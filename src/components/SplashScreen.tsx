import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3500); // Splash screen lasts for 3.5 seconds
    
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div 
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950 overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      {/* Background Radar Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div 
          className="absolute w-64 h-64 border border-red-500/20 rounded-full"
          animate={{ scale: [1, 3], opacity: [0.8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
        />
        <motion.div 
          className="absolute w-64 h-64 border border-red-500/30 rounded-full"
          animate={{ scale: [1, 3], opacity: [0.8, 0] }}
          transition={{ duration: 2, delay: 0.5, repeat: Infinity, ease: "easeOut" }}
        />
        <motion.div 
          className="absolute w-64 h-64 border border-red-500/10 rounded-full"
          animate={{ scale: [1, 3], opacity: [0.8, 0] }}
          transition={{ duration: 2, delay: 1, repeat: Infinity, ease: "easeOut" }}
        />
      </div>

      {/* Main Logo */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
        className="relative z-10 flex flex-col items-center"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            textShadow: ["0px 0px 0px #ef4444", "0px 0px 30px #ef4444", "0px 0px 0px #ef4444"]
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="bg-slate-900/50 p-6 rounded-full shadow-2xl shadow-red-500/40 border border-red-500/30 backdrop-blur-md mb-6"
        >
          <ShieldAlert size={80} className="text-red-500" />
        </motion.div>

        <motion.h1 
          className="text-5xl font-extrabold text-white tracking-widest drop-shadow-xl"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          SAFE<span className="text-red-500">HELP</span> AI
        </motion.h1>
        
        <motion.p
          className="text-slate-400 mt-2 font-medium tracking-wide uppercase text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
        >
          Initializing Emergency Systems...
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

export default SplashScreen;
