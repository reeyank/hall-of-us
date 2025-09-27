import { Memory, uid } from "./types";
import { TAGS_POOL, USERS } from "./constants";

export async function fetchMemoriesStub(filters?: { tags?: string[]; userId?: string; date?: string }) {
  await new Promise((r) => setTimeout(r, 300));
  const base = generateSampleMemories(12, 1);
  return base.filter((m) => {
    if (filters?.tags && filters.tags.length && !filters.tags.some((t) => m.tags.includes(t))) return false;
    if (filters?.userId && m.userId !== filters.userId) return false;
    if (filters?.date && new Date(m.createdAt).toISOString().slice(0, 10) !== filters.date) return false;
    return true;
  });
}

export async function uploadMemoryStub(payload: FormData) {
  await new Promise((r) => setTimeout(r, 400));
  return {
    id: uid("uploaded"),
    s3Url: URL.createObjectURL(payload.get("file") as File),
    thumbnailUrl: URL.createObjectURL(payload.get("file") as File),
    userId: "you",
    tags: (payload.get("tags") as string)?.split(",").map((s) => s.trim()) || [],
    caption: (payload.get("caption") as string) || "",
    createdAt: new Date().toISOString(),
    orientation: "vertical"
  } as Memory;
}

export function generateSampleMemories(n = 6, startSeed = 1): Memory[] {
  const mems: Memory[] = [];
  for (let i = 0; i < n; i++) {
    const seed = startSeed + i;
    const vertical = Math.random() > 0.6;
    mems.push({
      id: uid(String(seed)),
      userId: USERS[(startSeed + i) % USERS.length],
      s3Url: `https://picsum.photos/seed/${seed}/${vertical ? 600 : 900}/${vertical ? 900 : 600}`,
      thumbnailUrl: `https://picsum.photos/seed/${seed}/${vertical ? 600 : 900}/${vertical ? 900 : 600}`,
      tags: TAGS_POOL[(startSeed + i) % TAGS_POOL.length],
      caption: `Sample caption ${seed}`,
      createdAt: new Date(Date.now() - i * 1000 * 60 * 60).toISOString(),
      width: vertical ? 600 : 900,
      height: vertical ? 900 : 600,
      orientation: vertical ? "vertical" : "horizontal",
      likes: Math.floor(Math.random() * 30),
      comments: Math.floor(Math.random() * 8),
      processed: false
    });
  }
  return mems;
}
