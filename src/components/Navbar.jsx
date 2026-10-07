import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-saffron-500" />
            <span className="text-2xl font-bold text-gray-800 tracking-wide">
              Puja<span className="text-saffron-500">Sathi</span>
            </span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center space-x-6 text-gray-600 font-medium">
            <Link to="/" className="hover:text-saffron-500 transition">Home</Link>
            <Link to="/pujas" className="hover:text-saffron-500 transition">Book Puja</Link>
            {user && <Link to="/dashboard" className="hover:text-saffron-500 transition">Dashboard</Link>}
          </div>

          {/* Auth State Action */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/profile" className="text-sm font-semibold text-gray-700">Hi, {user.name}</Link>
                <button 
                  onClick={logout}
                  className="flex items-center gap-1 bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg font-medium text-sm transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link 
                to="/login"
                className="flex items-center gap-2 bg-saffron-500 hover:bg-saffron-600 text-white px-4 py-2 rounded-lg font-semibold shadow transition"
              >
                <User className="w-4 h-4" />
                <span>Login / Signup</span>
              </Link>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}