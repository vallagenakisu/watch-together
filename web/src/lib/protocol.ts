export type ControlAction =
  | { kind: "play"; time: number }
  | { kind: "pause"; time: number }
  | { kind: "seek"; time: number }
  | { kind: "set_video"; videoId: string; time: number };

export type ClientMessage =
  | { type: "hello"; uid: string; name: string }
  | { type: "create_room"; videoId?: string }
  | { type: "join_room"; roomId: string }
  | { type: "join_response"; targetUid: string; accept: boolean }
  | { type: "control"; action: ControlAction }
  | { type: "sync_request" }
  | { type: "chat"; text: string }
  | { type: "leave_room" };

export interface ChatMessage {
  id: string;
  uid: string;
  name: string;
  text: string;
  at: number;
}

export interface PublicMember { uid: string; name: string; isHost: boolean; }

export interface RoomSnapshot {
  roomId: string;
  hostUid: string;
  videoId: string | null;
  isPlaying: boolean;
  currentTime: number;
  serverTime: number;
  members: PublicMember[];
}

export type ServerMessage =
  | { type: "room_created"; snapshot: RoomSnapshot }
  | { type: "join_pending"; roomId: string }
  | { type: "join_request"; uid: string; name: string }
  | { type: "join_accepted"; snapshot: RoomSnapshot }
  | { type: "join_rejected"; roomId: string }
  | { type: "members_changed"; members: PublicMember[]; hostUid: string }
  | { type: "control"; action: ControlAction; byUid: string }
  | { type: "room_state"; snapshot: RoomSnapshot }
  | { type: "chat_message"; message: ChatMessage }
  | { type: "error"; message: string };
