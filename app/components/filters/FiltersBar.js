"use client";
import React, { useState, useEffect, useRef } from "react";
import {CedarCaptionChat} from "../../../src/cedar/components/chatComponents/CedarCaptionChat"
import {EmbeddedCedarChat} from "../../../src/cedar/components/chatComponents/EmbeddedCedarChat"
import { useCedarStore } from "cedar-os";

export default function FiltersBar({ tagsList, users, onApply, isOverlay = false }) {
  const [tag, setTag] = useState("");
  const [userId, setUserId] = useState("");
  const [date, setDate] = useState("");
  const [isFiltering, setIsFiltering] = useState(false);

  // Get Cedar store state
  const cedarState = useCedarStore((state) => state);

  const handleFilterImages = async () => {
    setIsFiltering(true);

    try {
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

      // Apply the filters returned from the backend
      if (result.filters) {
        onApply(result.filters);
      }

    } catch (error) {
      console.error('Error filtering images:', error);
    } finally {
      setIsFiltering(false);
    }
  };

  // Helper: send a natural language filter text to the same backend endpoint
  const handleFilterText = async (text, trigger = null) => {
    if (!text || typeof text !== 'string') return;
    setIsFiltering(true);

    try {
      // generate a short request id for correlation
      const requestId = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}langchain/chat/filter_images`, {
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

      if (result.filters) {
        onApply(result.filters);
      }
    } catch (error) {
      console.error('Error filtering images with text:', error);
    } finally {
      setIsFiltering(false);
    }
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
          <div className="mt-3 text-sm text-gray-600">
            Tip: You can also type natural-language filter requests in the embedded Cedar chat below (e.g. "show me images tagged beach from alice after 2024-01-01").
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

          <button className={`ml-auto bg-blue-600 text-white ${buttonClasses}`} onClick={() => onApply({ tags: tag ? [tag] : [], userId: userId || undefined, date: date || undefined })}>Apply</button>
          <button className={`ml-2 border ${buttonClasses}`} onClick={() => { setTag(""); setUserId(""); setDate(""); onApply({}); }}>Clear</button>
          <div className="ml-4 text-sm text-gray-600 hidden md:block">
            Tip: use the embedded chat below to send natural-language filter requests.
          </div>
        </>
      )}
    </div>
  );
}
