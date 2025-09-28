// app/components/filters/FiltersBar.js
"use client";
import React, { useState } from "react";
import TouchEnabledWrapper from "../touch/TouchEnabledWrapper"; // keep if you use it; else remove

export default function FiltersBar({ tagsList = [], users = [], onApply = () => {}, isOverlay = false }) {
  const [tag, setTag] = useState("");
  const [userId, setUserId] = useState("");
  const [date, setDate] = useState("");

  // AI modal state
  const [aiOpen, setAiOpen] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const containerClasses = isOverlay
    ? "space-y-4"
    : "bg-white p-3 rounded shadow-sm mb-4 flex items-center gap-3";

  const inputClasses = isOverlay
    ? "w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
    : "border px-2 py-1 rounded";

  const buttonClasses = isOverlay
    ? "w-full py-2 px-4 rounded-lg font-medium transition-colors"
    : "px-3 py-1 rounded";

  const doApply = (override = {}) => {
    const payload = {
      tags: override.tags ?? (tag ? [tag] : []),
      userId: override.userId ?? (userId || undefined),
      date: override.date ?? (date || undefined),
    };
    onApply(payload);
  };

  const openAiModal = () => {
    setAiInput("");
    setAiError("");
    setAiOpen(true);
  };

  const closeAiModal = () => {
    setAiOpen(false);
    setAiLoading(false);
    setAiError("");
  };

  const submitAi = async () => {
    if (!aiInput.trim()) {
      setAiError("Type something describing what you want to filter.");
      return;
    }
    setAiError("");
    setAiLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: aiInput.trim() }),
      });

      const payload = await res.json();

      if (!res.ok || !payload.success) {
        const errMsg = (payload && payload.error) || `Server error ${res.status}`;
        setAiError(errMsg);
        setAiLoading(false);
        return;
      }

      const data = payload.data || { tags: [], userId: null, date: null };

      // map result into UI fields and apply filters
      const newTag = (Array.isArray(data.tags) && data.tags[0]) || "";
      setTag(newTag);
      setUserId(data.userId || "");
      setDate(data.date || "");
      doApply({ tags: data.tags || [], userId: data.userId || undefined, date: data.date || undefined });
      closeAiModal();
    } catch (err) {
      console.error("AI call failed:", err);
      setAiError("Network or server error. Check console.");
      setAiLoading(false);
    }
  };

  return (
    <>
      <div className={containerClasses}>
        {isOverlay ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Tag</label>
              <select className={inputClasses} value={tag} onChange={(e) => setTag(e.target.value)}>
                <option value="">All tags</option>
                {tagsList.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by User</label>
              <select className={inputClasses} value={userId} onChange={(e) => setUserId(e.target.value)}>
                <option value="">All users</option>
                {users.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Date</label>
              <input className={inputClasses} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <div className="flex gap-3">
                <button
                  className={`${buttonClasses} bg-blue-600 hover:bg-blue-700 text-white flex-1`}
                  onClick={() => doApply()}
                >
                  Apply Filters
                </button>
                <button
                  className={`${buttonClasses} border border-gray-300 hover:bg-gray-50 text-gray-700 flex-1`}
                  onClick={() => { setTag(""); setUserId(""); setDate(""); onApply({}); }}
                >
                  Clear All
                </button>
              </div>
              <div className="flex justify-end">
                <TouchEnabledWrapper
                  touchMapping={{ singleTap: 0 }} // placeholder if you rely on MouseEvent constants
                  touchConfig={{ tapThreshold: 10 }}
                >
                  <button
                    className="px-3 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-sm"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); openAiModal(); }}
                  >
                    💬 Ask AI
                  </button>
                </TouchEnabledWrapper>
              </div>
            </div>
          </>
        ) : (
          <>
            <select className={inputClasses} value={tag} onChange={(e) => setTag(e.target.value)}>
              <option value="">-- All tags --</option>
              {tagsList.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>

            <select className={inputClasses} value={userId} onChange={(e) => setUserId(e.target.value)}>
              <option value="">-- All users --</option>
              {users.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>

            <input className={inputClasses} type="date" value={date} onChange={(e) => setDate(e.target.value)} />

            <div className="ml-auto flex items-center gap-6">
              <div className="flex items-center gap-2">
                <button className={`bg-blue-600 text-white ${buttonClasses}`} onClick={() => doApply()}>Apply</button>
                <button className={`border ${buttonClasses}`} onClick={() => { setTag(""); setUserId(""); setDate(""); onApply({}); }}>Clear</button>
              </div>

              <TouchEnabledWrapper touchMapping={{ singleTap: 0 }} touchConfig={{ tapThreshold: 10 }}>
                <button
                  className="px-3 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded text-sm"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); openAiModal(); }}
                >
                  💬 Ask AI
                </button>
              </TouchEnabledWrapper>
            </div>
          </>
        )}
      </div>

      {/* AI Modal (simple) */}
      {aiOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <div className="font-semibold">AI Filter — Describe what you want</div>
              <button onClick={closeAiModal} className="text-gray-500">×</button>
            </div>

            <div className="p-4">
              <textarea
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder='e.g. "Show me hackathon photos from alice last September"'
                className="w-full border rounded p-3 h-28 resize-none"
              />
              {aiError && <div className="text-red-600 mt-2">{aiError}</div>}
            </div>

            <div className="px-4 py-3 border-t flex items-center justify-end gap-3">
              <button onClick={closeAiModal} className="px-4 py-2 rounded border">Cancel</button>
              <button
                onClick={submitAi}
                disabled={aiLoading}
                className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60"
              >
                {aiLoading ? "Thinking..." : "Apply AI Filters"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


/*"use client";
import React, { useState } from "react";
import { MouseEvent, useCedarStore } from "cedar-os";
import TouchEnabledWrapper from "../touch/TouchEnabledWrapper";
import { useCedarChat } from "../../hooks/useCedarChat";

export default function FiltersBar({ tagsList, users, onApply, isOverlay = false }) {
  const setShowChat = useCedarStore((state) => state.setShowChat);
  
  // Use our custom chat hook
  useCedarChat((message) => handleChatResponse(message));
  const handleChatResponse = async (message) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error('Failed to get chat response');
      }

      const data = await response.json();
      
      // Update the filter states
      if (data.tags) setTag(data.tags[0] || '');
      if (data.userId) setUserId(data.userId);
      if (data.date) setDate(data.date);

      // Apply the filters
      onApply({
        tags: data.tags || [],
        userId: data.userId,
        date: data.date,
      });
    } catch (error) {
      console.error('Error processing chat:', error);
    }
  };
  const [tag, setTag] = useState("");
  const [userId, setUserId] = useState("");
  const [date, setDate] = useState("");

  const containerClasses = isOverlay
    ? "space-y-4"
    : "bg-white p-3 rounded shadow-sm mb-4 flex items-center gap-3";

  const inputClasses = isOverlay
    ? "w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
    : "border px-2 py-1 rounded";

  const buttonClasses = isOverlay
    ? "w-full py-2 px-4 rounded-lg font-medium transition-colors"
    : "px-3 py-1 rounded";

  const content = (
    <div className={containerClasses}>
      {isOverlay ? (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Tag</label>
            <select className={inputClasses} value={tag} onChange={(e) => setTag(e.target.value)}>
              <option value="">All tags</option>
              {tagsList.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by User</label>
            <select className={inputClasses} value={userId} onChange={(e) => setUserId(e.target.value)}>
              <option value="">All users</option>
              {users.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Date</label>
            <input className={inputClasses} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <div className="flex gap-3">
              <button
                className={`${buttonClasses} bg-blue-600 hover:bg-blue-700 text-white flex-1`}
                onClick={() => onApply({ tags: tag ? [tag] : [], userId: userId || undefined, date: date || undefined })}
              >
                Apply Filters
              </button>
              <button
                className={`${buttonClasses} border border-gray-300 hover:bg-gray-50 text-gray-700 flex-1`}
                onClick={() => { setTag(""); setUserId(""); setDate(""); onApply({}); }}
              >
                Clear All
              </button>
            </div>
            <div className="flex justify-end">
              <TouchEnabledWrapper
                touchMapping={{
                  singleTap: MouseEvent.CLICK
                }}
                touchConfig={{
                  tapThreshold: 10
                }}
              >
                <button
                  className="px-3 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowChat(true);
                  }}
                >
                  💬 Ask AI
                </button>
              </TouchEnabledWrapper>
            </div>
          </div>
        </>
      ) : (
        <>
          <select className={inputClasses} value={tag} onChange={(e) => setTag(e.target.value)}>
            <option value="">-- All tags --</option>
            {tagsList.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>

          <select className={inputClasses} value={userId} onChange={(e) => setUserId(e.target.value)}>
            <option value="">-- All users --</option>
            {users.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>

          <input className={inputClasses} type="date" value={date} onChange={(e) => setDate(e.target.value)} />

          <div className="ml-auto flex items-center gap-6">
            <div className="flex items-center gap-2">
              <button 
                className={`bg-blue-600 text-white ${buttonClasses}`} 
                onClick={() => onApply({ tags: tag ? [tag] : [], userId: userId || undefined, date: date || undefined })}
              >Apply</button>
              <button 
                className={`border ${buttonClasses}`} 
                onClick={() => { setTag(""); setUserId(""); setDate(""); onApply({}); }}
              >Clear</button>
            </div>
            <TouchEnabledWrapper
              touchMapping={{
                singleTap: MouseEvent.CLICK
              }}
              touchConfig={{
                tapThreshold: 10
              }}
            >
              <button
                className="px-3 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded text-sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowChat(true);
                }}
              >
                💬 Ask AI
              </button>
            </TouchEnabledWrapper>
          </div>
          <button className={`ml-2 border ${buttonClasses}`} onClick={() => { setTag(""); setUserId(""); setDate(""); onApply({}); }}>Clear</button>
        </>
      )}
    </div>
  );

  return content;
}*/
