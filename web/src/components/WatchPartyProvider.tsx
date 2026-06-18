"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useWatchParty, type WatchParty } from "@/lib/useWatchParty";

const WatchPartyContext = createContext<WatchParty | null>(null);

export function WatchPartyProvider({ children }: { children: ReactNode }) {
  const party = useWatchParty();
  return <WatchPartyContext.Provider value={party}>{children}</WatchPartyContext.Provider>;
}

export function useParty(): WatchParty {
  const ctx = useContext(WatchPartyContext);
  if (!ctx) throw new Error("useParty must be used within <WatchPartyProvider>");
  return ctx;
}
