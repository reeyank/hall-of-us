"use client";

import { useState } from 'react';
import { FloatingCedarChat } from '@/cedar/components/chatComponents/FloatingCedarChat';
import Link from 'next/link';

export default function Home() {
  const [showChat, setShowChat] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Hall of Us
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            AI-native application powered by CedarOS. Experience the future of human-AI collaboration.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              💬 AI Chat
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Floating chat interface with AI capabilities. Click the chat icon to start a conversation.
            </p>
            <button
              onClick={() => setShowChat(!showChat)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              {showChat ? 'Hide Chat' : 'Show Chat'}
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              📸 Smart Camera
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Take photos with your webcam and get AI-powered tag suggestions instantly.
            </p>
            <Link
              href="/camera"
              className="inline-block px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Open Camera
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              🎯 Interactive Spells
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Explore radial menus, sliders, and interactive UI elements.
            </p>
            <Link
              href="/demo/spells"
              className="inline-block px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Try Spells
            </Link>
          </div>          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              🧠 State Management
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              AI agents can read and modify application state in real-time.
            </p>
            <Link
              href="/demo/state"
              className="inline-block px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              View State Demo
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              🎨 3D Effects
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Beautiful 3D containers, glowing meshes, and visual effects.
            </p>
            <Link
              href="/demo/effects"
              className="inline-block px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              See Effects
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              📝 Text Animations
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Typewriter effects, shimmer text, and phantom text animations.
            </p>
            <Link
              href="/demo/text"
              className="inline-block px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
            >
              Text Demo
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              🔧 All Components
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Comprehensive showcase of all available CedarOS components.
            </p>
            <Link
              href="/demo/showcase"
              className="inline-block px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
            >
              Full Showcase
            </Link>
          </div>
        </div>

        {/* Getting Started */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            🚀 Getting Started
          </h2>
          <div className="space-y-4 text-gray-600 dark:text-gray-300">
            <p>
              <strong>1. Set up your API key:</strong> Add your OpenAI API key to the <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">.env.local</code> file.
            </p>
            <p>
              <strong>2. Try the camera:</strong> Click "Open Camera" to take photos and get AI-powered tag suggestions!
            </p>
            <p>
              <strong>3. Chat with AI:</strong> The floating chat is already enabled. Ask it anything!
            </p>
            <p>
              <strong>4. Explore demos:</strong> Click on any of the feature cards above to see CedarOS in action.
            </p>
            <p>
              <strong>5. Build something amazing:</strong> Check the <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">.github-copilot-instructions.md</code> file for development guidelines.
            </p>
          </div>
        </div>
      </div>

      {/* Floating Chat - conditionally rendered */}
      {showChat && <FloatingCedarChat />}
    </div>
  );
}
