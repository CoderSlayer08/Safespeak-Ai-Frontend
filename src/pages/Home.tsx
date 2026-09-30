import React from 'react';
import { Link } from 'react-router-dom';
import { Mic, Camera, MapPin, AlertCircle } from 'lucide-react';

const Home = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-10 space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h1 className="text-3xl md:text-5xl font-bold text-slate-900">SAFEHELP AI</h1>
        <p className="text-lg md:text-xl text-slate-600 font-medium">Need help? Tell us what happened.</p>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 p-6 flex flex-col items-center gap-6">
        
        <Link 
          to="/sos"
          className="w-full h-32 bg-red-600 hover:bg-red-700 text-white rounded-2xl flex flex-col items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
          aria-label="Hold to speak emergency"
        >
          <Mic size={40} />
          <span className="font-bold text-lg tracking-wide">HOLD TO SPEAK</span>
        </Link>

        <div className="flex items-center w-full gap-4 opacity-60">
          <div className="h-px bg-slate-300 flex-1"></div>
          <span className="font-semibold text-slate-500">OR</span>
          <div className="h-px bg-slate-300 flex-1"></div>
        </div>

        <Link 
          to="/sos"
          className="w-full py-4 border-2 border-slate-200 hover:border-slate-300 rounded-xl flex justify-center items-center font-medium text-slate-700 transition bg-slate-50 hover:bg-slate-100"
        >
          Type emergency
        </Link>

        <div className="w-full grid grid-cols-2 gap-4">
          <button className="py-3 bg-slate-100 rounded-xl flex items-center justify-center gap-2 text-slate-700 font-medium hover:bg-slate-200 transition">
            <MapPin size={20} className="text-blue-500" />
            Location ON
          </button>
          <button className="py-3 bg-slate-100 rounded-xl flex items-center justify-center gap-2 text-slate-700 font-medium hover:bg-slate-200 transition">
            <Camera size={20} className="text-purple-500" />
            Analyze Image
          </button>
        </div>
        
        <Link 
          to="/sos"
          className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl flex justify-center items-center gap-2 font-bold text-xl shadow-md transition-transform active:scale-95"
        >
          <AlertCircle size={28} />
          HELP
        </Link>
      </div>
    </div>
  );
};

export default Home;
