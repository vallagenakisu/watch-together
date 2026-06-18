"use client";

import { useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useParty } from "@/components/WatchPartyProvider";
import { SyncedPlayer } from "@/components/SyncedPlayer";
import { SearchPanel } from "@/components/SearchPanel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function RoomPage() {
  const params = useParams<{ id: string }>();
  const roomId = (params.id ?? "").toLowerCase();
  const party = useParty();
  const router = useRouter();
  const requested = useRef(false);

  const inThisRoom = party.room?.roomId === roomId;

  useEffect(() => {
    if (party.status !== "open") return;
    if (inThisRoom) return;
    if (party.joinStatus === "pending" || party.joinStatus === "rejected") return;
    if (requested.current) return;
    requested.current = true;
    party.joinRoom(roomId);
  }, [party.status, party.joinStatus, inThisRoom, roomId, party]);

  useEffect(() => {
    if (party.error) toast.error(party.error);
  }, [party.error]);

  useEffect(() => {
    const latest = party.joinRequests.at(-1);
    if (latest) toast.info(`${latest.name} wants to join`);
  }, [party.joinRequests]);

  function copyLink() {
    const url = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(url).then(() => toast.success("Room link copied!"));
  }

  function leave() {
    party.leaveRoom();
    requested.current = false;
    router.push("/");
  }

  if (!inThisRoom) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-4 px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold">Room {roomId}</h1>
        {party.joinStatus === "rejected" ? (
          <>
            <p className="text-sm text-muted-foreground">The host declined your request.</p>
            <Button onClick={() => router.push("/")}>Back home</Button>
          </>
        ) : party.status !== "open" ? (
          <p className="text-sm text-muted-foreground">Connecting to server…</p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">Waiting for the host to let you in…</p>
            <Button variant="ghost" onClick={() => router.push("/")}>Cancel</Button>
          </>
        )}
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold">Watch Together</h1>
          <Badge variant="secondary" className="font-mono">{roomId}</Badge>
          {party.status !== "open" && (
            <Badge variant="outline" className="text-amber-600">reconnecting…</Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={copyLink}>Copy invite link</Button>
          <Button variant="destructive" size="sm" onClick={leave}>Leave</Button>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SyncedPlayer party={party} />
        </div>

        <div className="flex flex-col gap-4">
          {party.isHost && party.joinRequests.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Join requests</CardTitle></CardHeader>
              <CardContent className="flex flex-col gap-2">
                {party.joinRequests.map((req) => (
                  <div key={req.uid} className="flex items-center justify-between gap-2">
                    <span className="text-sm">{req.name}</span>
                    <div className="flex gap-1">
                      <Button size="sm" onClick={() => party.respondJoin(req.uid, true)}>Accept</Button>
                      <Button size="sm" variant="ghost" onClick={() => party.respondJoin(req.uid, false)}>Decline</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card className="flex min-h-[320px] flex-col">
            <CardHeader><CardTitle className="text-base">Pick a video</CardTitle></CardHeader>
            <CardContent className="flex-1">
              <SearchPanel onPick={(videoId) => party.sendControl({ kind: "set_video", videoId, time: 0 })} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Watching ({party.members.length})</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-1">
              {party.members.map((m) => (
                <div key={m.uid} className="flex items-center gap-2 text-sm">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>{m.name}</span>
                  {m.uid === party.uid && <span className="text-xs text-muted-foreground">(you)</span>}
                  {m.isHost && <Badge variant="secondary" className="ml-auto text-xs">host</Badge>}
                </div>
              ))}
            </CardContent>
          </Card>

          <Separator />
          <p className="text-xs text-muted-foreground">
            Anyone in the room can play, pause, seek, or change the video — everyone stays in sync.
          </p>
        </div>
      </div>
    </main>
  );
}
