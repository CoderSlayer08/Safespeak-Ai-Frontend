import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { User, Phone, Mail, Trash2, Plus } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

// A unique 3D element representing an SOS Emergency Beacon
const SOSBeacon = () => {
  const groupRef = React.useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.5;
      const pulse = 1 + Math.sin(state.clock.getElapsedTime() * 4) * 0.05;
      groupRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <group ref={groupRef} position={[0, 0, -4]}>
        {/* Vertical bar of the Cross */}
        <mesh>
          <boxGeometry args={[0.8, 2.5, 0.8]} />
          <meshStandardMaterial 
            color="#ef4444" 
            emissive="#ef4444"
            emissiveIntensity={1.5}
            transparent={true}
            opacity={0.9}
          />
        </mesh>
        {/* Horizontal bar of the Cross */}
        <mesh>
          <boxGeometry args={[2.5, 0.8, 0.8]} />
          <meshStandardMaterial 
            color="#ef4444" 
            emissive="#ef4444"
            emissiveIntensity={1.5}
            transparent={true}
            opacity={0.9}
          />
        </mesh>
        
        {/* Wireframe protective box around the cross */}
        <mesh>
          <boxGeometry args={[3.2, 3.2, 3.2]} />
          <meshStandardMaterial 
            color="#f87171" 
            wireframe={true}
            transparent={true}
            opacity={0.3}
            emissive="#f87171"
            emissiveIntensity={0.5}
          />
        </mesh>
      </group>
    </Float>
  );
};

const BackgroundScene = () => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <SOSBeacon />
      <Stars radius={50} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
    </>
  );
};

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const res = await api.get('/contacts');
      setContacts(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    
    try {
      await api.post('/contacts', { name, phone, email });
      setName('');
      setPhone('');
      setEmail('');
      fetchContacts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/contacts/${id}`);
      fetchContacts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-start pt-10 pb-20">
      {/* Full Screen 3D Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <BackgroundScene />
        </Canvas>
      </div>

      <div className="z-10 space-y-8 max-w-2xl mx-auto w-full px-4">
        
        {/* Profile Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-slate-900/60 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/10 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-[50px]"></div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <div className="p-3 bg-blue-500/20 rounded-xl border border-blue-500/30">
              <User className="text-blue-400" size={28} />
            </div>
            My Identity Node
          </h2>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:gap-6 pb-4 border-b border-white/5">
              <span className="font-medium text-slate-400 uppercase tracking-widest text-xs mb-1 sm:mb-0 sm:w-20 sm:mt-1">Name</span>
              <span className="font-semibold text-white text-lg">{user?.name}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:gap-6">
              <span className="font-medium text-slate-400 uppercase tracking-widest text-xs mb-1 sm:mb-0 sm:w-20 sm:mt-1">Email</span>
              <span className="font-semibold text-blue-300 text-lg">{user?.email}</span>
            </div>
          </div>
        </motion.div>

        {/* Emergency Contacts Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-slate-900/60 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/10"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Emergency Contacts</h2>
          
          {loading ? (
            <div className="text-slate-400 animate-pulse">Syncing network...</div>
          ) : (
            <div className="space-y-4 mb-10">
              {contacts.length === 0 ? (
                <p className="text-slate-500 text-sm italic">No emergency contacts linked to your node yet.</p>
              ) : (
                contacts.map((contact, index) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    key={contact.id} 
                    className="flex justify-between items-center p-5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-colors group"
                  >
                    <div>
                      <h4 className="font-bold text-white text-lg">{contact.name}</h4>
                      <div className="text-sm text-slate-300 flex flex-wrap items-center gap-4 mt-2">
                        <span className="flex items-center gap-1.5"><Phone size={14} className="text-blue-400" /> {contact.phone}</span>
                        {contact.email && <span className="flex items-center gap-1.5"><Mail size={14} className="text-blue-400" /> {contact.email}</span>}
                      </div>
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(contact.id)}
                      className="p-3 text-red-400 bg-red-400/10 hover:bg-red-500 hover:text-white rounded-xl transition-colors border border-red-400/20"
                      aria-label="Delete contact"
                    >
                      <Trash2 size={20} />
                    </motion.button>
                  </motion.div>
                ))
              )}
            </div>
          )}

          <h3 className="font-bold text-blue-400 mb-4 text-sm uppercase tracking-widest flex items-center gap-2">
            <Plus size={16} /> Link New Contact
          </h3>
          <form onSubmit={handleAddContact} className="space-y-5 bg-black/20 p-6 rounded-2xl border border-white/5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Name</label>
                <input 
                  type="text" 
                  required 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-white text-sm transition-all"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Phone</label>
                <input 
                  type="tel" 
                  required 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-white text-sm transition-all"
                  placeholder="e.g. +1 234 567 890"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email (Optional)</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-white text-sm transition-all"
                  placeholder="e.g. john@example.com"
                />
              </div>
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.02, backgroundColor: "#2563eb" }}
              whileTap={{ scale: 0.95 }}
              type="submit" 
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30"
            >
              <Plus size={18} /> Establish Link
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
