'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import {
    User, Edit2, Loader, Camera, MapPin, Globe, Wrench, X,
    Check, Link as LinkIcon, Github, Twitter, Palette, Trash2
} from 'lucide-react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

const BANNER_COLOR_OPTIONS = [
    { from: 'from-blue-600/80', to: 'to-indigo-600/80', name: 'Blue/Indigo' },
    { from: 'from-purple-600/80', to: 'to-pink-600/80', name: 'Purple/Pink' },
    { from: 'from-emerald-600/80', to: 'to-teal-600/80', name: 'Emerald/Teal' },
    { from: 'from-orange-500/80', to: 'to-red-600/80', name: 'Orange/Red' },
    { from: 'from-gray-600/80', to: 'to-slate-700/80', name: 'Monochrome' },
    { from: 'from-violet-600/80', to: 'to-fuchsia-600/80', name: 'Violet/Fuchsia' },
];

export default function ProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [user, setUser] = useState(null);
    const [tempAvatar, setTempAvatar] = useState(null);
    const fileInputRef = useRef(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        bio: '',
        website: '',
        github: '',
        twitter: '',
        location: '',
        displayName: '',
        skills: [],
        bannerColor: 0,
        avatar: ''
    });
    const [newSkill, setNewSkill] = useState('');
    const [previewMode, setPreviewMode] = useState(false);

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const response = await fetch('/api/auth/me/profile', {
                credentials: 'include'
            });

            if (!response.ok) {
                if (response.status === 404 || response.status === 401) {
                    router.push('/auth/login');
                    return;
                }
                throw new Error('Failed to fetch profile');
            }

            const data = await response.json();

            if (data.user) {
                setUser(data.user);
                setFormData({
                    username: data.user.username || '',
                    email: data.user.email || '',
                    bio: data.user.bio || '',
                    website: data.user.website || '',
                    github: data.user.github || '',
                    twitter: data.user.twitter || '',
                    location: data.user.location || '',
                    displayName: data.user.displayName || '',
                    skills: data.user.skills || [],
                    bannerColor: typeof data.user.bannerColor === 'number' ? data.user.bannerColor : 0,
                    avatar: data.user.avatar || '' // Add this line
                });
                setTempAvatar(null);
                console.log('Fetched banner color:', data.user.bannerColor);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            // Only include avatar in dataToUpdate if tempAvatar is not null
            const dataToUpdate = {
                ...formData,
                bannerColor: Number(formData.bannerColor),
            };

            // Ensure we don't send empty string for avatar if there's no new upload
            if (!tempAvatar && !formData.avatar) {
                delete dataToUpdate.avatar;
            }

            console.log('Updating profile with:', dataToUpdate);

            // Delete old avatar only if we're uploading a new one
            if (tempAvatar && user.avatar && user.avatar !== tempAvatar) {
                try {
                    await fetch('/api/upload/avatar/delete', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ url: user.avatar }),
                        credentials: 'include'
                    });
                } catch (deleteError) {
                    console.error('Error deleting old avatar:', deleteError);
                }
            }

            const response = await fetch('/api/auth/me/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToUpdate),
                credentials: 'include'
            });

            if (!response.ok) {
                if (response.status === 401) {
                    router.push('/auth/login');
                    return;
                }
                throw new Error('Failed to update profile');
            }

            const data = await response.json();
            console.log('Profile update response:', data);
            setUser(data.user);
            setEditMode(false);
            setPreviewMode(false);
            setTempAvatar(null);
            toast.success('Profile updated successfully');

            if (window.location.search) {
                window.history.replaceState({}, '', window.location.pathname);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarClick = () => {
        if (editMode) {
            fileInputRef.current?.click();
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Enhanced file type validation
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Only JPG, PNG and WebP images are allowed');
            e.target.value = '';  // Clear the input
            return;
        }

        // Stricter size limit - 5MB
        const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > MAX_FILE_SIZE) {
            toast.error('Image must be less than 5MB');
            e.target.value = '';  // Clear the input
            return;
        }

        // Basic image dimension check
        try {
            const dimensions = await getImageDimensions(file);
            if (dimensions.width > 2000 || dimensions.height > 2000) {
                toast.error('Image dimensions must be 2000x2000 pixels or less');
                e.target.value = '';  // Clear the input
                return;
            }
        } catch (error) {
            toast.error('Failed to validate image dimensions');
            e.target.value = '';  // Clear the input
            return;
        }

        setAvatarUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const uploadResponse = await fetch('/api/upload/avatar', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            if (!uploadResponse.ok) {
                throw new Error('Failed to upload image');
            }

            const data = await uploadResponse.json();
            console.log('Upload response:', data);
            setTempAvatar(data.url);
            
            // Also update the formData state to include the new avatar URL
            setFormData(prev => ({
                ...prev,
                avatar: data.url
            }));
            
            console.log('Set tempAvatar and formData.avatar to:', data.url);
            
            // Automatically show the preview
            setPreviewMode(true);
            
            toast.success('Image uploaded. Click Save Changes to update your profile.');
        } catch (error) {
            console.error('Error:', error);
            toast.error(error.message || 'Failed to upload avatar');
        } finally {
            setAvatarUploading(false);
        }
    };

    const getImageDimensions = (file) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                resolve({ width: img.width, height: img.height });
            };
            img.onerror = () => {
                reject(new Error('Failed to load image'));
            };
            img.src = URL.createObjectURL(file);
        });
    };

    const addSkill = () => {
        if (!newSkill.trim()) return;

        if (formData.skills.includes(newSkill.trim())) {
            toast.error('This skill is already added');
            return;
        }

        if (formData.skills.length >= 10) {
            toast.error('Maximum 10 skills allowed');
            return;
        }

        setFormData(prev => ({
            ...prev,
            skills: [...prev.skills, newSkill.trim()]
        }));
        setNewSkill('');
    };

    const removeSkill = (skill) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter(s => s !== skill)
        }));
    };

    const setBannerColor = (index) => {
        setFormData(prev => ({
            ...prev,
            bannerColor: Number(index)
        }));
    };

    const togglePreview = () => {
        setPreviewMode(prevState => !prevState);
    };

    const clearAvatar = () => {
        setTempAvatar(null);
        setFormData(prev => ({
            ...prev,
            avatar: ''
        }));
        setPreviewMode(false);
        toast.success('Avatar removed. Click Save Changes to update your profile.');
    };

    if (loading || !user) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950">
                <Header user={null} />
                <div className="flex flex-col items-center justify-center flex-grow h-[calc(100vh-4.5rem)]">
                    <Loader className="w-8 h-8 animate-spin text-blue-500" />
                    <p className="text-gray-400 mt-4">Loading profile...</p>
                </div>
                <Footer />
            </div>
        );
    }

    const selectedBannerColor = BANNER_COLOR_OPTIONS[formData.bannerColor || 0];
    const bannerGradient = `bg-gradient-to-r ${selectedBannerColor.from} ${selectedBannerColor.to}`;

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 flex flex-col">
            <Header user={user} />

            <div className="flex-grow max-w-7xl mx-auto px-4 py-8 w-full">
                <div className="bg-gradient-to-br from-gray-800/50 via-gray-900/50 to-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/30 overflow-hidden">
                    <div className="relative mb-24">
                        <div className={`h-48 ${bannerGradient} flex items-end`}>
                            <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-10"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 to-transparent"></div>

                            {editMode && (
                                <div className="absolute bottom-4 right-4">
                                    <div className="p-2 bg-black/30 backdrop-blur-sm rounded-lg border border-white/20">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Palette className="w-4 h-4 text-white" />
                                            <span className="text-sm font-medium text-white">Banner Color</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {BANNER_COLOR_OPTIONS.map((color, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => setBannerColor(index)}
                                                    className={`w-8 h-8 rounded-full bg-gradient-to-r ${color.from} ${color.to} flex items-center justify-center ${formData.bannerColor === index ? 'ring-2 ring-white' : ''}`}
                                                    title={color.name}
                                                    type="button"
                                                >
                                                    {formData.bannerColor === index && (
                                                        <Check className="w-4 h-4 text-white" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="absolute -bottom-16 left-8 flex items-end">
                            <div className="relative group">
                                <div
                                    className={`w-32 h-32 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-gray-900 ${editMode ? 'cursor-pointer' : ''}`}
                                    onClick={handleAvatarClick}
                                >
                                    {avatarUploading ? (
                                        <div className="w-full h-full bg-gray-800/80 backdrop-blur-sm flex items-center justify-center">
                                            <Loader className="w-8 h-8 animate-spin text-blue-400" />
                                        </div>
                                    ) : tempAvatar ? (
                                        <div className="relative w-32 h-32">
                                            <Image
                                                src={tempAvatar}
                                                alt={user.username || 'User avatar'}
                                                fill
                                                className="object-cover"
                                                sizes="128px"
                                                priority
                                            />
                                            {editMode && (
                                                <div className="absolute bottom-0 right-0 p-1 bg-red-500/70 rounded-tl-lg cursor-pointer"
                                                     onClick={(e) => {
                                                         e.stopPropagation();
                                                         clearAvatar();
                                                     }}>
                                                    <Trash2 className="w-4 h-4 text-white" />
                                                </div>
                                            )}
                                        </div>
                                    ) : user?.avatar ? (
                                        <div className="relative w-32 h-32">
                                            <Image
                                                src={user.avatar}
                                                alt={user.username || 'User avatar'}
                                                fill
                                                className="object-cover"
                                                sizes="128px"
                                                priority
                                            />
                                            {editMode && (
                                                <div className="absolute bottom-0 right-0 p-1 bg-red-500/70 rounded-tl-lg cursor-pointer"
                                                     onClick={(e) => {
                                                         e.stopPropagation();
                                                         clearAvatar();
                                                     }}>
                                                    <Trash2 className="w-4 h-4 text-white" />
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
                                            <User className="w-12 h-12 text-blue-400" />
                                        </div>
                                    )}
                                    {editMode && (
                                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Camera className="w-6 h-6 text-white" />
                                        </div>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>

                            <div className="ml-6 mb-4">
                                <h2 className="text-2xl font-bold text-white">
                                    {formData.displayName || formData.username}
                                </h2>
                                <p className="text-gray-400">@{formData.username}</p>
                            </div>
                        </div>

                        {editMode && tempAvatar && (
                            <div className="absolute top-4 left-4">
                                <button
                                    onClick={togglePreview}
                                    className="px-3 py-2 bg-blue-600/80 hover:bg-blue-700/80 text-white rounded-lg backdrop-blur-sm transition-colors flex items-center gap-2"
                                >
                                    {previewMode ? 'Hide Preview' : 'Preview Avatar'}
                                </button>
                            </div>
                        )}

                        {!editMode ? (
                            <button
                                onClick={() => setEditMode(true)}
                                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur-sm transition-colors"
                            >
                                <Edit2 className="w-5 h-5 text-white" />
                            </button>
                        ) : (
                            <div className="absolute top-4 right-4 flex gap-2">
                                <button
                                    onClick={() => {
                                        setEditMode(false);
                                        setPreviewMode(false);
                                        setTempAvatar(null);
                                        fetchUserData();

                                        if (window.location.search) {
                                            window.history.replaceState({}, '', window.location.pathname);
                                        }
                                    }}
                                    className="p-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl backdrop-blur-sm transition-colors text-gray-300"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>

                    {previewMode && tempAvatar && (
                        <div className="px-8 pt-2 pb-4">
                            <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-4 border border-gray-700/50">
                                <h3 className="text-lg font-medium text-white mb-3">Avatar Preview</h3>
                                <div className="flex items-center space-x-4">
                                    <div className="relative w-16 h-16 rounded-full overflow-hidden">
                                        <Image
                                            src={tempAvatar}
                                            alt="Avatar preview"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="relative w-10 h-10 rounded-full overflow-hidden">
                                        <Image
                                            src={tempAvatar}
                                            alt="Avatar preview"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <p className="text-gray-300 text-sm">This is how your avatar will appear in comments and posts.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="p-8 pt-0">
                        <form onSubmit={handleUpdateProfile} className="space-y-8">
                            <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/30">
                                <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                                    <User className="w-5 h-5 mr-2 text-blue-400" />
                                    Basic Information
                                </h2>
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div>
                                        <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                                            Username
                                        </label>
                                        <input
                                            id="username"
                                            name="username"
                                            type="text"
                                            value={formData.username}
                                            onChange={handleInputChange}
                                            disabled={!editMode}
                                            className="w-full px-4 py-3 bg-gray-900/70 border border-gray-700/50 rounded-lg
                                                      disabled:opacity-60 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="johndoe"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                                            Email
                                        </label>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            disabled={!editMode}
                                            className="w-full px-4 py-3 bg-gray-900/70 border border-gray-700/50 rounded-lg
                                                      disabled:opacity-60 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="john@example.com"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="displayName" className="block text-sm font-medium text-gray-300 mb-1">
                                            Display Name
                                        </label>
                                        <input
                                            id="displayName"
                                            name="displayName"
                                            type="text"
                                            value={formData.displayName}
                                            onChange={handleInputChange}
                                            disabled={!editMode}
                                            className="w-full px-4 py-3 bg-gray-900/70 border border-gray-700/50 rounded-lg
                                                      disabled:opacity-60 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="John Doe"
                                        />
                                    </div>

                                    <div></div>
                                    <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-1">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-blue-400" />
                                            <span>Location</span>
                                        </div>
                                    </label>
                                    <input
                                        id="location"
                                        name="location"
                                        type="text"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        disabled={!editMode}
                                        className="w-full px-4 py-3 bg-gray-900/70 border border-gray-700/50 rounded-lg
                                                      disabled:opacity-60 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="San Francisco, CA"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-1">
                                        Bio
                                    </label>
                                    <textarea
                                        id="bio"
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleInputChange}
                                        disabled={!editMode}
                                        className="w-full px-4 py-3 bg-gray-900/70 border border-gray-700/50 rounded-lg
                                                      disabled:opacity-60 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        rows="3"
                                        placeholder="Write a short bio about yourself..."
                                    />
                                    {editMode && (
                                        <p className="mt-1 text-xs text-gray-400">
                                            {500 - (formData.bio?.length || 0)} characters remaining
                                        </p>
                                    )}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Wrench className="w-4 h-4 text-blue-400" />
                                            <span>Skills</span>
                                        </div>
                                    </label>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {formData.skills.length > 0 ? formData.skills.map((skill, index) => (
                                            <div
                                                key={index}
                                                className="bg-blue-900/30 border border-blue-500/30 py-1.5 px-3 rounded-full text-sm text-blue-200 flex items-center gap-1"
                                            >
                                                {skill}
                                                {editMode && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeSkill(skill)}
                                                        className="text-blue-300 hover:text-blue-100"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                )}
                                            </div>
                                        )) : (
                                            <p className="text-sm text-gray-500 italic">No skills added</p>
                                        )}
                                    </div>
                                    {editMode && (
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={newSkill}
                                                onChange={(e) => setNewSkill(e.target.value)}
                                                className="flex-grow px-4 py-3 bg-gray-900/70 border border-gray-700/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                placeholder="Add a skill (e.g., JavaScript, Python)"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        addSkill();
                                                    }
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={addSkill}
                                                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    )}
                                </div>

                            </div>

                            <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/30">
                                <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                                    <Globe className="w-5 h-5 mr-2 text-blue-400" />
                                    Social Links
                                </h2>
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div>
                                        <label htmlFor="website" className="block text-sm font-medium text-gray-300 mb-1">
                                            <div className="flex items-center gap-2">
                                                <LinkIcon className="w-4 h-4 text-blue-400" />
                                                <span>Website</span>
                                            </div>
                                        </label>
                                        <input
                                            id="website"
                                            name="website"
                                            type="url"
                                            value={formData.website}
                                            onChange={handleInputChange}
                                            disabled={!editMode}
                                            className="w-full px-4 py-3 bg-gray-900/70 border border-gray-700/50 rounded-lg
                                                      disabled:opacity-60 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="https://yourdomain.com"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="github" className="block text-sm font-medium text-gray-300 mb-1">
                                            <div className="flex items-center gap-2">
                                                <Github className="w-4 h-4 text-blue-400" />
                                                <span>GitHub</span>
                                            </div>
                                        </label>
                                        <div className="flex">
                                            <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-gray-700/50 bg-gray-800/50 text-gray-400 text-sm">
                                                github.com/
                                            </span>
                                            <input
                                                id="github"
                                                name="github"
                                                type="text"
                                                value={formData.github}
                                                onChange={handleInputChange}
                                                disabled={!editMode}
                                                className="flex-1 min-w-0 px-4 py-3 bg-gray-900/70 border border-gray-700/50 rounded-r-lg
                                                          disabled:opacity-60 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                placeholder="username"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="twitter" className="block text-sm font-medium text-gray-300 mb-1">
                                            <div className="flex items-center gap-2">
                                                <Twitter className="w-4 h-4 text-blue-400" />
                                                <span>Twitter</span>
                                            </div>
                                        </label>
                                        <div className="flex">
                                            <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-gray-700/50 bg-gray-800/50 text-gray-400 text-sm">
                                                twitter.com/
                                            </span>
                                            <input
                                                id="twitter"
                                                name="twitter"
                                                type="text"
                                                value={formData.twitter}
                                                onChange={handleInputChange}
                                                disabled={!editMode}
                                                className="flex-1 min-w-0 px-4 py-3 bg-gray-900/70 border border-gray-700/50 rounded-r-lg
                                                          disabled:opacity-60 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                placeholder="username"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {editMode && (
                                <div className="flex justify-end gap-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditMode(false);
                                            setTempAvatar(null);
                                            fetchUserData();
                                            if (window.location.search) {
                                                window.history.replaceState({}, '', window.location.pathname);
                                            }
                                        }}
                                        className="px-6 py-2.5 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-6 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {saving ? (
                                            <>
                                                <Loader className="w-4 h-4 animate-spin" />
                                                <span>Saving...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Check className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                <span>Save Changes</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
