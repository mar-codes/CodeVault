'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Code2, Search, LayoutGrid, List, SlidersHorizontal,
  Clock, User, Tag, Calendar, X, ChevronDown,
  Bookmark, Eye, EyeOff, Globe, Lock, Star,
  FileCode, Filter, RefreshCw, ArrowUpDown, Heart,
  Loader, AlertCircle, Home, Grid, ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

export default function Explore() {
  const router = useRouter();
  const [creations, setCreations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    search: '',
    author: '',
    language: '',
    timeframe: 'all',
    visibility: 'all',
    tags: [],
  });
  const [showFilters, setShowFilters] = useState(false);
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [favorites, setFavorites] = useState(new Set());
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [processingFavorites, setProcessingFavorites] = useState(new Set());
  const [userId, setUserId] = useState(null);

  const fetchCreations = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/creations/get');

      if (!res.ok) {
        throw new Error('Failed to fetch creations');
      }

      const data = await res.json();

      if (Array.isArray(data.creations)) {
        setCreations(data.creations);
        setUserId(data.userId);

        const initialFavorites = new Set(
          data.creations
            .filter(c => c.favoritedBy?.includes(data.userId))
            .map(c => c._id)
        );

        setFavorites(initialFavorites);
        setAvailableLanguages([...new Set(data.creations.map(c => c.language).filter(Boolean))]);
        setAvailableTags([...new Set(data.creations.flatMap(c => c.tags || []).filter(Boolean))]);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to fetch creations');
      toast.error('Failed to load creations');
    } finally {
      setLoading(false);
    }
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/check');
      if (res.ok) {
        const data = await res.json();
        setIsAuthenticated(true);
        setUserId(data.userId);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Auth check failed:', err);
      return false;
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await checkAuth();
      await fetchCreations();
    };

    init();
  }, [fetchCreations, checkAuth]);

  const toggleFavorite = async (creationId) => {
    if (processingFavorites.has(creationId)) return;

    const isAuthed = await checkAuth();

    if (!isAuthed) {
      toast.error('Please log in to favorite creations', {
        icon: '🔒',
        duration: 3000,
      });
      return;
    }

    try {
      setProcessingFavorites(prev => new Set([...prev, creationId]));

      const newFavorites = new Set(favorites);
      const isFavorited = newFavorites.has(creationId);

      if (isFavorited) {
        newFavorites.delete(creationId);
      } else {
        newFavorites.add(creationId);
      }

      setFavorites(newFavorites);

      setCreations(creations.map(creation => {
        if (creation._id === creationId) {
          return {
            ...creation,
            favorites: isFavorited ? Math.max(0, (creation.favorites || 0) - 1) : (creation.favorites || 0) + 1,
            favoritedBy: isFavorited
              ? (creation.favoritedBy || []).filter(id => id !== userId)
              : [...(creation.favoritedBy || []), userId]
          };
        }
        return creation;
      }));

      const res = await fetch(`/api/creations/${creationId}/favorite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to toggle favorite');
      }

      const data = await res.json();

      setCreations(creations.map(creation =>
        creation._id === creationId
          ? { ...creation, favorites: data.favorites, favoritedBy: data.favoritedBy }
          : creation
      ));

    } catch (err) {
      console.error('Toggle favorite error:', err);
      toast.error('Failed to update favorite');

      setFavorites(prev => {
        const revertedFavorites = new Set(prev);
        if (revertedFavorites.has(creationId)) {
          revertedFavorites.delete(creationId);
        } else {
          revertedFavorites.add(creationId);
        }
        return revertedFavorites;
      });

      fetchCreations();
    } finally {
      setProcessingFavorites(prev => {
        const updated = new Set(prev);
        updated.delete(creationId);
        return updated;
      });
    }
  };

  const filteredCreations = creations.filter(creation => {
    const searchMatch =
      creation.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
      creation.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
      creation.author?.toLowerCase().includes(filters.search.toLowerCase());

    const authorMatch = !filters.author || creation.author?.toLowerCase().includes(filters.author.toLowerCase());
    const languageMatch = !filters.language || creation.language === filters.language;
    const visibilityMatch = filters.visibility === 'all' || creation.visibility === filters.visibility;

    const timeframeMatch = () => {
      if (filters.timeframe === 'all') return true;
      const date = new Date(creation.createdAt);
      const now = new Date();
      switch (filters.timeframe) {
        case 'today': return date.toDateString() === now.toDateString();
        case 'week': return (now - date) < 7 * 24 * 60 * 60 * 1000;
        case 'month': return (now - date) < 30 * 24 * 60 * 60 * 1000;
        default: return true;
      }
    };

    const tagsMatch = filters.tags.length === 0 ||
      filters.tags.every(tag => creation.tags?.includes(tag));

    return searchMatch && authorMatch && languageMatch && timeframeMatch() && visibilityMatch && tagsMatch;
  });

  const sortedCreations = [...filteredCreations].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'popular':
        return (b.favorites || 0) - (a.favorites || 0);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-950">
        <div className="text-center space-y-4">
          <div className="flex flex-col items-center justify-center">
            <Loader className="w-12 h-12 text-blue-500 animate-spin mb-2" />
            <p className="text-lg text-gray-300 font-medium">Loading creations...</p>
            <p className="text-gray-400 text-sm">Fetching the latest code snippets</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-950">
        <div className="text-center space-y-4 p-8 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-red-500/30 max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-200">Something went wrong</h2>
          <p className="text-gray-400">{error}</p>
          <button
            onClick={fetchCreations}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950">
      {/* Modern Navigation Bar */}
      <div className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors group">
                <Home className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Home</span>
              </Link>

              <div className="hidden md:flex items-center space-x-6">
                <Link href="/auth/dashboard" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors group">
                  <Grid className="w-4 h-4 group-hover:text-blue-400 transition-colors" />
                  <span>Dashboard</span>
                </Link>

                <Link href="/lander/explore" className="flex items-center gap-2 text-blue-400 border-b-2 border-blue-500 pb-1">
                  <Globe className="w-4 h-4" />
                  <span className="font-medium">Explore</span>
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-800/70 hover:bg-gray-700/70 text-gray-200 rounded-full transition-all"
                >
                  <User className="w-4 h-4" />
                  <span>My Profile</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all shadow-lg shadow-blue-500/20"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modern Hero Header */}
      <div className="relative bg-gradient-to-r from-blue-900/20 via-indigo-900/20 to-purple-900/20 border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-white">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
                  Explore Creations
                </span>
              </h1>
              <p className="text-gray-400 text-lg flex items-center gap-2">
                Discover and learn from community code examples
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-80 focus-within:scale-105 transition-all duration-200">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search creations..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800/50 rounded-full border border-gray-700/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 text-gray-300 transition-all shadow-lg shadow-black/10"
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-5 py-3 rounded-full transition-all duration-200 shadow-lg shadow-black/10 ${showFilters
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-300'
                  }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
                {Object.values(filters).some(v =>
                  Array.isArray(v) ? v.length > 0 : Boolean(v) && v !== 'all'
                ) && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full" />
                  )}
              </button>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 right-10 w-60 h-60 bg-indigo-600/10 rounded-full blur-3xl"></div>
        </div>
      </div>

      <AnimatePresence mode="sync">
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="border-b border-gray-700/50 bg-gray-800/90 backdrop-blur-lg overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 py-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-blue-400" />
                    Programming Language
                  </label>
                  <select
                    value={filters.language}
                    onChange={(e) => setFilters({ ...filters, language: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-900/70 rounded-lg border border-gray-700/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 text-gray-300 transition-all appearance-none"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em", paddingRight: "2.5rem" }}
                  >
                    <option value="">All Languages</option>
                    {availableLanguages.map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    Time Period
                  </label>
                  <select
                    value={filters.timeframe}
                    onChange={(e) => setFilters({ ...filters, timeframe: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-900/70 rounded-lg border border-gray-700/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 text-gray-300 transition-all appearance-none"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em", paddingRight: "2.5rem" }}
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blue-400" />
                    Visibility
                  </label>
                  <select
                    value={filters.visibility}
                    onChange={(e) => setFilters({ ...filters, visibility: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-900/70 rounded-lg border border-gray-700/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 text-gray-300 transition-all appearance-none"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em", paddingRight: "2.5rem" }}
                  >
                    <option value="all">All</option>
                    <option value="public">Public</option>
                    <option value="unlisted">Unlisted</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-blue-400" />
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 bg-gray-900/70 p-3 rounded-lg border border-gray-700/50 min-h-[51px] max-h-[100px] overflow-y-auto">
                    {availableTags.length > 0 ? (
                      availableTags.map(tag => (
                        <button
                          key={tag}
                          onClick={() => setFilters({
                            ...filters,
                            tags: filters.tags.includes(tag)
                              ? filters.tags.filter(t => t !== tag)
                              : [...filters.tags, tag]
                          })}
                          className={`px-3 py-1 rounded-full text-xs flex items-center gap-1.5 transition-all duration-200 ${filters.tags.includes(tag)
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                            }`}
                        >
                          {tag}
                          {filters.tags.includes(tag) && <X className="w-3 h-3" />}
                        </button>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 p-1">No tags available</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6 gap-2">
                <button
                  onClick={() => setFilters({
                    search: '',
                    author: '',
                    language: '',
                    timeframe: 'all',
                    visibility: 'all',
                    tags: [],
                  })}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white flex items-center gap-2 hover:bg-gray-700/30 rounded-lg transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reset All Filters
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="px-4 py-2 text-sm bg-blue-600 text-white flex items-center gap-2 rounded-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {filteredCreations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 shadow-xl">
              <Code2 className="w-16 h-16 text-gray-600 mb-4 mx-auto" />
              <h3 className="text-2xl font-bold text-gray-300 mb-3">No Creations Found</h3>
              <p className="text-gray-400 max-w-md mb-6">
                {filters.search || filters.language || filters.tags.length > 0
                  ? "No creations match your current filters. Try adjusting your search criteria."
                  : "Looks like no creations exist yet. Be the first to share your code!"}
              </p>


              {(filters.search || filters.language || filters.tags.length > 0) && (
                <button
                  onClick={() => setFilters({
                    search: '',
                    author: '',
                    language: '',
                    timeframe: 'all',
                    visibility: 'all',
                    tags: [],
                  })}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all flex items-center gap-2 mx-auto shadow-lg shadow-blue-500/20"
                >
                  <RefreshCw className="w-4 h-4" />
                  Clear All Filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-full px-4 py-1.5 border border-gray-700/50">
                <p className="text-gray-300 flex items-center gap-2 text-sm">
                  <Filter className="w-4 h-4 text-blue-400" />
                  <span>{filteredCreations.length} creation{filteredCreations.length !== 1 ? 's' : ''}</span>
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800/70 rounded-full border border-gray-700/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 text-gray-300 hover:text-white transition-all"
                  >
                    <ArrowUpDown className="w-4 h-4" />
                    <span className="text-sm">{sortBy === 'newest' ? 'Newest First' : sortBy === 'oldest' ? 'Oldest First' : 'Most Popular'}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'transform rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute top-full mt-2 right-0 w-48 bg-gray-800 rounded-xl shadow-xl border border-gray-700/50 py-1 z-50 overflow-hidden"
                      >
                        {['newest', 'oldest', 'popular'].map((option) => (
                          <button
                            key={option}
                            onClick={() => {
                              setSortBy(option);
                              setDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-sm ${sortBy === option
                              ? 'text-blue-400 bg-gray-700/70'
                              : 'text-gray-300 hover:bg-gray-700/40 hover:text-white'
                              } transition-colors`}
                          >
                            {option === 'newest' ? '🕒 Newest First' :
                              option === 'oldest' ? '📜 Oldest First' :
                                '🌟 Most Popular'}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex gap-1 bg-gray-800/70 p-1 rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md ${viewMode === 'grid'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-400 hover:text-gray-200'
                      } transition-all`}
                    aria-label="Grid view"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md ${viewMode === 'list'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-400 hover:text-gray-200'
                      } transition-all`}
                    aria-label="List view"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className={`
              ${viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-5'
              }
            `}>
              {sortedCreations.map((creation) => (
                <motion.div
                  key={creation._id}
                  layout
                  layoutId={creation._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className={`
                    relative group bg-gray-800/60 backdrop-blur-md rounded-xl
                    border border-gray-700/40 hover:border-blue-500/50
                    transition-all duration-300 overflow-hidden
                    hover:shadow-xl hover:shadow-blue-500/10
                    ${viewMode === 'list'
                      ? 'flex flex-col sm:flex-row gap-4 sm:gap-6 p-5'
                      : 'p-6'}
                  `}
                >
                  <div className={`${viewMode === 'list' ? 'flex-1 min-w-0' : ''}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className={`
                          px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1
                          ${creation.language ? 'bg-blue-600/20 text-blue-400' : 'bg-gray-700/50 text-gray-400'}
                        `}>
                          <FileCode className="w-3 h-3" />
                          {creation.language || 'No language'}
                        </div>
                        <div className="flex items-center gap-1 text-gray-400">
                          {creation.visibility === 'public' ? (
                            <Globe className="w-3 h-3" />
                          ) : (
                            <Lock className="w-3 h-3" />
                          )}
                          <span className="text-xs">{creation.visibility}</span>
                        </div>
                      </div>
                    </div>

                    <Link href={`/creation/${creation._id}`} className="block group-hover:scale-[1.01] transition-transform">
                      <h2 className="text-xl font-semibold mb-2 text-gray-100 group-hover:text-blue-400 transition-colors line-clamp-2">
                        {creation.title}
                      </h2>
                    </Link>
                    <p className="text-gray-400 mb-4 line-clamp-2">
                      {creation.description || "No description provided"}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {creation.tags && creation.tags.length > 0 ? (
                        creation.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2.5 py-1 text-xs rounded-full bg-gray-700/40 text-gray-300"
                          >
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-500">No tags</span>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                      <div className="flex flex-wrap gap-3">
                        <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                          <User className="w-4 h-4 text-blue-400/70" />
                          <span className="truncate max-w-[120px]">{creation.author || "Anonymous"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                          <Clock className="w-4 h-4 text-blue-400/70" />
                          <span>{new Date(creation.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <Link
                        href={`/creation/${creation._id}`}
                        className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium text-sm group/link"
                      >
                        View Details
                        <ChevronDown className="w-4 h-4 rotate-[-90deg] group-hover/link:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>

                    <button
                      onClick={() => toggleFavorite(creation._id)}
                      disabled={processingFavorites.has(creation._id)}
                      className={`
                        absolute top-4 right-4 p-2.5 rounded-full 
                        transition-all duration-300
                        ${processingFavorites.has(creation._id)
                          ? 'bg-gray-700/70 cursor-wait shadow-lg'
                          : favorites.has(creation._id)
                            ? 'text-red-400 bg-red-500/20 hover:bg-red-500/30 shadow-lg shadow-red-500/10'
                            : 'text-gray-500 hover:text-red-400 bg-gray-900/70 hover:bg-red-500/10 shadow-lg shadow-black/10'
                        }
                      `}
                      aria-label={favorites.has(creation._id) ? "Remove from favorites" : "Add to favorites"}
                    >
                      {processingFavorites.has(creation._id) ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <Heart
                          className={`w-4 h-4 ${favorites.has(creation._id)
                            ? 'fill-current animate-pulse'
                            : 'group-hover:scale-110 transition-transform'
                            }`}
                        />
                      )}
                      <span className="absolute -bottom-1 -right-1 min-w-[20px] h-[20px] flex items-center justify-center text-xs bg-gray-800 text-white rounded-full px-1.5 border border-gray-700 shadow-md">
                        {creation.favorites || 0}
                      </span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}