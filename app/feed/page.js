"use client";
import React, { useState, useEffect, useMemo } from "react";
import { fetchMemoriesStub } from "../api";
import { PAGE_SIZE, DEFAULT_FEED_BG, PROCESSING_COLOR } from "./constants";

import FiltersBar from "../components/filters/FiltersBar";
import MemoryCard from "../components/memory/MemoryCard";
import UploadModal from "../components/upload/UploadModal";
import ChatPopup from "../components/chat/ChatPopup";

export default function Page() {
  const [memories, setMemories] = useState([]);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const [uploadOpen, setUploadOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatPreview, setChatPreview] = useState(undefined);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const results = await fetchMemoriesStub(filters);
      setMemories(results.slice(0, pageSize));
      setLoading(false);
    })();
  }, [filters, pageSize]);

  const allTags = useMemo(() => Array.from(new Set(memories.flatMap((m) => m.tags))), [memories]);
  const allUsers = useMemo(() => Array.from(new Set(memories.map((m) => m.userId))), [memories]);

  const handleApplyFilters = (f) => setFilters(f);
  const handleUploadCreated = (m) => setMemories((prev) => [m, ...prev]);
  const handleOpenEnhance = (preview) => { setChatPreview(preview); setChatOpen(true); };
  const handleProcess = async (memoryId) => {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1800));
    setMemories((prev) =>
        prev.map((m) =>
        m.id === memoryId
        ? { ...m, processed: true, tags: Array.from(new Set([...m.tags, "enhanced"])) }
        : m
    ));
    setProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header with glassmorphism */}
      <header className="sticky top-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Hall of Us Feed
              </h1>
              <p className="text-sm text-gray-300 mt-1">
                Discover and share your memories
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Filters with glassmorphism */}
        <div className="mb-6">
          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4">
            <FiltersBar
              tagsList={allTags}
              users={allUsers}
              onApply={handleApplyFilters}
            />
          </div>
        </div>

        {/* Feed Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {loading ? (
            <div className="col-span-full">
              <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-12 text-center">
                <div className="animate-pulse">
                  <div className="text-white text-lg">Loading your memories...</div>
                  <div className="mt-2 text-gray-300 text-sm">Please wait while we fetch your feed</div>
                </div>
              </div>
            </div>
          ) : memories.length === 0 ? (
            <div className="col-span-full">
              <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-12 text-center">
                <div className="text-white text-lg mb-2">No memories found</div>
                <div className="text-gray-300 text-sm mb-4">Start by uploading your first memory!</div>
                <button
                  onClick={() => setUploadOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
                >
                  Upload Memory
                </button>
              </div>
            </div>
          ) : (
            memories.map((m) => (
              <div key={m.id} className="transform transition-all duration-200 hover:scale-105">
                <MemoryCard memory={m} onProcess={handleProcess} />
              </div>
            ))
          )}
        </section>

        {/* Load More Button */}
        {memories.length > 0 && (
          <div className="mt-8 text-center">
            <button
              className="bg-white/10 backdrop-blur-md border border-white/30 text-white font-medium py-3 px-8 rounded-lg hover:bg-white/20 transition-all duration-200 transform hover:scale-105"
              onClick={() => setPageSize((s) => s + PAGE_SIZE)}
            >
              Load More Memories
            </button>
          </div>
        )}
      </main>

      {/* Floating Action Buttons with glassmorphism */}
      <button
        className="fixed left-4 bottom-4 z-40 bg-white/20 backdrop-blur-md border border-white/30 rounded-full w-14 h-14 shadow-2xl flex items-center justify-center text-white text-2xl hover:bg-white/30 transition-all duration-200 transform hover:scale-110"
        onClick={() => setUploadOpen(true)}
      >
        +
      </button>

      <button
        className="fixed right-4 bottom-4 z-40 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-full w-14 h-14 shadow-2xl flex items-center justify-center text-white text-xl transition-all duration-200 transform hover:scale-110"
        onClick={() => { setChatPreview(undefined); setChatOpen(true); }}
      >
        💬
      </button>

      {/* Processing Notification */}
      {processing && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-6 py-3 rounded-lg shadow-2xl">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Processing your memory...</span>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUpload={handleUploadCreated}
        onOpenEnhance={handleOpenEnhance}
      />
      <ChatPopup
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        memoryPreview={chatPreview}
      />
    </div>
  );
}
