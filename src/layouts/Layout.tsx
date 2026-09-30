import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShieldAlert, LogOut, User, LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';

const Layout = () => {
  const { user, logout } = React.useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isDarkTheme = location.pathname === '/' || location.pathname === '/profile' || location.pathname === '/dashboard' || location.pathname === '/sos' || location.pathname === '/register' || location.pathname === '/login';

  return (
    <div className={`min-h-screen flex flex-col ${isDarkTheme ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <header className={`${isDarkTheme ? 'bg-slate-950/80 backdrop-blur-md border-b border-white/10' : 'bg-red-700 shadow-md'} text-white p-4 sticky top-0 z-50 transition-colors`}>
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-wide">
            <ShieldAlert size={28} className={isDarkTheme ? 'text-red-500' : 'text-white'} />
            <span>SAFEHELP AI</span>
          </Link>
          <nav className="flex gap-4 items-center">
            {user ? (
              <>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Link to="/dashboard" className="hover:text-red-400 transition inline-block" aria-label="Dashboard">
                    <LayoutDashboard size={24} />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Link to="/profile" className="hover:text-red-400 transition inline-block" aria-label="Profile">
                    <User size={24} />
                  </Link>
                </motion.div>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleLogout} className="hover:text-red-400 transition" aria-label="Logout">
                  <LogOut size={24} />
                </motion.button>
              </>
            ) : (
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/login" className="hover:text-red-400 font-medium transition inline-block">Login</Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/register" className={`inline-block ${isDarkTheme ? "bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-500 transition shadow-lg shadow-red-500/30" : "bg-white text-red-700 px-4 py-2 rounded-lg font-bold hover:bg-red-50 transition"}`}>Register</Link>
                </motion.div>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className={`flex-1 flex flex-col w-full ${isDarkTheme ? 'p-0 m-0 relative' : 'max-w-4xl mx-auto p-4'}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
