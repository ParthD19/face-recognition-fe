  import React, { useState, useRef } from 'react';
  import { Camera, Upload, X, Loader2, Sparkles, CheckCircle, AlertCircle, RefreshCw, ZoomIn, Shield, Zap, Images } from 'lucide-react';

  /* =======================
    MAIN APP
  ======================= */
  const FaceFindApp = () => {
    const [appState, setAppState] = useState('idle');
    const [capturedImage, setCapturedImage] = useState(null);
    const [matchedPhotos, setMatchedPhotos] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [matches, setMatches] = useState([]);
    const [showCamera, setShowCamera] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [processingProgress, setProcessingProgress] = useState(0);

    const API_ENDPOINT = '/api/v1/recognize-face';

    const resetApp = () => {
      setAppState('idle');
      setCapturedImage(null);
      setMatchedPhotos([]);
      setErrorMessage('');
      setMatches([]);
      setShowCamera(false);
      setSelectedPhoto(null);
      setProcessingProgress(0);
    };

    const processImage = async (imageBlob) => {
      setAppState('processing');
      setProcessingProgress(0);
      setErrorMessage('');

      const progressInterval = setInterval(() => {
        setProcessingProgress((p) => Math.min(p + 10, 90));
      }, 200);

      try {
        const formData = new FormData();
        formData.append('file', imageBlob, 'capture.jpg');

        const response = await fetch(API_ENDPOINT, {
          method: 'POST',
          body: formData
        });

        clearInterval(progressInterval);
        setProcessingProgress(100);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Processing failed');
        }

        if (data.matched && data.image_urls?.length > 0) {
          setMatchedPhotos(data.image_urls);
          setMatches(data.matches || []);
          setAppState('results');
        } else {
          setAppState('no-matches');
        }
      } catch (err) {
        clearInterval(progressInterval);
        setErrorMessage(err.message || 'Something went wrong. Please try again.');
        setAppState('error');
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/30">
        {/* Subtle background decoration */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-200/20 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 py-12 max-w-7xl">
          {/* Header */}
          <header className="text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-6">
              <Sparkles className="w-8 h-8 text-purple-600" />
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                FaceFind
              </h1>
              <Sparkles className="w-8 h-8 text-pink-600" />
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Capture your face once and rediscover every moment you appeared in
            </p>
          </header>

          {/* Main Content */}
          <main>
            {appState === 'idle' && !showCamera && (
              <IdleState
                onCameraClick={() => setShowCamera(true)}
                onFileUpload={(file) => {
                  setCapturedImage(URL.createObjectURL(file));
                  processImage(file);
                }}
              />
            )}

            {showCamera && appState === 'idle' && (
              <PhotoCapture
                onCapture={(blob) => {
                  setCapturedImage(URL.createObjectURL(blob));
                  setShowCamera(false);
                  processImage(blob);
                }}
                onCancel={() => setShowCamera(false)}
              />
            )}

            {appState === 'processing' && (
              <ProcessingState image={capturedImage} progress={processingProgress} />
            )}

            {appState === 'results' && (
              <ResultsState
                photos={matchedPhotos}
                matches={matches}
                onReset={resetApp}
                onPhotoClick={setSelectedPhoto}
              />
            )}

            {appState === 'no-matches' && (
              <NoMatchesState image={capturedImage} onReset={resetApp} />
            )}

            {appState === 'error' && (
              <ErrorState message={errorMessage} onReset={resetApp} />
            )}
          </main>

          {selectedPhoto && (
            <PhotoModal photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
          )}
        </div>
      </div>
    );
  };

  /* =======================
    IDLE STATE
  ======================= */
  const IdleState = ({ onCameraClick, onFileUpload }) => {
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
      const file = e.target.files?.[0];
      if (file) {
        if (file.size > 10 * 1024 * 1024) {
          alert('File size must be less than 10MB');
          return;
        }
        onFileUpload(file);
      }
    };

    return (
      <div className="max-w-5xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Find Every Memory
            <br />
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
              Instantly
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Upload a selfie and our AI will find all photos you appear in from your collection
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button
              onClick={onCameraClick}
              className="group relative px-8 py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3 min-w-[200px] justify-center"
            >
              <Camera className="w-6 h-6" />
              <span>Use Camera</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="group relative px-8 py-5 bg-white text-gray-900 border-2 border-gray-200 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl hover:border-purple-300 transform hover:scale-105 transition-all duration-300 flex items-center gap-3 min-w-[200px] justify-center"
            >
              <Upload className="w-6 h-6" />
              <span>Upload Photo</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="user"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Accuracy */}
            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                99.8%
              </div>
              <div className="text-gray-900 font-semibold text-lg mb-2">Accuracy</div>
              <div className="text-gray-600 text-sm">Industry-leading precision</div>
            </div>

            {/* Fast Search */}
            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div className="text-gray-900 font-semibold text-lg mb-2">Fast Search</div>
              <div className="text-gray-600 text-sm">Results in seconds</div>
            </div>

            {/* Private */}
            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div className="text-gray-900 font-semibold text-lg mb-2">Private</div>
              <div className="text-gray-600 text-sm">Your data stays secure</div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-20 bg-white rounded-3xl p-10 shadow-xl">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-10">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="font-semibold text-lg mb-2 text-gray-900">1. Capture or Upload</h4>
              <p className="text-gray-600">Take a selfie or upload a photo of yourself</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-pink-600" />
              </div>
              <h4 className="font-semibold text-lg mb-2 text-gray-900">2. AI Analysis</h4>
              <p className="text-gray-600">Our AI analyzes your facial features instantly</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Images className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="font-semibold text-lg mb-2 text-gray-900">3. Get Results</h4>
              <p className="text-gray-600">View all photos where you appear</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* =======================
    PHOTO CAPTURE
  ======================= */
  const PhotoCapture = ({ onCapture, onCancel }) => {
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const [isReady, setIsReady] = useState(false);

    React.useEffect(() => {
      const startCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            streamRef.current = stream;
            setIsReady(true);
          }
        } catch (err) {
          alert('Camera access denied');
          onCancel();
        }
      };
      startCamera();
      return () => streamRef.current?.getTracks().forEach(t => t.stop());
    }, [onCancel]);

    const capture = () => {
      if (!videoRef.current) return;
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0);
      canvas.toBlob(blob => {
        streamRef.current?.getTracks().forEach(t => t.stop());
        onCapture(blob);
      }, 'image/jpeg', 0.95);
    };

    return (
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Position Your Face</h2>
        <div className="relative rounded-3xl overflow-hidden shadow-2xl mb-8">
          <video ref={videoRef} autoPlay playsInline muted className="w-full aspect-[3/4] object-cover scale-x-[-1]" />
          {!isReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Loader2 className="w-12 h-12 text-white animate-spin" />
            </div>
          )}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-64 h-80 border-4 border-white/60 rounded-full" />
          </div>
        </div>
        <div className="flex gap-4">
          <button onClick={capture} disabled={!isReady} className="flex-1 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl disabled:opacity-50 transition-all flex items-center justify-center gap-3">
            <Camera className="w-6 h-6" /> Capture
          </button>
          <button onClick={onCancel} className="flex-1 px-8 py-4 bg-white border-2 border-gray-200 text-gray-900 rounded-2xl font-semibold text-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-3">
            <X className="w-6 h-6" /> Cancel
          </button>
        </div>
      </div>
    );
  };

  /* =======================
    PROCESSING STATE
  ======================= */
  const ProcessingState = ({ image, progress }) => (
    <div className="max-w-2xl mx-auto text-center">
      {image && <img src={image} alt="Processing" className="w-full max-w-md mx-auto rounded-3xl shadow-2xl mb-8" />}
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none" className="text-gray-200" />
            <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none" strokeDasharray={`${2 * Math.PI * 56}`} strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`} className="text-purple-600 transition-all duration-300" strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-12 h-12 text-purple-600 animate-pulse" />
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Finding Your Photos...</h3>
          <p className="text-gray-600">{progress}% complete</p>
        </div>
      </div>
    </div>
  );

  /* =======================
    RESULTS STATE
  ======================= */
  const ResultsState = ({ photos = [], matches = [], onReset, onPhotoClick }) => {
  const bestMatch = matches.length > 0 ? matches[0] : null;
  const confidence = bestMatch ? (bestMatch.similarity * 100).toFixed(1) : '0.0';

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        {bestMatch && (
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-100 text-green-800 rounded-full shadow-lg mb-6">
            <CheckCircle className="w-6 h-6" />
            <span className="font-semibold text-lg">
              Best Match Confidence: {confidence}%
            </span>
          </div>
        )}

        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Found {photos.length} Photo{photos.length !== 1 ? 's' : ''}
        </h2>
        <p className="text-gray-600 text-lg">Click any photo to view full size</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
        {photos.map((p, i) => (
          <div key={i} onClick={() => onPhotoClick(p)} className="group relative cursor-pointer rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
            <img src={p} alt={`Match ${i + 1}`} className="w-full aspect-square object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
              <p className="text-white font-semibold">Photo {i + 1}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <button onClick={onReset} className="px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all inline-flex items-center gap-3">
          <RefreshCw className="w-6 h-6" /> Search Again
        </button>
      </div>
    </div>
  );
};

  /* =======================
    NO MATCHES & ERROR
  ======================= */
  const NoMatchesState = ({ image, onReset }) => (
    <div className="max-w-2xl mx-auto text-center">
      {image && <img src={image} alt="No match" className="w-full max-w-md mx-auto rounded-3xl shadow-2xl mb-8" />}
      <div className="inline-flex items-center gap-2 px-6 py-3 bg-amber-100 text-amber-800 rounded-full shadow-lg mb-6">
        <AlertCircle className="w-6 h-6" />
        <span className="font-semibold text-lg">No Matches Found</span>
      </div>
      <h3 className="text-3xl font-bold text-gray-900 mb-4">We couldn't find any photos of you</h3>
      <p className="text-gray-600 text-lg mb-8">Try using better lighting or a different photo</p>
      <button onClick={onReset} className="px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all">
        Try Again
      </button>
    </div>
  );

  const ErrorState = ({ message, onReset }) => (
    <div className="max-w-2xl mx-auto text-center">
      <div className="inline-flex items-center gap-2 px-6 py-3 bg-red-100 text-red-800 rounded-full shadow-lg mb-6">
        <AlertCircle className="w-6 h-6" />
        <span className="font-semibold text-lg">Error</span>
      </div>
      <h3 className="text-3xl font-bold text-gray-900 mb-4">Something went wrong</h3>
      <p className="text-gray-600 text-lg mb-8">{message}</p>
      <button onClick={onReset} className="px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all">
        Try Again
      </button>
    </div>
  );

  /* =======================
    PHOTO MODAL
  ======================= */
  const PhotoModal = ({ photo, onClose }) => (
    <div onClick={onClose} className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4">
      <button onClick={onClose} className="absolute top-6 right-6 text-white hover:text-gray-300 bg-white/10 hover:bg-white/20 rounded-full p-3 transition-all">
        <X className="w-8 h-8" />
      </button>
      <img src={photo} alt="Preview" className="max-w-full max-h-full rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()} />
    </div>
  );

  export default FaceFindApp;