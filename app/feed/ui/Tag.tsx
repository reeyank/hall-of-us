"use client";
import React from "react";

export default function Tag({ children }: { children: React.ReactNode }) {
  return <span className="text-xs bg-gray-100 px-2 py-1 rounded-full mr-2">{children}</span>;
}
