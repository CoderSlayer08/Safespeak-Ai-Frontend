import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { motion } from 'framer-motion';
import { ShieldAlert, Mail, Lock, Activity } from 'lucide-react';

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

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.data.token, res.data.data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex justify-center items-center py-12 relative min-h-[85vh]">
      <FloatingEmojis />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-2xl border border-white/10 relative z-10 overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-red-500/10 rounded-full blur-[50px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/10 rounded-full blur-[50px] pointer-events-none"></div>

        <div className="flex justify-center mb-6">
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
            <ShieldAlert className="text-red-500" size={36} />
          </div>
        </div>

        <h2 className="text-3xl font-extrabold text-center text-white mb-2 tracking-tight">Access Node</h2>
        <p className="text-center text-slate-400 mb-8 font-medium">Authenticate to the emergency network.</p>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-red-900/40 text-red-400 p-4 rounded-xl mb-6 text-sm font-bold border border-red-500/30 text-center"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="email" 
                required 
                className="w-full py-4 pl-12 pr-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-white transition-all placeholder:text-slate-600"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="password" 
                required 
                className="w-full py-4 pl-12 pr-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-white transition-all placeholder:text-slate-600"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit" 
            disabled={isLoading}
            className="w-full bg-red-600 hover:bg-red-500 text-white font-extrabold tracking-widest py-4 rounded-2xl transition-all disabled:opacity-50 mt-6 shadow-lg shadow-red-600/20 flex justify-center items-center gap-2"
          >
            {isLoading ? <><Activity className="animate-spin" size={20} /> AUTHENTICATING...</> : 'LOGIN'}
          </motion.button>
        </form>
        
        <p className="mt-8 text-center text-slate-400 font-medium">
          Don't have an account? <Link to="/register" className="text-blue-400 font-bold hover:text-blue-300 transition-colors ml-1">Create Node</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
