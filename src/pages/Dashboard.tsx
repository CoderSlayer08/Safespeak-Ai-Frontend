import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { MapPin, AlertTriangle, CheckCircle, Clock, Activity, ShieldAlert, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

const Dashboard = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/sos');
      setEvents(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markResolved = async (id: string) => {
    try {
      await api.patch(`/sos/${id}/status`, { status: 'RESOLVED' });
      fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 relative z-10">
        <Activity size={48} className="text-red-500 animate-pulse" />
        <p className="text-slate-400 font-medium tracking-widest uppercase text-sm animate-pulse">Syncing Emergency Network...</p>
      </div>
    );
  }

  return (
    <div className="py-8 space-y-8 max-w-4xl mx-auto w-full px-4 min-h-screen relative">
      <FloatingEmojis />
      
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-4 mb-10"
      >
        <div className="p-3 bg-red-500/20 rounded-2xl border border-red-500/30">
          <ShieldAlert className="text-red-500" size={32} />
        </div>
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Emergency Dashboard</h2>
          <p className="text-slate-400 font-medium">Monitor and manage active SOS incidents.</p>
        </div>
      </motion.div>
      
      {events.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900/60 backdrop-blur-xl p-12 rounded-3xl text-center border border-white/5 shadow-2xl flex flex-col items-center gap-4"
        >
          <CheckCircle size={64} className="text-emerald-500 opacity-50" />
          <h3 className="text-xl font-bold text-white">All Clear</h3>
          <p className="text-slate-400">No emergency events have been reported by this node.</p>
        </motion.div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence>
            {events.map((ev, index) => (
              <motion.div 
                key={ev.id} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`p-6 rounded-3xl border backdrop-blur-xl shadow-2xl overflow-hidden relative ${
                  ev.status === 'ACTIVE' 
                    ? 'bg-slate-900/80 border-red-500/30 shadow-red-500/10' 
                    : 'bg-slate-900/40 border-emerald-500/20 opacity-80'
                }`}
              >
                {/* Background glow effect for active emergencies */}
                {ev.status === 'ACTIVE' && (
                  <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
                )}
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-white/10">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl border ${
                      ev.status === 'ACTIVE' ? 'bg-red-500/20 border-red-500/30' : 'bg-emerald-500/10 border-emerald-500/20'
                    }`}>
                      {ev.status === 'ACTIVE' ? <AlertTriangle className="text-red-500" size={24} /> : <CheckCircle className="text-emerald-500" size={24} />}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-2xl text-white tracking-tight">{ev.incident_type}</h3>
                      <div className="text-sm text-slate-400 flex items-center gap-2 mt-1 font-medium">
                        <Clock size={14} className="text-blue-400" />
                        {new Date(ev.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                    </div>
                  </div>
                  
                  <span className={`px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase border ${
                    ev.status === 'ACTIVE' ? 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}>
                    {ev.status}
                  </span>
                </div>
                
                <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">People</div>
                    <div className="font-bold text-white text-lg">{ev.people_involved || 'Unknown'}</div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Injury</div>
                    <div className="font-bold text-white text-lg">{ev.injury_reported ? <span className="text-red-400">Reported</span> : <span className="text-emerald-400">None</span>}</div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5 md:col-span-2">
                    <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Urgency Level</div>
                    <div className="font-bold text-white text-lg">{ev.severity}</div>
                  </div>
                </div>

                <div className="relative z-10 bg-black/40 p-5 rounded-2xl mb-6 border border-white/5">
                  <div className="font-bold text-blue-400 text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Activity size={14} /> AI Analysis Summary
                  </div>
                  <p className="text-slate-300 leading-relaxed text-sm md:text-base">
                    {ev.ai_summary || "No AI summary available for this event."}
                  </p>
                </div>

                <div className="relative z-10 flex flex-wrap gap-4 items-center justify-between">
                  {ev.latitude && ev.longitude ? (
                    <motion.a 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      href={`https://www.google.com/maps?q=${ev.latitude},${ev.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-600/30 transition-colors"
                    >
                      <MapPin size={18} /> View Coordinates
                    </motion.a>
                  ) : (
                    <div className="text-slate-500 text-sm font-medium italic">No location data.</div>
                  )}
                  
                  {ev.status === 'ACTIVE' && (
                    <motion.button 
                      whileHover={{ scale: 1.05, backgroundColor: "#0f172a" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => markResolved(ev.id)}
                      className="flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-xl font-extrabold text-sm shadow-lg hover:shadow-xl transition-colors ml-auto group"
                    >
                      MARK RESOLVED <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
