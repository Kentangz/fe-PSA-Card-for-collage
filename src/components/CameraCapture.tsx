import { useState, useRef, useCallback, useEffect } from "react";
import { LuCamera, LuX, LuRotateCcw, LuCheck } from "react-icons/lu";

interface CameraCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (images: File[]) => void;
  disabled?: boolean;
}

export default function CameraCapture({ 
  isOpen, 
  onClose, 
  onCapture, 
  disabled = false 
}: CameraCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImages, setCapturedImages] = useState<File[]>([]);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isLoading, setIsLoading] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const initCamera = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      
      setStream(prevStream => {
        if (prevStream) {
          prevStream.getTracks().forEach(track => track.stop());
        }
        return null;
      });

      let mediaStream: MediaStream;
      
      try {
        const idealConstraints: MediaStreamConstraints = {
          video: {
            facingMode: facingMode,
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 },
            frameRate: { ideal: 30, max: 30 }
          },
          audio: false
        };
        
        mediaStream = await navigator.mediaDevices.getUserMedia(idealConstraints);
        
      } catch {
        const basicConstraints: MediaStreamConstraints = {
          video: {
            facingMode: facingMode
          },
          audio: false
        };
        
        mediaStream = await navigator.mediaDevices.getUserMedia(basicConstraints);
      }

      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        const video = videoRef.current;
        
        const handleLoadedMetadata = () => {
          setIsLoading(false);
        };

        const handleError = () => {
          setError('Video playback error');
          setIsLoading(false);
        };

        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('error', handleError);
        
        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('error', handleError);

        try {
          await video.play();
        } catch {
          //
        }
      } else {
        setError('Video element not found');
        setIsLoading(false);
      }
      
    } catch (err) {
      setIsLoading(false);
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Camera access denied. Please allow camera permission and try again.');
        } else if (err.name === 'NotFoundError') {
          setError('No camera found on this device.');
        } else if (err.name === 'NotSupportedError') {
          setError('Camera is not supported on this device.');
        } else if (err.name === 'OverconstrainedError') {
          setError('Camera constraints not supported. Trying fallback...');
          setTimeout(() => {
            setFacingMode('user');
          }, 1000);
        } else {
          setError(`Camera error: ${err.message}`);
        }
      } else {
        setError('An unknown error occurred while accessing the camera.');
      }
    }
  }, [facingMode]);

  useEffect(() => {
    if (isOpen && !disabled) {
      initCamera();
    }
  }, [isOpen, disabled, facingMode, initCamera]);

  useEffect(() => {
    if (!isOpen) {
      setStream(prevStream => {
        if (prevStream) {
          prevStream.getTracks().forEach(track => track.stop());
        }
        return null;
      });
      setCapturedImages([]);
      setError(null);
      setIsLoading(false);
      setShowPreviewModal(false);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      setStream(prevStream => {
        if (prevStream) {
          prevStream.getTracks().forEach(track => track.stop());
        }
        return null;
      });
    };
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || isCapturing) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setError('Camera not ready. Please wait or try again.');
      return;
    }

    setIsCapturing(true);
    
    const context = canvas.getContext('2d');
    if (!context) {
      setIsCapturing(false);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const timestamp = new Date().getTime();
        const file = new File([blob], `camera-capture-${timestamp}.jpg`, {
          type: 'image/jpeg',
          lastModified: timestamp
        });
        
        setCapturedImages(prev => [...prev, file]);
      } else {
        setError('Failed to capture photo. Please try again.');
      }
      setIsCapturing(false);
    }, 'image/jpeg', 0.85);
  }, [isCapturing]);

  const switchCamera = useCallback(() => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  }, []);

  const removeCapturedImage = useCallback((index: number) => {
    setCapturedImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleDone = useCallback(() => {
    if (capturedImages.length > 0) {
      onCapture(capturedImages);
    }
    onClose();
  }, [capturedImages, onCapture, onClose]);

  const handleClose = useCallback(() => {
    setCapturedImages([]);
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
      <div className="relative w-full h-full md:w-[90vw] md:h-[90vh] md:max-w-4xl md:rounded-lg md:overflow-hidden bg-black">
        
        <div className="absolute top-0 left-0 right-0 z-10 bg-black bg-opacity-50 p-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h3 className="text-white font-medium text-lg">
              Take Photos ({capturedImages.length})
            </h3>
            {isLoading && (
              <div className="text-yellow-400 text-sm flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                Loading camera...
              </div>
            )}
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:text-gray-300 p-1"
            disabled={isCapturing}
          >
            <LuX className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-center p-6 max-w-md">
              <div className="text-red-400 text-lg mb-4">{error}</div>
              <button
                onClick={initCamera}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Camera Preview */}
        {!error && (
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ 
                backgroundColor: '#000',
                display: isLoading ? 'none' : 'block' 
              }}
            />
            
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <div className="text-white text-lg">Starting camera...</div>
                </div>
              </div>
            )}
            
            {/* Hidden canvas for capture */}
            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}

        {/* Floating Bubble - Captured Images Counter (Top Left) */}
        {!error && capturedImages.length > 0 && (
          <div className="absolute top-20 left-4 z-20">
            <div className="relative">
              {/* Main bubble button */}
              <button
                onClick={() => setShowPreviewModal(!showPreviewModal)}
                className="bg-black bg-opacity-70 backdrop-blur-sm text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg border border-white/20 hover:bg-opacity-80 transition-all"
              >
                <div className="text-center">
                  <LuCamera className="w-3 h-3 mx-auto mb-0" />
                  <span className="text-xs font-bold">{capturedImages.length}</span>
                </div>
              </button>
              
              {/* Badge for new capture animation */}
              {isCapturing && (
                <div className="absolute -top-1 -right-1 bg-green-500 rounded-full w-4 h-4 animate-ping"></div>
              )}
            </div>
            
            {/* Expanded preview modal */}
            {showPreviewModal && (
              <div className="absolute top-16 left-0 bg-black bg-opacity-80 backdrop-blur-md rounded-lg p-3 w-48 max-h-64 overflow-hidden shadow-xl border border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white text-sm font-medium">Foto Tersimpan</span>
                  <button
                    onClick={() => setShowPreviewModal(false)}
                    className="text-white hover:text-gray-300 p-1"
                  >
                    <LuX className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-3 gap-2 max-h-44 overflow-y-auto scrollbar-hide">
                  {capturedImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Captured ${index + 1}`}
                        className="w-full h-12 object-cover rounded border border-white/20 group-hover:border-white/40 transition-all"
                      />
                      <button
                        onClick={() => removeCapturedImage(index)}
                        className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold transition-colors opacity-0 group-hover:opacity-100"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="text-center mt-2 pt-2 border-t border-white/20">
                  <span className="text-white text-xs opacity-70">
                    Tap foto untuk hapus
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bottom Controls */}
        {!error && (
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-4">
            {/* Control Buttons - Improved spacing */}
            <div className="flex justify-center items-center gap-6">
              
              {/* Switch Camera */}
              <button
                onClick={switchCamera}
                disabled={isCapturing || isLoading}
                className="text-white hover:text-gray-300 p-2 disabled:opacity-50 transition-all"
                title="Switch Camera"
              >
                <LuRotateCcw className="w-7 h-7" />
              </button>

              {/* Capture Button */}
              <button
                onClick={capturePhoto}
                disabled={isCapturing || !stream || isLoading}
                className="bg-white hover:bg-gray-200 disabled:bg-gray-400 w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg"
                title="Take Photo"
              >
                <LuCamera className="w-7 h-7 text-gray-800" />
              </button>

              {/* Done Button */}
              <button
                onClick={handleDone}
                disabled={capturedImages.length === 0}
                className="text-white hover:text-gray-300 p-2 disabled:opacity-50 transition-all"
                title="Done"
              >
                <LuCheck className="w-7 h-7" />
              </button>
            </div>

            {/* Instructions - Improved */}
            <div className="text-center mt-3">
              <p className="text-white text-sm opacity-80">
                {capturedImages.length === 0 
                  ? "Position your card and tap the capture button"
                  : "Tap ✓ to confirm or continue taking more photos"
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}