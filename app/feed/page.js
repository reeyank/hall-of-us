"use client";
import React, { useState, useEffect, useMemo } from "react";
import { fetchMemoriesStub } from "../api";
import { PAGE_SIZE, DEFAULT_FEED_BG, PROCESSING_COLOR } from "./constants";
import { useAuth } from "../components/AuthProvider";
import { useRouter } from 'next/navigation';

import FiltersBar from "../components/filters/FiltersBar";
import MemoryCard from "../components/memory/MemoryCard";
import UploadModal from "../components/upload/UploadModal";
import ChatPopup from "../components/chat/ChatPopup";

export default function Page() {
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const [uploadOpen, setUploadOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatPreview, setChatPreview] = useState(undefined);
  const [processing, setProcessing] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [allMemories, setAllMemories] = useState([]);
  const [memories, setMemories] = useState([]);
  useEffect(() => {
    const fetchMemories = async () => {
      setLoading(true);
      try {
        const results = await fetchMemoriesStub({});
        setAllMemories(results);               // master list
        setMemories(results.slice(0, pageSize)); // initial paginated list
      } finally {
        setLoading(false);
      }
    };

    fetchMemories();
  }, []);


  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const allTags = useMemo(
    () => Array.from(new Set(allMemories.flatMap((m) => m.tags))),
    [allMemories]
  );
  const allUsers = useMemo(
    () => Array.from(new Set(allMemories.map((m) => m.userId))),
    [allMemories]
  );

  useEffect(() => {
    setLoading(true);

    const filtered = allMemories.filter((m) => {
      if (filters.tags && filters.tags.length > 0) {
        if (!filters.tags.every((tag) => m.tags.includes(tag))) return false;
      }

      if (filters.userId && m.userId !== filters.userId) return false;

      if (filters.date) {
        const memDate = new Date(m.createdAt);
        if (isNaN(memDate.getTime())) return false;

        // normalize memDate to YYYY-MM-DD
        const memDateStr = memDate.toISOString().split("T")[0];

        // normalize user input date to YYYY-MM-DD
        let filterDate = filters.date;
        if (filterDate.includes("/")) {
          const [month, day, year] = filterDate.split("/");
          filterDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
        }

        if (memDateStr !== filterDate) return false;
      }

      return true;
    });

    setMemories(filtered.slice(0, pageSize));
    setLoading(false);
  }, [filters, pageSize, allMemories]);

  const handleApplyFilters = (f) => {
    setFilters(f);
    setFiltersOpen(false);
  };
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
            <button
              onClick={handleLogout}
              className="bg-white/10 backdrop-blur-md border border-white/30 text-white font-medium py-2 px-4 rounded-lg hover:bg-white/20 transition-all duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Filter Button */}
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => setFiltersOpen(true)}
            className="bg-white/10 backdrop-blur-md border border-white/30 text-white font-medium py-3 px-6 rounded-lg hover:bg-white/20 transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707v6.586a1 1 0 01-1.414.914l-4-2A1 1 0 018 18.586v-4.586a1 1 0 00-.293-.707L1.293 7.293A1 1 0 011 6.586V4z" />
            </svg>
            Filters
            {(filters.tags?.length || filters.userId || filters.date) && (
              <span className="ml-1 bg-blue-500 text-xs rounded-full px-2 py-0.5">
                {(filters.tags?.length || 0) + (filters.userId ? 1 : 0) + (filters.date ? 1 : 0)}
              </span>
            )}
          </button>
        </div>

        {/* Feed Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 w-full overflow-hidden">
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

      {/* Filters Overlay */}
      {filtersOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4">
          <div className="bg-white/95 backdrop-blur-md rounded-xl border border-white/20 p-6 w-full max-w-md mx-4 animate-in slide-in-from-top duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
              <button
                onClick={() => setFiltersOpen(false)}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <FiltersBar
              tagsList={allTags}
              users={allUsers}
              onApply={handleApplyFilters}
              isOverlay={true}
            />
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
