"use client";
import React, { useState } from "react";

export default function FiltersBar({ tagsList, users, onApply }: { tagsList: string[], users: string[], onApply: (filters: any) => void }) {
  const [tag, setTag] = useState("");
  const [userId, setUserId] = useState("");
  const [date, setDate] = useState("");

  return (
    <div className="bg-white p-3 rounded shadow-sm mb-4 flex items-center gap-3">
      <select className="border px-2 py-1 rounded" value={tag} onChange={(e) => setTag(e.target.value)}>
        <option value="">-- All tags --</option>
        {tagsList.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>

      <select className="border px-2 py-1 rounded" value={userId} onChange={(e) => setUserId(e.target.value)}>
        <option value="">-- All users --</option>
        {users.map((u) => <option key={u} value={u}>{u}</option>)}
      </select>

      <input className="border px-2 py-1 rounded" type="date" value={date} onChange={(e) => setDate(e.target.value)} />

      <button className="ml-auto bg-blue-600 text-white px-3 py-1 rounded" onClick={() => onApply({ tags: tag ? [tag] : [], userId: userId || undefined, date: date || undefined })}>Apply</button>
      <button className="ml-2 border px-3 py-1 rounded" onClick={() => { setTag(""); setUserId(""); setDate(""); onApply({}); }}>Clear</button>
    </div>
  );
}
