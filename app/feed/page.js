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
    <div className={`min-h-screen p-4 ${DEFAULT_FEED_BG}`}>
      <header className="max-w-4xl mx-auto mb-4">
        <h1 className="text-2xl font-semibold">Feed — MVP</h1>
        <p className="text-sm text-gray-600">Upload, filter and preview your memories. Chat & image enhance popup are placeholders.</p>
      </header>

      <main className="max-w-4xl mx-auto">
        <FiltersBar tagsList={allTags} users={allUsers} onApply={handleApplyFilters} />

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            <div className="col-span-full text-center py-12">Loading feed…</div>
          ) : (
            memories.map((m) => <MemoryCard key={m.id} memory={m} onProcess={handleProcess} />)
          )}
        </section>

        <div className="mt-6 text-center">
          <button className="px-4 py-2 border rounded" onClick={() => setPageSize((s) => s + PAGE_SIZE)}>Load more</button>
        </div>
      </main>

      <button className="fixed left-4 bottom-4 z-40 bg-white rounded-full w-14 h-14 shadow-lg flex items-center justify-center text-2xl" onClick={() => setUploadOpen(true)}>+</button>
      <button className="fixed right-4 bottom-4 z-40 bg-blue-600 rounded-full w-14 h-14 shadow-lg flex items-center justify-center text-white text-xl" onClick={() => { setChatPreview(undefined); setChatOpen(true); }}>💬</button>

      {processing && <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded shadow ${PROCESSING_COLOR}`}>Processing…</div>}

      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} onUpload={handleUploadCreated} onOpenEnhance={handleOpenEnhance} />
      <ChatPopup open={chatOpen} onClose={() => setChatOpen(false)} memoryPreview={chatPreview} />
    </div>
  );
}
