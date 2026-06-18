"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getName, getUid } from "./identity";
import type { ClientMessage, ControlAction, PublicMember, RoomSnapshot, ServerMessage } from "./protocol";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8080";

export type ConnectionStatus = "connecting" | "open" | "closed";
export type JoinStatus = "idle" | "pending" | "rejected" | "joined";
export interface JoinRequest { uid: string; name: string; }
export type RemoteControlHandler = (action: ControlAction) => void;

export interface WatchParty {
  uid: string;
  status: ConnectionStatus;
  room: RoomSnapshot | null;
  members: PublicMember[];
  isHost: boolean;
  joinStatus: JoinStatus;
  joinRequests: JoinRequest[];
  error: string | null;
  createRoom: (videoId?: string) => void;
  joinRoom: (roomId: string) => void;
  respondJoin: (uid: string, accept: boolean) => void;
  sendControl: (action: ControlAction) => void;
  leaveRoom: () => void;
  subscribeControl: (handler: RemoteControlHandler) => () => void;
}

export function useWatchParty(): WatchParty {
  const [uid, setUid] = useState("");
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [room, setRoom] = useState<RoomSnapshot | null>(null);
  const [joinStatus, setJoinStatus] = useState<JoinStatus>("idle");
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const controlHandlers = useRef<Set<RemoteControlHandler>>(new Set());
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldReconnect = useRef(true);

  const send = useCallback((msg: ClientMessage) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg));
  }, []);

  const handleServerMessage = useCallback((msg: ServerMessage) => {
    switch (msg.type) {
      case "room_created": setRoom(msg.snapshot); setJoinStatus("joined"); setError(null); break;
      case "join_pending": setJoinStatus("pending"); break;
      case "join_request":
        setJoinRequests((reqs) => reqs.some((r) => r.uid === msg.uid) ? reqs : [...reqs, { uid: msg.uid, name: msg.name }]);
        break;
      case "join_accepted": setRoom(msg.snapshot); setJoinStatus("joined"); setError(null); break;
      case "join_rejected": setJoinStatus("rejected"); setRoom(null); break;
      case "members_changed":
        setRoom((r) => r ? { ...r, members: msg.members, hostUid: msg.hostUid } : r);
        setJoinRequests((reqs) => reqs.filter((req) => !msg.members.some((m) => m.uid === req.uid)));
        break;
      case "control": {
        const action = msg.action;
        setRoom((r) => {
          if (!r) return r;
          if (action.kind === "set_video") return { ...r, videoId: action.videoId, currentTime: action.time, isPlaying: false, serverTime: Date.now() };
          return { ...r, isPlaying: action.kind === "play", currentTime: action.time, serverTime: Date.now() };
        });
        for (const handler of controlHandlers.current) handler(action);
        break;
      }
      case "room_state": setRoom(msg.snapshot); break;
      case "error": setError(msg.message); break;
    }
  }, []);

  const connect = useCallback(() => {
    const myUid = getUid();
    const myName = getName();
    setUid(myUid);
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;
    setStatus("connecting");

    ws.onopen = () => {
      setStatus("open");
      ws.send(JSON.stringify({ type: "hello", uid: myUid, name: myName } satisfies ClientMessage));
      setRoom((current) => {
        if (current) ws.send(JSON.stringify({ type: "join_room", roomId: current.roomId } satisfies ClientMessage));
        return current;
      });
    };
    ws.onmessage = (event) => {
      try { handleServerMessage(JSON.parse(event.data) as ServerMessage); } catch { /* ignore */ }
    };
    ws.onclose = () => {
      setStatus("closed");
      if (shouldReconnect.current) reconnectTimer.current = setTimeout(connect, 1500);
    };
    ws.onerror = () => ws.close();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    shouldReconnect.current = true;
    connect();
    return () => {
      shouldReconnect.current = false;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const createRoom = useCallback((videoId?: string) => send({ type: "create_room", videoId }), [send]);
  const joinRoom = useCallback((roomId: string) => { setJoinStatus("pending"); send({ type: "join_room", roomId }); }, [send]);
  const respondJoin = useCallback((targetUid: string, accept: boolean) => {
    send({ type: "join_response", targetUid, accept });
    setJoinRequests((reqs) => reqs.filter((r) => r.uid !== targetUid));
  }, [send]);
  const sendControl = useCallback((action: ControlAction) => send({ type: "control", action }), [send]);
  const leaveRoom = useCallback(() => { send({ type: "leave_room" }); setRoom(null); setJoinStatus("idle"); setJoinRequests([]); }, [send]);
  const subscribeControl = useCallback((handler: RemoteControlHandler) => {
    controlHandlers.current.add(handler);
    return () => { controlHandlers.current.delete(handler); };
  }, []);

  return {
    uid, status, room, members: room?.members ?? [], isHost: !!room && room.hostUid === uid,
    joinStatus, joinRequests, error, createRoom, joinRoom, respondJoin, sendControl, leaveRoom, subscribeControl,
  };
}
