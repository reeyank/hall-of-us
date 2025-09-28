"use client";
import { useState } from "react";
import { Heart } from "lucide-react";

export default function MemoryCard({ memory }) {
  console.log(memory);
  const [likes, setLikes] = useState(memory.likes || 0);
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
        setLikes(liked ? (likes === null ? 0 : likes - 1) : (likes === null ? 1 : likes + 1));
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
      className="relative rounded-xl shadow-2xl max-w-md mx-auto my-4"
    >
      {/* Outer carved frame effect */}
      <div className="absolute inset-0 rounded-xl pointer-events-none"></div>
      
      <div className= "relative rounded-lg overflow-hidden bg-black">
        {/* Image */}
        <img src={memory.s3Url} alt={memory.caption} className="w-full h-auto object-cover" />

        {/* Caption + tags */}
        {/* <div className="p-3 text-white">
          <p className="mt-1">{memory.caption}</p>
          <p className="mt-1 text-blue-400">
            {memory.tags.map((t) => `#${t} `)}
          </p>
        </div> */}

        {/* Actions row */}
        {/* <div className="flex items-center gap-2 p-3">
          <button onClick={handleLike} className="transition-colors duration-200">
            <Heart
              size={24}
              stroke={liked ? "red" : "white"}
              fill={liked ? "red" : "none"}
            />
          </button>
          <span className="text-white font-medium">{likes}</span>
        </div> */}
      </div>

      {/* Plaque below the frame */}
      <div className="flex items-center justify-center -mt-8 relative z-0 p-2">
        <div className="bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg shadow-xl px-6 py-3 flex flex-col items-center gap-2">
          <div className="flex items-center gap-3">
            <img
              src={memory.pfp || `https://i.pravatar.cc/40?u=${memory.userId}`}
              alt={displayName}
              className="w-8 h-8 rounded-full object-cover shadow-md"
            />
            <span className="font-serif text-white text-lg font-medium">{displayName}</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <button onClick={handleLike} className="transition-colors duration-200">
              <Heart
                size={20}
                stroke={liked ? "red" : "white"}
                fill={liked ? "red" : "none"}
              />
            </button>
            <span className="text-white font-medium">{likes}</span>
            <div className="text-blue-400 text-sm ml-4">
              {memory.tags.map((t) => `#${t} `)}
            </div>
          </div>
        </div>
      </div>
      {memory.caption && (
        <div className="text-white text-sm text-center mt-3 px-4">
          {memory.caption}
        </div>
      )}
      </div>
  );
}
