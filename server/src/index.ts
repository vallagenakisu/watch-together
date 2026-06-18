/**
 * WebSocket server entry point.
 *
 * Uses Node's built-in `http` module (so we can also answer a simple health
 * check over plain HTTP) and the `ws` library for the WebSocket layer. No
 * Express, no framework — just Node + one library.
 */
import { createServer } from "node:http";
import { WebSocketServer, WebSocket } from "ws";
import type { ClientMessage, ServerMessage } from "./protocol.ts";
import {
  applyControl,
  createRoom,
  getRoom,
  publicMembers,
  removeMemberEverywhere,
  snapshot,
  type Member,
} from "./rooms.ts";

const PORT = Number(process.env.PORT ?? 8080);

/** Per-connection state we keep alongside each socket. */
interface Connection {
  uid: string;
  name: string;
  roomId: string | null;
  socket: WebSocket;
  alive: boolean;
}

/** uid -> connection, so we can find a target member's socket to message. */
const connections = new Map<string, Connection>();

// --- HTTP server (health check + the thing ws upgrades from) ----------------
const httpServer = createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: true, rooms: connections.size }));
    return;
  }
  res.writeHead(404);
  res.end("Watch Together WebSocket server. Connect over ws://");
});

const wss = new WebSocketServer({ server: httpServer });

// --- helpers ----------------------------------------------------------------
function send(socket: WebSocket, msg: ServerMessage): void {
  if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(msg));
}

function sendToUid(uid: string, msg: ServerMessage): void {
  const conn = connections.get(uid);
  if (conn) send(conn.socket, msg);
}

/** Send to every member of a room, optionally skipping one uid. */
function broadcast(roomId: string, msg: ServerMessage, exceptUid?: string): void {
  const room = getRoom(roomId);
  if (!room) return;
  for (const member of room.members.values()) {
    if (member.uid === exceptUid) continue;
    send(member.socket, msg);
  }
}

function notifyMembersChanged(roomId: string): void {
  const room = getRoom(roomId);
  if (!room) return;
  broadcast(roomId, {
    type: "members_changed",
    members: publicMembers(room),
    hostUid: room.hostUid,
  });
}

// --- message handling -------------------------------------------------------
function handleMessage(conn: Connection, msg: ClientMessage): void {
  switch (msg.type) {
    case "hello": {
      conn.uid = msg.uid;
      conn.name = msg.name || "Guest";
      connections.set(conn.uid, conn);
      break;
    }

    case "create_room": {
      const member: Member = { uid: conn.uid, name: conn.name, socket: conn.socket };
      const room = createRoom(member, msg.videoId ?? null);
      conn.roomId = room.id;
      send(conn.socket, { type: "room_created", snapshot: snapshot(room) });
      break;
    }

    case "join_room": {
      const room = getRoom(msg.roomId);
      if (!room) {
        send(conn.socket, { type: "error", message: "Room not found." });
        return;
      }
      if (room.members.has(conn.uid)) {
        // Already a member (e.g. reconnect) — just resync.
        conn.roomId = room.id;
        room.members.get(conn.uid)!.socket = conn.socket;
        send(conn.socket, { type: "join_accepted", snapshot: snapshot(room) });
        return;
      }
      room.pending.set(conn.uid, { uid: conn.uid, name: conn.name, socket: conn.socket });
      send(conn.socket, { type: "join_pending", roomId: room.id });
      // Ask the host to approve.
      sendToUid(room.hostUid, { type: "join_request", uid: conn.uid, name: conn.name });
      break;
    }

    case "join_response": {
      const roomId = conn.roomId;
      const room = roomId ? getRoom(roomId) : undefined;
      if (!room || room.hostUid !== conn.uid) {
        send(conn.socket, { type: "error", message: "Only the host can approve joins." });
        return;
      }
      const pending = room.pending.get(msg.targetUid);
      if (!pending) return; // Request was withdrawn / already handled.
      room.pending.delete(msg.targetUid);

      if (!msg.accept) {
        sendToUid(msg.targetUid, { type: "join_rejected", roomId: room.id });
        return;
      }
      room.members.set(pending.uid, pending);
      const joinerConn = connections.get(pending.uid);
      if (joinerConn) joinerConn.roomId = room.id;
      sendToUid(pending.uid, { type: "join_accepted", snapshot: snapshot(room) });
      notifyMembersChanged(room.id);
      break;
    }

    case "control": {
      const room = conn.roomId ? getRoom(conn.roomId) : undefined;
      if (!room || !room.members.has(conn.uid)) return;

      const a = msg.action;
      if (a.kind === "set_video") {
        applyControl(room, false, a.time, a.videoId);
      } else {
        applyControl(room, a.kind === "play", a.time);
      }
      // Broadcast to everyone, including the originator. Clients guard against
      // re-applying their own actions, and this keeps every client's room state
      // (current video / playing / position) authoritative and consistent.
      broadcast(room.id, { type: "control", action: a, byUid: conn.uid });
      break;
    }

    case "sync_request": {
      const room = conn.roomId ? getRoom(conn.roomId) : undefined;
      if (!room) return;
      send(conn.socket, { type: "room_state", snapshot: snapshot(room) });
      break;
    }

    case "chat": {
      const room = conn.roomId ? getRoom(conn.roomId) : undefined;
      if (!room || !room.members.has(conn.uid)) return;
      const text = msg.text.trim().slice(0, 500);
      if (!text) return;
      broadcast(room.id, {
        type: "chat_message",
        message: {
          id: `${conn.uid}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          uid: conn.uid,
          name: conn.name,
          text,
          at: Date.now(),
        },
      });
      break;
    }

    case "leave_room": {
      leaveRoom(conn);
      break;
    }
  }
}

function leaveRoom(conn: Connection): void {
  if (!conn.roomId) return;
  const roomId = conn.roomId;
  conn.roomId = null;
  removeMemberEverywhere(conn.uid);
  // If the room still exists (it had other members), tell them.
  if (getRoom(roomId)) notifyMembersChanged(roomId);
}

// --- connection lifecycle ---------------------------------------------------
wss.on("connection", (socket) => {
  const conn: Connection = {
    uid: "",
    name: "",
    roomId: null,
    socket,
    alive: true,
  };

  socket.on("message", (data) => {
    let msg: ClientMessage;
    try {
      msg = JSON.parse(data.toString()) as ClientMessage;
    } catch {
      send(socket, { type: "error", message: "Malformed JSON." });
      return;
    }
    try {
      handleMessage(conn, msg);
    } catch (err) {
      console.error("handler error", err);
      send(socket, { type: "error", message: "Server error." });
    }
  });

  socket.on("pong", () => {
    conn.alive = true;
  });

  socket.on("close", () => {
    const roomId = conn.roomId;
    removeMemberEverywhere(conn.uid);
    if (conn.uid) connections.delete(conn.uid);
    if (roomId && getRoom(roomId)) notifyMembersChanged(roomId);
  });
});

// Heartbeat: drop dead connections so rooms don't keep ghosts.
const heartbeat = setInterval(() => {
  for (const conn of connections.values()) {
    if (!conn.alive) {
      conn.socket.terminate();
      continue;
    }
    conn.alive = false;
    conn.socket.ping();
  }
}, 30_000);
wss.on("close", () => clearInterval(heartbeat));

httpServer.listen(PORT, () => {
  console.log(`▶  Watch Together WS server listening on ws://localhost:${PORT}`);
});
