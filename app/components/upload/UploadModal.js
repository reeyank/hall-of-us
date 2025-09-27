"use client";
import React, { useState, useEffect, useRef } from "react";
import { uploadMemoryStub } from "../../api";
import Tag from "../ui/Tag";

// Dummy tags for autocomplete (in real app, this would come from backend)
const AVAILABLE_TAGS = [
  "hackathon", "teamwork", "food", "snack", "sponsor", "banner",
  "judges", "selfie", "work", "whiteboard", "fun", "team",
  "nature", "sunset", "photography", "friends", "family", "travel",
  "beach", "mountain", "city", "party", "celebration", "memories"
];

export default function UploadModal({ open, onClose, onUpload, onOpenEnhance }) {
  const [step, setStep] = useState(1); // 1: upload, 2: add tags/caption, 3: uploading
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [currentTag, setCurrentTag] = useState("");
  const [filteredTags, setFilteredTags] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [caption, setCaption] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const fileInputRef = useRef(null);
  const tagInputRef = useRef(null);

  useEffect(() => {
    if (!file) return setPreview(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setStep(1);
      setFile(null);
      setSelectedTags([]);
      setCurrentTag("");
      setCaption("");
      setUploadProgress(0);
      setShowToast(false);
      setShowSuggestions(false);
    }
  }, [open]);

  // Filter tags based on current input
  useEffect(() => {
    if (currentTag.length > 0) {
      const filtered = AVAILABLE_TAGS
        .filter(tag =>
          tag.toLowerCase().includes(currentTag.toLowerCase()) &&
          !selectedTags.includes(tag)
        )
        .slice(0, 5); // Show max 5 suggestions
      setFilteredTags(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setFilteredTags([]);
      setShowSuggestions(false);
    }
  }, [currentTag, selectedTags]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!open) return;

      if (e.key === 'Escape') {
        if (showSuggestions) {
          setShowSuggestions(false);
          setCurrentTag("");
        } else {
          onClose();
        }
      } else if (e.key === 'Enter' && step === 3) {
        // Close modal when upload is complete
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [open, step, showSuggestions, onClose]);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    if (selectedFile) {
      setStep(2); // Move to tags/caption step
    }
  };

  const addTag = (tag) => {
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
    setCurrentTag("");
    setShowSuggestions(false);
    tagInputRef.current?.focus();
  };

  const removeTag = (tagToRemove) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInput = (e) => {
    const value = e.target.value;

    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredTags.length > 0) {
        addTag(filteredTags[0]);
      } else if (value.trim()) {
        addTag(value.trim());
      }
    } else if (e.key === 'Backspace' && value === "" && selectedTags.length > 0) {
      // Remove last tag if backspace on empty input
      setSelectedTags(selectedTags.slice(0, -1));
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setStep(3); // Show progress
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 20;
      });
    }, 100);

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("tags", selectedTags.join(","));
      form.append("caption", caption);

      const created = await uploadMemoryStub(form);

      // Complete progress
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Show success toast
      setTimeout(() => {
        setShowToast(true);
        onUpload(created);

        // Auto close after showing toast
        setTimeout(() => {
          setFile(null);
          setSelectedTags([]);
          setCaption("");
          onClose();
        }, 2000);
      }, 500);

    } catch (error) {
      clearInterval(progressInterval);
      console.error('Upload failed:', error);
      // Could add error handling here
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      handleFileSelect(droppedFile);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Main Modal - Mobile Optimized */}
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
        <div className="bg-white/95 backdrop-blur-md h-full w-full flex flex-col">

          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              {step === 1 ? 'Upload Memory' : step === 2 ? 'Add Details' : 'Uploading...'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl w-8 h-8 flex items-center justify-center"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto">

            {/* Step 1: Upload File */}
            {step === 1 && (
              <div className="p-6 h-full flex flex-col">
                <div
                  className="flex-1 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer flex flex-col items-center justify-center"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="text-6xl mb-4">📸</div>
                  <p className="text-lg font-medium text-gray-700 mb-2">Tap to select an image</p>
                  <p className="text-sm text-gray-500">or drag and drop here</p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
                  className="hidden"
                />
              </div>
            )}

            {/* Step 2: Add Tags and Caption - Mobile Layout */}
            {step === 2 && (
              <div className="p-6 space-y-6">

                {/* Image Preview */}
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-xl overflow-hidden">
                    {preview ? (
                      <img src={preview} className="w-full h-64 object-cover" alt="preview" />
                    ) : (
                      <div className="h-64 flex items-center justify-center text-gray-400">No preview</div>
                    )}
                  </div>
                  <button
                    onClick={() => setStep(1)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                  >
                    ← Change Image
                  </button>
                </div>

                {/* Tags Section */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Tags</label>

                  {/* Selected Tags */}
                  {selectedTags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedTags.map((tag, index) => (
                        <div key={index} className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          <span>{tag}</span>
                          <button
                            onClick={() => removeTag(tag)}
                            className="ml-2 text-blue-600 hover:text-blue-800 font-semibold"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tag Input */}
                  <div className="relative">
                    <input
                      ref={tagInputRef}
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyDown={handleTagInput}
                      placeholder={selectedTags.length === 0 ? "Type a tag and press enter..." : "Add another tag..."}
                    />

                    {/* Tag Suggestions */}
                    {showSuggestions && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto z-10">
                        {filteredTags.map((tag, index) => (
                          <button
                            key={index}
                            className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                            onClick={() => addTag(tag)}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Caption Section */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Caption</label>
                  <textarea
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white h-24 resize-none"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Write a caption for your memory..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4">
                  <button
                    className="w-full py-3 px-4 rounded-lg font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={handleUpload}
                  >
                    Upload Memory
                  </button>
                  <button
                    className="w-full py-3 px-4 rounded-lg font-medium transition-colors border border-gray-300 hover:bg-gray-50 text-gray-700"
                    onClick={() => onOpenEnhance(preview ?? undefined)}
                  >
                    ✨ Enhance with AI
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Upload Progress */}
            {step === 3 && (
              <div className="p-6 h-full flex flex-col items-center justify-center text-center space-y-6">
                <div className="text-xl font-semibold text-gray-800">
                  {uploadProgress < 100 ? 'Uploading...' : 'Upload Complete!'}
                </div>

                {uploadProgress < 100 && (
                  <div className="w-full max-w-xs space-y-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-600">{Math.round(uploadProgress)}% complete</div>
                  </div>
                )}

                {uploadProgress >= 100 && (
                  <div className="space-y-4">
                    <div className="text-5xl">✅</div>
                    <div className="text-sm text-gray-600">
                      Tap anywhere to close
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Success Toast */}
      {showToast && (
        <div className="fixed top-4 left-4 right-4 z-[60] bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 ease-out">
          <div className="flex items-center gap-2">
            <span className="text-lg">✅</span>
            <span className="font-medium">Memory uploaded successfully!</span>
          </div>
        </div>
      )}
    </>
  );
}
