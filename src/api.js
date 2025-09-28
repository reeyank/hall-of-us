// src/api.js
const BASE_URL = "https://api.doubleehbatteries.com";

export async function fetchUsers() {
  const response = await fetch(`${BASE_URL}/users`);
  if (!response.ok) throw new Error("Failed to fetch users");
  return response.json();
}

export async function fetchItems() {
  const response = await fetch(`${BASE_URL}/items`);
  if (!response.ok) throw new Error("Failed to fetch items");
  return response.json();
}

export async function createItem(data) {
  const response = await fetch(`${BASE_URL}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create item");
  return response.json();
}