"use client";
import React, { useState, useEffect, useRef } from "react";
import { uploadMemoryStub } from "../../api";

export default function UploadModal({ open, onClose, onUpload, onOpenEnhance }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [tags, setTags] = useState("");
  const [caption, setCaption] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (!file) return setPreview(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleUpload = async () => {
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    form.append("tags", tags);
    form.append("caption", caption);
    const created = await uploadMemoryStub(form);
    onUpload(created);
    setFile(null);
    setTags("");
    setCaption("");
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-full max-w-2xl p-4 rounded shadow-lg">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">Upload memory</h3>
          <button onClick={onClose} className="text-gray-600">Close</button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="border rounded p-2 h-64 flex items-center justify-center">
              {preview ? <img src={preview} className="h-full object-contain" alt="preview" /> : <div className="text-sm text-gray-500">No image selected</div>}
            </div>
            <input ref={inputRef} className="mt-2" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </div>
          <div>
            <label className="text-sm">Tags (comma separated)</label>
            <input className="w-full border px-2 py-1 rounded mt-1" value={tags} onChange={(e) => setTags(e.target.value)} />
            <label className="text-sm mt-3 block">Caption</label>
            <textarea className="w-full border px-2 py-1 rounded mt-1 h-28" value={caption} onChange={(e) => setCaption(e.target.value)} />
            <div className="mt-3 flex gap-2">
              <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={handleUpload}>Upload</button>
              <button className="border px-3 py-1 rounded" onClick={() => onOpenEnhance(preview ?? undefined)}>Enhance (open chat)</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
