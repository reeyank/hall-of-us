import { uid } from "./feed/types";
import { TAGS_POOL, USERS } from "./feed/constants";

export async function fetchMemoriesStub(filters) {
  const url = new URL('https://api.doubleehbatteries.com/photos');
  // Add filter parameters if they exist
  if (filters.tags && filters.tags.length > 0) {
    url.searchParams.append('tags', filters.tags.join(','));
  }
  if (filters.userId) {
    url.searchParams.append('user_id', filters.userId);
  }
  if (filters.date) {
    url.searchParams.append('date', filters.date);
  }
  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.json();
}

export async function uploadMemoryStub(payload) {
  await new Promise((r) => setTimeout(r, 400));
  return {
    id: uid("uploaded"),
    s3Url: URL.createObjectURL(payload.get("file")),
    thumbnailUrl: URL.createObjectURL(payload.get("file")),
    userId: "you",
    tags: payload.get("tags")?.split(",").map((s) => s.trim()) || [],
    caption: payload.get("caption") || "",
    createdAt: new Date().toISOString(),
    orientation: "vertical"
  };
}

export function generateSampleMemories(n = 6, startSeed = 1) {
  const mems = [];
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
