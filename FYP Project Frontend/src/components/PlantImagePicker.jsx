import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload as UploadIcon, Camera, Aperture } from 'lucide-react';

export default function PlantImagePicker({ file, preview, onSelect, onClear }) {
  const [mode, setMode] = useState('upload');
  const [dragActive, setDragActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [cameraReady, setCameraReady] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraReady(false);
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError('');
    setCameraReady(false);

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera is not supported in this browser. Please upload an image instead.');
      return;
    }

    try {
      stopCamera();

      const constraintOptions = [
        { video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false },
        { video: true, audio: false },
      ];

      let stream = null;
      let lastError = null;

      for (const constraints of constraintOptions) {
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints);
          break;
        } catch (err) {
          lastError = err;
        }
      }

      if (!stream) {
        throw lastError || new Error('Camera access denied');
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraReady(true);
      }
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError(
        err?.name === 'NotAllowedError'
          ? 'Camera permission denied. Allow camera access in your browser settings, or upload a file instead.'
          : 'Could not access the camera. Please upload an image from your device instead.'
      );
      stopCamera();
    }
  }, [stopCamera]);

  useEffect(() => {
    if (mode === 'camera' && !preview) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [mode, preview, startCamera, stopCamera]);

  const handleFile = (selectedFile) => {
    if (!selectedFile || !selectedFile.type.startsWith('image/')) return;
    onSelect(selectedFile, URL.createObjectURL(selectedFile));
    setMode('upload');
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video || !cameraReady) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const capturedFile = new File([blob], `plant-camera-${Date.now()}.jpg`, {
          type: 'image/jpeg',
        });
        onSelect(capturedFile, URL.createObjectURL(blob));
        setMode('upload');
        stopCamera();
      },
      'image/jpeg',
      0.92
    );
  };

  if (preview) {
    return (
      <div className="rounded-2xl border-2 border-forest-200 bg-forest-50/50 overflow-hidden">
        <div className="p-4 flex flex-col sm:flex-row gap-4 items-center">
          <img
            src={preview}
            alt="Selected plant"
            className="w-full sm:w-48 h-48 object-cover rounded-xl"
          />
          <div className="flex-1 text-center sm:text-left">
            <p className="font-medium text-gray-800 truncate">
              {file?.name || 'Captured photo'}
            </p>
            {file?.size != null && (
              <p className="text-sm text-gray-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
            )}
            <button
              type="button"
              onClick={onClear}
              className="mt-2 text-sm font-semibold text-red-500 hover:text-red-600"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex rounded-xl border border-forest-200 overflow-hidden bg-gray-50">
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-colors ${
            mode === 'upload'
              ? 'bg-white text-forest-700 shadow-sm'
              : 'text-gray-500 hover:text-forest-600'
          }`}
        >
          <UploadIcon className="w-4 h-4" />
          Upload file
        </button>
        <button
          type="button"
          onClick={() => setMode('camera')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-colors ${
            mode === 'camera'
              ? 'bg-white text-forest-700 shadow-sm'
              : 'text-gray-500 hover:text-forest-600'
          }`}
        >
          <Camera className="w-4 h-4" />
          Use camera
        </button>
      </div>

      {mode === 'upload' ? (
        <motion.div
          onDrop={onDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          whileHover={{ scale: 1.01 }}
          className={`relative rounded-2xl border-2 border-dashed transition-colors ${
            dragActive ? 'border-forest-500 bg-forest-50' : 'border-gray-200 bg-gray-50/50'
          }`}
        >
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFile(e.target.files?.[0])}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="py-12 px-6 text-center pointer-events-none">
            <UploadIcon className="w-14 h-14 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 font-medium">Drop your image here or click to browse</p>
            <p className="text-sm text-gray-400 mt-1">PNG, JPG, WEBP up to 10MB</p>
          </div>
        </motion.div>
      ) : (
        <div className="rounded-2xl border-2 border-forest-200 bg-gray-900 overflow-hidden">
          <div className="relative aspect-[4/3] bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {!cameraReady && !cameraError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <p className="text-white text-sm">Starting camera...</p>
              </div>
            )}
            {cameraError && (
              <div className="absolute inset-0 flex items-center justify-center p-6 bg-black/80">
                <p className="text-white text-sm text-center">{cameraError}</p>
              </div>
            )}
          </div>
          <div className="p-4 bg-gray-900 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-between gap-3">
            <p className="text-gray-300 text-sm text-center sm:text-left">Point the camera at the plant leaf</p>
            <button
              type="button"
              onClick={capturePhoto}
              disabled={!cameraReady}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white bg-forest-600 hover:bg-forest-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full sm:w-auto"
            >
              <Aperture className="w-5 h-5" />
              Capture photo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
