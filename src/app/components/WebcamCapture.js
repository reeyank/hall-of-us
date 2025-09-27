"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Square, RotateCcw, Loader2, Tag, X } from 'lucide-react';

export default function WebcamCapture() {
  const [stream, setStream] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestedTags, setSuggestedTags] = useState([]);
  const [error, setError] = useState(null);
  const [cameraStatus, setCameraStatus] = useState('idle'); // idle, requesting, active, error

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Effect to set video stream when both stream and videoRef are available
  useEffect(() => {
    if (stream && videoRef.current && isStreaming) {
      console.log('Setting video stream via useEffect');
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(console.warn);
    }
  }, [stream, isStreaming]);

  const startCamera = useCallback(async () => {
    try {
      setError(null);

      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        setError('Not running in browser environment');
        return;
      }

      // Check for HTTPS requirement on mobile
      if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
        setError('Camera requires HTTPS on mobile devices. Try using localhost or deploy with HTTPS.');
        return;
      }

      // Check for mediaDevices support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Camera API not supported in this browser');
        return;
      }

      // Request camera with mobile-friendly constraints
      const constraints = {
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          facingMode: 'user' // Use front camera on mobile
        },
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

      console.log('Media stream obtained:', mediaStream);
      console.log('Video tracks:', mediaStream.getVideoTracks());

      // Set stream and isStreaming - useEffect will handle the video element
      setStream(mediaStream);
      setIsStreaming(true);

      console.log('Stream state updated, useEffect will handle video element');
    } catch (err) {
      console.error('Camera access error:', err);

      // Provide more specific error messages
      if (err.name === 'NotAllowedError') {
        setError('Camera access denied. Please allow camera permissions and try again.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found on this device.');
      } else if (err.name === 'NotSupportedError') {
        setError('Camera not supported on this device/browser.');
      } else if (err.name === 'NotReadableError') {
        setError('Camera is being used by another application.');
      } else {
        setError('Failed to access camera: ' + err.message);
      }
    }
  }, []);  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsStreaming(false);
    }
  }, [stream]);

  const captureImage = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    // Ensure we're in the browser
    if (typeof window === 'undefined') return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the current video frame to canvas
    ctx.drawImage(video, 0, 0);

    // Convert to blob
    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const imageUrl = URL.createObjectURL(blob);
      setCapturedImage(imageUrl);

      // Stop the camera after capture
      stopCamera();

      // Process the image with AI
      await processImageWithAI(blob);
    }, 'image/jpeg', 0.9);
  }, [stopCamera]);

  const processImageWithAI = async (imageBlob) => {
    setIsProcessing(true);
    setSuggestedTags([]);

    try {
      // Convert image to base64
      const base64 = await blobToBase64(imageBlob);

      // Create a prompt for the AI to analyze the image
      const prompt = `Analyze this image and suggest 5-8 relevant tags that describe what you see.
      Focus on objects, people, activities, colors, mood, and setting.
      Return only the tags as a comma-separated list, no additional text.`;

      // Call OpenAI API (you'll need to implement this endpoint)
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64,
          prompt: prompt
        })
      });

      if (response.ok) {
        const data = await response.json();
        const tags = data.tags || [];
        setSuggestedTags(tags);
      } else {
        throw new Error('Failed to analyze image');
      }
    } catch (err) {
      console.error('Image analysis error:', err);
      setError('Failed to analyze image: ' + err.message);
      // Fallback: suggest some generic tags
      setSuggestedTags(['photo', 'captured', 'moment', 'image', 'snapshot']);
    } finally {
      setIsProcessing(false);
    }
  };

  const blobToBase64 = (blob) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.readAsDataURL(blob);
    });
  };

  const resetCapture = () => {
    setCapturedImage(null);
    setSuggestedTags([]);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            📸 Smart Photo Capture
          </h2>
          <p className="text-purple-100">
            Take a photo and get AI-powered tag suggestions!
          </p>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Camera View or Captured Image */}
          <div className="relative mb-6">
            {!capturedImage ? (
              <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                {isStreaming ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    onLoadedMetadata={() => {
                      console.log('Video metadata loaded');
                      console.log('Video dimensions:', videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight);
                    }}
                    onError={(e) => {
                      console.error('Video error:', e);
                      setError('Video display error: ' + e.message);
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="text-6xl mb-4">📹</div>
                      <p className="text-gray-500">Camera not started</p>
                      <p className="text-sm text-gray-400 mt-2">
                        Click "Start Camera" to begin
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-3 mb-6">
            {!isStreaming && !capturedImage && (
              <button
                onClick={startCamera}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Start Camera
              </button>
            )}

            {isStreaming && (
              <>
                <button
                  onClick={captureImage}
                  className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
                >
                  <Square className="w-5 h-5" />
                  Capture Photo
                </button>
                <button
                  onClick={stopCamera}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Stop Camera
                </button>
              </>
            )}

            {capturedImage && (
              <button
                onClick={resetCapture}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Take Another
              </button>
            )}
          </div>

          {/* AI Analysis Results */}
          {capturedImage && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5" />
                AI Suggested Tags
              </h3>

              {isProcessing ? (
                <div className="flex items-center gap-3 text-gray-600">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analyzing image with AI...</span>
                </div>
              ) : suggestedTags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {suggestedTags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium border border-purple-200 hover:bg-purple-200 transition-colors cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No tags generated yet.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Hidden canvas for image processing */}
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
      />
    </div>
  );
}
