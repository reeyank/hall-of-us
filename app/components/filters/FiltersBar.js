"use client";
import React, { useState, useEffect, useRef } from "react";
import {CedarCaptionChat} from "../../../src/cedar/components/chatComponents/CedarCaptionChat"
import {EmbeddedCedarChat} from "../../../src/cedar/components/chatComponents/EmbeddedCedarChat"
import { useCedarStore } from "cedar-os";

export default function FiltersBar({ tagsList, users, onApply, isOverlay = false }) {
  const [tag, setTag] = useState("");
  const [userId, setUserId] = useState("");
  const [date, setDate] = useState("");
  const [nlText, setNlText] = useState("");
  const [isFiltering, setIsFiltering] = useState(false);

  // Get Cedar store state
  const cedarState = useCedarStore((state) => state);

  const handleFilterImages = async () => {
    setIsFiltering(true);

    try {
      const payloadPreview = {
        cedarState: {
          messages: cedarState.messages?.length || 0,
          currentThreadId: cedarState.currentThreadId || null,
        },
        activeFilters: { tag, userId, date },
        availableFilters: {
          tags: tagsList || [],
          userIds: users || [],
        }
      };
      console.log('handleFilterImages: sending payload preview', payloadPreview);
      // Send POST request to backend with CedarState
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}langchain/chat/filter_images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cedarState: {
            messages: cedarState.messages,
            currentThreadId: cedarState.currentThreadId,
            activeFilters: { tag, userId, date },
            // Include other relevant state data
            threads: cedarState.threads,
            threadMap: cedarState.threadMap,
          },
          // Provide the backend with all available filter options and raw lists
          availableFilters: {
            // tags and userIds use the lists passed into this component
            tags: tagsList || [],
            userIds: users || [],
            // Date may be freeform; backend can interpret empty array as unrestricted
            date: [],
          },
          // Convenience top-level arrays for explicit tag/user lists
          allTags: tagsList || [],
          allUserIds: users || [],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('handleFilterImages: received response', result);

      // Apply the filters returned from the backend
      if (result.filters) {
        console.log('handleFilterImages: applying filters', result.filters);
        onApply(result.filters);
      }

    } catch (error) {
      console.error('Error filtering images:', error);
    } finally {
      setIsFiltering(false);
    }
  };

  // Helper: send a natural language filter text to the same backend endpoint
  // Normalize filters returned from backend (support array of conditions)
  const normalizeFilters = (filters) => {
    if (!filters) return {};
    // If already an object with tags/userId/date, return as-is
    if (!Array.isArray(filters) && typeof filters === 'object') return filters;

    const normalized = { tags: [], userId: undefined, date: undefined };

    if (Array.isArray(filters)) {
      filters.forEach((f) => {
        try {
          const field = (f.field || f.name || '').toString();
          const operator = (f.operator || '').toString();
          const value = f.value !== undefined ? f.value : f.val || f.v || null;

          if (!field) return;

          if (field.toLowerCase().includes('tag')) {
            // support includes / equals
            if (Array.isArray(value)) {
              normalized.tags.push(...value.map(String));
            } else if (typeof value === 'string') {
              normalized.tags.push(value);
            }
          } else if (field.toLowerCase().includes('user')) {
            normalized.userId = typeof value === 'string' ? value : String(value);
          } else if (field.toLowerCase().includes('date') || field.toLowerCase().includes('created')) {
            normalized.date = typeof value === 'string' ? value : String(value);
          } else if (field === 'id' && operator === 'in') {
            // not supported directly, leave for now
          }
        } catch (err) {
          console.warn('normalizeFilters: failed to normalize filter entry', f, err);
        }
      });
      // dedupe tags
      normalized.tags = Array.from(new Set(normalized.tags));
    }

    return normalized;
  };

  const handleFilterText = async (text, trigger = null) => {
    if (!text || typeof text !== 'string') return;
    setIsFiltering(true);

    try {
      // generate a short request id for correlation
      const requestId = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
      console.log('Sending natural-language filter request:', { text, trigger, requestId });

      const response = await fetch(`http://localhost:8000/langchain/chat/filter_images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // correlation / session metadata useful for MCP servers
          requestId,
          clientSessionId: (cedarState && (cedarState.sessionId || cedarState.clientSessionId)) || localStorage.getItem('cedar_session') || null,
          // explicit caller user id if available
          userId: (cedarState && (cedarState.user || cedarState.userId)) || localStorage.getItem('user') || null,
          // timestamp for the request
          requestTimestamp: new Date().toISOString(),
          cedarState: {
            messages: cedarState.messages,
            currentThreadId: cedarState.currentThreadId,
            activeFilters: { tag, userId, date },
            threads: cedarState.threads,
            threadMap: cedarState.threadMap,
          },
          // editor text / input the user typed (if available on the cedar state)
          editorContent: typeof cedarState.stringifyEditor === 'function' ? cedarState.stringifyEditor() : (cedarState.editorContent || null),
          // compiled additional context (if the cedar API exposes a helper)
          compiledAdditionalContext: typeof cedarState.compileAdditionalContext === 'function' ? cedarState.compileAdditionalContext() : (cedarState.additionalContext || null),
          // registered states and agent connection logs help MCP servers understand the runtime
          registeredStates: cedarState.registeredStates || null,
          agentConnectionLogs: cedarState.agentConnectionLogs || null,
          // Provide the backend with all available filter options and raw lists
          availableFilters: {
            tags: tagsList || [],
            userIds: users || [],
            orientation: ["horizontal", "vertical"],
            processed: [true, false],
            date: [],
          },
          allTags: tagsList || [],
          allUserIds: users || [],
          naturalLanguageFilter: text,
          // Optional trigger metadata (e.g. came from a particular chat message or UI action)
          trigger: trigger || null,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('handleFilterText: received response', result);

      if (result.filters) {
        console.log('handleFilterText: raw filters from backend', result.filters);
        const normalized = normalizeFilters(result.filters);
        console.log('handleFilterText: normalized filters to apply', normalized);
        onApply(normalized);
        // update local UI selects where possible
        if (normalized.tags && normalized.tags.length > 0) setTag(normalized.tags[0] || '');
        if (normalized.userId) setUserId(normalized.userId);
        if (normalized.date) setDate(normalized.date);
      }
    } catch (error) {
      console.error('Error filtering images with text:', error);
    } finally {
      setIsFiltering(false);
    }
  };

  // Submit handler for the visible natural-language text input
  const handleNlSubmit = async (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    const text = (nlText || '').trim();
    if (!text) return;
    await handleFilterText(text, { source: 'filters_bar_text_input', messageId: null, threadId: cedarState.currentThreadId || null, contentSnippet: text.slice(0,200) });
    // keep the text so the user can tweak; optionally clear
    // setNlText('');
  };

  // Listen for new user messages from Cedar chat and treat qualifying messages as natural-language filters.
  const lastSentMessageId = useRef(null);
  useEffect(() => {
    const messages = cedarState.messages || [];
    if (!messages.length) return;
    const last = messages[messages.length - 1];

    // Only consider plain user text messages
    if (!last || last.role !== 'user' || last.type !== 'text') return;

    // Avoid re-sending the same message
    if (last.id && last.id === lastSentMessageId.current) return;

    const content = last.content || last.text || last.message || '';
    if (!content || typeof content !== 'string') return;

    // Heuristic: look for keywords that indicate filtering intent
    const lc = content.toLowerCase();
    const keywords = ['filter', 'show', 'only', 'images', 'photos', 'tag', 'user', 'from', 'after', 'before', 'date'];
    const looksLikeFilter = keywords.some((k) => lc.includes(k));

    if (looksLikeFilter) {
      lastSentMessageId.current = last.id || `${Date.now()}`;
      const trigger = {
        messageId: last.id || null,
        threadId: cedarState.currentThreadId || null,
        source: 'cedar_chat',
        contentSnippet: content.slice(0, 200),
      };
      handleFilterText(content, trigger);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cedarState.messages]);

  // Listen for explicit requests dispatched from the ChatInput (Use-as-filter button)
  useEffect(() => {
    const onNaturalFilter = (e) => {
      try {
        const detail = e && e.detail ? e.detail : null;
        if (!detail) return;
        const { text, trigger } = detail;
        // Avoid duplicates: if trigger has a messageId we've already processed, skip
        if (trigger && trigger.messageId && trigger.messageId === lastSentMessageId.current) return;
        if (trigger && trigger.messageId) {
          lastSentMessageId.current = trigger.messageId;
        }
        // Call the same handler that the heuristic path uses
        handleFilterText && handleFilterText(text, trigger || null);
      } catch (err) {
        console.error('Error handling naturalFilterRequest event', err);
      }
    };

    window.addEventListener('naturalFilterRequest', onNaturalFilter);
    return () => window.removeEventListener('naturalFilterRequest', onNaturalFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const containerClasses = isOverlay
    ? "space-y-4"
    : "bg-white p-3 rounded shadow-sm mb-4 flex items-center gap-3";

  const inputClasses = isOverlay
    ? "w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
    : "border px-2 py-1 rounded";

  const buttonClasses = isOverlay
    ? "w-full py-2 px-4 rounded-lg font-medium transition-colors"
    : "px-3 py-1 rounded";

  return (
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

          <div className="flex gap-3 mt-6">
            <button
              className={`${buttonClasses} bg-blue-600 hover:bg-blue-700 text-white flex-1`}
              onClick={() => {
                const applied = { tags: tag ? [tag] : [], userId: userId || undefined, date: date || undefined };
                console.log('Manual Apply Filters clicked, applying:', applied);
                onApply(applied);
              }}
            >
              Apply Filters
            </button>
            <button
              className={`${buttonClasses} border border-gray-300 hover:bg-gray-50 text-gray-700 flex-1`}
              onClick={() => { console.log('Clear All Filters clicked'); setTag(""); setUserId(""); setDate(""); onApply({}); }}
            >
              Clear All
            </button>
          </div>
          <div className="mt-3 text-sm text-gray-600">
            Tip: Type in what you want to filter below!
          </div>
          <form onSubmit={handleNlSubmit} className="mt-3 flex gap-2">
            <input
              type="text"
              placeholder="Or enter a natural-language filter..."
              // make it dark
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              value={nlText}
              onChange={(e) => setNlText(e.target.value)}
              disabled={isFiltering}
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              disabled={isFiltering || !nlText.trim()}
            >
              {isFiltering ? 'Filtering…' : 'Apply'}
            </button>
          </form>
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

          <button className={`ml-auto bg-blue-600 text-white ${buttonClasses}`} onClick={() => onApply({ tags: tag ? [tag] : [], userId: userId || undefined, date: date || undefined })}>Apply</button>
          <button className={`ml-2 border ${buttonClasses}`} onClick={() => { setTag(""); setUserId(""); setDate(""); onApply({}); }}>Clear</button>
          <div className="ml-4 text-sm text-gray-600 hidden md:block">
            Tip: use the embedded chat below to send natural-language filter requests.
          </div>
          <form onSubmit={handleNlSubmit} className="ml-4 hidden md:flex items-center gap-2">
            <input
              type="text"
              placeholder="Natural-language filter..."
              className={inputClasses + ' w-64'}
              value={nlText}
              onChange={(e) => setNlText(e.target.value)}
              disabled={isFiltering}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleNlSubmit(); } }}
            />
            <button
              type="button"
              className={`ml-2 bg-blue-600 text-white ${buttonClasses}`}
              onClick={handleNlSubmit}
              disabled={isFiltering || !nlText.trim()}
            >
              {isFiltering ? 'Filtering…' : 'Apply'}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
