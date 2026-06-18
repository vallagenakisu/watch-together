"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import type { SearchResult } from "@/app/api/search/route";
import { parseVideoId } from "@/lib/youtube-id";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Props { onPick: (videoId: string) => void; }

export function SearchPanel({ onPick }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchDisabled, setSearchDisabled] = useState(false);

  async function runSearch() {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (res.status === 501) { setSearchDisabled(true); toast.info("Paste a YouTube URL to load a video."); return; }
      if (!res.ok) { toast.error("Search failed. Paste a YouTube URL instead."); return; }
      const data = (await res.json()) as { results: SearchResult[] };
      setResults(data.results);
      if (data.results.length === 0) toast.info("No results.");
    } catch { toast.error("Network error."); }
    finally { setLoading(false); }
  }

  function pickFromUrl() {
    const id = parseVideoId(query);
    if (!id) { toast.error("That doesn't look like a YouTube link or video id."); return; }
    onPick(id);
    setQuery("");
    setResults([]);
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (searchDisabled ? pickFromUrl() : runSearch())}
          placeholder={searchDisabled ? "Paste a YouTube URL…" : "Search or paste a YouTube URL…"}
        />
        {searchDisabled
          ? <Button onClick={pickFromUrl} disabled={!query.trim()}>Load</Button>
          : <Button onClick={runSearch} disabled={loading || !query.trim()}>{loading ? "…" : "Search"}</Button>}
      </div>
      {!searchDisabled && (
        <button type="button" onClick={pickFromUrl} className="self-start text-xs text-muted-foreground underline-offset-2 hover:underline">
          or load a YouTube URL directly
        </button>
      )}
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-2 pr-3">
          {results.map((r) => (
            <button key={r.videoId} type="button" onClick={() => onPick(r.videoId)}
              className="flex gap-3 rounded-lg p-2 text-left transition-colors hover:bg-accent">
              {r.thumbnail && (
                <Image src={r.thumbnail} alt="" width={120} height={90}
                  className="h-[68px] w-[120px] flex-none rounded-md object-cover" unoptimized />
              )}
              <span className="flex flex-col">
                <span className="line-clamp-2 text-sm font-medium">{r.title}</span>
                <span className="text-xs text-muted-foreground">{r.channel}</span>
              </span>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
