import { uid } from "./feed/types";

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
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: payload,
  });
  return response.json();
}
