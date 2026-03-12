import { readFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

type WatchlistEntry = {
  maskedUntil?: string;
  lastSeenId?: number;
};

type Watchlist = Record<string, WatchlistEntry>;

function loadWatchlist(): Watchlist | null {
  const path = join(homedir(), ".openclaw", "workspace", "memory", "ccc-watchlist.json");
  try {
    const data = readFileSync(path, "utf-8");
    return JSON.parse(data) as Watchlist;
  } catch {
    return null;
  }
}

export function shouldForward(session: string, messageId?: number): boolean {
  const watchlist = loadWatchlist();
  if (!watchlist) return true;

  const entry = watchlist[session];
  if (!entry) return true;

  if (entry.maskedUntil) {
    const until = new Date(entry.maskedUntil).getTime();
    if (Date.now() >= until) return true;
  }

  if (typeof messageId === "number" && typeof entry.lastSeenId === "number") {
    if (messageId <= entry.lastSeenId) return false;
  }

  if (entry.maskedUntil) {
    const until = new Date(entry.maskedUntil).getTime();
    if (Date.now() < until) return false;
  }

  return true;
}
