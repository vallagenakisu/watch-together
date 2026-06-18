"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/protocol";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  messages: ChatMessage[];
  myUid: string;
  onSend: (text: string) => void;
}

export function ChatPanel({ messages, myUid, onSend }: Props) {
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the newest message.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  function submit() {
    const clean = text.trim();
    if (!clean) return;
    onSend(clean);
    setText("");
  }

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto pr-1">
        {messages.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted-foreground">
            No messages yet. Say hi! 👋
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.uid === myUid;
            return (
              <div key={m.id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-1.5 text-sm ${
                    mine ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  {!mine && <span className="mb-0.5 block text-xs font-medium opacity-70">{m.name}</span>}
                  <span className="whitespace-pre-wrap break-words">{m.text}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Type a message…"
          maxLength={500}
        />
        <Button onClick={submit} disabled={!text.trim()}>
          Send
        </Button>
      </div>
    </div>
  );
}
