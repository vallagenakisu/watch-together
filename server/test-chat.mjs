// Quick check of room + chat. Run the server first, then: node test-chat.mjs
import { WebSocket } from "ws";

const URL = process.env.WS_URL ?? "ws://localhost:8080";
const open = (ws) => new Promise((r) => ws.on("open", r));
const next = (ws, type) =>
  new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`timeout waiting for ${type}`)), 3000);
    const onMsg = (raw) => {
      const m = JSON.parse(raw.toString());
      if (m.type === type) { clearTimeout(t); ws.off("message", onMsg); resolve(m); }
    };
    ws.on("message", onMsg);
  });
const send = (ws, m) => ws.send(JSON.stringify(m));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

let fail = 0;
const check = (c, l) => { console.log(`${c ? "✓" : "✗"} ${l}`); if (!c) fail++; };

const host = new WebSocket(URL);
const guest = new WebSocket(URL);
await Promise.all([open(host), open(guest)]);

// Collect every chat_message each side receives.
const hostChats = [];
const guestChats = [];
host.on("message", (r) => { const m = JSON.parse(r); if (m.type === "chat_message") hostChats.push(m.message); });
guest.on("message", (r) => { const m = JSON.parse(r); if (m.type === "chat_message") guestChats.push(m.message); });

send(host, { type: "hello", uid: "host-1", name: "Host" });
send(guest, { type: "hello", uid: "guest-1", name: "Guest" });
send(host, { type: "create_room" });
const created = await next(host, "room_created");
const roomId = created.snapshot.roomId;

send(guest, { type: "join_room", roomId });
await next(host, "join_request");
send(host, { type: "join_response", targetUid: "guest-1", accept: true });
await next(guest, "join_accepted");

// One chat at a time (so we can assert without cross-socket ordering races).
send(guest, { type: "chat", text: "  Hello everyone!  " });
await wait(200);
send(host, { type: "chat", text: "Hi Guest 👋" });
await wait(200);
send(guest, { type: "chat", text: "   " }); // empty -> ignored
await wait(300);

// Everyone sees both real messages (sender included), in order, and not the empty one.
check(hostChats.length === 2 && guestChats.length === 2, "both sides have exactly 2 messages (empty ignored)");
check(guestChats[0]?.text === "Hello everyone!", "first message trimmed correctly");
check(guestChats[0]?.name === "Guest", "message carries sender name");
check(guestChats[1]?.text === "Hi Guest 👋", "second message delivered in order");
check(hostChats[0]?.text === "Hello everyone!" && hostChats[1]?.text === "Hi Guest 👋", "host sees identical history");
check(new Set([...hostChats, ...guestChats].map((m) => m.id)).size === 2, "messages have stable unique ids");

host.close(); guest.close();
console.log(fail === 0 ? "\nALL PASSED ✅" : `\n${fail} FAILED ❌`);
process.exit(fail === 0 ? 0 : 1);
