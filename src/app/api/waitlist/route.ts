// API endpoint (/api/waitlist) that saves waitlist signups to Supabase.
//
// The browser posts the user's email; this server route validates it, inserts
// a row into the "waitlist" table, and returns a short message. Nothing the
// client sends is trusted — all validation happens here, server-side.
//
// Required environment variables (see .env.example; values live in .env, which
// is git-ignored and never committed — this repo is open source):
//   - NEXT_PUBLIC_SUPABASE_URL   — Supabase project URL
//   - SUPABASE_SERVICE_ROLE_KEY  — secret service-role key, server-side only
//
// The route deliberately returns only generic messages. Real errors (e.g. a
// missing table) are logged to the server console, not sent to the browser.

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { rateLimit, readJsonLimited } from "@/lib/server/request-guards";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Simple but strict email check — same shape as the browser's <input type=email>.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const limited = rateLimit(request, "waitlist", 5, 60 * 60_000);
  if (limited) return limited;

  // 1) Parse the JSON body defensively (never assume it is well-formed).
  const body = await readJsonLimited(request, 1_024);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const email = (body as { email?: unknown }).email;

  // 2) Validate the value *before* touching the database or secrets.
  if (
    typeof email !== "string" ||
    email.trim().length > 254 ||
    !EMAIL_PATTERN.test(email.trim())
  ) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  // 3) If the env vars were not provided, fail gracefully instead of crashing.
  if (!supabase) {
    return NextResponse.json(
      { error: "Waitlist is not configured yet. Please try again later." },
      { status: 503 },
    );
  }

  // 4) Insert the normalized email. Lowercased + trimmed so duplicates are
  //    caught reliably by the table's UNIQUE constraint on "email".
  const { error } = await supabase
    .from("waitlist")
    .insert({ email: email.trim().toLowerCase() });

  if (error) {
    // 23505 = Postgres unique_violation. A repeat signup is not a failure —
    // the person is already on the list, so treat it as success.
    if (error.code === "23505") {
      return NextResponse.json(
        { message: "You are already on the waitlist!" },
        { status: 200 },
      );
    }
    // Anything else (e.g. table missing, network hiccup) is a real failure.
    // Log the technical detail server-side only; the client sees a generic
    // message so no schema or infrastructure details leak publicly.
    console.error("waitlist insert failed:", error.message);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 },
    );
  }

  // 5) Success. The message is shown in the form's success state.
  return NextResponse.json(
    { message: "You're on the waitlist! We'll let you know when it's ready." },
    { status: 200 },
  );
}
