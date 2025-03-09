'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { FiGrid, FiList, FiClock, FiSearch } from 'react-icons/fi';
import {
  Code2, LogOut, User, Home, Search,
  LayoutDashboard, Menu, X, ChevronDown
} from 'lucide-react';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [creations, setCreations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const sessionRes = await fetch('/api/auth/session');
        const sessionData = await sessionRes.json();

        if (!sessionData.user) {
          router.push('/auth/login');
          return;
        }

        setUser(sessionData.user);

        const creationsRes = await fetch(`/api/creations/get/${sessionData.user.id}`);
        if (!creationsRes.ok) {
          throw new Error(`Failed to fetch creations: ${creationsRes.status}`);
        }

        const creationsData = await creationsRes.json();
        console.log("Fetched creations data:", creationsData);

        if (Array.isArray(creationsData.creations)) {
          setCreations(creationsData.creations);
        } else {
          console.error("Creations data is not an array:", creationsData.creations);
          setCreations([]);
          setError("Invalid creation data format");
        }
      } catch (error) {
        console.error('Dashboard error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const filteredCreations = creations
    .filter(creation =>
      creation.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creation.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'name') return a.title.localeCompare(b.title);
      return 0;
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-950">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-lg text-gray-300">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950">
      {/* New Header */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50 shadow-md">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and desktop navigation */}
            <div className="flex items-center">
              <Link href="/auth/dashboard" className="flex items-center group">
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
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-800/70 hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <Home className="h-4 w-4" />
                    <span>Home</span>
                  </div>
                </Link>

                <Link
                  href="/lander/explore"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-800/70 hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <Search className="h-4 w-4" />
                    <span>Explore</span>
                  </div>
                </Link>

                <Link
                  href="/auth/dashboard"
                  className="px-3 py-2 rounded-md text-sm font-medium bg-gray-800 text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </div>
                </Link>
              </div>
            </div>

            {/* Desktop user menu */}
            <div className="hidden md:flex items-center">
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-md px-3 py-2 transition-colors focus:outline-none"
                  aria-expanded={isProfileOpen}
                >
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                    {user?.username?.charAt(0).toUpperCase() ?? 'U'}
                  </div>
                  <span>{user?.username}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                {isProfileOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <Link
                      href="/auth/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                    >
                      <User className="h-4 w-4" />
                      Your Profile
                    </Link>
                    <button
                      onClick={() => router.push('/api/auth/signout')}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none"
              >
                {isMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-gray-700">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                <Link
                  href="/auth/dashboard"
                  className="block px-3 py-2 rounded-md text-base font-medium bg-gray-900 text-white"
                >
                  <div className="flex items-center gap-2">
                    <LayoutDashboard className="h-5 w-5" />
                    <span>Dashboard</span>
                  </div>
                </Link>

                <Link
                  href="/lander/explore"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  <div className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    <span>Explore</span>
                  </div>
                </Link>
              </div>

              <div className="pt-4 pb-3 border-t border-gray-700">
                <div className="flex items-center px-5">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                    {user?.username?.charAt(0).toUpperCase() ?? 'U'}
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium leading-none text-white">
                      {user?.username}
                    </div>
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
                    onClick={() => router.push('/api/auth/signout')}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700"
                  >
                    <div className="flex items-center gap-2">
                      <LogOut className="h-5 w-5" />
                      <span>Sign out</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </nav>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Dashboard Header - Update New Project Link */}
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-gray-700/50 p-6 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-100">Welcome back, {user?.username}</h1>
              <p className="text-gray-400 mt-2">Your creative coding workspace</p>
            </div>
            <Link
              href="/lander/upload"
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center gap-2 shadow-lg"
            >
              <span>New Project</span>
              <span className="text-sm bg-blue-500/30 px-2 py-1 rounded backdrop-blur-sm">⌘N</span>
            </Link>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            {[
              { label: 'Total Projects', value: creations.length },
              { label: 'Active Projects', value: creations.filter(c => !c.archived).length },
              {
                label: 'This Month', value: creations.filter(c =>
                  new Date(c.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                ).length
              },
              {
                label: 'Last Updated', value: creations[0]?.updatedAt ?
                  new Date(creations[0].updatedAt).toLocaleDateString() : 'N/A'
              }
            ].map((stat, index) => (
              <div key={index} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50">
                <p className="text-sm text-gray-400">{stat.label}</p>
                <p className="text-2xl font-semibold mt-1 text-gray-100">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Controls Bar */}
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-xl border border-gray-700/50 p-4 mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid'
                ? 'bg-gray-700 text-blue-400'
                : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
                }`}
            >
              <FiGrid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list'
                ? 'bg-gray-700 text-blue-400'
                : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
                }`}
            >
              <FiList size={20} />
            </button>
          </div>

          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                className="w-full pl-10 pr-4 py-2 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-900/50 text-gray-300 placeholder-gray-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-700 rounded-lg px-4 py-2 bg-gray-900/50 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest" className="bg-gray-900">Newest First</option>
            <option value="oldest" className="bg-gray-900">Oldest First</option>
            <option value="name" className="bg-gray-900">Name</option>
          </select>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Modified Projects Display */}
        {filteredCreations.length === 0 ? (
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-gray-700/50 p-12 flex flex-col items-center justify-center min-h-[400px]">
            <h2 className="text-2xl font-semibold mb-2 text-gray-100">No projects found</h2>
            <p className="text-gray-400 mb-6">
              {searchQuery ? 'Try adjusting your search terms.' : 'Start by creating your first project!'}
            </p>
            <Link
              href="/lander/upload"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create your first project
            </Link>
          </div>
        ) : (
          <div className={viewMode === 'grid' ?
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" :
            "space-y-4"
          }>
            {filteredCreations.map((creation, index) => (
              <div key={creation._id || index}
                className={`bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-gray-700/50 hover:border-gray-600/50 transition-all ${viewMode === 'list' ? 'p-4 flex items-center gap-4' : 'p-6'
                  }`}
              >
                <div className={viewMode === 'list' ? 'flex-1' : ''}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`w-3 h-3 rounded-full ${creation.status === 'active' ? 'bg-green-500' :
                      creation.status === 'archived' ? 'bg-gray-400' : 'bg-yellow-500'
                      }`} />
                    <span className="text-sm text-gray-400">{creation.language || 'No language'}</span>
                  </div>

                  <h2 className="text-xl font-semibold mb-2 text-gray-100">
                    {creation.title || 'Untitled Project'}
                  </h2>

                  <p className="text-gray-400 mb-4 line-clamp-2">
                    {creation.description || 'No description provided'}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FiClock className="text-gray-500" />
                      <span className="text-sm text-gray-400">
                        Updated {creation.updatedAt ?
                          new Date(creation.updatedAt).toLocaleDateString() : 'Never'}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <Link
                        href={`/creation/edit/${creation._id}`}
                        className="text-gray-400 hover:text-gray-300 font-medium text-sm group flex items-center gap-1"
                      >
                        Edit Project
                        <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                      </Link>

                      <Link
                        href={`/creation/${creation._id}`}
                        className="text-blue-400 hover:text-blue-300 font-medium text-sm group flex items-center gap-1"
                      >
                        View Project
                        <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
