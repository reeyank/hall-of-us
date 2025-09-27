import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center max-w-md mx-auto p-8">
        {/* Logo/Header */}
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Hall of Us
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Welcome to our AI-native application
        </p>

        {/* Navigation Buttons */}
        <div className="space-y-4">
          <Link
            href="/login"
            className="block w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Sign In
          </Link>

          <Link
            href="/signup"
            className="block w-full px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors font-semibold"
          >
            Sign Up
          </Link>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
          Choose an option above to get started
        </p>
      </div>
    </div>
  );
}
