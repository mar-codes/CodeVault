'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, User, Code, Search, Clock, Eye, ThumbsUp, MessageSquare, Filter, Grid, Layout } from 'lucide-react';
import { getOptimizedAvatarUrl } from '@/lib/cloudinary';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { Toaster, toast } from 'react-hot-toast';
import Loading from './Loading';
import { formatDistanceToNow } from 'date-fns';
import Dropdown from './Dropdown';

export default function UserCreationsContent({ userId }) {
    const [profile, setProfile] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [creations, setCreations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [viewMode, setViewMode] = useState('grid'); // grid or list
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    useEffect(() => {
        Promise.all([
            fetchProfile(userId),
            fetchCurrentUser(),
            fetchCreations(userId)
        ]).then(([profileData, userData, creationsData]) => {
            setProfile(profileData);
            setCurrentUser(userData);
            setCreations(creationsData || []);
            setLoading(false);
        }).catch((error) => {
            console.error("Error fetching data:", error);
            toast.error('Failed to load content');
            setLoading(false);
        });
    }, [userId]);

    const fetchProfile = async (id) => {
        try {
            const res = await fetch(`/api/users/${id}`, { credentials: 'include' });
            if (!res.ok) throw new Error('Failed to fetch profile');
            const data = await res.json();
            return data.user;
        } catch (error) {
            toast.error('Failed to load user profile');
            return null;
        }
    };

    const fetchCurrentUser = async () => {
        try {
            const res = await fetch('/api/auth/me/auth', { credentials: 'include' });
            if (!res.ok) return null;
            const data = await res.json();
            return data.user;
        } catch (error) {
            return null;
        }
    };

    const fetchCreations = async (id) => {
        try {
            const res = await fetch(`/api/creations/get/${id}`, { credentials: 'include' });
            if (!res.ok) throw new Error('Failed to fetch creations');
            const data = await res.json();

            if (!data || (!data.snippets && !data.creations)) {
                console.error('Invalid data structure received:', data);
                return [];
            }

            const snippets = data.snippets || data.creations || [];
            return snippets;
        } catch (error) {
            console.error('Error fetching creations:', error);
            toast.error('Failed to load user creations');
            return [];
        }
    };

    const filteredCreations = creations.filter(creation =>
        creation.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (creation.description && creation.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (creation.language && creation.language.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const sortedCreations = [...filteredCreations].sort((a, b) => {
        if (sortBy === 'newest') {
            return new Date(b.createdAt) - new Date(a.createdAt);
        } else if (sortBy === 'oldest') {
            return new Date(a.createdAt) - new Date(b.createdAt);
        } else if (sortBy === 'popular') {
            const likesA = a.likes?.length || 0;
            const likesB = b.likes?.length || 0;
            if (likesA !== likesB) return likesB - likesA;
            return (b.views || 0) - (a.views || 0);
        }
        return 0;
    });

    const sortOptions = [
        { value: 'newest', label: 'Latest First' },
        { value: 'oldest', label: 'Oldest First' },
        { value: 'popular', label: 'Most Popular' }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950">
                <Header user={currentUser} loading={false} />
                <div className="container mx-auto px-4 py-20">
                    <SkeletonLoader />
                </div>
                <Footer />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950">
                <Header user={currentUser} loading={false} />
                <div className="container mx-auto px-4 py-20 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-md mx-auto bg-gradient-to-b from-gray-800/50 to-gray-900/50 backdrop-blur-xl p-8 rounded-2xl border border-gray-700/30 shadow-lg shadow-blue-900/5"
                    >
                        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center mb-4">
                            <User className="w-10 h-10 text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Profile Not Found</h2>
                        <p className="text-gray-400 mb-6">This user profile doesn't exist or has been removed.</p>
                        <Link
                            href="/auth/user/profile/dashboard"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-xl transition-all duration-300 text-white font-medium shadow-lg shadow-blue-900/20"
                        >
                            <ArrowLeft size={18} />
                            Return to Dashboard
                        </Link>
                    </motion.div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950">
            <Header user={currentUser} loading={false} />
            <Toaster position="top-right" />

            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7 }}
                className="relative overflow-hidden bg-gradient-to-b from-blue-900/20 to-transparent border-b border-gray-800/50"
            >
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-800/10 via-transparent to-transparent"></div>
                <div className="container mx-auto px-4 py-12">
                    <div className="flex flex-col md:flex-row items-center gap-8 max-w-5xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="w-28 h-28 rounded-full overflow-hidden border-4 border-gray-700/80 bg-gray-800 relative shadow-2xl shadow-blue-900/20"
                        >
                            {profile.avatar ? (
                                <Image
                                    src={getOptimizedAvatarUrl(profile.avatar, { width: 112, height: 112 })}
                                    alt={profile.displayName || profile.username || "User"}
                                    width={112}
                                    height={112}
                                    className="object-cover w-full h-full"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                                    <User size={40} className="text-gray-400" />
                                </div>
                            )}
                            <div className="absolute inset-0 rounded-full shadow-inner ring-1 ring-white/10"></div>
                        </motion.div>

                        <div className="flex-1 text-center md:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 bg-blue-900/30 border border-blue-700/30 rounded-full text-blue-300 text-xs">
                                <Code size={12} />
                                <span>{sortedCreations.length} {sortedCreations.length === 1 ? 'creation' : 'creations'}</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                                {profile.displayName || profile.username || "Anonymous User"}'s Creations
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start">
                                <Link
                                    href={`/auth/user/profile/view/${profile._id}`}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800/60 hover:bg-gray-800 rounded-lg transition-all duration-200 text-white/90 hover:text-white backdrop-blur-sm border border-white/10 shadow-lg shadow-black/20"
                                >
                                    <ArrowLeft size={16} />
                                    <span className="font-medium">Back to Profile</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="container mx-auto px-4 py-10">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="max-w-5xl mx-auto"
                >
                    <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-gray-800/50 overflow-hidden shadow-xl shadow-black/20">
                        <div className="p-6 border-b border-gray-800/60">
                            <h2 className="text-xl font-semibold text-white mb-4">Filter Snippets</h2>

                            <div className="flex flex-col md:flex-row gap-4 items-stretch">
                                <div className="relative flex-1">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search size={18} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search creations..."
                                        className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-200 placeholder-gray-500"
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                                        className="px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-lg hover:bg-gray-800 transition-colors text-gray-300 flex items-center gap-2 min-w-[80px] justify-center"
                                    >
                                        <Filter size={16} />
                                        <span className="hidden sm:inline">Filter</span>
                                    </button>

                                    <Dropdown
                                        options={sortOptions}
                                        value={sortBy}
                                        onChange={setSortBy}
                                        placeholder="Sort by"
                                        className="min-w-[130px]"
                                    />

                                    <div className="flex border border-gray-700/50 rounded-lg overflow-hidden">
                                        <button
                                            onClick={() => setViewMode('grid')}
                                            className={`px-3 py-3 flex items-center justify-center min-w-[40px] ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-900/50 text-gray-400 hover:bg-gray-800'}`}
                                        >
                                            <Grid size={18} />
                                        </button>
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={`px-3 py-3 flex items-center justify-center min-w-[40px] ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-900/50 text-gray-400 hover:bg-gray-800'}`}
                                        >
                                            <Layout size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Filter Options */}
                            <AnimatePresence>
                                {isFilterOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-hidden mt-4 pt-4 border-t border-gray-700/40"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {/* Additional filters would go here */}
                                            <div className="opacity-50">Additional filters coming soon</div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Section: Results Count */}
                        <div className="px-6 py-3 bg-gray-800/30 border-b border-gray-800/60">
                            <div className="flex justify-between items-center">
                                <p className="text-gray-400">
                                    {sortedCreations.length === 0 ? 'No results found' :
                                        `Showing ${sortedCreations.length} ${sortedCreations.length === 1 ? 'creation' : 'creations'}`}
                                </p>

                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                                    >
                                        Clear search
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Section: Content */}
                        <div className="p-6">
                            {sortedCreations.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="text-center py-20 bg-gradient-to-b from-gray-800/20 to-gray-900/20 backdrop-blur-sm rounded-xl border border-gray-700/30"
                                >
                                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-gray-700/50 to-gray-800/50 flex items-center justify-center mb-5 shadow-lg">
                                        <Code size={32} className="text-gray-500" />
                                    </div>
                                    <h2 className="text-2xl font-semibold text-gray-200 mb-3">No Snippets Found</h2>
                                    <p className="text-gray-500 max-w-md mx-auto mb-6">
                                        {searchTerm ? 'No creation match your search criteria. Try using different keywords.' : 'This user has not created any code creations yet.'}
                                    </p>
                                    {searchTerm && (
                                        <button
                                            onClick={() => setSearchTerm('')}
                                            className="inline-flex items-center gap-2 px-5 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all duration-200 text-gray-300 border border-gray-700"
                                        >
                                            <ArrowLeft size={16} />
                                            Clear Search
                                        </button>
                                    )}
                                </motion.div>
                            ) : (
                                <div className={viewMode === 'grid'
                                    ? "grid grid-cols-1 md:grid-cols-2 gap-6"
                                    : "flex flex-col gap-4"
                                }>
                                    <AnimatePresence>
                                        {sortedCreations.map((creation, index) => (
                                            <CreationCard
                                                key={creation._id}
                                                creation={creation}
                                                index={index}
                                                profile={profile}
                                                viewMode={viewMode}
                                            />
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
            <div className="py-16"></div>
            <Footer />
        </div>
    );
}

function CreationCard({ creation, index, profile, viewMode }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, delay: 0.05 + (index * 0.03) }}
            className={`group ${viewMode === 'list' ? 'w-full' : ''}`}
        >
            <Link href={`/creation/${creation._id}`} className="block h-full">
                <div className="h-full bg-gray-800/20 backdrop-blur-sm rounded-xl border border-gray-700/40 overflow-hidden hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 hover:translate-y-[-2px]">
                    <div className={`p-6 h-full flex flex-col`}>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-1 line-clamp-1 group-hover:text-blue-300 transition-colors">
                                    {creation.title}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <Clock size={14} />
                                    <span>
                                        {creation.createdAt
                                            ? formatDistanceToNow(new Date(creation.createdAt), { addSuffix: true })
                                            : 'Date unknown'}
                                    </span>
                                </div>
                            </div>

                            {creation.language && (
                                <span className="px-3 py-1 bg-blue-900/30 text-blue-300 text-xs rounded-md border border-blue-800/30 group-hover:bg-blue-800/50 group-hover:border-blue-700/50 transition-colors">
                                    {creation.language}
                                </span>
                            )}
                        </div>

                        {creation.description && (
                            <p className="text-gray-300 mb-4 line-clamp-2 flex-grow">{creation.description}</p>
                        )}

                        {creation.tags && creation.tags.length > 0 && (
                            <div className="mb-4 flex flex-wrap gap-2">
                                {creation.tags.map((tag, i) => (
                                    <span
                                        key={i}
                                        className="px-2 py-1 bg-gray-800/50 text-gray-300 text-xs rounded border border-gray-700/30 hover:bg-gray-700/50 transition-colors"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t border-gray-700/30 mt-auto">
                            <div className="flex gap-4">
                                <div className="flex items-center gap-1.5 text-gray-400 group-hover:text-gray-300 transition-colors">
                                    <Eye size={15} />
                                    <span className="text-xs">{creation.views || 0}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-gray-400 group-hover:text-gray-300 transition-colors">
                                    <ThumbsUp size={15} />
                                    <span className="text-xs">{creation.favorites || 0}</span>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-700 mr-2">
                                    {profile.avatar ? (
                                        <Image
                                            src={getOptimizedAvatarUrl(profile.avatar, { width: 24, height: 24 })}
                                            alt={profile.displayName || profile.username || "User"}
                                            width={24}
                                            height={24}
                                            className="object-cover w-full h-full"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <User size={12} className="text-gray-400" />
                                        </div>
                                    )}
                                </div>
                                <span className="text-xs text-gray-300">{profile.displayName || profile.username}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

function SkeletonLoader() {
    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-8 mb-10 bg-gray-800/20 backdrop-blur-sm p-8 rounded-xl">
                <div className="w-28 h-28 rounded-full bg-gray-700/50 animate-pulse"></div>
                <div className="flex-1">
                    <div className="h-8 w-3/4 bg-gray-700/50 rounded animate-pulse mb-4"></div>
                    <div className="h-4 w-1/2 bg-gray-700/50 rounded animate-pulse mb-6"></div>
                    <div className="h-10 w-40 bg-gray-700/50 rounded-lg animate-pulse"></div>
                </div>
            </div>

            <div className="bg-gray-900/40 rounded-2xl border border-gray-800/50 overflow-hidden">
                <div className="p-6 border-b border-gray-800/60">
                    <div className="h-7 w-1/4 bg-gray-700/50 rounded mb-4 animate-pulse"></div>
                    <div className="flex flex-col md:flex-row gap-4 items-stretch">
                        <div className="h-12 bg-gray-700/50 rounded-lg animate-pulse flex-grow"></div>
                        <div className="flex gap-2">
                            <div className="h-12 w-20 bg-gray-700/50 rounded-lg animate-pulse"></div>
                            <div className="h-12 w-32 bg-gray-700/50 rounded-lg animate-pulse"></div>
                            <div className="h-12 w-20 bg-gray-700/50 rounded-lg animate-pulse"></div>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-3 bg-gray-800/30 border-b border-gray-800/60">
                    <div className="h-5 w-32 bg-gray-700/50 rounded animate-pulse"></div>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-gray-800/20 backdrop-blur-sm rounded-xl h-64 animate-pulse">
                                <div className="p-6 h-full flex flex-col">
                                    <div className="h-7 w-3/4 bg-gray-700/50 rounded mb-4"></div>
                                    <div className="h-4 w-1/2 bg-gray-700/50 rounded mb-4"></div>
                                    <div className="h-16 w-full bg-gray-700/50 rounded mb-4"></div>
                                    <div className="mt-auto pt-4 border-t border-gray-700/30">
                                        <div className="flex justify-between">
                                            <div className="flex gap-4">
                                                <div className="h-5 w-12 bg-gray-700/50 rounded"></div>
                                                <div className="h-5 w-12 bg-gray-700/50 rounded"></div>
                                                <div className="h-5 w-12 bg-gray-700/50 rounded"></div>
                                            </div>
                                            <div className="h-5 w-24 bg-gray-700/50 rounded"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
