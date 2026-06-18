/**
 * In-memory room store. No database — everything lives in this Map and is gone
 * when the server restarts. That is fine for an MVP: rooms are ephemeral.
 */
import type { WebSocket } from "ws";
import type { PublicMember, RoomSnapshot } from "./protocol.ts";

export interface Member {
  uid: string;
  name: string;
  socket: WebSocket;
}

export interface Room {
  id: string;
  hostUid: string;
  videoId: string | null;
  isPlaying: boolean;
  /** Position in seconds as of `updatedAt`. */
  currentTime: number;
  /** Server time (ms) when currentTime/isPlaying were last set. */
  updatedAt: number;
  members: Map<string, Member>;
  /** uid -> member waiting for the host to approve. */
  pending: Map<string, Member>;
}

const rooms = new Map<string, Room>();

/** Short, unlikely-to-collide, human-typable room code (e.g. "k7f2qa"). */
function generateRoomId(): string {
  let id = "";
  do {
    id = Math.random().toString(36).slice(2, 8);
  } while (rooms.has(id));
  return id;
}

export function createRoom(host: Member, videoId: string | null): Room {
  const room: Room = {
    id: generateRoomId(),
    hostUid: host.uid,
    videoId: videoId ?? null,
    isPlaying: false,
    currentTime: 0,
    updatedAt: Date.now(),
    members: new Map([[host.uid, host]]),
    pending: new Map(),
  };
  rooms.set(room.id, room);
  return room;
}

export function getRoom(roomId: string): Room | undefined {
  return rooms.get(roomId);
}

/**
 * Compute where playback "really" is right now. If the video is playing, the
 * position has advanced by the wall-clock time since we last recorded it.
 */
export function effectiveTime(room: Room): number {
  if (!room.isPlaying) return room.currentTime;
  const elapsed = (Date.now() - room.updatedAt) / 1000;
  return room.currentTime + elapsed;
}

export function snapshot(room: Room): RoomSnapshot {
  return {
    roomId: room.id,
    hostUid: room.hostUid,
    videoId: room.videoId,
    isPlaying: room.isPlaying,
    currentTime: effectiveTime(room),
    serverTime: Date.now(),
    members: publicMembers(room),
  };
}

export function publicMembers(room: Room): PublicMember[] {
  return [...room.members.values()].map((m) => ({
    uid: m.uid,
    name: m.name,
    isHost: m.uid === room.hostUid,
  }));
}

/**
 * Remove a member from whatever room they are in. If the host leaves, promote
 * the next member; if the room is now empty, delete it. Returns the affected
 * room so the caller can notify the remaining members.
 */
export function removeMemberEverywhere(uid: string): Room | undefined {
  for (const room of rooms.values()) {
    const wasMember = room.members.delete(uid);
    room.pending.delete(uid);
    if (!wasMember) continue;

    if (room.members.size === 0) {
      rooms.delete(room.id);
      return room;
    }
    if (room.hostUid === uid) {
      // Promote the earliest-joined remaining member to host.
      room.hostUid = room.members.keys().next().value!;
    }
    return room;
  }
  return undefined;
}

/** Record a new authoritative playback state on the room. */
export function applyControl(
  room: Room,
  isPlaying: boolean,
  time: number,
  videoId?: string,
): void {
  room.isPlaying = isPlaying;
  room.currentTime = time;
  room.updatedAt = Date.now();
  if (videoId !== undefined) room.videoId = videoId;
}
