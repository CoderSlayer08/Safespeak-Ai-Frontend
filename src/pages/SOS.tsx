import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Mic, Camera, MapPin, Send, AlertTriangle, X, Play } from 'lucide-react';

const SOS = () => {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [location, setLocation] = useState<any>(null);
  const [locationError, setLocationError] = useState('');
  
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const navigate = useNavigate();

  // Speech Recognition setup (if supported)
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new (SpeechRecognition as any)() : null;

  if (recognition) {
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setText(prev => prev + ' ' + finalTranscript);
      }
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
  }

  const toggleListen = () => {
    if (!recognition) {
      setError('Voice input is not supported by this browser. Please use text input.');
      return;
    }
    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Location not supported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy
        });
        setLocationError('');
      },
      (err) => {
        setLocationError('Location access was denied. The SOS can still be created without location.');
      }
    );
  };

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setIsAnalyzing(true);
    setError('');
    try {
      const res = await api.post('/ai/analyze', { text });
      setAnalysis(res.data.data);
    } catch (err) {
      setError('Failed to analyze emergency. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError('Camera access denied or not available.');
      setShowCamera(false);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.7);
        setImagePreview(dataUrl);
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  const analyzeImage = async () => {
    if (!imagePreview) return;
    setIsAnalyzing(true);
    setError('');
    try {
      const blob = await (await fetch(imagePreview)).blob();
      const formData = new FormData();
      formData.append('image', blob, 'capture.jpg');
      
      const res = await api.post('/ai/analyze-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const imgData = res.data.data;
      
      // Combine with text analysis view
      setAnalysis({
        incident_type: 'Image Analysis',
        severity: 'Unknown',
        people_involved: null,
        injury_reported: false,
        hazard_reported: imgData.possible_hazards?.length > 0,
        summary: `Objects: ${imgData.visible_objects?.join(', ')}. Description: ${imgData.description}. Text found: ${imgData.text_detected || 'None'}`,
        recommended_action: 'Review image analysis and proceed if help is needed.'
      });
      
    } catch (err) {
      setError('Failed to analyze image.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const readAloud = (textToRead: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(textToRead);
      window.speechSynthesis.speak(utterance);
    }
  };

  const submitSOS = async () => {
    setIsSubmitting(true);
    try {
      await api.post('/sos', {
        ...analysis,
        latitude: location?.latitude || null,
        longitude: location?.longitude || null,
        location_accuracy: location?.accuracy || null
      });
      navigate('/dashboard'); // Go to dashboard on success to see "Active SOS"
    } catch (err) {
      setError('Failed to send SOS.');
      setIsSubmitting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="py-4 space-y-6 max-w-xl mx-auto w-full">
      {error && <div className="bg-red-100 text-red-800 p-4 rounded-xl text-sm font-medium border border-red-200">{error}</div>}

      {!analysis && !showCamera && !imagePreview && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Describe the Emergency</h2>
          
          <div className="relative">
            <textarea
              className="w-full h-40 p-4 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-slate-800 text-lg resize-none"
              placeholder="Describe what happened..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button 
              onClick={toggleListen}
              className={`absolute bottom-4 right-4 p-3 rounded-full transition ${isListening ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
              aria-label="Hold to speak"
            >
              <Mic size={24} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={startCamera}
              className="py-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium text-slate-700 flex items-center justify-center gap-2 transition"
            >
              <Camera size={20} className="text-purple-600" />
              Camera
            </button>
            <button 
              onClick={handleAnalyze}
              disabled={isAnalyzing || !text.trim()}
              className="py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {isAnalyzing ? 'Analyzing...' : 'ANALYZE'}
            </button>
          </div>
        </div>
      )}

      {showCamera && (
        <div className="bg-black p-4 rounded-2xl relative overflow-hidden flex flex-col items-center">
          <video ref={videoRef} autoPlay playsInline className="w-full max-h-96 object-cover rounded-lg bg-slate-900"></video>
          <canvas ref={canvasRef} className="hidden"></canvas>
          <div className="absolute bottom-6 flex gap-4">
            <button onClick={captureImage} className="bg-white text-black p-4 rounded-full font-bold shadow-lg">
              <Camera size={32} />
            </button>
            <button onClick={stopCamera} className="bg-red-600 text-white p-4 rounded-full font-bold shadow-lg">
              <X size={32} />
            </button>
          </div>
        </div>
      )}

      {imagePreview && !analysis && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4 flex flex-col items-center">
          <img src={imagePreview} alt="Captured" className="w-full max-h-96 object-cover rounded-xl" />
          <div className="flex gap-4 w-full">
            <button onClick={() => setImagePreview(null)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl">Retake</button>
            <button onClick={analyzeImage} disabled={isAnalyzing} className="flex-1 py-3 bg-purple-600 text-white font-bold rounded-xl flex justify-center items-center gap-2">
              {isAnalyzing ? 'Analyzing...' : 'Analyze Image'}
            </button>
          </div>
        </div>
      )}

      {analysis && !showConfirm && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
          <div className="bg-red-600 p-4 text-white text-center font-bold flex justify-between items-center">
            <span>EMERGENCY SUMMARY</span>
            <button onClick={() => readAloud(analysis.summary)} className="p-2 hover:bg-white/20 rounded-full" aria-label="Read Alert">
              <Play size={20} />
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-y-4 text-sm">
              <div>
                <div className="text-slate-500 font-medium">Incident</div>
                <div className="font-bold text-slate-900">{analysis.incident_type}</div>
              </div>
              <div>
                <div className="text-slate-500 font-medium">Urgency</div>
                <div className="font-bold text-slate-900">{analysis.severity}</div>
              </div>
              <div>
                <div className="text-slate-500 font-medium">People</div>
                <div className="font-bold text-slate-900">{analysis.people_involved || 'Unknown'}</div>
              </div>
              <div>
                <div className="text-slate-500 font-medium">Injury</div>
                <div className="font-bold text-slate-900">{analysis.injury_reported ? 'Reported' : 'None'}</div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl text-slate-800 text-sm border border-slate-200">
              {analysis.summary}
            </div>
            
            <div className="bg-amber-50 p-4 rounded-xl text-amber-900 text-sm border border-amber-200 font-medium">
              {analysis.recommended_action}
            </div>

            <div className="pt-4 border-t border-slate-200 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-600">
                  {location ? '📍 Location detected' : locationError || 'Location not set'}
                </span>
                <button 
                  onClick={getLocation} 
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-sm transition"
                >
                  GET LOCATION
                </button>
              </div>

              <div className="flex gap-4 pt-2">
                <button 
                  onClick={() => { setAnalysis(null); setImagePreview(null); }}
                  className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                >
                  EDIT
                </button>
                <button 
                  onClick={() => setShowConfirm(true)}
                  className="flex-[2] py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition"
                >
                  <AlertTriangle /> SEND SOS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-6 text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Send SOS?</h2>
            <p className="text-slate-600 font-medium">
              This will create an emergency alert containing your emergency information and current location.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={submitSOS}
                disabled={isSubmitting}
                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition disabled:opacity-70"
              >
                {isSubmitting ? 'SENDING...' : 'YES, SEND SOS'}
              </button>
              <button 
                onClick={() => setShowConfirm(false)}
                disabled={isSubmitting}
                className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Demo Section */}
      {!analysis && !showCamera && !imagePreview && (
        <div className="mt-12 p-6 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50/50">
          <h3 className="font-bold text-slate-700 mb-4 text-center">TRY DEMO</h3>
          <div className="flex flex-wrap gap-2 justify-center">
            <button onClick={() => setText("My friend and I had an accident on the highway. He is injured and we need help.")} className="px-3 py-1 bg-white border border-slate-300 text-slate-600 rounded-full text-xs hover:bg-slate-100 font-medium">Road Accident</button>
            <button onClick={() => setText("There is a fire in the kitchen.")} className="px-3 py-1 bg-white border border-slate-300 text-slate-600 rounded-full text-xs hover:bg-slate-100 font-medium">Fire</button>
            <button onClick={() => setText("I feel unsafe and someone is following me.")} className="px-3 py-1 bg-white border border-slate-300 text-slate-600 rounded-full text-xs hover:bg-slate-100 font-medium">Personal Safety</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SOS;
