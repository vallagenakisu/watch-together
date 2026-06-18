"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParty } from "@/components/WatchPartyProvider";
import { getName, setName as persistName } from "@/lib/identity";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  const party = useParty();
  const router = useRouter();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  useEffect(() => setName(getName()), []);

  useEffect(() => {
    if (party.room) router.push(`/room/${party.room.roomId}`);
  }, [party.room, router]);

  const connecting = party.status !== "open";

  function handleCreate() {
    persistName(name);
    party.createRoom();
  }

  function handleJoin() {
    const clean = code.trim().toLowerCase();
    if (!clean) return;
    persistName(name);
    router.push(`/room/${clean}`);
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-4 py-12">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Watch Together 🎬</h1>
        <p className="text-sm text-muted-foreground">
          Create a room, pick a YouTube video, and watch in perfect sync with friends.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="name">Your display name</label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => persistName(name)}
          placeholder="e.g. Swift Otter"
        />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Start a room</CardTitle></CardHeader>
        <CardContent>
          <Button className="w-full" onClick={handleCreate} disabled={connecting}>
            {connecting ? "Connecting…" : "Create a room"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Join a room</CardTitle></CardHeader>
        <CardContent className="flex gap-2">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            placeholder="Room code (e.g. k7f2qa)"
          />
          <Button variant="secondary" onClick={handleJoin} disabled={connecting || !code.trim()}>
            Join
          </Button>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        {party.status === "open" ? "Connected" : "Connecting to server…"}
      </p>
    </main>
  );
}
