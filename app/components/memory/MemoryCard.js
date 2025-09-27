"use client";
import { useState } from "react";
import { Heart } from "lucide-react";

export default function MemoryCard({ memory }) {
  console.log(memory);
  const [likes, setLikes] = useState(memory.likes);
  const [liked, setLiked] = useState(false);

  const handleLike = async () => {
    const photo_id = memory.id;
    const user_id = localStorage.getItem("user");

    const formData = new URLSearchParams();
    formData.append("user_id", user_id);

    const endpoint = liked
      ? `https://api.doubleehbatteries.com/photos/${photo_id}/unlike?user_id=${user_id}`
      : `https://api.doubleehbatteries.com/photos/${photo_id}/like?user_id=${user_id}`;
    const method = "POST";

    try {
      const response = await fetch(endpoint, {
        method: method,
        headers: {},
        body: formData,
      });

      if (response.ok) {
        setLikes(liked ? likes - 1 : likes + 1);
        setLiked(!liked);
      } else {
        const errorData = await response.json();
        console.error("Failed to update like status:", errorData.detail);
      }
    } catch (error) {
      console.error("Error updating like status:", error);
    }
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
