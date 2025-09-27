"use client";
import React from "react";

export default function Tag({ children }) {
  return (
    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full break-words inline-block">
      {children}
    </span>
  );
}
