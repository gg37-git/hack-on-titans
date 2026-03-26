'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <span className="text-2xl font-black tracking-tight text-neutral-900">
                CURA<span className="text-primary-700">LINK</span>
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-neutral-600 hover:text-primary-700 font-medium transition-colors">Features</Link>
            <Link href="#about" className="text-neutral-600 hover:text-primary-700 font-medium transition-colors">About</Link>
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="text-neutral-600 hover:text-primary-700 font-medium transition-colors">Dashboard</Link>
                <button 
                  onClick={logout}
                  className="btn-secondary"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-neutral-600 hover:text-primary-700 font-medium transition-colors">Login</Link>
                <Link href="/signup" className="btn-primary">
                  Get Started Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button could go here */}
        </div>
      </div>
    </nav>
  );
}
