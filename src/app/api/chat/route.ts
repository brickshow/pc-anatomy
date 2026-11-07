// This is an API endpoint (/api/chat) that powers the AI chat assistant.
// It receives the user's conversation and forwards it to the OpenRouter API to get a reply.

import { NextResponse } from "next/server";
import { CHAT_MODELS } from "@/lib/chat/models";
import { rateLimit, readJsonLimited } from "@/lib/server/request-guards";

// These settings tell Next.js to run this route with the Node.js runtime and never cache the result.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// The OpenRouter API address we send requests to, and the most recent messages we keep from the chat history.
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MAX_HISTORY = 12;
const MAX_REQUEST_BYTES = 32 * 1024;
const MAX_MESSAGE_CHARS = 2_000;
// Hard cap for every AI reply: the server truncates anything longer
// than this so responses always stay short and readable.
const MAX_REPLY_CHARS = 500;

// The instructions shown to the AI at the start of every conversation. It tells the bot what it is,
// what topics it can answer, and how to format its replies.
const SYSTEM_PROMPT = `You are "Computer Anatomy", a friendly, accurate assistant for learning about computer hardware.

Your scope:
- Computer components: CPUs, GPUs, RAM, motherboards, storage (HDD, SATA SSD, M.2 NVMe), power supplies (PSU), UPS and AVR units, cooling (fans, radiators, water blocks), keyboards, mice, monitors, and cases.
- How components work, how to build or upgrade a PC, compatibility, and troubleshooting basics.
- The Computer Anatomy app: components such as the System Unit, CPU, Motherboard, RAM, GPU, SSD, M.2 SSD, HDD, PSU, CPU Cooler, Case Fans, Keyboard, Mouse, Monitor, UPS, and AVR can be explored interactively in 3D via the sidebar.

How to answer:
- Keep answers clear, concise, and educational. Use short paragraphs when helpful.
- Keep your ENTIRE reply under 500 characters — brief and to the point.
- Format your answers in clean Markdown so they render nicely: use bullet lists (-) for lists and Markdown tables (| column |) for comparisons or specs. Never use heading symbols (# or ##) — emphasize key terms with bold instead.
- Only answer computer-hardware and PC-building topics. If the user asks something unrelated, politely decline and offer to help with computer topics instead.
- NEVER invent or guess specific specifications, model numbers, prices, wattages, release dates, or benchmarks. If you are not certain about an exact number, say so honestly (e.g. "I'm not sure of the exact figure") and explain the general principle instead.
- Do not present opinions as facts. If an answer depends on brand, budget, or use case, say so and give balanced guidance.
- If you don't know something, admit it clearly. It is better to say "I don't know" than to make something up.
- When the user asks about a component in the app, feel free to mention they can select it in the sidebar to view its 3D model.`;

// A chat message is simply a role (who said it: user, assistant, or system) plus the text content.
type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

// Safely shortens an over-long reply to MAX_REPLY_CHARS characters.
// It cuts on a word boundary (never mid-word) and appends an ellipsis,
// and trims any trailing whitespace/markdown cruft left at the cut point.
function truncateReply(text: string): string {
  if (text.length <= MAX_REPLY_CHARS) return text;
  const trimmed = text.trim();
  let cut = trimmed.slice(0, MAX_REPLY_CHARS);
  const lastSpace = cut.lastIndexOf(" ");
  // Only split at a word boundary if there is a useful split point.
  if (lastSpace > 0) cut = cut.slice(0, lastSpace);
  return `${cut.trimEnd()}…`;
}

// Returns the list of AI models to try in priority order.
// If the OPENROUTER_MODEL environment variable is set, that model is tried first; otherwise we use the default list.
function modelPriority(): string[] {
  const override = process.env.OPENROUTER_MODEL?.trim();
  const base = CHAT_MODELS.map((m) => m.id);
  if (!override) return base;
  return [override, ...base.filter((id) => id !== override)];
}

// This runs when the client sends a POST request to /api/chat containing the chat history.
export async function POST(request: Request) {
  const limited = rateLimit(request, "chat", 6, 60_000);
  if (limited) return limited;

  const body = await readJsonLimited(request, MAX_REQUEST_BYTES);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Grab the array of chat messages from the body (or use an empty list if it's missing).
  const candidate = (body as { messages?: unknown }).messages;
  if (!Array.isArray(candidate)) {
    return NextResponse.json({ error: "Invalid message history." }, { status: 400 });
  }
  const history: ChatMessage[] = [];
  // Clients may send the full conversation. Validate only the bounded slice
  // that can be forwarded upstream, preserving the request's existing contract.
  for (const message of candidate.slice(-MAX_HISTORY)) {
    if (
      !message ||
      typeof message !== "object" ||
      !("role" in message) ||
      !("content" in message) ||
      (message.role !== "user" && message.role !== "assistant") ||
      typeof message.content !== "string" ||
      message.content.trim().length === 0 ||
      message.content.length > MAX_MESSAGE_CHARS
    ) {
      return NextResponse.json({ error: "Invalid message." }, { status: 400 });
    }
    history.push({ role: message.role, content: message.content.trim() });
  }
  // If there are no messages at all, there's nothing to reply to, so return an error.
  if (history.length === 0) {
    return NextResponse.json(
      { error: "No messages provided." },
      { status: 400 }
    );
  }
  if (history[history.length - 1]?.role !== "user") {
    return NextResponse.json({ error: "The latest message must be from the user." }, { status: 400 });
  }

  // Read the API key from the environment variables; the AI can't be called without it.
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    // If no key exists, tell the user the assistant hasn't been set up yet.
    return NextResponse.json(
      {
        error:
          "The AI assistant is not configured yet. Add OPENROUTER_API_KEY to your .env.local file and restart the dev server.",
      },
      { status: 500 }
    );
  }

  // Build the full conversation the AI will see: the system instructions plus the most recent messages.
  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.slice(-MAX_HISTORY),
  ];

  // Get the models to try, in priority order.
  const models = modelPriority();
  // If a model fails, we store the error here and keep it to show later.
  let lastError = "";

  // Try each model one by one until one of them gives us a usable reply.
  for (const model of models) {
    try {
      // Ask the OpenRouter API to generate a reply using this model.
      const upstream = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer":
            process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
          "X-Title": "Computer Anatomy",
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.4,
          max_tokens: 512,
        }),
        // Give up on this model after 30 seconds and try the next one.
        signal: AbortSignal.timeout(30_000),
      });

      // If the API returned an error status (e.g. too many requests), skip this model and try the next.
      if (!upstream.ok) {
        lastError = `[chat] ${model} responded ${upstream.status}`;
        console.error(lastError);
        continue;
      }

      // Read the model's reply text out of the JSON response.
      const data = await upstream.json();
      const reply = data?.choices?.[0]?.message?.content;
      // If the model actually gave us some non-empty text, enforce the
      // 500-char limit on the server and send it back to the client.
      if (typeof reply === "string" && reply.trim().length > 0) {
        return NextResponse.json({ reply: truncateReply(reply), model });
      }

      // If the reply was empty, remember that and try the next model.
      lastError = `[chat] ${model} returned an empty response`;
      console.error(lastError);
    } catch (err) {
      // If this model threw an error (for example, it timed out), remember it and try the next.
      lastError = `[chat] ${model} failed: ${err}`;
      console.error(lastError);
    }
  }

  // If every model failed, tell the client the assistant is currently unavailable.
  return NextResponse.json(
    {
      error:
        "The AI assistant couldn't respond right now — all models are unavailable. Please try again in a moment.",
    },
    { status: 502 }
  );
}
