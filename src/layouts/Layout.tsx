import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShieldAlert, LogOut, User, LayoutDashboard } from 'lucide-react';

const Layout = () => {
  const { user, logout } = React.useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-red-700 text-white p-4 shadow-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-wide">
            <ShieldAlert size={28} />
            <span>SAFEHELP AI</span>
          </Link>
          <nav className="flex gap-4 items-center">
            {user ? (
              <>
                <Link to="/dashboard" className="hover:text-red-200 transition" aria-label="Dashboard">
                  <LayoutDashboard size={24} />
                </Link>
                <Link to="/profile" className="hover:text-red-200 transition" aria-label="Profile">
                  <User size={24} />
                </Link>
                <button onClick={handleLogout} className="hover:text-red-200 transition" aria-label="Logout">
                  <LogOut size={24} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-red-200 font-medium">Login</Link>
                <Link to="/register" className="bg-white text-red-700 px-4 py-2 rounded-lg font-bold hover:bg-red-50 transition">Register</Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1 w-full max-w-4xl mx-auto p-4 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
