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

export const removeMemoryFromBackend = async (memoryId) => {
  try {
    const response = await fetch('/langchain/chat/remove-memory', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        memory_id: memoryId,
        cedar_state: {
          timestamp: new Date().toISOString(),
          source: 'cedaros_frontend'
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error removing memory from backend:', error);
    throw error;
  }
};

export const getMemoryToRemoveFromChat = async (chatContext, allMemories) => {
  try {
    const response = await fetch('http://localhost:8000/chat/remove-memory', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_context: chatContext,
        available_memories: allMemories.map(m => ({
          id: m.id,
          caption: m.caption || '',
          tags: m.tags || [],
          userId: m.userId || '',
          createdAt: m.createdAt || ''
        }))
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result; // Should contain { memoryId: "some-id", success: true/false, message: "..." }
  } catch (error) {
    console.error('Error getting memory to remove from chat context:', error);
    throw error;
  }
};

export const findSimilarPostsByTag = async (tag, allMemories) => {
  try {
    // Filter memories that contain the selected tag
    const similarPosts = allMemories.filter(memory => 
      memory.tags.includes(tag)
    );

    // Sort by relevance (number of matching tags, then by creation date)
    const sortedPosts = similarPosts.sort((a, b) => {
      // Calculate tag overlap score
      const aTagOverlap = a.tags.filter(t => t === tag).length;
      const bTagOverlap = b.tags.filter(t => t === tag).length;
      
      if (aTagOverlap !== bTagOverlap) {
        return bTagOverlap - aTagOverlap;
      }
      
      // If same tag overlap, sort by creation date (newest first)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return {
      success: true,
      posts: sortedPosts,
      tag: tag,
      count: sortedPosts.length,
      message: `Found ${sortedPosts.length} posts with tag #${tag}`
    };
  } catch (error) {
    console.error('Error finding similar posts by tag:', error);
    return {
      success: false,
      posts: [],
      tag: tag,
      count: 0,
      message: `Error finding posts with tag #${tag}: ${error.message}`
    };
  }
};

export const findSimilarPostsAdvanced = async (selectedMemory, allMemories) => {
  try {
    // Advanced similarity search based on multiple factors
    const similarPosts = allMemories
      .filter(memory => memory.id !== selectedMemory.id) // Exclude the selected memory itself
      .map(memory => {
        let score = 0;
        
        // Tag similarity (highest weight)
        const tagIntersection = memory.tags.filter(tag => selectedMemory.tags.includes(tag));
        score += tagIntersection.length * 3;
        
        // User similarity (medium weight)
        if (memory.userId === selectedMemory.userId) {
          score += 2;
        }
        
        // Date proximity (lower weight)
        const daysDiff = Math.abs(new Date(memory.createdAt) - new Date(selectedMemory.createdAt)) / (1000 * 60 * 60 * 24);
        if (daysDiff < 7) score += 1; // Within a week
        
        return { ...memory, similarityScore: score, sharedTags: tagIntersection };
      })
      .filter(memory => memory.similarityScore > 0) // Only include memories with some similarity
      .sort((a, b) => b.similarityScore - a.similarityScore); // Sort by similarity score

    return {
      success: true,
      posts: similarPosts,
      baseMemory: selectedMemory,
      count: similarPosts.length,
      message: `Found ${similarPosts.length} similar posts`
    };
  } catch (error) {
    console.error('Error finding similar posts:', error);
    return {
      success: false,
      posts: [],
      baseMemory: selectedMemory,
      count: 0,
      message: `Error finding similar posts: ${error.message}`
    };
  }
};