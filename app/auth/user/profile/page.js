'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';
import { Loader, Camera, Trash2, Save, AtSign, MapPin, Globe, User, Palette, Link2, Code, ExternalLink, Github, Twitter, Eye } from 'lucide-react';
import { getOptimizedAvatarUrl } from '@/lib/cloudinary'
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { useRouter } from 'next/navigation';
import Loading from '@/app/components/Loading';
import PreviewProfileModal from '@/app/components/PreviewProfileModal';

export default function ProfileSettings() {
    const [avatar, setAvatar] = useState('');
    const [tempAvatar, setTempAvatar] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [displayName, setDisplayName] = useState('');
    const [username, setUsername] = useState('');
    const [bio, setBio] = useState('');
    const [location, setLocation] = useState('');
    const [website, setWebsite] = useState('');
    const [github, setGithub] = useState('');
    const [twitter, setTwitter] = useState('');
    const [skills, setSkills] = useState([]);
    const [skillInput, setSkillInput] = useState('');
    const [bannerColor, setBannerColor] = useState(0);
    const [customGradient, setCustomGradient] = useState({ from: '', to: '' });
    const [isCustomGradient, setIsCustomGradient] = useState(false);
    const router = useRouter();
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState(0);
    const [tempBannerColor, setTempBannerColor] = useState(0);

    const bannerStyles = [
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

    useEffect(() => {
        fetchUser();
    }, []);

    useEffect(() => {
        if (!user && !loading) {
            router.push('/auth/login');
        }
    }, [user, loading, router]);

    const fetchUser = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/auth/me/auth', { credentials: 'include' });

            if (res.ok) {
                const data = await res.json();
                const userData = data.user;
                setUser(userData);

                setDisplayName(userData?.displayName || '');
                setUsername(userData?.username || '');
                setBio(userData?.bio || '');
                setLocation(userData?.location || '');
                setWebsite(userData?.website || '');
                setGithub(userData?.github || '');
                setTwitter(userData?.twitter || '');
                setSkills(userData?.skills || []);

                const validBannerColor = userData?.bannerColor !== undefined ?
                    Math.min(Math.max(0, userData.bannerColor), bannerStyles.length - 1) : 0;
                setBannerColor(validBannerColor);
                setTempBannerColor(validBannerColor);

                if (userData?.avatar) {
                    setAvatar(userData.avatar);
                }
            }
        } catch (error) {
            toast.error('Failed to load profile data');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            toast.error('Image must be less than 10MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            setTempAvatar(e.target.result);
        };
        reader.readAsDataURL(file);
    };

    const handleDeleteAvatar = async () => {
        if (!avatar) return;

        try {
            const response = await fetch('/api/upload/avatar/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: avatar }),
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to delete avatar');
            }

            setTempAvatar(null);
            setAvatar('');
            toast.success('Avatar removed', {
                style: {
                    background: '#111111',
                    color: '#fff',
                    padding: '16px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    borderRadius: '8px'
                },
                iconTheme: {
                    primary: '#10b981',
                    secondary: '#111111'
                }
            });
        } catch (error) {
            toast.error('Failed to delete avatar: ' + error.message);
        }
    };

    const handleAddSkill = () => {
        if (!skillInput.trim()) return;
        if (skills.includes(skillInput.trim())) {
            toast.error('This skill is already in your list');
            return;
        }
        setSkills([...skills, skillInput.trim()]);
        setSkillInput('');
    };

    const handleRemoveSkill = (skillToRemove) => {
        setSkills(skills.filter(skill => skill !== skillToRemove));
    };

    const handleSkillKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddSkill();
        }
    };

    const saveProfile = async (e) => {
        e.preventDefault();
        if (!user) return;

        try {
            setSaving(true);

            let finalAvatarUrl = avatar;
            if (tempAvatar) {
                const formData = new FormData();
                const blob = await fetch(tempAvatar).then(r => r.blob());
                formData.append('file', blob);

                const uploadRes = await fetch('/api/upload/avatar', {
                    method: 'POST',
                    body: formData,
                    credentials: 'include'
                });

                if (!uploadRes.ok) throw new Error('Failed to upload avatar');
                const uploadData = await uploadRes.json();
                finalAvatarUrl = uploadData.url;
            }

            const profileData = {
                avatar: finalAvatarUrl,
                displayName,
                username,
                bio,
                location,
                website,
                github,
                twitter,
                skills,
                bannerColor: Math.min(Math.max(0, tempBannerColor), bannerStyles.length - 1)
            };

            const response = await fetch('/api/auth/me/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileData),
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Failed to update profile');

            const data = await response.json();
            setUser(data.user);
            setBannerColor(tempBannerColor);
            toast.success('Profile updated successfully!', {
                style: {
                    background: '#111111',
                    color: '#fff',
                    padding: '16px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    borderRadius: '8px'
                },
                iconTheme: {
                    primary: '#10b981',
                    secondary: '#111111'
                }
            });
        } catch (error) {
            toast.error(error.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        } 1
    };

    const [activeTab, setActiveTab] = useState('basic');

    if (loading) {
        return (
            <Loading />
        );
    }

    const tabs = [
        { id: 'basic', label: 'Basic Info', icon: User },
        { id: 'appearance', label: 'Appearance', icon: Palette },
        { id: 'social', label: 'Social Links', icon: Link2 },
        { id: 'skills', label: 'Skills', icon: Code }
    ];

    const getPreviewData = () => {
        return {
            _id: user?._id,
            displayName,
            username,
            bio,
            location,
            website,
            github,
            twitter,
            skills,
            avatar,
            bannerColor: isCustomGradient && customGradient.from && customGradient.to ?
                { custom: true, from: customGradient.from, to: customGradient.to } :
                tempBannerColor,
            createdAt: user?.createdAt,
        };
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950">
            <Header user={user} loading={loading} />
            <Toaster position="top-right" />

            <div className="container mx-auto p-4 max-w-5xl">
                <div className="flex gap-2 mb-6">
                    {user && (
                        <Link
                            href={`/auth/user/profile/view/${user._id}`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-800/70 rounded-xl transition-all duration-200 text-gray-300 hover:text-white"
                        >
                            <ExternalLink size={16} />
                            View Public Profile
                        </Link>
                    )}

                    <button
                        onClick={() => setIsPreviewOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 rounded-xl transition-all duration-200 text-blue-400 hover:text-blue-300 border border-blue-500/30 hover:border-blue-500/50"
                    >
                        <Eye size={16} />
                        Preview Changes
                    </button>
                </div>

                <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl p-2 mb-6">
                    <div className="flex gap-1 relative">
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            return (
                                <motion.button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl relative z-10 transition-colors
                                        ${activeTab === tab.id ? 'text-white' : 'text-gray-400 hover:text-gray-300'}`}
                                >
                                    <Icon size={18} />
                                    <span className="font-medium">{tab.label}</span>
                                    {activeTab === tab.id && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl -z-10"
                                            initial={false}
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>
                </div>

                <form onSubmit={saveProfile} className="space-y-4">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl p-6 border border-gray-700/30"
                        >
                            {activeTab === 'basic' && (
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="flex flex-col items-center p-4 bg-gray-800/30 rounded-lg">
                                        <div
                                            className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-gray-700/50 to-gray-800/50 relative mb-4 cursor-pointer border-2 border-gray-600/30 hover:border-blue-500/50 transition-all duration-300"
                                            onClick={() => !uploading && fileInputRef.current?.click()}
                                        >
                                            {uploading ? (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                                    <Loader className="w-8 h-8 animate-spin text-blue-400" />
                                                </div>
                                            ) : tempAvatar ? (
                                                <Image
                                                    src={tempAvatar}
                                                    alt="Avatar preview"
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : avatar ? (
                                                <Image
                                                    src={getOptimizedAvatarUrl(avatar, { width: 200, height: 200 })}
                                                    alt="Avatar preview"
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full">
                                                    <Camera className="w-10 h-10 text-gray-500" />
                                                </div>
                                            )}
                                        </div>

                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            onChange={handleFileChange}
                                            accept="image/jpeg,image/png,image/webp"
                                            disabled={uploading}
                                        />

                                        <div className="flex flex-wrap justify-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={uploading}
                                                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-lg transition-all duration-300 shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 font-medium"
                                            >
                                                {avatar ? 'Change' : 'Select Image'}
                                            </button>

                                            {avatar && (
                                                <button
                                                    type="button"
                                                    onClick={handleDeleteAvatar}
                                                    disabled={uploading}
                                                    className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-lg transition-all duration-300 shadow-lg hover:shadow-red-500/25 disabled:opacity-50 flex items-center justify-center gap-1 font-medium"
                                                >
                                                    <Trash2 size={16} />
                                                    Remove
                                                </button>
                                            )}
                                        </div>

                                        <div className="mt-4 text-sm text-gray-400">
                                            <p>Recommended: Square image, max 10MB</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Display Name</label>
                                            <input
                                                type="text"
                                                value={displayName}
                                                onChange={(e) => setDisplayName(e.target.value)}
                                                placeholder="Your display name"
                                                className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-200 placeholder-gray-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                                            <div className="flex items-center w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700/50 rounded-xl">
                                                <AtSign size={16} className="text-gray-400 mr-2" />
                                                <input
                                                    type="text"
                                                    value={username}
                                                    onChange={(e) => setUsername(e.target.value)}
                                                    placeholder="username"
                                                    className="w-full bg-transparent focus:outline-none text-gray-200 placeholder-gray-500"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                                            <textarea
                                                value={bio}
                                                onChange={(e) => setBio(e.target.value)}
                                                placeholder="Tell us about yourself"
                                                rows="4"
                                                maxLength="500"
                                                className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-200 placeholder-gray-500"
                                            ></textarea>
                                            <p className="text-xs text-gray-400 mt-1">{bio.length}/500 characters</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                                            <div className="flex items-center w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700/50 rounded-xl">
                                                <MapPin size={16} className="text-gray-400 mr-2" />
                                                <input
                                                    type="text"
                                                    value={location}
                                                    onChange={(e) => setLocation(e.target.value)}
                                                    placeholder="City, Country"
                                                    className="w-full bg-transparent focus:outline-none text-gray-200 placeholder-gray-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'appearance' && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-medium text-gray-200">Banner Style</h3>
                                        <div className="text-sm text-gray-400">
                                            Selected: {!isCustomGradient && tempBannerColor >= 0 ? `#${tempBannerColor}` : 'Custom'}
                                        </div>
                                    </div>

                                    <div className="flex overflow-x-auto pb-2 gap-2 snap-x scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                                        {["Blue & Purple", "Red & Orange", "Green & Teal", "Monochrome", "Premium"].map((category, idx) => (
                                            <motion.div
                                                key={category}
                                                onClick={() => setActiveCategory(idx)}
                                                className={`px-4 py-2 rounded-lg whitespace-nowrap snap-start transition-all duration-200 cursor-pointer
                        ${activeCategory === idx
                                                        ? 'bg-gradient-to-r from-blue-600/50 to-indigo-600/50 text-white font-medium'
                                                        : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-gray-300'}`}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                {category}
                                            </motion.div>
                                        ))}
                                    </div>

                                    <div className="relative h-24 rounded-xl overflow-hidden mb-4">
                                        <div className={`absolute inset-0 bg-gradient-to-r 
                ${!isCustomGradient && tempBannerColor >= 0
                                                ? `${bannerStyles[tempBannerColor].from} ${bannerStyles[tempBannerColor].to}`
                                                : 'from-blue-600 to-indigo-600'}`}>
                                        </div>
                                        {avatar && (
                                            <div className="absolute bottom-3 left-4 flex items-center gap-3">
                                                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/80 shadow-lg">
                                                    <Image
                                                        src={getOptimizedAvatarUrl(avatar, { width: 80, height: 80 })}
                                                        alt="Profile"
                                                        width={56}
                                                        height={56}
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div className="text-white font-medium text-lg drop-shadow-md">{displayName || 'Your Name'}</div>
                                            </div>
                                        )}
                                    </div>

                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={activeCategory}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.2 }}
                                            className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2"
                                        >
                                            {bannerStyles.slice(activeCategory * 20, (activeCategory + 1) * 20).map((style, index) => {
                                                const styleIndex = activeCategory * 20 + index;
                                                return (
                                                    <motion.button
                                                        key={styleIndex}
                                                        type="button"
                                                        onClick={() => {
                                                            setTempBannerColor(styleIndex);
                                                            setIsCustomGradient(false);
                                                        }}
                                                        className={`h-12 rounded-lg bg-gradient-to-r ${style.from} ${style.to}
                                relative group overflow-hidden`}
                                                        whileHover={{ scale: 1.05, y: -3 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        animate={{
                                                            boxShadow: !isCustomGradient && tempBannerColor === styleIndex
                                                                ? '0 0 0 2px rgba(255,255,255,0.8), 0 4px 10px rgba(0,0,0,0.3)'
                                                                : '0 0 0 0 rgba(255,255,255,0), 0 0px 0px rgba(0,0,0,0)'
                                                        }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold opacity-0 group-hover:opacity-100 bg-black/30 transition-opacity">
                                                            #{styleIndex}
                                                        </span>
                                                    </motion.button>
                                                );
                                            })}
                                        </motion.div>
                                    </AnimatePresence>

                                    <div className="mt-6 p-4 border border-gray-700/30 rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50">
                                        <div className="flex items-center gap-2 mb-4">
                                            <input
                                                type="checkbox"
                                                id="customGradient"
                                                checked={isCustomGradient}
                                                onChange={(e) => setIsCustomGradient(e.target.checked)}
                                                className="w-4 h-4 accent-blue-600 rounded"
                                            />
                                            <label htmlFor="customGradient" className="text-gray-300 font-medium">Use custom gradient</label>
                                        </div>

                                        {isCustomGradient && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="space-y-3"
                                            >
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-xs text-gray-400 mb-1">Start Color</label>
                                                        <div className="relative">
                                                            <input
                                                                type="text"
                                                                value={customGradient.from}
                                                                onChange={(e) => setCustomGradient({ ...customGradient, from: e.target.value })}
                                                                placeholder="from-blue-600"
                                                                className="w-full px-3 py-2 bg-gray-900/70 border border-gray-700/50 rounded-lg text-gray-200"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-400 mb-1">End Color</label>
                                                        <div className="relative">
                                                            <input
                                                                type="text"
                                                                value={customGradient.to}
                                                                onChange={(e) => setCustomGradient({ ...customGradient, to: e.target.value })}
                                                                placeholder="to-indigo-600"
                                                                className="w-full px-3 py-2 bg-gray-900/70 border border-gray-700/50 rounded-lg text-gray-200"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="h-12 rounded-lg overflow-hidden relative">
                                                    <div className={`absolute inset-0 bg-gradient-to-r ${customGradient.from} ${customGradient.to}`}></div>
                                                    <div className="absolute inset-0 flex items-center justify-center text-white text-sm font-medium bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                                                        Preview
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'social' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Website</label>
                                        <div className="flex items-center w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700/50 rounded-xl">
                                            <Globe size={16} className="text-gray-400 mr-2" />
                                            <input
                                                type="url"
                                                value={website}
                                                onChange={(e) => setWebsite(e.target.value)}
                                                placeholder="https://yourwebsite.com"
                                                className="w-full bg-transparent focus:outline-none text-gray-200 placeholder-gray-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Github</label>
                                        <div className="flex items-center w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700/50 rounded-xl">
                                            <Github size={16} className="text-gray-400 mr-2" />
                                            <input
                                                type="text"
                                                value={github}
                                                onChange={(e) => setGithub(e.target.value)}
                                                placeholder="Your Github username"
                                                className="w-full bg-transparent focus:outline-none text-gray-200 placeholder-gray-500"
                                            />
                                        </div>
                                    </div>

                                    <div></div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Twitter</label>
                                        <div className="flex items-center w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700/50 rounded-xl">
                                            <Twitter size={16} className="text-gray-400 mr-2" />
                                            <input
                                                type="text"
                                                value={twitter}
                                                onChange={(e) => setTwitter(e.target.value)}
                                                placeholder="Your Twitter username"
                                                className="w-full bg-transparent focus:outline-none text-gray-200 placeholder-gray-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'skills' && (
                                <div className="space-y-4">
                                    <div className="mt-6">
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Skills</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={skillInput}
                                                onChange={(e) => setSkillInput(e.target.value)}
                                                onKeyPress={handleSkillKeyPress}
                                                placeholder="Add a skill (press Enter)"
                                                className="flex-grow px-4 py-2.5 bg-gray-900/50 border border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-200 placeholder-gray-500"
                                            />
                                            <motion.button
                                                type="button"
                                                onClick={handleAddSkill}
                                                whileTap={{ scale: 0.95 }}
                                                className="px-4 py-2.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 hover:border-blue-500/50 text-blue-400 rounded-xl transition-all duration-200 font-medium"
                                            >
                                                Add Skill
                                            </motion.button>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            <AnimatePresence mode="popLayout">
                                                {skills.map((skill) => (
                                                    <motion.div
                                                        key={skill}
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.8 }}
                                                        className="group flex items-center gap-1.5 bg-gradient-to-br from-gray-800/50 to-gray-900/50 hover:from-blue-900/20 hover:to-indigo-900/20 px-3 py-1.5 rounded-lg border border-gray-700/50 hover:border-blue-500/50 transition-all duration-200"
                                                    >
                                                        <span className="text-sm text-gray-300 group-hover:text-blue-400 transition-colors">{skill}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveSkill(skill)}
                                                            className="text-gray-500 hover:text-red-400 transition-colors"
                                                        >
                                                            ×
                                                        </button>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-xl transition-all duration-300 shadow-lg hover:shadow-green-500/25 disabled:opacity-50 flex items-center gap-2 font-medium"
                        >
                            {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save size={16} />}
                            {saving ? 'Saving...' : 'Save Profile'}
                        </button>
                    </div>
                </form>
            </div>

            <PreviewProfileModal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                previewData={getPreviewData()}
            />

            <Footer />
        </div>
    );
}
