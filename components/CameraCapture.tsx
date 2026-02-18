
import React, { useRef, useEffect, useState } from 'react';

interface CameraCaptureProps {
  onCapture: (base64: string) => void;
  onCancel: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function setupCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Could not access camera. Please check permissions.");
      }
    }
    setupCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Faster processing dimensions: 1024px is enough for OCR and much faster to upload
      const MAX_DIM = 1024;
      let width = video.videoWidth;
      let height = video.videoHeight;

      if (width > height) {
        if (width > MAX_DIM) {
          height *= MAX_DIM / width;
          width = MAX_DIM;
        }
      } else {
        if (height > MAX_DIM) {
          width *= MAX_DIM / height;
          height = MAX_DIM;
        }
      }

      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'medium';
        ctx.drawImage(video, 0, 0, width, height);
        // Using 0.5 quality for maximum speed reduction in data size
        const base64 = canvas.toDataURL('image/jpeg', 0.5).split(',')[1];
        onCapture(base64);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        {error ? (
          <div className="text-white p-6 text-center">
            <p className="mb-4">{error}</p>
            <button onClick={onCancel} className="bg-white text-black px-6 py-2 rounded-lg font-bold">Go Back</button>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        )}
        
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-[85%] h-[65%] border-2 border-white/40 rounded-xl">
             <div className="absolute top-4 left-0 right-0 text-center">
                <span className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] bg-black/20 px-3 py-1 rounded-full">Align Scoresheet</span>
             </div>
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <div className="bg-black p-8 flex items-center justify-between safe-bottom">
        <button onClick={onCancel} className="text-white text-lg w-12 h-12 flex items-center justify-center">
          <i className="fa-solid fa-xmark"></i>
        </button>
        
        <button 
          onClick={takePhoto}
          className="w-20 h-20 bg-white rounded-full flex items-center justify-center active:scale-90 transition-transform shadow-xl"
        >
          <div className="w-16 h-16 bg-white rounded-full border-4 border-black/5"></div>
        </button>

        <div className="w-12"></div>
      </div>
    </div>
  );
};

export default CameraCapture;
