import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Mic, Camera, MapPin, AlertCircle } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Float, Environment, Sparkles, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

// A pulsing glowing orb representing safety/emergency AI
const SafetyOrb = () => {
  const outerRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (outerRef.current && innerRef.current) {
      // Rotate the outer wireframe shield slowly
      outerRef.current.rotation.y = time * 0.3;
      outerRef.current.rotation.x = time * 0.15;
      
      // Rotate the inner core in the opposite direction
      innerRef.current.rotation.y = -time * 0.2;
      
      // Gentle floating hover
      outerRef.current.position.y = Math.sin(time * 1.5) * 0.1 + 1;
      innerRef.current.position.y = Math.sin(time * 1.5) * 0.1 + 1;
      
      // Pulse the scale of the inner core like a heartbeat
      const pulse = 1 + Math.sin(time * 3) * 0.05;
      innerRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group position={[0, 0, -2]}>
        {/* Outer Protective Geodesic Shield */}
        <mesh ref={outerRef} scale={1.8}>
          <icosahedronGeometry args={[1, 2]} />
          <meshStandardMaterial 
            color="#ef4444" 
            wireframe={true}
            transparent={true}
            opacity={0.6}
            emissive="#ef4444"
            emissiveIntensity={1.5}
          />
        </mesh>
        
        {/* Inner AI Core */}
        <mesh ref={innerRef} scale={1.2}>
          <icosahedronGeometry args={[1, 3]} />
          <meshStandardMaterial 
            color="#0f172a" 
            metalness={1}
            roughness={0.2}
            envMapIntensity={2}
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
      <directionalLight position={[10, 10, 5]} intensity={1.5} />
      <Environment preset="city" />
      <SafetyOrb />
      {/* 3D Floating Particles across the screen */}
      <Sparkles count={150} scale={12} size={6} speed={0.4} color="#ef4444" opacity={0.4} noise={1} />
      <Sparkles count={100} scale={15} size={4} speed={0.2} color="#3b82f6" opacity={0.3} noise={2} />
      {/* Subtle distant stars */}
      <Stars radius={50} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
    </>
  );
};

const Home = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-4 w-full relative min-h-screen overflow-hidden bg-slate-950">
      
      {/* Full Screen 3D Background */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <BackgroundScene />
        </Canvas>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-center space-y-2 mb-8 relative z-10 mt-12"
      >
        <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight drop-shadow-2xl">
          SAFE<span className="text-red-500">HELP</span> AI
        </h1>
        <p className="text-xl md:text-2xl text-slate-300 font-medium tracking-wide drop-shadow-lg">AI-Powered Emergency Response</p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="w-full max-w-md bg-slate-900/40 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 p-6 flex flex-col items-center gap-6 relative z-10 mb-12"
      >
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full">
          <Link 
            to="/sos"
            className="w-full h-36 bg-gradient-to-br from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white rounded-2xl flex flex-col items-center justify-center gap-2 shadow-lg shadow-red-600/40 transition-all hover:shadow-2xl hover:shadow-red-500/50"
            aria-label="Hold to speak emergency"
          >
            <Mic size={48} className="animate-pulse" />
            <span className="font-extrabold text-xl tracking-widest">HOLD TO SPEAK</span>
          </Link>
        </motion.div>

        <div className="flex items-center w-full gap-4 opacity-50">
          <div className="h-px bg-slate-500 flex-1"></div>
          <span className="font-semibold text-slate-300 text-sm tracking-widest">OR</span>
          <div className="h-px bg-slate-500 flex-1"></div>
        </div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
          <Link 
            to="/sos"
            className="w-full py-4 border border-white/20 hover:border-white/40 rounded-xl flex justify-center items-center font-semibold text-white transition bg-white/5 hover:bg-white/10 shadow-sm backdrop-blur-sm"
          >
            Type emergency description
          </Link>
        </motion.div>

        <div className="w-full grid grid-cols-2 gap-4">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="py-3 bg-slate-800/60 border border-white/10 shadow-sm rounded-xl flex items-center justify-center gap-2 text-slate-200 font-medium hover:bg-slate-700/60 transition backdrop-blur-sm">
            <MapPin size={20} className="text-blue-400" />
            Location ON
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="py-3 bg-slate-800/60 border border-white/10 shadow-sm rounded-xl flex items-center justify-center gap-2 text-slate-200 font-medium hover:bg-slate-700/60 transition backdrop-blur-sm">
            <Camera size={20} className="text-purple-400" />
            Analyze Image
          </motion.button>
        </div>
        
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full mt-2">
          <Link 
            to="/sos"
            className="w-full py-5 bg-slate-100 hover:bg-white text-slate-900 rounded-2xl flex justify-center items-center gap-2 font-black text-xl shadow-lg transition-all hover:shadow-2xl"
          >
            <AlertCircle size={28} className="text-red-600" />
            INITIALIZE EMERGENCY SEQUENCE
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Home;
