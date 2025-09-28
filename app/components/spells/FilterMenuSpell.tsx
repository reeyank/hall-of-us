"use client";
import { useState } from "react";
import ChatPopup from "../chat/ChatPopup";

export default function FilterMenuSpell() {
  const [category, setCategory] = useState("");
  const [tag, setTag] = useState("");

  const filters = {
    ...(category && { category }),
    ...(tag && { tag }),
  };

  return (
    <div className="p-4">
      <h2 className="font-bold mb-2">Filter Menu</h2>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border rounded px-2 py-1"
        />
        <input
          type="text"
          placeholder="Tag"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          className="border rounded px-2 py-1"
        />
      </div>

      {/* Pass filters into the ChatPopup */}
      <ChatPopup filters={filters} />
    </div>
  );
}
