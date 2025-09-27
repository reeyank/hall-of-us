"use client";

import WebcamCapture from '../components/WebcamCapture';
import Link from 'next/link';

export default function CameraPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors"
          >
            <span className="text-lg">←</span>
            Back to Home
          </Link>
        </div>

        {/* Main Content */}
        <WebcamCapture />

        {/* Instructions */}
        <div className="mt-8 max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              📋 How it works
            </h3>
            <div className="space-y-2 text-gray-600 dark:text-gray-300">
              <p>• <strong>Start Camera:</strong> Click "Start Camera" to begin webcam feed</p>
              <p>• <strong>Capture Photo:</strong> Click "Capture Photo" when ready to take a picture</p>
              <p>• <strong>AI Analysis:</strong> The AI will analyze your image and suggest relevant tags</p>
              <p>• <strong>Take Another:</strong> Click "Take Another" to capture a new photo</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
