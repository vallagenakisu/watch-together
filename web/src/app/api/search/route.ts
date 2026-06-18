import { NextResponse } from "next/server";

export interface SearchResult {
  videoId: string;
  title: string;
  channel: string;
  thumbnail: string;
}

interface YouTubeSearchItem {
  id: { videoId: string };
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: { medium?: { url: string }; default?: { url: string } };
  };
}

export async function GET(request: Request) {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "Search is not configured. Paste a YouTube URL instead." },
      { status: 501 },
    );
  }

  const q = new URL(request.url).searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ results: [] });

  const api = new URL("https://www.googleapis.com/youtube/v3/search");
  api.searchParams.set("part", "snippet");
  api.searchParams.set("type", "video");
  api.searchParams.set("maxResults", "12");
  api.searchParams.set("q", q);
  api.searchParams.set("key", key);

  const res = await fetch(api, { next: { revalidate: 0 } });
  if (!res.ok) return NextResponse.json({ error: "YouTube search failed." }, { status: 502 });

  const data = (await res.json()) as { items: YouTubeSearchItem[] };
  const results: SearchResult[] = (data.items ?? []).map((item) => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    channel: item.snippet.channelTitle,
    thumbnail: item.snippet.thumbnails.medium?.url ?? item.snippet.thumbnails.default?.url ?? "",
  }));

  return NextResponse.json({ results });
}
