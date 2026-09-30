import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Mic, Camera, MapPin, Send, AlertTriangle, X, Play, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const EMOJIS = ['🚨', '🚑', '🏥', '🆘', '🚁', '🛡️', '📍', '📞', '🚨', '🆘'];

const FloatingEmojis = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {EMOJIS.map((emoji, index) => {
        const randomX = (index * 13) % 90 + 5;
        const randomY = (index * 29) % 90 + 5;
        const duration = 12 + (index % 8);
        
        return (
          <motion.div
            key={index}
            className="absolute text-5xl opacity-15 filter blur-[1px]"
            initial={{ top: `${randomY}%`, left: `${randomX}%`, y: 0 }}
            animate={{ 
              y: [0, -50, 0],
              x: [0, 30, -30, 0],
              rotate: [0, 15, -15, 0]
            }}
            transition={{ 
              duration: duration, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          >
            {emoji}
          </motion.div>
        );
      })}
    </div>
  );
};

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
  const recognitionRef = useRef<any>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
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
    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, []);

  const toggleListen = () => {
    const recognition = recognitionRef.current;
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
        latitude: location?.latitude ?? null,
        longitude: location?.longitude ?? null,
        location_accuracy: location?.accuracy ?? null
      });
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to send SOS.');
      setIsSubmitting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="py-8 space-y-6 max-w-xl mx-auto w-full relative min-h-[80vh]">
      <FloatingEmojis />
      
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="relative z-10 bg-red-900/40 text-red-400 p-4 rounded-xl text-sm font-bold border border-red-500/30 shadow-lg shadow-red-500/10"
        >
          {error}
        </motion.div>
      )}

      {!analysis && !showCamera && !imagePreview && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative z-10 bg-slate-900/60 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/10 space-y-6"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-[40px] pointer-events-none"></div>
          
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <div className="p-3 bg-red-500/20 rounded-xl border border-red-500/30">
              <AlertTriangle className="text-red-500" size={24} />
            </div>
            Describe Emergency
          </h2>
          
          <div className="relative">
            <textarea
              className="w-full h-48 p-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-white text-lg resize-none shadow-inner"
              placeholder="Describe what happened or speak into the microphone..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleListen}
              className={`absolute bottom-5 right-5 p-4 rounded-full transition shadow-lg ${isListening ? 'bg-red-600 text-white animate-pulse shadow-red-600/50' : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'}`}
              aria-label="Hold to speak"
            >
              <Mic size={24} />
            </motion.button>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <motion.button 
              whileHover={{ scale: 1.03, backgroundColor: "rgba(255,255,255,0.15)" }}
              whileTap={{ scale: 0.97 }}
              onClick={startCamera}
              className="py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-white flex items-center justify-center gap-2 shadow-lg transition-colors"
            >
              <Camera size={22} className="text-purple-400" />
              Use Camera
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleAnalyze}
              disabled={isAnalyzing || !text.trim()}
              className="py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? <Activity className="animate-spin" size={22} /> : 'ANALYZE'}
            </motion.button>
          </div>
        </motion.div>
      )}

      {showCamera && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white/10 overflow-hidden flex flex-col items-center"
        >
          <video ref={videoRef} autoPlay playsInline className="w-full max-h-[60vh] object-cover rounded-2xl bg-black border border-white/5 shadow-inner"></video>
          <canvas ref={canvasRef} className="hidden"></canvas>
          <div className="absolute bottom-10 flex gap-6">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={captureImage} className="bg-white text-black p-5 rounded-full font-bold shadow-2xl">
              <Camera size={32} />
            </motion.button>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={stopCamera} className="bg-red-600 text-white p-5 rounded-full font-bold shadow-2xl shadow-red-600/30 border border-red-500/50">
              <X size={32} />
            </motion.button>
          </div>
        </motion.div>
      )}

      {imagePreview && !analysis && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 bg-slate-900/60 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/10 space-y-6 flex flex-col items-center"
        >
          <img src={imagePreview} alt="Captured" className="w-full max-h-[50vh] object-cover rounded-2xl border border-white/10 shadow-lg" />
          <div className="flex gap-5 w-full">
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setImagePreview(null)} className="flex-1 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl">Retake</motion.button>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={analyzeImage} disabled={isAnalyzing} className="flex-1 py-4 bg-purple-600 hover:bg-purple-500 text-white font-extrabold rounded-2xl flex justify-center items-center gap-2 shadow-lg shadow-purple-600/30">
              {isAnalyzing ? <Activity className="animate-spin" size={22} /> : 'Analyze Image'}
            </motion.button>
          </div>
        </motion.div>
      )}

      {analysis && !showConfirm && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 bg-slate-900/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden"
        >
          <div className="bg-red-600/20 border-b border-red-500/30 p-5 text-red-400 text-center font-extrabold tracking-widest flex justify-between items-center backdrop-blur-md">
            <span>EMERGENCY SUMMARY</span>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => readAloud(analysis.summary)} className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-full text-red-300 transition-colors" aria-label="Read Alert">
              <Play size={20} />
            </motion.button>
          </div>
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="text-slate-400 font-bold uppercase tracking-wider mb-1 text-xs">Incident</div>
                <div className="font-extrabold text-white text-lg">{analysis.incident_type}</div>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="text-slate-400 font-bold uppercase tracking-wider mb-1 text-xs">Urgency</div>
                <div className="font-extrabold text-red-400 text-lg">{analysis.severity}</div>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="text-slate-400 font-bold uppercase tracking-wider mb-1 text-xs">People</div>
                <div className="font-bold text-white text-lg">{analysis.people_involved || 'Unknown'}</div>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="text-slate-400 font-bold uppercase tracking-wider mb-1 text-xs">Injury</div>
                <div className="font-bold text-white text-lg">{analysis.injury_reported ? <span className="text-red-400">Reported</span> : <span className="text-emerald-400">None</span>}</div>
              </div>
            </div>

            <div className="bg-black/40 p-5 rounded-2xl text-slate-300 text-sm border border-white/5 leading-relaxed font-medium">
              {analysis.summary}
            </div>
            
            <div className="bg-amber-500/10 p-5 rounded-2xl text-amber-300 text-sm border border-amber-500/20 font-bold leading-relaxed">
              {analysis.recommended_action}
            </div>

            <div className="pt-6 border-t border-white/10 space-y-6">
              <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                <span className="text-sm font-bold text-slate-300 flex items-center gap-2">
                  <MapPin className="text-blue-400" size={18} />
                  {location ? 'Location detected' : locationError || 'Location not set'}
                </span>
                <motion.button 
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={getLocation} 
                  className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-300 font-extrabold rounded-xl text-xs tracking-wider transition-colors"
                >
                  GET LOCATION
                </motion.button>
              </div>

              <div className="flex gap-5">
                <motion.button 
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => { setAnalysis(null); setImagePreview(null); }}
                  className="flex-1 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl transition-colors"
                >
                  EDIT
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setShowConfirm(true)}
                  className="flex-[2] py-4 bg-red-600 hover:bg-red-500 text-white font-extrabold tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 border border-red-500/50"
                >
                  <AlertTriangle /> SEND SOS
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-sm w-full space-y-8 text-center shadow-2xl"
          >
            <div className="w-20 h-20 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/30">
              <AlertTriangle size={40} className="animate-pulse" />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold text-white mb-2">Send SOS?</h2>
              <p className="text-slate-400 font-medium text-sm leading-relaxed">
                This will create an emergency alert in your SafeHelp dashboard.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <motion.button 
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={submitSOS}
                disabled={isSubmitting}
                className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-extrabold tracking-widest rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 border border-red-500/50 disabled:opacity-50"
              >
                {isSubmitting ? <Activity className="animate-spin" /> : 'YES, SEND SOS'}
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => setShowConfirm(false)}
                disabled={isSubmitting}
                className="w-full py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl"
              >
                CANCEL
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Demo Section */}
      {!analysis && !showCamera && !imagePreview && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="relative z-10 mt-12 p-6 border-2 border-dashed border-white/10 rounded-3xl bg-black/20 backdrop-blur-md"
        >
          <h3 className="font-bold text-slate-400 mb-5 text-center text-sm tracking-widest uppercase">TEST SCENARIOS</h3>
          <div className="flex flex-wrap gap-3 justify-center">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setText("My friend and I had an accident on the highway. He is injured and we need help.")} className="px-4 py-2 bg-white/5 border border-white/10 text-slate-300 rounded-full text-xs font-bold tracking-wide">Road Accident</motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setText("There is a fire in the kitchen.")} className="px-4 py-2 bg-white/5 border border-white/10 text-slate-300 rounded-full text-xs font-bold tracking-wide">Fire</motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setText("I feel unsafe and someone is following me.")} className="px-4 py-2 bg-white/5 border border-white/10 text-slate-300 rounded-full text-xs font-bold tracking-wide">Personal Safety</motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SOS;
