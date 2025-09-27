import { uid } from "./feed/types";
import { TAGS_POOL, USERS } from "./feed/constants";

export async function fetchMemoriesStub(filters) {
  try {
    const response = await fetch('https://api.doubleehbatteries.com/photos');
    if (!response.ok) {
      throw new Error(`Failed to fetch memories: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    const photos = data.photos || [];

    // Transform API response to match expected format for MemoryCard
    return photos.map(photo => ({
      id: photo.id,
      userId: photo.user_id || "unknown", // Use 'unknown' as default if user_id is null
      s3Url: photo.url,
      thumbnailUrl: photo.url, // Assuming thumbnail is the same as the full image URL
      tags: photo.tags ? photo.tags.split(',').map(s => s.trim()).filter(Boolean) : [], // Split tags string into array
      caption: photo.caption || "",
      createdAt: new Date().toISOString(), // API doesn't provide, use current time for now
      width: 900, // Placeholder
      height: 600, // Placeholder
      orientation: "horizontal", // Placeholder
      likes: photo.likes || 0,
      comments: 0, // Placeholder
      processed: false // Placeholder
    }));
  } catch (error) {
    console.error('Error fetching memories:', error);
    return []; // Return an empty array on error
  }
}

export async function uploadMemoryStub(payload) {
  try {
    const response = await fetch('https://api.doubleehbatteries.com/photos/upload', {
      method: 'POST',
      body: payload,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json()

    // Transform API response to match expected format
    return {
      id: result.id || uid("uploaded"),
      s3Url: result.url || URL.createObjectURL(payload.get("file")),
      thumbnailUrl: result.url || URL.createObjectURL(payload.get("file")), // API doesn't provide separate thumbnail URL
      userId: result.user_id || payload.get("user_id") || "you",
      tags: result.tags ? result.tags.split(",").map((s) => s.trim()) : payload.get("tags")?.split(",").map((s) => s.trim()) || [],
      caption: result.caption || payload.get("caption") || "",
      createdAt: new Date().toISOString(), // API doesn't provide created timestamp
      orientation: "vertical" // API doesn't provide orientation info
    };
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
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
