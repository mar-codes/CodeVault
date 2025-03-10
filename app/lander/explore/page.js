'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ReactDOM from 'react-dom';
import React from 'react';
import Link from 'next/link';
import {
  Code2, Search, LayoutGrid, List, SlidersHorizontal,
  Clock, User, Tag, X, ChevronDown, Eye, Globe, Lock,
  FileCode, Filter, RefreshCw, ArrowUpDown, Heart,
  Loader, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useInView } from 'react-intersection-observer';
import Loading from '@/app/components/Loading';

const springConfig = {
  type: "spring",
  stiffness: 400,
  damping: 30
};

const gridTransition = {
  layout: springConfig,
  opacity: { duration: 0.2 },
  scale: springConfig
};


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
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 50;
  const [user, setUser] = useState(null);
  const { ref: topRef, inView: isTopVisible } = useInView();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

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
    const visibilityMatch = filters.visibility === 'all' || creation.privacy === filters.visibility;

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

  const { paginatedCreations, totalPages } = useMemo(() => {
    const sorted = [...filteredCreations].sort((a, b) => {
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

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedItems = sorted.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return {
      paginatedCreations: paginatedItems,
      totalPages: Math.ceil(filteredCreations.length / ITEMS_PER_PAGE)
    };
  }, [filteredCreations, sortBy, currentPage]);

  const StickyHeader = () => (
    <motion.div
      initial={{ y: -100 }}
      animate={{
        y: isTopVisible ? -100 : 0,
        transition: {
          type: "spring",
          stiffness: 200,
          damping: 20
        }
      }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="bg-gray-900/95 backdrop-blur-lg border-b border-gray-800/60 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="flex-1 max-w-xl">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search creations..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 bg-gray-800/50 rounded-full border border-gray-700/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 text-gray-300"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <ViewToggle />
                <SortDropdown />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Link
                href="/auth/login"
                className="px-4 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white border border-gray-700 hover:border-gray-600 transition-all duration-200 hover:bg-gray-800/60 focus-visible:ring-2 focus-visible:ring-blue-500/50 outline-none"
              >
                Login
              </Link>
              <Link
                href="/auth/signup"
                className="px-4 py-2 rounded-md text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition-all duration-200 shadow-md shadow-blue-900/20 hover:shadow-blue-900/30 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 focus-visible:ring-offset-gray-900 outline-none"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const Pagination = () => (
    <div className="flex items-center justify-between px-6 py-4 bg-gray-800/50 rounded-3xl mt-8 shadow-2xl shadow-gray-900/50">
      <button
        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className="px-4 py-2 rounded-full bg-gray-700 text-gray-300 disabled:opacity-50 transition-all duration-200 hover:bg-gray-600 hover:text-white"
      >
        Previous
      </button>

      <div className="flex items-center gap-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(page => page === 1 || page === totalPages || Math.abs(currentPage - page) <= 2)
          .map((page, i, arr) => (
            <React.Fragment key={page}>
              {i > 0 && arr[i - 1] !== page - 1 && (
                <span className="text-gray-500">...</span>
              )}
              <button
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-full transition-all duration-200 ${currentPage === page
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                  }`}
              >
                {page}
              </button>
            </React.Fragment>
          ))}
      </div>

      <button
        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="px-4 py-2 rounded-full bg-gray-700 text-gray-300 disabled:opacity-50 transition-all duration-200 hover:bg-gray-600 hover:text-white"
      >
        Next
      </button>
    </div>
  );

  const ViewToggle = () => (
    <div className="flex gap-1 bg-gray-800/70 p-1 rounded-lg">
      <button
        onClick={() => setViewMode('grid')}
        className={`p-2 rounded-md transform transition-all duration-200 hover:scale-105 active:scale-95
          ${viewMode === 'grid'
            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
          }`}
        aria-label="Grid view"
      >
        <LayoutGrid className="w-4 h-4" />
      </button>
      <button
        onClick={() => setViewMode('list')}
        className={`p-2 rounded-md transform transition-all duration-200 hover:scale-105 active:scale-95
          ${viewMode === 'list'
            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
          }`}
        aria-label="List view"
      >
        <List className="w-4 h-4" />
      </button>
    </div>
  );

  const FilterButton = () => (
    <button
      onClick={() => setShowFilters(!showFilters)}
      className={`flex items-center gap-2 px-5 py-3 rounded-full transition-all duration-200 shadow-lg shadow-black/10 ${showFilters
        ? 'bg-blue-600 text-white hover:bg-blue-700'
        : 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-300'
        } relative`}
    >
      <SlidersHorizontal className="w-4 h-4" />
      <span className="hidden sm:inline">Filters</span>
    </button>
  );

  const SortDropdown = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);
    const [dropdownStyles, setDropdownStyles] = useState({});

    const updateDropdownPosition = useCallback(() => {
      if (!buttonRef.current) return;

      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownStyles({
        position: 'fixed',
        width: rect.width,
        left: rect.left,
        top: rect.bottom + 5,
        zIndex: 9999
      });
    }, []);

    const toggleDropdown = useCallback(() => {
      if (!dropdownOpen) {
        updateDropdownPosition();
      }
      setDropdownOpen(prev => !prev);
    }, [dropdownOpen, updateDropdownPosition]);

    useEffect(() => {
      if (!dropdownOpen) return;

      const handleResize = () => {
        updateDropdownPosition();
      };

      const handleScroll = () => {
        updateDropdownPosition();
      };

      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleScroll, true);

      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleScroll, true);
      };
    }, [dropdownOpen, updateDropdownPosition]);

    useEffect(() => {
      if (!dropdownOpen) return;

      const handleClickOutside = (event) => {
        if (
          buttonRef.current &&
          !buttonRef.current.contains(event.target) &&
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target)
        ) {
          setDropdownOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [dropdownOpen]);

    return (
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={toggleDropdown}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800/70 rounded-full border border-gray-700/50 
            focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 text-gray-300 hover:text-white 
            transition-all duration-200 hover:bg-gray-700/80 active:scale-95"
        >
          <ArrowUpDown className="w-4 h-4" />
          <span className="text-sm">{sortBy === 'newest' ? 'Newest First' : sortBy === 'oldest' ? 'Oldest First' : 'Most Popular'}</span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {dropdownOpen && ReactDOM.createPortal(
          <div
            ref={dropdownRef}
            style={dropdownStyles}
            className="dropdown-menu-portal"
          >
            <div className="w-48 mt-2 bg-gray-800 rounded-xl shadow-xl border border-gray-700/50 py-1 overflow-hidden">
              {['newest', 'oldest', 'popular'].map((option) => (
                <motion.button
                  key={option}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSortBy(option);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors duration-200
                    ${sortBy === option
                      ? 'text-blue-400 bg-gray-700/70'
                      : 'text-gray-300 hover:bg-gray-700/40 hover:text-white'
                    }`}
                >
                  {option === 'newest' ? 'Newest First' :
                    option === 'oldest' ? 'Oldest First' :
                      'Most Popular'}
                </motion.button>
              ))}
            </div>
          </div>,
          document.body
        )}
      </div>
    );
  };

  const CreationsGrid = () => (
    <motion.div
      layout
      className={`${viewMode === 'grid'
        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
        : 'space-y-5'}`}
      transition={gridTransition}
    >
      <AnimatePresence mode="popLayout">
        {paginatedCreations.map((creation) => (
          <motion.div
            key={creation._id}
            layout="position"
            layoutId={creation._id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={gridTransition}
            className={`relative group bg-gray-800/60 backdrop-blur-md rounded-xl
              border border-gray-700/40 hover:border-blue-500/50
              transition-all duration-300 overflow-hidden
              hover:shadow-xl hover:shadow-blue-500/10
              ${viewMode === 'list'
                ? 'flex flex-col sm:flex-row gap-4 sm:gap-6 p-5'
                : 'p-6'}`}
          >
            <div className={`${viewMode === 'list' ? 'flex-1 min-w-0' : ''}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1
                    ${creation.language ? 'bg-blue-600/20 text-blue-400' : 'bg-gray-700/50 text-gray-400'}`}>
                    <FileCode className="w-3 h-3" />
                    {creation.language || 'No language'}
                  </div>
                  <div className="flex items-center gap-1 text-gray-400">
                    {creation.privacy === 'public' ? (
                      <Globe className="w-3 h-3" />
                    ) : (
                      <Lock className="w-3 h-3" />
                    )}
                    <span className="text-xs">{creation.privacy}</span>
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
                className={`absolute top-4 right-4 p-2.5 rounded-full 
                  transition-all duration-300
                  ${processingFavorites.has(creation._id)
                    ? 'bg-gray-700/70 cursor-wait shadow-lg'
                    : favorites.has(creation._id)
                      ? 'text-red-400 bg-red-500/20 hover:bg-red-500/30 shadow-lg shadow-red-500/10'
                      : 'text-gray-500 hover:text-red-400 bg-gray-900/70 hover:bg-red-500/10 shadow-lg shadow-black/10'}`}
                aria-label={favorites.has(creation._id) ? "Remove from favorites" : "Add to favorites"}
              >
                {processingFavorites.has(creation._id) ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Heart
                    className={`w-4 h-4 ${favorites.has(creation._id)
                      ? 'fill-current animate-pulse'
                      : 'group-hover:scale-110 transition-transform'}`}
                  />
                )}
                <span className="absolute -bottom-1 -right-1 min-w-[20px] h-[20px] flex items-center justify-center text-xs bg-gray-800 text-white rounded-full px-1.5 border border-gray-700 shadow-md">
                  {creation.favorites || 0}
                </span>
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );

  const LoadingState = () => (
    <div className="py-12">
      <div className="flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-l-indigo-400 rounded-full animate-spin animate-delay-150"></div>
        </div>
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-200 mb-2">Loading creations</h3>
          <p className="text-gray-400">Please wait while we fetch the latest code examples...</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full mt-6">
          {[...Array(6)].map((_, i) => (
            <div 
              key={i}
              className="bg-gray-800/40 rounded-xl border border-gray-700/30 h-64 animate-pulse"
              style={{
                animationDelay: `${i * 0.15}s`,
                animationDuration: '1.5s'
              }}
            >
              <div className="h-full flex flex-col p-6">
                <div className="flex justify-between mb-4">
                  <div className="bg-gray-700/60 h-6 w-24 rounded-full"></div>
                  <div className="bg-gray-700/60 h-6 w-6 rounded-full"></div>
                </div>
                <div className="bg-gray-700/60 h-7 w-3/4 rounded-md mb-2"></div>
                <div className="bg-gray-700/60 h-4 w-full rounded-md mb-1"></div>
                <div className="bg-gray-700/60 h-4 w-2/3 rounded-md mb-4"></div>
                <div className="flex gap-2 mb-4">
                  <div className="bg-gray-700/60 h-6 w-16 rounded-full"></div>
                  <div className="bg-gray-700/60 h-6 w-16 rounded-full"></div>
                </div>
                <div className="mt-auto flex justify-between">
                  <div className="bg-gray-700/60 h-5 w-24 rounded-md"></div>
                  <div className="bg-gray-700/60 h-5 w-20 rounded-md"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const CustomSelect = ({ icon: Icon, label, value, onChange, options }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef(null);
    const buttonRef = useRef(null);
    const dropdownRef = useRef(null);
    const [dropdownStyles, setDropdownStyles] = useState({});

    const selectedOption = options.find(option => option.value === value) || options[0];

    const updateDropdownPosition = useCallback(() => {
      if (!buttonRef.current) return;

      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownStyles({
        position: 'fixed',
        width: rect.width,
        left: rect.left,
        top: rect.bottom + 5,
        zIndex: 9999
      });
    }, []);

    const toggleDropdown = useCallback(() => {
      if (!isOpen) {
        updateDropdownPosition();
      }
      setIsOpen(prev => !prev);
    }, [isOpen, updateDropdownPosition]);

    useEffect(() => {
      if (!isOpen) return;

      const handleResize = () => {
        updateDropdownPosition();
      };

      const handleScroll = () => {
        updateDropdownPosition();
      };

      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleScroll, true);

      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleScroll, true);
      };
    }, [isOpen, updateDropdownPosition]);

    useEffect(() => {
      if (!isOpen) return;

      const handleClickOutside = (event) => {
        if (
          buttonRef.current &&
          !buttonRef.current.contains(event.target) &&
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen]);

    const handleOptionClick = (optionValue) => {
      onChange({ target: { value: optionValue } });
      setIsOpen(false);
    };

    return (
      <div className="relative" ref={selectRef}>
        <label className="block text-sm font-medium text-gray-400 mb-2">{label}</label>
        <button
          ref={buttonRef}
          type="button"
          onClick={toggleDropdown}
          className="w-full flex items-center justify-between bg-gray-900/80 border border-gray-700 rounded-lg px-4 py-2.5 text-left text-sm transition-all duration-200 hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/70"
        >
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-gray-500" />
            <span className="text-gray-200">{selectedOption.label}</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && ReactDOM.createPortal(
          <div
            ref={dropdownRef}
            style={dropdownStyles}
            className="dropdown-menu-portal"
          >
            <div className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
              <div className="max-h-60 overflow-y-auto py-1">
                {options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleOptionClick(option.value)}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-200 hover:bg-gray-700/70 transition-colors"
                  >
                    <span>{option.label}</span>
                    {option.value === value && <Check className="w-4 h-4 text-blue-500" />}
                  </button>
                ))}
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    );
  };

  const TagSelector = ({ availableTags, selectedTags, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef(null);
    const buttonRef = useRef(null);
    const dropdownRef = useRef(null);
    const [dropdownStyles, setDropdownStyles] = useState({});

    const updateDropdownPosition = useCallback(() => {
      if (!buttonRef.current) return;

      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownStyles({
        position: 'fixed',
        width: rect.width,
        left: rect.left,
        top: rect.bottom + 5,
        zIndex: 9999
      });
    }, []);

    const toggleDropdown = useCallback(() => {
      if (!isOpen) {
        updateDropdownPosition();
      }
      setIsOpen(prev => !prev);
    }, [isOpen, updateDropdownPosition]);

    useEffect(() => {
      if (!isOpen) return;

      const handleResize = () => {
        updateDropdownPosition();
      };

      const handleScroll = () => {
        updateDropdownPosition();
      };

      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleScroll, true);

      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleScroll, true);
      };
    }, [isOpen, updateDropdownPosition]);

    useEffect(() => {
      if (!isOpen) return;

      const handleClickOutside = (event) => {
        if (
          buttonRef.current &&
          !buttonRef.current.contains(event.target) &&
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen]);

    const handleTagClick = (tag) => {
      onChange(tag);
    };

    return (
      <div className="relative" ref={selectRef}>
        <label className="block text-sm font-medium text-gray-400 mb-2">Tags</label>
        <button
          ref={buttonRef}
          type="button"
          onClick={toggleDropdown}
          className="w-full flex items-center justify-between bg-gray-900/80 border border-gray-700 rounded-lg px-4 py-2.5 text-left text-sm transition-all duration-200 hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/70"
        >
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-gray-500" />
            <span className="text-gray-200 truncate">
              {selectedTags.length === 0 ? 'Select Tags' : `${selectedTags.length} selected`}
            </span>
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {selectedTags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-900/40 text-blue-300 rounded-full"
              >
                {tag}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(tag);
                  }}
                  className="text-blue-300 hover:text-blue-100"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {isOpen && ReactDOM.createPortal(
          <div
            ref={dropdownRef}
            style={dropdownStyles}
            className="dropdown-menu-portal"
          >
            <div className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
              <div className="max-h-60 overflow-y-auto py-1">
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-200 hover:bg-gray-700/70 transition-colors"
                  >
                    <span>{tag}</span>
                    {selectedTags.includes(tag) && <Check className="w-4 h-4 text-blue-500" />}
                  </button>
                ))}
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    );
  };

  const FilterSection = () => {
    const [openDropdown, setOpenDropdown] = useState(null);

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <CustomSelect
          icon={FileCode}
          label="Programming Language"
          value={filters.language}
          onChange={(e) => setFilters(prev => ({ ...prev, language: e.target.value }))}
          options={[
            { value: '', label: 'All Languages' },
            ...availableLanguages.map(lang => ({ value: lang, label: lang }))
          ]}
        />

        <CustomSelect
          icon={Clock}
          label="Time Period"
          value={filters.timeframe}
          onChange={(e) => setFilters(prev => ({ ...prev, timeframe: e.target.value }))}
          options={[
            { value: 'all', label: 'All Time' },
            { value: 'today', label: 'Today' },
            { value: 'week', label: 'This Week' },
            { value: 'month', label: 'This Month' }
          ]}
        />

        <CustomSelect
          icon={Eye}
          label="Visibility"
          value={filters.visibility}
          onChange={(e) => setFilters(prev => ({ ...prev, visibility: e.target.value }))}
          options={[
            { value: 'all', label: 'All' },
            { value: 'public', label: 'Public' },
            { value: 'unlisted', label: 'Unlisted' }
          ]}
        />

        <TagSelector
          availableTags={availableTags}
          selectedTags={filters.tags}
          onChange={(tag) => setFilters(prev => ({
            ...prev,
            tags: prev.tags.includes(tag)
              ? prev.tags.filter(t => t !== tag)
              : [...prev.tags, tag]
          }))}
        />
      </div>
    );
  };


  return (
    <>
      <Header user={user} />
      <div className="relative bg-gray-900 bg-gradient-to-r from-blue-900/20 via-indigo-900/20 to-purple-900/20 border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col gap-8">
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
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 max-w-xl">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search creations..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 bg-gray-800/50 rounded-full border border-gray-700/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 text-gray-300"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <ViewToggle />
                <FilterButton />
                <SortDropdown />
              </div>
            </div>
          </div>
        </div>

        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 right-10 w-60 h-60 bg-indigo-600/20 rounded-full blur-3xl"></div>
        </div>
      </div>
      <div ref={topRef} />
      <StickyHeader />

      <main className="min-h-screen bg-gray-950 bg-gradient-to-b from-gray-900 via-gray-950 to-black">
        <div className="relative bg-gray-900 bg-gradient-to-r from-blue-900/30 via-indigo-900/30 to-purple-900/30 border-b border-gray-800/50">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 right-10 w-60 h-60 bg-indigo-600/20 rounded-full blur-3xl"></div>
          </div>
        </div>

        <AnimatePresence mode="sync">
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{
                opacity: 1,
                height: 'auto',
                transition: {
                  height: { duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] },
                  opacity: { duration: 0.3, delay: 0.1 }
                }
              }}
              exit={{
                opacity: 0,
                height: 0,
                transition: {
                  height: { duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] },
                  opacity: { duration: 0.2 }
                }
              }}
              className="backdrop-blur-xl rounded-xl overflow-hidden border border-gray-700/50 bg-gradient-to-b from-gray-800/90 to-gray-900/90 shadow-2xl"
            >
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="max-w-7xl mx-auto px-6 py-8"
              >
                <FilterSection />

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="flex justify-end mt-8 gap-3"
                >
                  <button
                    onClick={() => setFilters({
                      search: '',
                      author: '',
                      language: '',
                      timeframe: 'all',
                      visibility: 'all',
                      tags: [],
                    })}
                    className="px-4 py-2.5 text-sm text-gray-400 hover:text-white flex items-center gap-2 
                  hover:bg-gray-700/50 rounded-lg transition-all duration-200 border border-transparent hover:border-gray-700"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reset Filters
                  </button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <LoadingState />
            </motion.div>
          ) : paginatedCreations.length === 0 ? (
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
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4"></div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-full px-4 py-1.5 border border-gray-700/50">
                  <p className="text-gray-300 flex items-center gap-2 text-sm">
                    <Filter className="w-4 h-4 text-blue-400" />
                    <span>{filteredCreations.length} creation{filteredCreations.length !== 1 ? 's' : ''}</span>
                  </p>
                </div>
              </div>

              <CreationsGrid />

              <Pagination />
            </>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}