"use client";
import React, { useState } from "react";

export default function FiltersBar({ tagsList, users, onApply, isOverlay = false }) {
  const [tag, setTag] = useState("");
  const [userId, setUserId] = useState("");
  const [date, setDate] = useState("");

  const containerClasses = isOverlay
    ? "space-y-4"
    : "bg-white p-3 rounded shadow-sm mb-4 flex items-center gap-3";

  const inputClasses = isOverlay
    ? "w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
        </>
      )}
    </div>
  );
}
