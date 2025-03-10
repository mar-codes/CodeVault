'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiGrid, FiList, FiSearch, FiPlus } from 'react-icons/fi';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import debounce from 'lodash/debounce';
import {
  LayoutDashboard, Activity, Calendar, Clock
} from 'lucide-react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import CreationCard from '@/app/components/CreationCard';
import Dropdown from '@/app/components/Dropdown';
import Loading from '@/app/components/Loading';

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
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Enhanced sort options
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'nameDesc', label: 'Name (Z-A)' }
  ];

  const handleSearch = useCallback(
    debounce((value) => {
      setDebouncedSearch(value);
    }, 300),
    []
  );

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userRes = await fetch('/api/auth/me/auth');
        const userData = await userRes.json();

        if (!userData.success) {
          router.push('/auth/login');
          return;
        }

        setUser(userData.user);
        const userId = userData.user._id;

        const creationsURL = `/api/creations/get/${userId}`;

        const creationsRes = await fetch(creationsURL);

        if (!creationsRes.ok) {
          throw new Error(`Failed to fetch creations: ${creationsRes.status}`);
        }

        const creationsData = await creationsRes.json();

        if (creationsData.success && Array.isArray(creationsData.creations)) {
          setCreations(creationsData.creations);
        } else {
          setCreations([]);
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

  // Add this new function for handling sort logic
  const sortCreations = useCallback((items, sortType) => {
    switch(sortType) {
      case 'newest':
        return [...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'oldest':
        return [...items].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'name':
        return [...items].sort((a, b) => a.title?.localeCompare(b.title || ''));
      case 'nameDesc':
        return [...items].sort((a, b) => b.title?.localeCompare(a.title || ''));
      default:
        return items;
    }
  }, []);

  const filteredCreations = useMemo(() => {
    return sortCreations(
      creations.filter(creation =>
        creation.title?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        creation.description?.toLowerCase().includes(debouncedSearch.toLowerCase())
      ),
      sortBy
    );
  }, [creations, debouncedSearch, sortBy, sortCreations]);

  const paginatedCreations = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCreations.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCreations, currentPage]);

  const totalPages = Math.ceil(filteredCreations.length / itemsPerPage);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950">
      <Header
        user={user}
        onMenuClick={() => setIsMenuOpen(true)}
        onProfileClick={() => setIsProfileOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 sm:space-y-8">
        {/* Welcome Card */}
        <div className="bg-gradient-to-br from-gray-800/50 via-gray-900/50 to-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/30 p-6 sm:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-200 to-indigo-300 text-transparent bg-clip-text">
                Welcome back, {user?.username || 'User'}
              </h1>
              <p className="text-gray-400">Manage and explore your creative coding projects</p>
            </div>
            
            <Link
              href="/lander/upload"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium transition-all duration-300 shadow-lg hover:shadow-blue-500/25 whitespace-nowrap"
            >
              <FiPlus className="w-4 h-4" />
              <span>New Project</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-6 sm:mt-8">
            {[
              { label: 'Total Projects', value: creations.length, icon: <LayoutDashboard className="w-5 h-5 text-blue-400" /> },
              { label: 'Active Projects', value: creations.filter(c => !c.archived).length, icon: <Activity className="w-5 h-5 text-green-400" /> },
              {
                label: 'This Month',
                value: creations.filter(c => new Date(c.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length,
                icon: <Calendar className="w-5 h-5 text-purple-400" />
              },
              {
                label: 'Last Updated',
                value: creations[0]?.updatedAt ? new Date(creations[0].updatedAt).toLocaleDateString() : 'N/A',
                icon: <Clock className="w-5 h-5 text-orange-400" />
              }
            ].map((stat, index) => (
              <div key={index}
                className="relative group bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-5 rounded-xl border border-gray-700/30 hover:border-gray-600/50 transition-all duration-300"
              >
                <div className="absolute inset-0 rounded-xl bg-blue-400/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="text-xl sm:text-2xl">{stat.icon}</span>
                    <p className="text-xs sm:text-sm font-medium text-gray-400">{stat.label}</p>
                  </div>
                  <p className="text-xl sm:text-2xl font-semibold text-gray-100">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Controls Bar - Enhanced for better mobile experience */}
        <div className="bg-gradient-to-r from-gray-800/50 via-gray-900/50 to-gray-800/50 backdrop-blur-xl rounded-xl shadow-xl border border-gray-700/30 p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            {/* Search Bar - Prioritized on mobile */}
            <div className="flex-1 order-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800/50 text-gray-300 placeholder-gray-500"
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  value={searchQuery}
                />
              </div>
            </div>
            
            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-3 order-2 sm:order-2">
              {/* View Mode Controls */}
              <div className="flex items-center bg-gray-800/50 rounded-lg p-1 h-full">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-2 sm:px-3 py-2 rounded-md transition-all duration-200 flex items-center gap-1.5 ${viewMode === 'grid'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
                    }`}
                  title="Grid View"
                >
                  <FiGrid size={16} />
                  <span className="text-xs sm:text-sm font-medium hidden sm:inline">Grid</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-2 sm:px-3 py-2 rounded-md transition-all duration-200 flex items-center gap-1.5 ${viewMode === 'list'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
                    }`}
                  title="List View"
                >
                  <FiList size={16} />
                  <span className="text-xs sm:text-sm font-medium hidden sm:inline">List</span>
                </button>
              </div>

              {/* Sort Dropdown with Label */}
              <div className="flex items-center gap-2 h-full">
                <span className="text-gray-400 text-xs hidden sm:block">Sort:</span>
                <Dropdown
                  options={sortOptions}
                  value={sortBy}
                  onChange={setSortBy}
                  className="sm:min-w-[140px]"
                  buttonClassName="py-2 px-3"
                />
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-gray-800/50 text-gray-400 hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="text-gray-400 text-sm">
                  {currentPage} / {totalPages || 1}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="p-2 rounded-lg bg-gray-800/50 text-gray-400 hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-900/20 border border-red-700/50 p-4 rounded-xl backdrop-blur-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredCreations.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-800/50 via-gray-900/50 to-gray-800/50 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-700/30 p-8 sm:p-12 flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px]">
            <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center bg-blue-900/20 rounded-full mb-5 sm:mb-6">
              <LayoutDashboard className="w-7 h-7 sm:w-8 sm:h-8 text-blue-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-2 bg-gradient-to-r from-blue-200 to-indigo-300 text-transparent bg-clip-text text-center">
              {searchQuery ? 'No matching projects' : 'Start Your Coding Journey'}
            </h2>
            <p className="text-gray-400 mb-6 sm:mb-8 text-center max-w-md text-sm sm:text-base">
              {searchQuery ? 'Try adjusting your search terms or filters.' : 'Create your first project and begin building something amazing!'}
            </p>
            <Link
              href="/lander/upload"
              className="group relative px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
            >
              <span className="flex items-center gap-2">
                <FiPlus className="w-4 h-4" />
                Create your first project
              </span>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600/20 to-indigo-600/20 blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
          </div>
        ) : (
          // Projects Display - Enhanced for better responsiveness
          <div
            className={`${viewMode === 'grid'
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
              : "space-y-3 sm:space-y-4"
              }`}
          >
            {paginatedCreations.map((creation, index) => (
              <CreationCard
                key={creation._id || index}
                creation={creation}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
        
        {/* Pagination indicator for mobile - only show when needed */}
        {totalPages > 1 && (
          <div className="flex justify-center pt-4 sm:hidden">
            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-2 h-2 rounded-full ${
                    currentPage === i + 1 ? 'bg-blue-500' : 'bg-gray-700'
                  }`}
                  aria-label={`Page ${i + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
