"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { MessageCircle } from "lucide-react";

const ChatWidget = dynamic(
  () => import("@/components/chat/ChatWidget").then((module) => module.ChatWidget),
  { ssr: false },
);

export function ChatLauncher() {
  const [opened, setOpened] = useState(false);

  if (opened) return <ChatWidget initiallyOpen />;

  return (
    <button
      type="button"
      onClick={() => setOpened(true)}
      aria-label="Open the PC Anatomy assistant"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-accent text-white shadow-lg transition-transform hover:scale-105"
    >
      <MessageCircle className="h-6 w-6" aria-hidden="true" />
    </button>
  );
}
