"use client";
import React, { useState, useEffect, useMemo } from "react";
import { fetchMemoriesStub, removeMemoryFromBackend, getMemoryToRemoveFromChat } from "../api";
import { PAGE_SIZE, DEFAULT_FEED_BG, PROCESSING_COLOR } from "./constants";
import { useAuth } from "../components/AuthProvider";
import { useRouter } from 'next/navigation';
import { useRegisterFrontendTool } from 'cedar-os';
import { useSubscribeStateToAgentContext } from 'cedar-os';
import FiltersBar from "../components/filters/FiltersBar";
import MemoryCard from "../components/memory/MemoryCard";
import UploadModal from "../components/upload/UploadModal";
import { FloatingCedarChat } from "../../src/cedar/components/chatComponents/FloatingCedarChat";
import { useCedarStore } from 'cedar-os';
import { useRegisterState } from 'cedar-os';
import { z } from 'zod';

export default function Page() {
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const [uploadOpen, setUploadOpen] = useState(false);
  const [chatPreview, setChatPreview] = useState(undefined);
  const [processing, setProcessing] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const setShowChat = useCedarStore((state) => state.setShowChat);

  const [allMemories, setAllMemories] = useState([]);
  const [memories, setMemories] = useState([]);

  useRegisterState({
    key: 'allMemories',
    description: 'The memories that can be removed by Cedar. Current count: ' + allMemories.length,
    value: allMemories,
    setValue: setAllMemories,
    stateSetters: {
      removeMemory: {
        name: 'removeMemory',
        description: 'Remove a memory from the feed',
        argsSchema: z.object({
          memoryId: z.string().min(1, 'Memory ID cannot be empty').describe('The ID of the memory to remove'),
        }),
        execute: async (args) => {
          console.log('State setter removeMemory called with:', args);
          console.log('Current allMemories:', allMemories.map(m => ({ id: m.id, caption: m.caption })));
          
          try {
            // Call backend API first
            const backendResult = await removeMemoryFromBackend(args.memoryId);
            console.log('Backend removal result:', backendResult);
            
            if (backendResult.success) {
              const filtered = allMemories.filter(m => m.id !== args.memoryId);
              console.log('State setter filtered count:', filtered.length);
              setAllMemories(filtered);
              return { success: true, message: 'Memory removed successfully' };
            } else {
              return { success: false, message: 'Backend failed to remove memory' };
            }
          } catch (error) {
            console.error('Error in state setter removeMemory:', error);
            return { success: false, message: error.message };
          }
        },
      },
    },
  });

  useSubscribeStateToAgentContext('allMemories', (allMemories) => ({ allMemories }), {
    showInChat: false,
    color: '#4F46E5',
  });

  useRegisterFrontendTool({
    name: 'removeMemoryFromChat',
    description: 'Remove a memory based on chat context. The system will analyze the conversation to determine which memory to remove.',
    argsSchema: z.object({
      chatContext: z.string().describe('The current chat conversation context'),
    }),
    execute: async (args) => {
      console.log('removeMemoryFromChat tool called with context:', args.chatContext);
      console.log('Current allMemories:', allMemories.map(m => ({ id: m.id, caption: m.caption })));
      
      if (allMemories.length === 0) {
        return { success: false, message: 'No memories available to remove' };
      }
      
      try {
        // Call the new API to determine which memory to remove based on chat context
        const chatResult = await getMemoryToRemoveFromChat(args.chatContext, allMemories);
        console.log('Chat analysis result:', chatResult);
        
        if (!chatResult.success || !chatResult.memoryId) {
          return { 
            success: false, 
            message: chatResult.message || 'Could not determine which memory to remove from chat context'
          };
        }
        
        const memoryToRemove = allMemories.find(m => m.id === chatResult.memoryId);
        if (!memoryToRemove) {
          return { 
            success: false, 
            message: `Memory with ID ${chatResult.memoryId} not found in current memories`
          };
        }
        
        // Remove the memory from the frontend state
        const filtered = allMemories.filter(m => m.id !== chatResult.memoryId);
        console.log('Filtered memories:', filtered.length);
        setAllMemories(filtered);
        
        return { 
          success: true, 
          memoryId: chatResult.memoryId, 
          removedMemory: memoryToRemove,
          message: `Removed memory: ${memoryToRemove.caption || memoryToRemove.id}`,
          chatAnalysis: chatResult
        };
      } catch (error) {
        console.error('Error removing memory from chat context:', error);
        return { 
          success: false, 
          message: `Failed to remove memory from chat context: ${error.message}` 
        };
      }
    },
  });

  useRegisterFrontendTool({
    name: 'removeMemory',
    description: 'Remove a specific memory from the feed by ID. Use removeMemoryFromChat for context-based removal.',
    argsSchema: z.object({
      memoryId: z.string().min(1, 'Memory ID cannot be empty').describe('The ID of the memory to remove'),
    }),
    execute: async (args) => {
      console.log('removeMemory tool called with:', args);
      console.log('Current allMemories:', allMemories.map(m => ({ id: m.id, caption: m.caption })));
      
      const memoryExists = allMemories.find(m => m.id === args.memoryId);
      if (!memoryExists) {
        console.log('Memory not found with ID:', args.memoryId);
        return { success: false, memoryId: args.memoryId, message: `Memory with ID ${args.memoryId} not found` };
      }
      
      try {
        // Call the backend API to remove the memory
        const backendResult = await removeMemoryFromBackend(args.memoryId);
        console.log('Backend removal result:', backendResult);
        
        // If backend removal is successful, update the frontend state
        if (backendResult.success) {
          const filtered = allMemories.filter(m => m.id !== args.memoryId);
          console.log('Filtered memories:', filtered.length);
          setAllMemories(filtered);
          
          return { 
            success: true, 
            memoryId: args.memoryId, 
            message: `Memory ${args.memoryId} removed successfully from both frontend and backend`,
            backendResponse: backendResult
          };
        } else {
          return { 
            success: false, 
            memoryId: args.memoryId, 
            message: `Backend failed to remove memory: ${backendResult.message || 'Unknown error'}` 
          };
        }
      } catch (error) {
        console.error('Error calling backend to remove memory:', error);
        return { 
          success: false, 
          memoryId: args.memoryId, 
          message: `Failed to remove memory from backend: ${error.message}` 
        };
      }
    },
  });

  useRegisterFrontendTool({
    name: 'listMemoryIds',
    description: 'List all available memory IDs for removal',
    argsSchema: z.object({}),
    execute: async () => {
      const memoryList = allMemories.map(m => ({ id: m.id, caption: m.caption || 'No caption', userId: m.userId }));
      console.log('Available memories:', memoryList);
      return { 
        success: true, 
        memories: memoryList,
        message: `Found ${memoryList.length} memories. IDs: ${memoryList.map(m => m.id).join(', ')}` 
      };
    },
  });

  // Additional tool for backend-only removal (if needed)
  useRegisterFrontendTool({
    name: 'removeMemoryFromBackend',
    description: 'Remove a memory from backend storage only (without frontend state update)',
    argsSchema: z.object({
      memoryId: z.string().min(1, 'Memory ID cannot be empty').describe('The ID of the memory to remove'),
    }),
    execute: async (args) => {
      try {
        const backendResult = await removeMemoryFromBackend(args.memoryId);
        return {
          success: backendResult.success,
          memoryId: args.memoryId,
          message: backendResult.success 
            ? `Memory ${args.memoryId} removed from backend storage`
            : `Failed to remove memory from backend: ${backendResult.message}`,
          backendResponse: backendResult
        };
      } catch (error) {
        return {
          success: false,
          memoryId: args.memoryId,
          message: `Error removing memory from backend: ${error.message}`
        };
      }
    },
  });

  useEffect(() => {
    (async () => {
      const results = await fetchMemoriesStub({});
      setAllMemories(results);
    })();
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
    console.log('useEffect for filtering memories triggered. allMemories.length:', allMemories.length);
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

    console.log('Setting memories to filtered.slice(0, pageSize). Filtered count:', filtered.length, 'pageSize:', pageSize);
    setMemories(filtered.slice(0, pageSize));
    setLoading(false);
  }, [filters, pageSize, allMemories]);

  const handleApplyFilters = (f) => {
    setFilters(f);
    setFiltersOpen(false);

    let filtered = [...allMemories];

    if (f.tags && f.tags.length > 0) {
      filtered = filtered.filter((m) => f.tags.every((tag) => m.tags.includes(tag)));
    }

    if (f.userId) {
      filtered = filtered.filter((m) => m.userId === f.userId);
    }

    if (f.date) {
      filtered = filtered.filter((m) => m.date === f.date);
    }

    setMemories(filtered.slice(0, pageSize));
  };

  const handleUploadCreated = (m) => setMemories((prev) => [m, ...prev]);
  
  const handleOpenEnhance = (preview) => { 
    setChatPreview(preview); 
    setShowChat(true); 
  };
  
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

  // Optional: Add a manual remove function for UI buttons
  const handleRemoveMemory = async (memoryId) => {
    try {
      const backendResult = await removeMemoryFromBackend(memoryId);
      if (backendResult.success) {
        setAllMemories(prev => prev.filter(m => m.id !== memoryId));
        console.log(`Memory ${memoryId} removed successfully`);
      } else {
        console.error('Failed to remove memory:', backendResult.message);
        // You could show a toast notification here
      }
    } catch (error) {
      console.error('Error removing memory:', error);
      // You could show an error toast notification here
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed relative" style={{ backgroundImage: `url('/backdrop.png')` }}>
      <div className="absolute inset-0 bg-black opacity-70"></div> {/* Dark overlay for readability */}
      {/* Header with glassmorphism */}
      <header className="sticky top-0 z-50 bg-white/20 backdrop-blur-xl border-b border-white/40">
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
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 w-full">
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
                  <MemoryCard 
                    memory={m} 
                    onProcess={handleProcess}
                    onRemove={handleRemoveMemory} // Optional: if you want to add remove buttons to cards
                  />
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
      <FloatingCedarChat/>
    </div>
  );
}