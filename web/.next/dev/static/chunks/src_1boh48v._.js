(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/lib/identity.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getName",
    ()=>getName,
    "getUid",
    ()=>getUid,
    "setName",
    ()=>setName
]);
/**
 * Temporary identity. No accounts: each browser gets a random uid + display
 * name persisted in localStorage, so it survives refreshes but is unique per
 * browser/profile.
 */ const UID_KEY = "wt_uid";
const NAME_KEY = "wt_name";
const ADJECTIVES = [
    "Swift",
    "Calm",
    "Brave",
    "Lucky",
    "Cosmic",
    "Sunny",
    "Mellow",
    "Witty"
];
const ANIMALS = [
    "Otter",
    "Falcon",
    "Panda",
    "Fox",
    "Koala",
    "Heron",
    "Lynx",
    "Whale"
];
function randomName() {
    const a = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const b = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
    return `${a} ${b}`;
}
function getUid() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    let uid = localStorage.getItem(UID_KEY);
    if (!uid) {
        uid = crypto.randomUUID();
        localStorage.setItem(UID_KEY, uid);
    }
    return uid;
}
function getName() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    let name = localStorage.getItem(NAME_KEY);
    if (!name) {
        name = randomName();
        localStorage.setItem(NAME_KEY, name);
    }
    return name;
}
function setName(name) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    localStorage.setItem(NAME_KEY, name.trim() || randomName());
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/useWatchParty.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useWatchParty",
    ()=>useWatchParty
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$identity$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/identity.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
;
const WS_URL = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8080";
function useWatchParty() {
    _s();
    const [uid, setUid] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [status, setStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("connecting");
    const [room, setRoom] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [joinStatus, setJoinStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("idle");
    const [joinRequests, setJoinRequests] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const wsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const controlHandlers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(new Set());
    const reconnectTimer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const shouldReconnect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(true);
    const send = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useWatchParty.useCallback[send]": (msg)=>{
            const ws = wsRef.current;
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(msg));
            }
        }
    }["useWatchParty.useCallback[send]"], []);
    const connect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useWatchParty.useCallback[connect]": ()=>{
            const myUid = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$identity$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getUid"])();
            const myName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$identity$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getName"])();
            setUid(myUid);
            const ws = new WebSocket(WS_URL);
            wsRef.current = ws;
            setStatus("connecting");
            ws.onopen = ({
                "useWatchParty.useCallback[connect]": ()=>{
                    setStatus("open");
                    ws.send(JSON.stringify({
                        type: "hello",
                        uid: myUid,
                        name: myName
                    }));
                    // If we were already in a room, resync after a reconnect.
                    setRoom({
                        "useWatchParty.useCallback[connect]": (current)=>{
                            if (current) {
                                ws.send(JSON.stringify({
                                    type: "join_room",
                                    roomId: current.roomId
                                }));
                            }
                            return current;
                        }
                    }["useWatchParty.useCallback[connect]"]);
                }
            })["useWatchParty.useCallback[connect]"];
            ws.onmessage = ({
                "useWatchParty.useCallback[connect]": (event)=>{
                    let msg;
                    try {
                        msg = JSON.parse(event.data);
                    } catch  {
                        return;
                    }
                    handleServerMessage(msg);
                }
            })["useWatchParty.useCallback[connect]"];
            ws.onclose = ({
                "useWatchParty.useCallback[connect]": ()=>{
                    setStatus("closed");
                    if (shouldReconnect.current) {
                        reconnectTimer.current = setTimeout(connect, 1500);
                    }
                }
            })["useWatchParty.useCallback[connect]"];
            ws.onerror = ({
                "useWatchParty.useCallback[connect]": ()=>{
                    ws.close();
                }
            })["useWatchParty.useCallback[connect]"];
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["useWatchParty.useCallback[connect]"], []);
    const handleServerMessage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useWatchParty.useCallback[handleServerMessage]": (msg)=>{
            switch(msg.type){
                case "room_created":
                    setRoom(msg.snapshot);
                    setJoinStatus("joined");
                    setError(null);
                    break;
                case "join_pending":
                    setJoinStatus("pending");
                    break;
                case "join_request":
                    setJoinRequests({
                        "useWatchParty.useCallback[handleServerMessage]": (reqs)=>reqs.some({
                                "useWatchParty.useCallback[handleServerMessage]": (r)=>r.uid === msg.uid
                            }["useWatchParty.useCallback[handleServerMessage]"]) ? reqs : [
                                ...reqs,
                                {
                                    uid: msg.uid,
                                    name: msg.name
                                }
                            ]
                    }["useWatchParty.useCallback[handleServerMessage]"]);
                    break;
                case "join_accepted":
                    setRoom(msg.snapshot);
                    setJoinStatus("joined");
                    setError(null);
                    break;
                case "join_rejected":
                    setJoinStatus("rejected");
                    setRoom(null);
                    break;
                case "members_changed":
                    setRoom({
                        "useWatchParty.useCallback[handleServerMessage]": (r)=>r ? {
                                ...r,
                                members: msg.members,
                                hostUid: msg.hostUid
                            } : r
                    }["useWatchParty.useCallback[handleServerMessage]"]);
                    // Drop any pending request now reflected in the member list.
                    setJoinRequests({
                        "useWatchParty.useCallback[handleServerMessage]": (reqs)=>reqs.filter({
                                "useWatchParty.useCallback[handleServerMessage]": (req)=>!msg.members.some({
                                        "useWatchParty.useCallback[handleServerMessage]": (m)=>m.uid === req.uid
                                    }["useWatchParty.useCallback[handleServerMessage]"])
                            }["useWatchParty.useCallback[handleServerMessage]"])
                    }["useWatchParty.useCallback[handleServerMessage]"]);
                    break;
                case "control":
                    {
                        // Keep the room snapshot in step with the latest control so video id /
                        // playing / position stay accurate (drives declarative video loading).
                        const action = msg.action;
                        setRoom({
                            "useWatchParty.useCallback[handleServerMessage]": (r)=>{
                                if (!r) return r;
                                if (action.kind === "set_video") {
                                    return {
                                        ...r,
                                        videoId: action.videoId,
                                        currentTime: action.time,
                                        isPlaying: false,
                                        serverTime: Date.now()
                                    };
                                }
                                return {
                                    ...r,
                                    isPlaying: action.kind === "play",
                                    currentTime: action.time,
                                    serverTime: Date.now()
                                };
                            }
                        }["useWatchParty.useCallback[handleServerMessage]"]);
                        // Hand play/pause/seek to the player. set_video is handled declaratively
                        // via the room.videoId change, so the player ignores it here.
                        for (const handler of controlHandlers.current)handler(action);
                        break;
                    }
                case "room_state":
                    setRoom(msg.snapshot);
                    break;
                case "error":
                    setError(msg.message);
                    break;
            }
        }
    }["useWatchParty.useCallback[handleServerMessage]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useWatchParty.useEffect": ()=>{
            shouldReconnect.current = true;
            connect();
            return ({
                "useWatchParty.useEffect": ()=>{
                    shouldReconnect.current = false;
                    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
                    wsRef.current?.close();
                }
            })["useWatchParty.useEffect"];
        }
    }["useWatchParty.useEffect"], [
        connect
    ]);
    const createRoom = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useWatchParty.useCallback[createRoom]": (videoId)=>send({
                type: "create_room",
                videoId
            })
    }["useWatchParty.useCallback[createRoom]"], [
        send
    ]);
    const joinRoom = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useWatchParty.useCallback[joinRoom]": (roomId)=>{
            setJoinStatus("pending");
            send({
                type: "join_room",
                roomId
            });
        }
    }["useWatchParty.useCallback[joinRoom]"], [
        send
    ]);
    const respondJoin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useWatchParty.useCallback[respondJoin]": (targetUid, accept)=>{
            send({
                type: "join_response",
                targetUid,
                accept
            });
            setJoinRequests({
                "useWatchParty.useCallback[respondJoin]": (reqs)=>reqs.filter({
                        "useWatchParty.useCallback[respondJoin]": (r)=>r.uid !== targetUid
                    }["useWatchParty.useCallback[respondJoin]"])
            }["useWatchParty.useCallback[respondJoin]"]);
        }
    }["useWatchParty.useCallback[respondJoin]"], [
        send
    ]);
    const sendControl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useWatchParty.useCallback[sendControl]": (action)=>send({
                type: "control",
                action
            })
    }["useWatchParty.useCallback[sendControl]"], [
        send
    ]);
    const leaveRoom = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useWatchParty.useCallback[leaveRoom]": ()=>{
            send({
                type: "leave_room"
            });
            setRoom(null);
            setJoinStatus("idle");
            setJoinRequests([]);
        }
    }["useWatchParty.useCallback[leaveRoom]"], [
        send
    ]);
    const subscribeControl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useWatchParty.useCallback[subscribeControl]": (handler)=>{
            controlHandlers.current.add(handler);
            return ({
                "useWatchParty.useCallback[subscribeControl]": ()=>{
                    controlHandlers.current.delete(handler);
                }
            })["useWatchParty.useCallback[subscribeControl]"];
        }
    }["useWatchParty.useCallback[subscribeControl]"], []);
    const isHost = !!room && room.hostUid === uid;
    return {
        uid,
        status,
        room,
        members: room?.members ?? [],
        isHost,
        joinStatus,
        joinRequests,
        error,
        createRoom,
        joinRoom,
        respondJoin,
        sendControl,
        leaveRoom,
        subscribeControl
    };
}
_s(useWatchParty, "P0FEDNMf6CAe50gpVVsCx78pfz8=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/WatchPartyProvider.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WatchPartyProvider",
    ()=>WatchPartyProvider,
    "useParty",
    ()=>useParty
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$useWatchParty$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/useWatchParty.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
/**
 * Holds the single WebSocket connection for the whole app. Mounted once in the
 * root layout so the connection (and room membership) survives client-side
 * navigation between the home page and a room page.
 */ const WatchPartyContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(null);
function WatchPartyProvider({ children }) {
    _s();
    const party = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$useWatchParty$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWatchParty"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(WatchPartyContext.Provider, {
        value: party,
        children: children
    }, void 0, false, {
        fileName: "[project]/src/components/WatchPartyProvider.tsx",
        lineNumber: 15,
        columnNumber: 10
    }, this);
}
_s(WatchPartyProvider, "awYyjGYNt6jEzHMKWliEPmOVAKY=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$useWatchParty$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWatchParty"]
    ];
});
_c = WatchPartyProvider;
function useParty() {
    _s1();
    const ctx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(WatchPartyContext);
    if (!ctx) throw new Error("useParty must be used within <WatchPartyProvider>");
    return ctx;
}
_s1(useParty, "/dMy7t63NXD4eYACoT93CePwGrg=");
var _c;
__turbopack_context__.k.register(_c, "WatchPartyProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ui/sonner.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Toaster",
    ()=>Toaster
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-themes/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CircleCheckIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-check.mjs [app-client] (ecmascript) <export default as CircleCheckIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__InfoIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/info.mjs [app-client] (ecmascript) <export default as InfoIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TriangleAlertIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/triangle-alert.mjs [app-client] (ecmascript) <export default as TriangleAlertIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$octagon$2d$x$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__OctagonXIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/octagon-x.mjs [app-client] (ecmascript) <export default as OctagonXIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2Icon$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.mjs [app-client] (ecmascript) <export default as Loader2Icon>");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
const Toaster = ({ ...props })=>{
    _s();
    const { theme = "system" } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Toaster"], {
        theme: theme,
        className: "toaster group",
        icons: {
            success: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CircleCheckIcon$3e$__["CircleCheckIcon"], {
                className: "size-4"
            }, void 0, false, {
                fileName: "[project]/src/components/ui/sonner.tsx",
                lineNumber: 16,
                columnNumber: 11
            }, ("TURBOPACK compile-time value", void 0)),
            info: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__InfoIcon$3e$__["InfoIcon"], {
                className: "size-4"
            }, void 0, false, {
                fileName: "[project]/src/components/ui/sonner.tsx",
                lineNumber: 19,
                columnNumber: 11
            }, ("TURBOPACK compile-time value", void 0)),
            warning: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TriangleAlertIcon$3e$__["TriangleAlertIcon"], {
                className: "size-4"
            }, void 0, false, {
                fileName: "[project]/src/components/ui/sonner.tsx",
                lineNumber: 22,
                columnNumber: 11
            }, ("TURBOPACK compile-time value", void 0)),
            error: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$octagon$2d$x$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__OctagonXIcon$3e$__["OctagonXIcon"], {
                className: "size-4"
            }, void 0, false, {
                fileName: "[project]/src/components/ui/sonner.tsx",
                lineNumber: 25,
                columnNumber: 11
            }, ("TURBOPACK compile-time value", void 0)),
            loading: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2Icon$3e$__["Loader2Icon"], {
                className: "size-4 animate-spin"
            }, void 0, false, {
                fileName: "[project]/src/components/ui/sonner.tsx",
                lineNumber: 28,
                columnNumber: 11
            }, ("TURBOPACK compile-time value", void 0))
        },
        style: {
            "--normal-bg": "var(--popover)",
            "--normal-text": "var(--popover-foreground)",
            "--normal-border": "var(--border)",
            "--border-radius": "var(--radius)"
        },
        toastOptions: {
            classNames: {
                toast: "cn-toast"
            }
        },
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/sonner.tsx",
        lineNumber: 11,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(Toaster, "EriOrahfenYKDCErPq+L6926Dw4=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"]
    ];
});
_c = Toaster;
;
var _c;
__turbopack_context__.k.register(_c, "Toaster");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_1boh48v._.js.map