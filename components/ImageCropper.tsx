import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Point, Area } from 'react-easy-crop';
import getCroppedImg from '../utils/imageUtils';

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedImage: string) => void;
  onCancel: () => void;
}

const ImageCropper: React.FC<ImageCropperProps> = ({ imageSrc, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isCropping, setIsCropping] = useState(false);

  const onCropCompleteCallback = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleConfirmCrop = async () => {
    if (!croppedAreaPixels) return;
    setIsCropping(true);
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(croppedImage);
    } catch (e) {
      console.error(e);
      // In a real app, you might want to show an error toast to the user
      alert('Could not crop the image. Please try again.');
      setIsCropping(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50 animate-fade-in p-4">
      <div className="w-full max-w-2xl text-center mb-4">
        <h2 className="text-2xl font-serif font-bold text-white">Crop Image</h2>
        <p className="text-white/80">Focus on the food for the best results.</p>
      </div>
      <div className="relative w-full max-w-2xl h-[60vh] bg-gray-900 rounded-lg overflow-hidden shadow-2xl">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropCompleteCallback}
        />
      </div>
      <div className="w-full max-w-sm mt-4">
        <label htmlFor="zoom-slider" className="block mb-2 text-sm font-medium text-white text-center">Zoom</label>
        <input
          id="zoom-slider"
          type="range"
          value={zoom}
          min={1}
          max={3}
          step={0.1}
          aria-labelledby="Zoom"
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
      </div>
      <div className="mt-6 flex space-x-4">
        <button
          onClick={onCancel}
          disabled={isCropping}
          className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 transition-all disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirmCrop}
          disabled={isCropping}
          className="px-6 py-3 bg-amber-500 text-white font-semibold rounded-lg shadow-md hover:bg-amber-600 transition-all disabled:opacity-50 disabled:cursor-wait"
        >
          {isCropping ? 'Cropping...' : 'Confirm Crop'}
        </button>
      </div>
    </div>
  );
};

export default ImageCropper;
