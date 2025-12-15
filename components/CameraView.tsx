import React, { useRef, useEffect, useState, useCallback } from 'react';
import { XIcon, CameraOffIcon } from './icons';

interface CameraViewProps {
  onCapture: (imageDataUrl: string) => void;
  onCancel: () => void;
}

const CameraView: React.FC<CameraViewProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);

  const cleanupCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  }, [stream]);

  useEffect(() => {
    const checkPermissionsAndStartCamera = async () => {
      // First, check for basic browser support.
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("Camera access is not supported by your browser.");
        return;
      }

      try {
        // Proactively check permission status.
        if (navigator.permissions && navigator.permissions.query) {
          const permissionStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
          if (permissionStatus.state === 'denied') {
            setError("Camera access was denied. To take a photo, you'll need to grant permission in your browser's site settings.");
            return;
          }
        }

        // Use optimized constraints to prevent lag
        // 720p is often the sweet spot for balance between quality and performance on mobile web
        // Limiting frame rate to 24fps can significantly reduce CPU usage and stuttering
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 15, max: 24 }
          },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setStream(mediaStream);

      } catch (err: any) {
        console.error("Error accessing camera:", err);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError("Camera access was denied. To take a photo, you'll need to grant permission in your browser's site settings.");
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setError("No camera found. Please ensure a camera is connected and enabled.");
        } else {
          setError("Could not access camera. It might be in use by another application. Please check and try again.");
        }
      }
    };

    checkPermissionsAndStartCamera();

    return () => {
      cleanupCamera();
    };
  }, [cleanupCamera]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Ensure video is playing and has valid dimensions
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        setIsFlashing(true);

        // Set canvas to match video dimensions
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context = canvas.getContext('2d');
        if (context) {
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageDataUrl = canvas.toDataURL('image/jpeg', 0.85); // Compress slightly for performance

          // Small delay to show the flash effect before closing
          setTimeout(() => {
            onCapture(imageDataUrl);
            cleanupCamera();
          }, 150);
        }
      }
    }
  };

  const handleCancel = () => {
    cleanupCamera();
    onCancel();
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 animate-fade-in p-4 sm:p-6">
      {/* Always render the close button */}
      <button
        onClick={handleCancel}
        className="absolute top-4 right-4 text-white bg-black/30 rounded-full p-2 hover:bg-black/60 transition z-20 backdrop-blur-md"
        aria-label="Close camera"
      >
        <XIcon className="h-8 w-8" />
      </button>

      {error ? (
        <div className="w-full max-w-lg bg-amber-50 dark:bg-gray-800 rounded-lg p-8 text-center shadow-2xl flex flex-col items-center">
          <CameraOffIcon className="h-16 w-16 text-red-500 mb-4" />
          <h3 className="text-2xl font-serif font-bold text-red-700 dark:text-red-400 mb-3">Camera Access Needed</h3>
          <p className="text-amber-800 dark:text-gray-300">{error}</p>
        </div>
      ) : (
        <>
          <div className="relative w-full max-w-4xl h-[calc(100vh-12rem)] rounded-2xl overflow-hidden shadow-2xl bg-black">
            {/* Flash Overlay */}
            {isFlashing && (
              <div className="absolute inset-0 bg-white z-10 animate-fade-out pointer-events-none"></div>
            )}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            ></video>
          </div>
          <canvas ref={canvasRef} className="hidden"></canvas>

          <div className="absolute bottom-6 sm:bottom-8 left-0 right-0 flex justify-center items-center pb-safe">
            <button
              onClick={handleCapture}
              disabled={!stream}
              className="w-20 h-20 sm:w-24 sm:h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center ring-4 ring-white/30 disabled:opacity-50 transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 hover:bg-white/30"
              aria-label="Capture photo"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full border-4 border-transparent shadow-sm"></div>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CameraView;