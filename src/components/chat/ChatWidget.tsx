"use client";

// This file is a client component (runs in the browser).
// ChatWidget is the floating AI assistant chat. It shows a launcher
// button, an expandable chat window with quick prompts, multi-chat
// threads, and markdown-rendered AI replies. Chats persist to
// localStorage and text replies are animated in with a typewriter.
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Plus, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatHead } from "@/components/chat/ChatHead";

// A single message in a chat thread (sent by either the user or assistant).
type Message = {
  id: number;
  role: "user" | "assistant";
  text: string;
};

// A conversation thread: an id, a short title, and its messages.
type ChatThread = {
  id: string;
  title: string;
  messages: Message[];
};

// Pre-written example questions shown as quick-prompt chips.
const QUICK_PROMPTS = [
  "What is a GPU?",
  "How does RAM work?",
  "Explain the CPU",
  "How do I build a PC?",
];

// Rotating invite messages shown on the launcher when the chat is closed.
const INVITE_PROMPTS = [
  "Hey, ask me anything!",
  "Want to ask something?",
  "Curious about a component?",
  "Explore PC hardware with me!",
];

// The assistant's opening greeting used to start each new chat.
const GREETING =
  "Hi! I'm the Computer Anatomy assistant. Ask me about any component — GPU, RAM, CPU, and more.";

// How many previous messages to send to the AI for context.
const MAX_HISTORY = 12;
// localStorage key where saved chat threads are stored.
const STORAGE_KEY = "computer-anatomy-chats";

// Shortens a message into a chat thread title (max ~30 chars).
function truncateTitle(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > 30 ? `${clean.slice(0, 30)}…` : clean;
}

// Renders a single message bubble. User text is plain; assistant replies
// are rendered as Markdown (GFM enabled).
function MessageText({ role, text }: { role: Message["role"]; text: string }) {
  if (role === "user") {
    return <span className="whitespace-pre-wrap">{text}</span>;
  }
  return (
    <div className="assistant-md">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
    </div>
  );
}

// Reveals a reply gradually like a typewriter animation, calling onTick
// each character revealed (to keep the message list scrolled to bottom)
// and onDone when finished.
function Typewriter({
  text,
  onTick,
  onDone,
}: {
  text: string;
  onTick: () => void;
  onDone: () => void;
}) {
  // How many characters of `text` are currently visible.
  const [len, setLen] = useState(0);
  const finished = len >= text.length;

  // Set up an interval that reveals characters one at a time. Longer
  // text types faster (lower interval in ms).
  useEffect(() => {
    if (finished) return;
    const rate = text.length > 1200 ? 4 : text.length > 500 ? 6 : 10;
    const id = window.setInterval(() => {
      onTick();
      setLen((l) => Math.min(l + 1, text.length));
    }, rate);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, finished]);

  // Notify the parent once the whole text has been revealed.
  useEffect(() => {
    if (finished) onDone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  return (
    // Render only the revealed portion so it looks like typing.
    <div className="assistant-md">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{text.slice(0, len)}</ReactMarkdown>
      <span className="typing-caret" aria-hidden="true" />
    </div>
  );
}

export function ChatWidget({ initiallyOpen = false }: { initiallyOpen?: boolean }) {
  // Whether the chat window is open/closed.
  const [open, setOpen] = useState(initiallyOpen);
  // Current text typed in the input box.
  const [input, setInput] = useState("");
  // True while waiting for the assistant's reply.
  const [pending, setPending] = useState(false);
  // Id of the message currently being typed out (null when none).
  const [animatingId, setAnimatingId] = useState<number | null>(null);
  // All saved chat threads (starts with one default "New chat").
  const [chats, setChats] = useState<ChatThread[]>([
    {
      id: "chat-initial",
      title: "New chat",
      messages: [{ id: 0, role: "assistant", text: GREETING }],
    },
  ]);
  // Id of the chat thread currently shown.
  const [activeChatId, setActiveChatId] = useState("chat-initial");

  // idRef generates the next unique message id.
  const idRef = useRef(1);
  // scrollRef targets the message list so we can auto-scroll to bottom.
  const scrollRef = useRef<HTMLDivElement>(null);
  // inputRef targets the text input so we can focus it when opening.
  const inputRef = useRef<HTMLInputElement>(null);

  // The active thread (falls back to the first thread if not found).
  const activeChat = chats.find((c) => c.id === activeChatId) ?? chats[0];
  // Convenience alias for the active thread's messages.
  const messages = activeChat.messages;

  // Rotating invite prompt state: which one is shown and whether it shows.
  const [promptIdx, setPromptIdx] = useState(0);
  const [showPrompt, setShowPrompt] = useState(true);

  // While the chat is closed, cycle the launcher invite message: hide the
  // current one briefly, then switch to the next invite prompt.
  useEffect(() => {
    if (open) return;
    const visible = showPrompt;
    const id = window.setTimeout(
      () => {
        if (visible) {
          setShowPrompt(false);
        } else {
          setPromptIdx((i) => (i + 1) % INVITE_PROMPTS.length);
          setShowPrompt(true);
        }
      },
      visible ? 2000 : 3000
    );
    return () => window.clearTimeout(id);
  }, [open, showPrompt]);

  // On mount: try to load saved chats from localStorage (after 0ms) and
  // restore the active thread. Guard against outdated/missing data.
  useEffect(() => {
    let cancelled = false;
    const id = window.setTimeout(() => {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw || cancelled) return;
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed?.chats) || parsed.chats.length === 0) return;
        setChats(parsed.chats);
        const active = parsed.chats.some((c: ChatThread) => c.id === parsed.activeId)
          ? parsed.activeId
          : parsed.chats[0].id;
        setActiveChatId(active);
        const maxId = parsed.chats.reduce(
          (max: number, c: ChatThread) =>
            Math.max(max, ...c.messages.map((m) => m.id)),
          0
        );
        idRef.current = maxId + 1;
      } catch {
        // ignore corrupted storage
      }
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, []);

  // Persist the active chat + all threads to localStorage whenever they change.
  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ activeId: activeChatId, chats })
      );
    } catch {
      // storage unavailable (e.g. private mode)
    }
  }, [chats, activeChatId]);

  // Focus the input whenever the chat window opens.
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Scroll the message list all the way down (to the newest message).
  const scrollToBottom = () => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  };

  // Keep the list scrolled to the bottom on relevant changes.
  useEffect(() => {
    scrollToBottom();
  }, [messages, pending, animatingId, open]);

  // Starts a fresh chat thread with the greeting and switches to it.
  const newChat = () => {
    const chat: ChatThread = {
      id: `chat-${Date.now()}`,
      title: "New chat",
      messages: [{ id: idRef.current++, role: "assistant", text: GREETING }],
    };
    setChats((prev) => [...prev, chat]);
    setActiveChatId(chat.id);
    setInput("");
    setAnimatingId(null);
  };

  // Sends a message (typed or from a quick prompt) to the chat API and
  // appends the assistant's reply to the active thread.
  const send = async (text?: string) => {
    const value = (text ?? input).trim();
    if (!value || pending) return;

    const userMsg: Message = { id: idRef.current++, role: "user", text: value };
    setInput("");
    setPending(true);

    // The first user message in a thread becomes the chat's title.
    const isFirstUserMsg = messages.filter((m) => m.role === "user").length === 0;
    setChats((prev) =>
      prev.map((c) =>
        c.id === activeChatId
          ? {
              ...c,
              title: isFirstUserMsg ? truncateTitle(value) : c.title,
              messages: [...c.messages, userMsg],
            }
          : c
      )
    );

    // Send the recent conversation as context (capped by MAX_HISTORY)
    // plus the new user message to the chat API endpoint.
    const history: { role: "user" | "assistant"; content: string }[] = [
      ...messages.slice(-(MAX_HISTORY - 1)).map((m) => ({ role: m.role, content: m.text })),
      { role: "user", content: value },
    ];

    // Call the API; fall back to a friendly message if it fails.
    let reply = "";
    let isError = false;
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      const data = await res.json().catch(() => null);
      reply = data?.reply ?? data?.error ?? "Sorry, I couldn't get a response. Please try again.";
      isError = !data?.reply;
    } catch {
      reply = "Sorry, I couldn't reach the AI service. Please try again.";
      isError = true;
    }

    // Append the assistant's reply to the active thread.
    const assistantMsg: Message = { id: idRef.current++, role: "assistant", text: reply };
    setChats((prev) =>
      prev.map((c) =>
        c.id === activeChatId ? { ...c, messages: [...c.messages, assistantMsg] } : c
      )
    );
    setPending(false);
    // Trigger the typewriter animation on the newly added reply.
    if (!isError) setAnimatingId(assistantMsg.id);
  };

  return (
    // Fixed launcher + window anchored to the bottom-right corner.
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative flex h-[520px] w-[360px] flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_0_0_1px_rgba(77,141,255,0.08),0_0_46px_rgba(77,141,255,0.14),0_24px_70px_rgba(2,6,16,0.6)]"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-linear-to-b from-accent/18 via-accent/6 to-transparent"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-accent/8 to-transparent"
            />
            {/* Window header: chat head avatar, active thread title, and
                new-chat/close buttons. */}
            <header className="relative flex items-center gap-2 border-b border-line bg-surface-2/60 px-4 py-3.5">
              <span className="relative flex aspect-[682/902] h-12 shrink-0 items-center justify-center overflow-hidden rounded-lg">
                <ChatHead />
                <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="truncate text-[13.5px] font-semibold tracking-tight text-foreground">
                  {activeChat.title}
                </p>
              </div>
              <button
                type="button"
                aria-label="New chat"
                onClick={newChat}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
              >
                <Plus className="h-4 w-4" strokeWidth={1.8} />
              </button>
              <button
                type="button"
                aria-label="Close chat"
                onClick={() => setOpen(false)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
              >
                <X className="h-4 w-4" strokeWidth={1.8} />
              </button>
            </header>

            {/* Scrollable list of messages for the active thread. */}
            <div className="thin-scroll flex-1 space-y-3 overflow-y-auto px-4 py-4" ref={scrollRef}>
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "flex",
                    m.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[12.5px] leading-relaxed",
                      m.role === "user"
                        ? "rounded-br-md bg-accent text-white"
                        : "rounded-bl-md border border-line bg-surface-2 text-foreground/90"
                    )}
                  >
                    {/* Animate the newest reply with the typewriter,
                        and keep auto-scrolling while it types. */}
                    {m.id === animatingId ? (
                      <Typewriter
                        key={m.id}
                        text={m.text}
                        onTick={scrollToBottom}
                        onDone={() => setAnimatingId(null)}
                      />
                    ) : (
                      <MessageText role={m.role} text={m.text} />
                    )}
                  </div>
                </div>
              ))}
              {/* Minimal loading state while waiting for a reply;
                      disappears as soon as the response arrives. */}
                  {pending && (
                    <div className="flex justify-start">
                      <div className="flex items-center gap-2.5 rounded-2xl rounded-bl-md border border-line bg-surface-2 px-3.5 py-3">
                        {/* Small pulsing dots as an animated loading indicator. */}
                        <span className="flex items-center gap-1">
                          {[0, 1, 2].map((i) => (
                            <motion.span
                              key={i}
                              animate={{ opacity: [0.25, 1, 0.25] }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: i * 0.18,
                              }}
                              className="h-1.5 w-1.5 rounded-full bg-muted"
                            />
                          ))}
                        </span>
                        <span className="text-[12.5px] text-muted">
                          Analyzing your request…
                        </span>
                      </div>
                    </div>
                  )}
            </div>

{/* Bottom input area: quick prompts, text field, and send button. */}
            <div className="border-t border-line px-3 pt-2.5">
              <div className="mb-2.5 flex gap-1.5 overflow-x-auto">
                {/* Clicking a quick prompt sends it directly as a message. */}
                {QUICK_PROMPTS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => send(q)}
                    className="shrink-0 rounded-full border border-line bg-surface-2 px-3 py-1.5 text-[11px] text-muted transition-colors hover:border-accent/40 hover:text-foreground"
                  >
                    {q}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 pb-3">
                {/* Text input that sends the message on Enter. */}
                <input
                  ref={inputRef}
                  value={input}
                  maxLength={2_000}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Ask about a component…"
                  className="h-10 flex-1 rounded-xl border border-line bg-surface-2 px-3.5 text-[13px] text-foreground outline-none transition-colors placeholder:text-muted-2 focus:border-accent/50"
                />
                {/* Send button, disabled while empty or awaiting a reply. */}
                <button
                  type="button"
                  aria-label="Send message"
                  onClick={() => send()}
                  disabled={!input.trim() || pending}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-white transition-all hover:bg-accent-bright disabled:opacity-40"
                >
                  <Send className="h-4 w-4" strokeWidth={1.8} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Launcher row shown when the window is closed. */}
      <div className="flex items-center gap-3">
        {!open && (
          <AnimatePresence>
            {/* Rotating invite bubble; clicking it opens the chat. */}
            {showPrompt && (
              <motion.button
                type="button"
                aria-label="Ask the assistant"
                onClick={() => setOpen(true)}
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="flex items-center gap-2 rounded-2xl border border-line bg-surface px-4 py-2.5 text-[13px] font-medium text-foreground shadow-[0_10px_30px_rgba(2,6,16,0.35)] transition-colors hover:border-accent/40"
              >
                <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-emerald-400" />
                <span className="block whitespace-nowrap">
                  {INVITE_PROMPTS[promptIdx]}
                </span>
              </motion.button>
            )}
          </AnimatePresence>
        )}
        {/* Toggle button (the chat head avatar) to open/close the chat. */}
        <motion.button
          type="button"
          aria-label="Open AI assistant"
          onClick={() => setOpen((v) => !v)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative aspect-[682/902] h-20 overflow-hidden rounded-xl"
        >
          <ChatHead />
          {!open && (
            <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-emerald-400" />
          )}
        </motion.button>
      </div>
    </div>
  );
}
