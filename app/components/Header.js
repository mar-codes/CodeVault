"use client";

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Code2, LogOut, User, Home, Search, 
  LayoutDashboard, Menu, X, ChevronDown
} from 'lucide-react';

export default function Header({ user }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        setIsUserMenuOpen(false);
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  const isActive = (path) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname?.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50 shadow-md">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and desktop navigation */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center group">
              <div className="bg-blue-600/20 p-1.5 rounded-md mr-2 group-hover:bg-blue-600/30 transition-colors">
                <Code2 className="h-5 w-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
              </div>
              <span className="text-xl font-bold text-blue-400 group-hover:text-blue-300 transition-colors">
                CodeVault
              </span>
            </Link>
            
            <div className="hidden md:flex ml-10 space-x-1">
              <Link 
                href="/" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/') 
                    ? 'bg-gray-800 text-white' 
                    : 'text-gray-300 hover:bg-gray-800/70 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </div>
              </Link>
              
              <Link 
                href="/lander/explore" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/lander/explore') 
                    ? 'bg-gray-800 text-white' 
                    : 'text-gray-300 hover:bg-gray-800/70 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Search className="h-4 w-4" />
                  <span>Explore</span>
                </div>
              </Link>
              
              {user && (
                <Link 
                  href="/auth/dashboard" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/auth/dashboard') 
                      ? 'bg-gray-800 text-white' 
                      : 'text-gray-300 hover:bg-gray-800/70 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </div>
                </Link>
              )}
            </div>
          </div>

          {/* Desktop user menu */}
          <div className="hidden md:flex items-center">
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-md px-3 py-2 transition-colors focus:outline-none"
                  aria-expanded={isUserMenuOpen}
                >
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                    {user.username?.charAt(0).toUpperCase() ?? 'U'}
                  </div>
                  <span>{user.username}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isUserMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <Link 
                      href="/auth/profile" 
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      Your Profile
                    </Link>
                    <Link
                      href="/auth/dashboard"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  href="/auth/login" 
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link 
                  href="/auth/signup" 
                  className="px-3 py-2 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">{isMenuOpen ? 'Close menu' : 'Open menu'}</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-800">
          <Link
            href="/"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/') 
                ? 'bg-gray-900 text-white' 
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              <span>Home</span>
            </div>
          </Link>

          <Link
            href="/lander/explore"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/lander/explore') 
                ? 'bg-gray-900 text-white' 
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              <span>Explore</span>
            </div>
          </Link>

          {user && (
            <Link
              href="/auth/dashboard"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/auth/dashboard') 
                  ? 'bg-gray-900 text-white' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5" />
                <span>Dashboard</span>
              </div>
            </Link>
          )}
        </div>
        
        {/* Mobile user section */}
        <div className="pt-4 pb-3 border-t border-gray-700">
          {user ? (
            <>
              <div className="flex items-center px-5">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                  {user.username?.charAt(0).toUpperCase() ?? 'U'}
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium leading-none text-white">{user.username}</div>
                  {user.email && (
                    <div className="text-sm font-medium leading-none text-gray-400 mt-1">{user.email}</div>
                  )}
                </div>
              </div>
              <div className="mt-3 px-2 space-y-1">
                <Link
                  href="/auth/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700"
                >
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    <span>Your Profile</span>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700"
                >
                  <div className="flex items-center gap-2">
                    <LogOut className="h-5 w-5" />
                    <span>Sign out</span>
                  </div>
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col px-5 py-2 space-y-2">
              <Link
                href="/auth/login"
                className="block w-full px-3 py-2 rounded-md text-center text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                Login
              </Link>
              <Link
                href="/auth/signup"
                className="block w-full px-3 py-2 rounded-md text-center text-base font-medium bg-blue-600 hover:bg-blue-700 text-white"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
