"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Code2, LogOut, User, Home, Search,
  LayoutDashboard, Menu, X, ChevronDown,
  Bell, PlusSquare, Settings, ExternalLink
} from 'lucide-react';
import styles from './FluidButton.module.css';

export default function Header({ user, className }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const adminIds = ["67d00247bda0a3f6a8035d04", "another_admin_id", "third_admin_id"];
  const isAdmin = user?._id && adminIds.includes(user._id);

  useEffect(() => {
    const handleClickOutsideUserMenu = (e) => {
      if (isUserMenuOpen && !e.target.closest('.user-menu-container')) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutsideUserMenu);
    return () => document.removeEventListener('mousedown', handleClickOutsideUserMenu);
  }, [isUserMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMenuOpen && !e.target.closest('.mobile-menu-container')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const handleSignout = () => {
    router.push('/auth/signout');
  };

  const isActive = (path) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname?.startsWith(path)) return true;
    return false;
  };

  return (
    <header className={`${scrolled
      ? 'bg-gray-900/85 backdrop-blur-xl border-gray-800/40'
      : 'bg-gray-900 border-transparent'
      } border-b sticky top-0 z-50 transition-all duration-300`}>
      <nav className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[4.5rem]">
          <div className="flex items-center gap-4">
            {isAdmin && (
              <Link
                href="/admin/dashboard"
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30 transition-all duration-200"
              >
                <span className="text-xs font-medium text-red-400">Admin</span>
              </Link>
            )}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center gap-2 group">
                <img src="/codevault.svg" alt="CodeVault" className="h-9 w-auto" />
                <span className="text-xl font-bold bg-gradient-to-r from-blue-300 to-indigo-400 bg-clip-text text-transparent group-hover:from-blue-200 group-hover:to-indigo-300 transition-all duration-300 pl-1">
                  CodeVault
                </span>
              </Link>
            </div>
          </div>

          <div className="hidden md:flex flex-1 items-center justify-center">
            <div className="flex space-x-1.5">
              <Link
                href="/"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/')
                  ? 'bg-gray-800/80 text-white shadow-lg shadow-black/10'
                  : 'text-gray-400 hover:bg-gray-800/40 hover:text-white'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <Home className="h-[1.1rem] w-[1.1rem]" />
                  <span>Home</span>
                </div>
              </Link>

              <Link
                href="/lander/explore"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/lander/explore')
                  ? 'bg-gray-800/80 text-white shadow-lg shadow-black/10'
                  : 'text-gray-400 hover:bg-gray-800/40 hover:text-white'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <Search className="h-[1.1rem] w-[1.1rem]" />
                  <span>Explore</span>
                </div>
              </Link>

              {user && (
                <Link
                  href="/auth/user/profile/dashboard"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/auth/user/profile/dashboard')
                    ? 'bg-gray-800/80 text-white shadow-lg shadow-black/10'
                    : 'text-gray-400 hover:bg-gray-800/40 hover:text-white'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <LayoutDashboard className="h-[1.1rem] w-[1.1rem]" />
                    <span>Dashboard</span>
                  </div>
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 sm:space-x-3">
            {user && (
              <Link
                href="/lander/upload"
                className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-r from-blue-500/20 to-indigo-500/20 hover:from-blue-500/30 hover:to-indigo-500/30 text-blue-400 hover:text-blue-300 border border-blue-500/30 hover:border-blue-500/50 transition-all duration-200 shadow-lg shadow-blue-900/5"
                aria-label="Create new project"
                title="Create new project"
              >
                <PlusSquare className="h-5 w-5" />
              </Link>
            )}

            {user ? (
              <div className="relative user-menu-container">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white rounded-lg px-3 py-2 transition-all duration-200 group h-10"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={`${user.username}'s avatar`}
                      className="h-7 w-7 rounded-lg object-cover ring-2 ring-blue-500/20 group-hover:ring-blue-500/40 transition-all shadow-lg shadow-blue-900/20"
                    />
                  ) : (
                    <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold ring-2 ring-blue-500/20 group-hover:ring-blue-500/40 transition-all shadow-lg shadow-blue-900/20">
                      {user.username?.charAt(0).toUpperCase() ?? 'U'}
                    </div>
                  )}
                  <span className="max-w-[80px] sm:max-w-[120px] truncate font-medium hidden xs:block">
                    {user.username}
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-300 hidden xs:block ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isUserMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2.5 w-64 rounded-xl shadow-xl py-2 bg-gray-800/95 backdrop-blur-xl ring-1 ring-gray-700 focus:outline-none divide-y divide-gray-700/50 z-50">
                    <div className="px-4 py-3">
                      <p className="text-sm font-medium text-white">{user.username}</p>
                      {user.email && (
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      )}
                    </div>

                    <div className="py-1">
                      <Link
                        href="/auth/user/profile"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        Your Profile
                      </Link>
                      <Link
                        href="/auth/user/profile/dashboard"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Link>
                      <Link
                        href={`/auth/user/profile/settings/${user?._id}`}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={handleSignout}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Link
                  href="/auth/login"
                  className={`px-3 sm:px-5 py-2.5 rounded-lg text-sm font-medium text-blue-300 hover:text-white transition-all duration-200 ${styles.fluidButton}`}
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className={`px-3 sm:px-5 py-2.5 rounded-lg text-sm font-medium text-blue-50 transition-all duration-200 ${styles.fluidFilled}`}
                >
                  Register
                </Link>
              </div>
            )}

            <div className="md:hidden flex items-center ml-1">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 focus-visible:ring-2 focus-visible:ring-blue-500/50 outline-none transition-colors duration-200"
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
        </div>
      </nav>

      <div
        className={`fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ease-in-out ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={() => setIsMenuOpen(false)}
      >
        <div
          className={`mobile-menu-container fixed right-0 inset-y-0 w-[85%] max-w-[320px] bg-gray-900 shadow-xl transform transition-transform duration-300 ease-in-out overflow-y-auto ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-4 h-16 border-b border-gray-800">
            <span className="text-base font-medium text-white">Menu</span>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="px-3 py-3 space-y-1">
            <Link
              href="/"
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200 ${isActive('/')
                ? 'bg-gray-800 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
            >
              <Home className="h-5 w-5" />
              <span>Home</span>
            </Link>

            <Link
              href="/lander/explore"
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200 ${isActive('/lander/explore')
                ? 'bg-gray-800 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
            >
              <Search className="h-5 w-5" />
              <span>Explore</span>
            </Link>

            {user && (
              <>
                <Link
                  href="/auth/user/profile/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200 ${isActive('/auth/user/profile/dashboard')
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                >
                  <LayoutDashboard className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  href="/lander/upload"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 hover:text-blue-300 transition-all duration-200"
                >
                  <PlusSquare className="h-5 w-5" />
                  <span>Create New Project</span>
                </Link>
              </>
            )}

            <div className="pt-3 mt-3 border-t border-gray-800">
              {user ? (
                <>
                  <div className="flex items-center px-4 py-3">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={`${user.username}'s avatar`}
                        className="h-7 w-7 rounded-lg object-cover ring-2 ring-blue-500/20 group-hover:ring-blue-500/40 transition-all shadow-lg shadow-blue-900/20"
                      />
                    ) : (
                      <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold ring-2 ring-blue-500/20 group-hover:ring-blue-500/40 transition-all shadow-lg shadow-blue-900/20">
                        {user.username?.charAt(0).toUpperCase() ?? 'U'}
                      </div>
                    )}
                    <div className="ml-3">
                      <div className="text-base font-medium text-white">{user.username}</div>
                      {user.email && (
                        <div className="text-sm text-gray-400">{user.email}</div>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <Link
                      href="/auth/user/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors duration-200"
                    >
                      <User className="h-5 w-5" />
                      <span>Your Profile</span>
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-between w-full px-4 py-3 rounded-lg text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <Settings className="h-5 w-5" />
                        <span>Settings</span>
                      </div>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-blue-900/50 text-blue-300">New</span>
                    </Link>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleSignout();
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-base font-medium text-red-400 hover:bg-gray-800 hover:text-red-300 transition-colors duration-200"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col px-4 py-3 space-y-3">
                  <Link
                    href="/auth/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex justify-center w-full px-4 py-3 rounded-lg text-base font-medium border border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex justify-center w-full px-4 py-3 rounded-lg text-base font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition-all duration-200"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}