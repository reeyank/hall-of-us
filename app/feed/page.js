"use client";

import React, { useState, useEffect, useMemo } from "react";
import { fetchMemoriesStub } from '../api';
import UploadModal from '../components/upload/UploadModal';
import ChatPopup from '../components/chat/ChatPopup';

const PAGE_SIZE = 10;

// Transform API photos to match expected memory structure
const transformPhotoToMemory = (photo) => ({
  id: photo.id,
  url: photo.url,
  filename: photo.filename,
  tags: photo.tags ? photo.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
  user_id: photo.user_id || 'anonymous',
  userId: photo.user_id || 'anonymous',
  likes: photo.likes || 0,
  processed: false,
  createdAt: photo.exif_gps_info?.["29"] || new Date().toISOString(),
  exif_gps_info: photo.exif_gps_info
});

// FiltersBar Component
const FiltersBar = ({ tagsList, users, onApply, isOverlay }) => {
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  const handleApply = () => {
    onApply({
      tags: selectedTags,
      userId: selectedUser,
      date: selectedDate
    });
  };

  const handleReset = () => {
    setSelectedTags([]);
    setSelectedUser('');
    setSelectedDate('');
    onApply({});
  };

  return (
    <div className="space-y-4">
      {/* Tags Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
        <div className="flex flex-wrap gap-2">
          {tagsList.map(tag => (
            <button
              key={tag}
              onClick={() => {
                setSelectedTags(prev => 
                  prev.includes(tag) 
                    ? prev.filter(t => t !== tag)
                    : [...prev, tag]
                );
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedTags.includes(tag)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* User Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">User</label>
        <select 
          value={selectedUser} 
          onChange={(e) => setSelectedUser(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Users</option>
          {users.map(user => (
            <option key={user} value={user}>{user}</option>
          ))}
        </select>
      </div>

      {/* Date Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4">
        <button
          onClick={handleApply}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Apply Filters
        </button>
        <button
          onClick={handleReset}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

// MemoryCard Component
const MemoryCard = ({ memory, onProcess }) => {
  const [liked, setLiked] = useState(false);
  
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden hover:bg-white/15 transition-all duration-200">
      <div className="aspect-square relative">
        <img 
          src={memory.url} 
          alt={memory.filename}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x400?text=Image+Not+Found';
          }}
        />
        {memory.processed && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            Enhanced
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex flex-wrap gap-1 mb-3">
          {memory.tags.map(tag => (
            <span key={tag} className="bg-white/20 text-white px-2 py-1 rounded-full text-xs">
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex items-center justify-between text-white text-sm">
          <span>@{memory.user_id}</span>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setLiked(!liked)}
              className={`flex items-center gap-1 ${liked ? 'text-red-400' : 'text-white/70'} hover:text-red-400 transition-colors`}
            >
              <span>♥</span>
              <span>{memory.likes + (liked ? 1 : 0)}</span>
            </button>
            
            {!memory.processed && (
              <button
                onClick={() => onProcess(memory.id)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors"
              >
                Enhance
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Feed Component
export default function FeedPage() {
  const [page, setPage] = useState(1);
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
    const getAllMemories = async () => {
      setLoading(true);
      try {
        const results = await fetchMemoriesStub(filters);
        const transformedResults = results.photos.map(transformPhotoToMemory);
        setAllMemories(transformedResults);
      } finally {
        setLoading(false);
      }
    };

    getAllMemories();
  }, [filters]);

  const allTags = useMemo(
    () => Array.from(new Set(allMemories.flatMap((m) => m.tags))),
    [allMemories]
  );
  
  const allUsers = useMemo(
    () => Array.from(new Set(allMemories.map((m) => m.user_id))),
    [allMemories]
  );

  useEffect(() => {
    const startIndex = 0;
    const endIndex = page * pageSize;
    setMemories(allMemories.slice(startIndex, endIndex));
  }, [page, pageSize, allMemories]);

  const handleApplyFilters = (f) => {
    setFilters(f);
    setPage(1); // Reset to first page on new filters
    setFiltersOpen(false);
  };

  const handleUploadCreated = (m) => setAllMemories((prev) => [m, ...prev]);
  const handleOpenEnhance = (preview) => { setChatPreview(preview); setChatOpen(true); };

  const handleProcess = async (memoryId) => {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1800));
    setMemories((prev) =>
      prev.map((m) =>
        m.id === memoryId
          ? { ...m, processed: true, tags: Array.from(new Set([...m.tags, "enhanced"])) }
          : m
      )
    );
    setAllMemories((prev) =>
      prev.map((m) =>
        m.id === memoryId
          ? { ...m, processed: true, tags: Array.from(new Set([...m.tags, "enhanced"])) }
          : m
      )
    );
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
            <button className="bg-white/10 backdrop-blur-md border border-white/30 text-white font-medium py-2 px-4 rounded-lg hover:bg-white/20 transition-all duration-200">
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
        {memories.length > 0 && memories.length >= pageSize && (
          <div className="mt-8 text-center">
            <button
              className="bg-white/10 backdrop-blur-md border border-white/30 text-white font-medium py-3 px-8 rounded-lg hover:bg-white/20 transition-all duration-200 transform hover:scale-105"
              onClick={() => setPage((prevPage) => prevPage + 1)}
            >
              Load More Memories
            </button>
          </div>
        )}
      </main>

      {/* Floating Action Buttons */}
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
      {uploadOpen && (
        <UploadModal
          open={uploadOpen}
          onClose={() => setUploadOpen(false)}
          onUpload={handleUploadCreated}
          onOpenEnhance={handleOpenEnhance}
        />
      )}
      {chatOpen && (
        <ChatPopup
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          memoryPreview={chatPreview}
        />
      )}
    </div>
  );
}