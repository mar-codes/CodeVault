'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Loader, MapPin, Globe, Github, Twitter, User, ArrowLeft, Edit, MessageSquare } from 'lucide-react';
import { getOptimizedAvatarUrl } from '@/lib/cloudinary';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { Toaster, toast } from 'react-hot-toast';
import Loading from './Loading';

// Define banner styles similar to the profile settings page
const bannerStyles = [
    // Blue & Purple Family (0-19)
    { from: 'from-blue-600', to: 'to-indigo-600' },
    { from: 'from-indigo-600', to: 'to-blue-600' },
    { from: 'from-purple-600', to: 'to-indigo-600' },
    { from: 'from-violet-600', to: 'to-blue-600' },
    { from: 'from-blue-500', to: 'to-indigo-500' },
    { from: 'from-indigo-500', to: 'to-purple-500' },
    { from: 'from-purple-500', to: 'to-violet-500' },
    { from: 'from-blue-600', via: 'via-purple-600', to: 'to-pink-600' },
    { from: 'from-indigo-600', via: 'via-purple-600', to: 'to-pink-600' },
    { from: 'from-violet-600', via: 'via-indigo-600', to: 'to-blue-600' },
    { from: 'from-sky-600', via: 'via-blue-600', to: 'to-indigo-600' },
    { from: 'from-blue-500', via: 'via-indigo-600', to: 'to-purple-600' },
    { from: 'from-indigo-500', via: 'via-blue-600', to: 'to-cyan-600' },
    { from: 'from-purple-500', via: 'via-violet-600', to: 'to-indigo-600' },
    { from: 'from-violet-500', via: 'via-purple-600', to: 'to-blue-600' },
    { from: 'from-sky-400', via: 'via-blue-500', to: 'to-indigo-600' },
    { from: 'from-blue-400', via: 'via-indigo-500', to: 'to-purple-600' },
    { from: 'from-indigo-400', via: 'via-purple-500', to: 'to-violet-600' },
    { from: 'from-purple-400', via: 'via-violet-500', to: 'to-indigo-600' },
    { from: 'from-violet-400', via: 'via-indigo-500', to: 'to-blue-600' },

    // Red & Orange Family (20-39)
    { from: 'from-red-600', to: 'to-rose-600' },
    { from: 'from-rose-600', to: 'to-pink-600' },
    { from: 'from-orange-600', to: 'to-red-600' },
    { from: 'from-amber-500', to: 'to-orange-600' },
    { from: 'from-red-500', to: 'to-pink-500' },
    { from: 'from-rose-500', to: 'to-red-500' },
    { from: 'from-orange-500', to: 'to-red-500' },
    { from: 'from-amber-500', to: 'to-orange-500' },
    { from: 'from-yellow-500', via: 'via-orange-600', to: 'to-red-600' },
    { from: 'from-red-600', via: 'via-rose-600', to: 'to-pink-600' },
    { from: 'from-rose-600', via: 'via-pink-600', to: 'to-red-600' },
    { from: 'from-orange-500', via: 'via-red-600', to: 'to-rose-600' },
    { from: 'from-amber-500', via: 'via-orange-600', to: 'to-red-600' },
    { from: 'from-yellow-500', via: 'via-amber-600', to: 'to-orange-600' },
    { from: 'from-red-500', via: 'via-rose-600', to: 'to-pink-600' },
    { from: 'from-rose-500', via: 'via-pink-600', to: 'to-fuchsia-600' },
    { from: 'from-orange-400', via: 'via-red-500', to: 'to-rose-600' },
    { from: 'from-amber-400', via: 'via-orange-500', to: 'to-red-600' },
    { from: 'from-yellow-400', via: 'via-amber-500', to: 'to-orange-600' },
    { from: 'from-red-400', via: 'via-rose-500', to: 'to-pink-600' },

    // Green & Teal Family (40-59)
    { from: 'from-green-600', to: 'to-emerald-600' },
    { from: 'from-emerald-600', to: 'to-teal-600' },
    { from: 'from-teal-600', to: 'to-cyan-600' },
    { from: 'from-green-500', to: 'to-teal-500' },
    { from: 'from-emerald-500', to: 'to-cyan-500' },
    { from: 'from-teal-500', to: 'to-blue-500' },
    { from: 'from-green-400', to: 'to-emerald-500' },
    { from: 'from-emerald-400', to: 'to-teal-500' },
    { from: 'from-teal-400', to: 'to-cyan-500' },
    { from: 'from-lime-400', to: 'to-green-500' },
    { from: 'from-green-600', via: 'via-teal-600', to: 'to-cyan-600' },
    { from: 'from-emerald-600', via: 'via-teal-600', to: 'to-cyan-600' },
    { from: 'from-teal-600', via: 'via-cyan-600', to: 'to-blue-600' },
    { from: 'from-lime-500', via: 'via-green-600', to: 'to-emerald-600' },
    { from: 'from-green-500', via: 'via-emerald-600', to: 'to-teal-600' },
    { from: 'from-emerald-500', via: 'via-teal-600', to: 'to-cyan-600' },
    { from: 'from-teal-500', via: 'via-cyan-600', to: 'to-blue-600' },
    { from: 'from-lime-400', via: 'via-green-500', to: 'to-emerald-600' },
    { from: 'from-green-400', via: 'via-teal-500', to: 'to-cyan-600' },
    { from: 'from-emerald-400', via: 'via-cyan-500', to: 'to-blue-600' },

    // Monochrome & Special (60-79)
    { from: 'from-gray-900', to: 'to-slate-800' },
    { from: 'from-slate-900', to: 'to-gray-800' },
    { from: 'from-zinc-900', to: 'to-neutral-800' },
    { from: 'from-neutral-900', to: 'to-stone-800' },
    { from: 'from-gray-800', to: 'to-slate-700' },
    { from: 'from-slate-800', to: 'to-gray-700' },
    { from: 'from-zinc-800', to: 'to-neutral-700' },
    { from: 'from-neutral-800', to: 'to-stone-700' },
    { from: 'from-gray-700', to: 'to-slate-600' },
    { from: 'from-slate-700', to: 'to-gray-600' },
    { from: 'from-gray-800', via: 'via-slate-700', to: 'to-slate-900' },
    { from: 'from-slate-800', via: 'via-gray-700', to: 'to-gray-900' },
    { from: 'from-zinc-800', via: 'via-neutral-700', to: 'to-stone-900' },
    { from: 'from-neutral-800', via: 'via-stone-700', to: 'to-slate-900' },
    { from: 'from-gray-700', via: 'via-slate-800', to: 'to-black' },
    { from: 'from-slate-700', via: 'via-gray-800', to: 'to-black' },
    { from: 'from-zinc-700', via: 'via-neutral-800', to: 'to-black' },
    { from: 'from-neutral-700', via: 'via-stone-800', to: 'to-black' },
    { from: 'from-black', via: 'via-gray-800', to: 'to-gray-900' },
    { from: 'from-black', via: 'via-slate-800', to: 'to-slate-900' },

    // Premium & Complex (80-99)
    { from: 'from-fuchsia-600', via: 'via-purple-600', to: 'to-pink-600' },
    { from: 'from-purple-600', via: 'via-pink-600', to: 'to-red-600' },
    { from: 'from-violet-600', via: 'via-purple-600', to: 'to-fuchsia-600' },
    { from: 'from-indigo-600', via: 'via-violet-600', to: 'to-purple-600' },
    { from: 'from-cyan-600', via: 'via-blue-600', to: 'to-violet-600' },
    { from: 'from-blue-600', via: 'via-indigo-600', to: 'to-violet-600' },
    { from: 'from-emerald-600', via: 'via-green-600', to: 'to-lime-600' },
    { from: 'from-teal-600', via: 'via-emerald-600', to: 'to-green-600' },
    { from: 'from-cyan-600', via: 'via-teal-600', to: 'to-emerald-600' },
    { from: 'from-sky-600', via: 'via-cyan-600', to: 'to-teal-600' },
    { from: 'from-rose-500', via: 'via-red-600', to: 'to-orange-700' },
    { from: 'from-pink-500', via: 'via-rose-600', to: 'to-red-700' },
    { from: 'from-fuchsia-500', via: 'via-pink-600', to: 'to-rose-700' },
    { from: 'from-purple-500', via: 'via-fuchsia-600', to: 'to-pink-700' },
    { from: 'from-violet-500', via: 'via-purple-600', to: 'to-fuchsia-700' },
    { from: 'from-indigo-500', via: 'via-violet-600', to: 'to-purple-700' },
    { from: 'from-blue-500', via: 'via-indigo-600', to: 'to-violet-700' },
    { from: 'from-sky-500', via: 'via-blue-600', to: 'to-indigo-700' },
    { from: 'from-cyan-500', via: 'via-sky-600', to: 'to-blue-700' },
    { from: 'from-teal-500', via: 'via-cyan-600', to: 'to-sky-700' }
];

const renderUserBanner = (bannerColor) => {
    if (bannerColor && typeof bannerColor === 'object' && bannerColor.custom) {
        return `bg-gradient-to-r from-${bannerColor.from} to-${bannerColor.to}`;
    }

    const safeIndex = Math.min(Math.max(0, bannerColor || 0), bannerStyles.length - 1);
    return `bg-gradient-to-r ${bannerStyles[safeIndex].from} ${bannerStyles[safeIndex].to}`;
};

export default function UserProfileContent({ userId, previewMode = false, previewData = null }) {
    const [profile, setProfile] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isOwnProfile, setIsOwnProfile] = useState(false);

    useEffect(() => {
        if (previewMode && previewData) {
            setProfile(previewData);
            setLoading(false);
        } else {
            Promise.all([
                fetchProfile(userId),
                fetchCurrentUser()
            ]).then(([profileData, userData]) => {
                setProfile(profileData);
                setCurrentUser(userData);
                setIsOwnProfile(userData && profileData && userData._id === profileData._id);
                setLoading(false);
            }).catch(() => {
                setLoading(false);
            });
        }
    }, [userId, previewMode, previewData]);

    const fetchProfile = async (id) => {
        if (previewMode) return;
        try {
            const res = await fetch(`/api/users/${id}`, { credentials: 'include' });
            if (!res.ok) throw new Error('Failed to fetch profile');
            const data = await res.json();
            console.log('Profile data:', data);
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

    // Helper function to delete old avatar when a new one is uploaded
    const deleteOldAvatar = async (avatarUrl) => {
        if (!avatarUrl) return;

        try {
            // Extract public_id from the URL
            // Assuming the URL format contains the public_id
            const urlParts = avatarUrl.split('/');
            const filenameWithExtension = urlParts[urlParts.length - 1];
            const publicId = filenameWithExtension.split('.')[0];

            await fetch('/api/upload/remove', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ publicId }),
                credentials: 'include',
            });
        } catch (error) {
            console.error('Failed to delete old avatar:', error);
        }
    };

    const updateAvatar = async (newAvatarUrl) => {
        try {
            // First get the current avatar URL to delete later
            const oldAvatarUrl = profile?.avatar;

            // Update the user profile with new avatar
            const response = await fetch(`/api/users/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ avatar: newAvatarUrl }),
                credentials: 'include',
            });

            if (!response.ok) throw new Error('Failed to update profile');

            // If successful, delete the old avatar
            if (oldAvatarUrl) {
                await deleteOldAvatar(oldAvatarUrl);
            }

            // Update the local state
            setProfile({
                ...profile,
                avatar: newAvatarUrl
            });

            toast.success('Profile picture updated successfully');
        } catch (error) {
            toast.error('Failed to update profile picture');
            console.error(error);
        }
    };

    if (loading) {
        return (
            <Loading />
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950">
                <Header user={currentUser} loading={false} />
                <div className="container mx-auto px-4 py-20 text-center">
                    <div className="max-w-md mx-auto bg-gray-800/30 backdrop-blur-xl p-8 rounded-2xl border border-gray-700/30">
                        <User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                        <h2 className="text-2xl font-bold text-white mb-2">Profile Not Found</h2>
                        <p className="text-gray-400 mb-6">This user profile doesn't exist or has been removed.</p>
                        <Link
                            href="/auth/user/profile/dashboard"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl transition-all duration-200 text-white"
                        >
                            <ArrowLeft size={16} />
                            Return to Dashboard
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    const bannerClasses = renderUserBanner(profile.bannerColor);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950">
            <Header user={currentUser} loading={false} />
            <Toaster position="top-right" />

            <div className={`w-full h-48 sm:h-64 md:h-72 ${bannerClasses}`}>
                {currentUser && (
                    <div className="container mx-auto px-4 h-full flex items-start pt-4">
                        <Link
                            href="/auth/user/profile/dashboard"
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-black/30 hover:bg-black/40 rounded-lg transition-all duration-200 text-white/90 hover:text-white backdrop-blur-sm border border-white/10"
                        >
                            <ArrowLeft size={16} />
                            <span className="text-sm">Back</span>
                        </Link>
                    </div>
                )}
            </div>

            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto -mt-28 relative z-10">
                    <div className="bg-gray-800/60 backdrop-blur-lg rounded-2xl p-6 md:p-8 border border-gray-700/40 shadow-xl">
                        <div className="flex flex-col items-center md:items-start md:flex-row md:gap-8">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                                className="w-36 h-36 md:w-44 md:h-44 rounded-full overflow-hidden border-4 border-gray-900 shadow-xl bg-gray-800 ring-2 ring-blue-500/40 transform hover:scale-[1.02] transition-all duration-300"
                            >
                                {profile.avatar ? (
                                    <Image
                                        src={getOptimizedAvatarUrl(profile.avatar, { width: 176, height: 176 })}
                                        alt={profile.displayName || profile.username || "User"}
                                        width={176}
                                        height={176}
                                        className="object-cover w-full h-full"
                                        priority
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <User size={60} className="text-gray-400" />
                                    </div>
                                )}
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.1 }}
                                className="mt-5 md:mt-8 flex-1 text-center md:text-left"
                            >
                                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
                                    {profile.displayName || profile.username || "Anonymous User"}
                                </h1>

                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
                                    {profile.username && (
                                        <p className="text-blue-400 text-lg bg-blue-900/20 inline-block px-3 py-1 rounded-lg">
                                            @{profile.username}
                                        </p>
                                    )}
                                </div>

                                {profile._id === "67d00247bda0a3f6a8035d04" && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{
                                            duration: 0.8,
                                            ease: [0.23, 1, 0.32, 1],
                                            delay: 0.5 
                                        }}
                                        className="absolute top-6 right-6 md:right-8"
                                    >
                                        <div className="group relative">
                                            <motion.div
                                                initial={{ y: 20 }}
                                                animate={{ y: [20, 0] }}
                                                transition={{
                                                    duration: 0.6,
                                                    ease: "easeOut",
                                                    delay: 0.8
                                                }}
                                                className="flex flex-col items-center justify-center px-5 py-4 bg-gradient-to-br from-amber-500/90 via-yellow-500/90 to-orange-600/90 rounded-2xl border-2 border-amber-300/30 shadow-xl shadow-amber-500/30 backdrop-blur-sm hover:shadow-amber-500/40 hover:scale-105 transition-all duration-300"
                                            >
                                                <motion.svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-7 w-7 text-amber-100 drop-shadow-md mb-1"
                                                    viewBox="0 0 24 24"
                                                    fill="currentColor"
                                                    initial={{ rotate: -30, opacity: 0 }}
                                                    animate={{
                                                        rotate: [-5, 5, -5],
                                                        opacity: 1
                                                    }}
                                                    transition={{
                                                        rotate: {
                                                            duration: 2,
                                                            ease: "easeInOut",
                                                            repeat: Infinity,
                                                            repeatType: "reverse"
                                                        },
                                                        opacity: {
                                                            duration: 0.5
                                                        }
                                                    }}
                                                >
                                                    <path d="M12 1.5l3 6 7.5-1.5-4.5 7.5 4.5 7.5-7.5-1.5-3 6-3-6-7.5 1.5 4.5-7.5-4.5-7.5 7.5 1.5z" />
                                                </motion.svg>

                                                <motion.span
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.4, delay: 1.2 }}
                                                    className="font-bold text-sm text-white tracking-wider text-center whitespace-nowrap"
                                                >
                                                    CodeVault Owner
                                                </motion.span>
                                            </motion.div>

                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: [0.4, 0.7, 0.4], scale: [0.8, 1.1, 1] }}
                                                transition={{
                                                    duration: 3,
                                                    repeat: Infinity,
                                                    ease: "easeInOut",
                                                    delay: 1.5
                                                }}
                                                className="absolute inset-0 -z-10 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl blur-xl"
                                            />

                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: [0.3, 0.5, 0.3], scale: [0.9, 1.2, 0.9] }}
                                                transition={{
                                                    duration: 4,
                                                    repeat: Infinity,
                                                    ease: "easeInOut",
                                                    delay: 1.5
                                                }}
                                                className="absolute inset-0 -z-20 bg-amber-500/20 rounded-3xl blur-2xl"
                                            />
                                        </div>
                                    </motion.div>
                                )}

                                <div className="mt-3 flex flex-wrap items-center justify-center md:justify-start gap-3">
                                    {profile.location && (
                                        <div className="flex items-center text-gray-200 gap-2 bg-gray-700/30 px-3 py-1 rounded-lg">
                                            <MapPin size={14} className="text-gray-300" />
                                            <span className="text-sm">{profile.location}</span>
                                        </div>
                                    )}

                                    <div className="flex items-center">
                                        {isOwnProfile ? (
                                            <Link
                                                href="/auth/user/profile"
                                                className="flex items-center justify-center gap-2 px-3 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-lg transition-all duration-300 text-white text-sm shadow-md shadow-emerald-600/20 hover:shadow-emerald-600/40 border border-emerald-500/20 hover:scale-105"
                                            >
                                                <Edit size={14} className="text-emerald-200" />
                                                <span>Edit Profile</span>
                                            </Link>
                                        ) : (
                                            <Link
                                                href={`/auth/user/profile/view/creations/${profile._id}`}
                                                className="flex items-center justify-center gap-2 px-3 py-1 bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-700 hover:to-violet-700 rounded-lg transition-all duration-300 text-white text-sm shadow-md shadow-fuchsia-600/20 hover:shadow-fuchsia-600/40 border border-fuchsia-500/20 hover:scale-105"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-fuchsia-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                                                    <polyline points="14 2 14 8 20 8" />
                                                </svg>
                                                <span>View Creations</span>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                        <div className="md:col-span-2 space-y-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.2 }}
                                className="bg-gray-800/40 backdrop-blur-sm rounded-2xl p-7 border border-gray-700/30 shadow-lg hover:shadow-xl hover:border-gray-600/30 transition-all duration-300"
                            >
                                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                                    <span className="bg-blue-500/20 w-8 h-8 flex items-center justify-center rounded-lg mr-3">
                                        <User size={16} className="text-blue-300" />
                                    </span>
                                    About
                                </h2>
                                {profile.bio ? (
                                    <p className="text-gray-300 whitespace-pre-line leading-relaxed pl-11">{profile.bio}</p>
                                ) : (
                                    <p className="text-gray-500 italic pl-11">No bio provided</p>
                                )}
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.3 }}
                                className="bg-gray-800/40 backdrop-blur-sm rounded-2xl p-7 border border-gray-700/30 shadow-lg hover:shadow-xl hover:border-gray-600/30 transition-all duration-300"
                            >
                                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                                    <span className="bg-purple-500/20 w-8 h-8 flex items-center justify-center rounded-lg mr-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-300">
                                            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                                        </svg>
                                    </span>
                                    Skills
                                </h2>
                                {profile.skills && profile.skills.length > 0 ? (
                                    <div className="flex flex-wrap gap-2 pl-11">
                                        {profile.skills.map((skill, index) => (
                                            <span
                                                key={index}
                                                className="px-4 py-2 bg-purple-900/30 text-purple-200 rounded-xl text-sm border border-purple-800/30 hover:bg-purple-800/40 transition-colors cursor-default"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic pl-11">No skills listed</p>
                                )}
                            </motion.div>
                        </div>

                        <div className="space-y-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.4 }}
                                className="bg-gray-800/40 backdrop-blur-sm rounded-2xl p-7 border border-gray-700/30 shadow-lg hover:shadow-xl hover:border-gray-600/30 transition-all duration-300"
                            >
                                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                                    <span className="bg-cyan-500/20 w-8 h-8 flex items-center justify-center rounded-lg mr-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-300">
                                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                            <polyline points="15 3 21 3 21 9" />
                                            <line x1="10" y1="14" x2="21" y2="3" />
                                        </svg>
                                    </span>
                                    Connect
                                </h2>
                                <div className="space-y-3 pl-2">
                                    {profile.website && (
                                        <a
                                            href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 text-gray-300 hover:text-blue-400 transition-all p-2 rounded-lg hover:bg-blue-900/20 group"
                                        >
                                            <div className="bg-gray-700/50 p-2 rounded-lg group-hover:bg-blue-700/30 transition-colors">
                                                <Globe size={18} />
                                            </div>
                                            <span className="text-sm truncate">{profile.website.replace(/^https?:\/\//, '')}</span>
                                        </a>
                                    )}

                                    {profile.github && (
                                        <a
                                            href={`https://github.com/${profile.github}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 text-gray-300 hover:text-cyan-400 transition-all p-2 rounded-lg hover:bg-cyan-900/20 group"
                                        >
                                            <div className="bg-gray-700/50 p-2 rounded-lg group-hover:bg-cyan-700/30 transition-colors">
                                                <Github size={18} />
                                            </div>
                                            <span className="text-sm">{profile.github}</span>
                                        </a>
                                    )}

                                    {profile.twitter && (
                                        <a
                                            href={`https://twitter.com/${profile.twitter}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 text-gray-300 hover:text-sky-400 transition-all p-2 rounded-lg hover:bg-sky-900/20 group"
                                        >
                                            <div className="bg-gray-700/50 p-2 rounded-lg group-hover:bg-sky-700/30 transition-colors">
                                                <Twitter size={18} />
                                            </div>
                                            <span className="text-sm">{profile.twitter}</span>
                                        </a>
                                    )}

                                    {!profile.website && !profile.github && !profile.twitter && (
                                        <p className="text-gray-500 italic pl-9">No social links provided</p>
                                    )}
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.5 }}
                                className="bg-gray-800/40 backdrop-blur-sm rounded-2xl p-7 border border-gray-700/30 shadow-lg hover:shadow-xl hover:border-gray-600/30 transition-all duration-300"
                            >
                                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                                    <span className="bg-green-500/20 w-8 h-8 flex items-center justify-center rounded-lg mr-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-300">
                                            <path d="M12 20v-6M6 20V10M18 20V4" />
                                        </svg>
                                    </span>
                                    Stats
                                </h2>
                                <div className="grid grid-cols-2 gap-4 pl-2 mt-5">
                                    <div className="bg-gradient-to-br from-gray-900/70 to-gray-800/50 rounded-xl p-5 text-center hover:bg-gray-800/70 transition-all border border-blue-900/30 hover:border-blue-500/50 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/10 duration-300 flex flex-col justify-center items-center">
                                        <p className="text-3xl font-bold text-blue-400">
                                            {Array.isArray(profile.creations) ? profile.creations.length : 0}
                                        </p>
                                        <p className="text-sm text-gray-300 mt-1">Snippets</p>
                                    </div>

                                    <div className="bg-gradient-to-br from-gray-900/70 to-gray-800/50 rounded-xl p-5 text-center hover:bg-gray-800/70 transition-all border border-purple-900/30 hover:border-purple-500/50 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/10 duration-300 flex flex-col justify-center items-center">
                                        <p className="text-3xl font-bold text-purple-400">
                                            {profile.joinDate || Math.floor((new Date() - new Date(profile.createdAt)) / (1000 * 60 * 60 * 24))}
                                        </p>
                                        <p className="text-sm text-gray-300 mt-1">Days</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="py-20"></div>
            <Footer />
        </div>
    );
}
