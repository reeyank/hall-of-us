"use client";
import React from "react";
import Tag from "../ui/Tag";

export default function MemoryCard({ memory, onProcess }) {
  return (
    <article className="rounded-lg shadow-sm overflow-hidden bg-white">
      <div className="relative">
        <img src={memory.thumbnailUrl} alt={memory.caption} className="w-full h-72 object-cover" />
        {memory.processed && <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">Processed</div>}
      </div>
      <div className="p-3">
        <div className="text-sm text-gray-600 flex flex-wrap">
          {memory.tags.map((t, i) => <Tag key={`${t}-${i}`}>{t}</Tag>)}
        </div>
        <p className="mt-2 text-sm text-gray-800">{memory.caption}</p>
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <span>{new Date(memory.createdAt).toLocaleString()}</span>
          <div className="flex gap-2 items-center">
            <button className="px-2 py-1 rounded bg-blue-50 text-blue-600 text-sm" onClick={() => onProcess(memory.id)}>Process</button>
            <div className="text-xs">❤️ {memory.likes}</div>
            <div className="text-xs">💬 {memory.comments}</div>
          </div>
        </div>
      </div>
    </article>
  );
}
