/**
 * The wire protocol shared between the browser and this server.
 *
 * Everything is JSON. A message always has a `type` discriminator so both
 * sides can switch on it. Keep this file in sync with `web/src/lib/protocol.ts`.
 */

/** A playback control action that must be mirrored on every client. */
export type ControlAction =
  | { kind: "play"; time: number }
  | { kind: "pause"; time: number }
  | { kind: "seek"; time: number }
  | { kind: "set_video"; videoId: string; time: number };

/** Messages the browser sends TO the server. */
export type ClientMessage =
  // First thing a socket sends: who am I (temporary uid) and my display name.
  | { type: "hello"; uid: string; name: string }
  // Create a new room. Optionally start with a video already chosen.
  | { type: "create_room"; videoId?: string }
  // Ask to join an existing room. The host must approve.
  | { type: "join_room"; roomId: string }
  // Host approves or rejects a pending join request.
  | { type: "join_response"; targetUid: string; accept: boolean }
  // Any member drives playback; the server rebroadcasts to everyone else.
  | { type: "control"; action: ControlAction }
  // Ask the server for the current authoritative room state (e.g. after reconnect).
  | { type: "sync_request" }
  // Leave the current room.
  | { type: "leave_room" };

/** A member as seen by other clients (no socket, no internals). */
export interface PublicMember {
  uid: string;
  name: string;
  isHost: boolean;
}

/** The authoritative snapshot of a room at a moment in time. */
export interface RoomSnapshot {
  roomId: string;
  hostUid: string;
  videoId: string | null;
  isPlaying: boolean;
  /** Playback position in seconds, valid as of `serverTime`. */
  currentTime: number;
  /** Server clock (ms) when this snapshot was taken, for drift correction. */
  serverTime: number;
  members: PublicMember[];
}

/** Messages the server sends TO the browser. */
export type ServerMessage =
  | { type: "room_created"; snapshot: RoomSnapshot }
  // You asked to join; waiting for the host to approve.
  | { type: "join_pending"; roomId: string }
  // Host received a request and must decide.
  | { type: "join_request"; uid: string; name: string }
  | { type: "join_accepted"; snapshot: RoomSnapshot }
  | { type: "join_rejected"; roomId: string }
  // Someone's membership changed; here is the fresh member list.
  | { type: "members_changed"; members: PublicMember[]; hostUid: string }
  // Rebroadcast of a control action (the originator is told who did it).
  | { type: "control"; action: ControlAction; byUid: string }
  // Full state, e.g. response to sync_request.
  | { type: "room_state"; snapshot: RoomSnapshot }
  | { type: "error"; message: string };
