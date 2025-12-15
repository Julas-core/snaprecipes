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
        // Proactively check permission status using the Permissions API if available.
        if (navigator.permissions && navigator.permissions.query) {
          // The type assertion is needed because 'camera' is a valid permission name.
          const permissionStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
          if (permissionStatus.state === 'denied') {
            setError("Camera access was denied. To take a photo, you'll need to grant permission in your browser's site settings.");
            return; // Stop here if permission is already denied.
          }
        }

        // If not denied (i.e., 'granted' or 'prompt'), try to get the user media.
        // This will trigger the permission prompt if the state was 'prompt'.
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setStream(mediaStream);

      } catch (err: any) {
        console.error("Error accessing camera:", err);
        // Handle various specific errors that can occur with getUserMedia.
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
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        onCapture(imageDataUrl);
        cleanupCamera();
      }
    }
  };

  const handleCancel = () => {
    cleanupCamera();
    onCancel();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50 animate-fade-in p-4">
      {/* Always render the close button */}
      <button
        onClick={handleCancel}
        className="absolute top-4 right-4 text-white bg-black/30 rounded-full p-2 hover:bg-black/60 transition z-10"
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
          <div className="relative w-full max-w-2xl aspect-[4/3] rounded-lg overflow-hidden shadow-2xl">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
          </div>
          <canvas ref={canvasRef} className="hidden"></canvas>
          <div className="mt-6 flex space-x-4">
            <button
              onClick={handleCapture}
              disabled={!stream}
              className="w-20 h-20 bg-white rounded-full flex items-center justify-center ring-4 ring-white/30 disabled:opacity-50 transition-transform duration-200 ease-in-out hover:scale-105"
              aria-label="Capture photo"
            >
              <div className="w-16 h-16 bg-white rounded-full border-4 border-amber-600"></div>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CameraView;