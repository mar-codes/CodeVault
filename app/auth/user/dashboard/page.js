'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiGrid, FiList, FiSearch } from 'react-icons/fi';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import debounce from 'lodash/debounce';
import {
  LayoutDashboard, ChevronDown, Activity, Calendar, Clock
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

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'name', label: 'Name' }
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
        console.log('User ID extracted:', userId);

        const creationsURL = `/api/creations/get/${userId}`;
        console.log('Fetching from URL:', creationsURL);

        const creationsRes = await fetch(creationsURL);
        console.log('Response status:', creationsRes.status);

        if (!creationsRes.ok) {
          throw new Error(`Failed to fetch creations: ${creationsRes.status}`);
        }

        const creationsData = await creationsRes.json();
        console.log('Creations data:', creationsData); 

        if (creationsData.success && Array.isArray(creationsData.creations)) {
          console.log('Setting creations:', creationsData.creations);
          setCreations(creationsData.creations);
        } else {
          console.log('No creations found or invalid data');
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

  const filteredCreations = useMemo(() => {
    return creations
      .filter(creation =>
        creation.title?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        creation.description?.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
        if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
        if (sortBy === 'name') return a.title.localeCompare(b.title);
        return 0;
      });
  }, [creations, debouncedSearch, sortBy]);

  const paginatedCreations = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCreations.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCreations, currentPage]);

  const totalPages = Math.ceil(filteredCreations.length / itemsPerPage);

  if (loading) {
    return (
      <Loading />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950">
      <Header
        user={user}
        onMenuClick={() => setIsMenuOpen(true)}
        onProfileClick={() => setIsProfileOpen(true)}
      />

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="bg-gradient-to-br from-gray-800/50 via-gray-900/50 to-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/30 p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-200 to-indigo-300 text-transparent bg-clip-text">
                Welcome back, {user?.username}
              </h1>
              <p className="text-gray-400">Manage and explore your creative coding projects</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
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
                className="relative group bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-xl border border-gray-700/30 hover:border-gray-600/50 transition-all duration-300">
                <div className="absolute inset-0 rounded-xl bg-blue-400/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{stat.icon}</span>
                    <p className="text-sm font-medium text-gray-400">{stat.label}</p>
                  </div>
                  <p className="text-2xl font-semibold text-gray-100">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Controls Bar - Updated Layout */}
        <div className="bg-gradient-to-r from-gray-800/50 via-gray-900/50 to-gray-800/50 backdrop-blur-xl rounded-xl shadow-xl border border-gray-700/30 p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* View Mode Controls */}
            <div className="flex items-center bg-gray-800/50 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded-md transition-all duration-200 flex items-center gap-2 ${viewMode === 'grid'
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
                  }`}
                title="Grid View"
              >
                <FiGrid size={16} />
                <span className="text-sm font-medium">Grid</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-md transition-all duration-200 flex items-center gap-2 ${viewMode === 'list'
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
                  }`}
                title="List View"
              >
                <FiList size={16} />
                <span className="text-sm font-medium">List</span>
              </button>
            </div>

            {/* Search Bar */}
            <div className="flex-1 relative max-w-2xl">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-900/50 text-gray-300 placeholder-gray-500"
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  value={searchQuery}
                />
              </div>
            </div>

            <Dropdown
              options={sortOptions}
              value={sortBy}
              onChange={setSortBy}
              className="min-w-[180px]"
            />

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-gray-800/50 text-gray-400 hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-gray-400">
                {currentPage} / {totalPages || 1}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-2 rounded-lg bg-gray-800/50 text-gray-400 hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
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

        {filteredCreations.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-800/50 via-gray-900/50 to-gray-800/50 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-700/30 p-12 flex flex-col items-center justify-center min-h-[400px]">
            <LayoutDashboard className="w-16 h-16 text-blue-400 mb-6" />
            <h2 className="text-2xl font-semibold mb-2 bg-gradient-to-r from-blue-200 to-indigo-300 text-transparent bg-clip-text">
              {searchQuery ? 'No matching projects' : 'Start Your Coding Journey'}
            </h2>
            <p className="text-gray-400 mb-8 text-center max-w-md">
              {searchQuery ? 'Try adjusting your search terms.' : 'Create your first project and begin building something amazing!'}
            </p>
            <Link
              href="/lander/upload"
              className="group relative px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
            >
              Create your first project
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600/20 to-indigo-600/20 blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
          </div>
        ) : (
          <div
            className={`${viewMode === 'grid'
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max"
              : "space-y-4"
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
      </div>
      <Footer />
    </div>
  );
}
