"use client";
import { useState } from "react";
import { Heart } from "lucide-react";

export default function MemoryCard({ memory }) {
  const [likes, setLikes] = useState(memory.likes || Math.floor(Math.random() * 50 + 1));
  const [liked, setLiked] = useState(false);

  const handleLike = () => {
    setLikes(liked ? likes - 1 : likes + 1);
    setLiked(!liked);
  };

  const displayName = memory.userId
    ? memory.userId.charAt(0).toUpperCase() + memory.userId.slice(1)
    : "User";

  return (
    <div
      className="rounded-xl overflow-hidden shadow-lg max-w-md mx-auto my-4 border border-gray-700
                 bg-gradient-to-br from-black/70 via-gray-900/50 to-black/70 backdrop-blur-md"
    >
      {/* Header: PFP + Name */}
      <div className="flex items-center gap-3 p-3">
        <img
          src={memory.pfp || `https://i.pravatar.cc/40?u=${memory.userId}`}
          alt={displayName}
          className="w-10 h-10 rounded-full object-cover border border-gray-500"
        />
        <span className="font-semibold text-white">{displayName}</span>
      </div>

      {/* Image */}
      <img src={memory.s3Url} alt={memory.caption} className="w-full h-auto object-cover" />

      {/* Caption + tags */}
      <div className="p-3 text-white">
        <p className="mt-1">{memory.caption}</p>
        <p className="mt-1 text-blue-400">
          {memory.tags.map((t) => `#${t} `)}
        </p>
      </div>

      {/* Actions row */}
      <div className="flex items-center gap-2 p-3">
        <button onClick={handleLike} className="transition-colors duration-200">
          <Heart
            size={24}
            stroke={liked ? "red" : "white"}
            fill={liked ? "red" : "none"}
          />
        </button>
        <span className="text-white font-medium">{likes}</span>
      </div>
    </div>
  );
}
