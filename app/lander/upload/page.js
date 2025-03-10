"use client"

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { detectLanguage } from '../../utils/languageUtils';
import availableTags from '../../utils/Tags';
import Dropdown from '../../components/Dropdown';
import Loading from '@/app/components/Loading';
import {
    AlertCircle, Code2, Save, Info, FileCode, AlertTriangle, 
    CheckCircle2, X, Terminal, Braces, Type, FileText, 
    Upload, Tag, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Editor } from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiGlobe, FiLock, FiLink } from 'react-icons/fi';

export default function Home() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [code, setCode] = useState('');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('info');
    const [codeStats, setCodeStats] = useState({ lines: 0, chars: 0, language: 'plaintext' });
    const [errors, setErrors] = useState([]);
    const [warnings, setWarnings] = useState([]);
    const [selectedPrivacy, setSelectedPrivacy] = useState('public');
    const [selectedTags, setSelectedTags] = useState([]);
    const [formData, setFormData] = useState({ language: 'javascript' });
    const [showEditor, setShowEditor] = useState(false);

    const MAX_TAGS = 5;

    const handleTagToggle = (tag) => {
        setSelectedTags(prev => {
            if (prev.includes(tag)) {
                return prev.filter(t => t !== tag);
            }
            if (prev.length >= MAX_TAGS) {
                setMessage(`Maximum ${MAX_TAGS} tags allowed`);
                setMessageType('error');
                return prev;
            }
            return [...prev, tag];
        });
    };

    const router = useRouter();

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

    const processCodeChanges = useCallback((codeValue) => {
        const lines = codeValue.split('\n').length;
        const chars = codeValue.length;
        const language = detectLanguage(codeValue);
        return { lines, chars, language };
    }, []);

    useEffect(() => {
        const { lines, chars, language } = processCodeChanges(code);
        setCodeStats({ lines, chars, language });
    }, [code, processCodeChanges]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            const response = await fetch('/api/creations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    description,
                    code,
                    language: codeStats.language,
                    privacy: selectedPrivacy,
                    tags: selectedTags,  // Add tags to the submission
                    metadata: {
                        lines: codeStats.lines,
                        characters: codeStats.chars
                    }
                }),
            });

            const data = await response.json();

            if (response.ok) {
                const snippetId = data.id || (data.creation && data.creation._id);
                if (!snippetId) {
                    setMessageType('error');
                    setMessage('Error: Could not get snippet ID');
                    return;
                }

                setMessageType('success');
                setMessage(
                    <span>
                        Your code snippet was saved successfully! View it at:
                        <a
                            href={`/creation/${snippetId}`}
                            className="ml-1 underline font-medium hover:text-blue-300 transition-colors"
                        >
                            {window.location.origin}/creation/{snippetId}
                        </a>
                    </span>
                );
                // Reset all form fields including tags
                setTitle('');
                setDescription('');
                setCode('');
                setSelectedTags([]); // Add this line to reset tags
            } else {
                setMessageType('error');
                setMessage(`Error: ${data.message}`);
            }
        } catch (error) {
            setMessageType('error');
            setMessage('Error saving creation. Please try again.');
        }
    };

    if (loading) {
        return (
            <Loading
                size="default"
            />
        );
    }

    const getMessageStyles = () => {
        switch (messageType) {
            case 'error':
                return "bg-red-900/30 border-l-4 border-red-500 text-red-200";
            case 'success':
                return "bg-emerald-900/30 border-l-4 border-emerald-500 text-emerald-200";
            default:
                return "bg-blue-900/30 border-l-4 border-blue-500 text-blue-200";
        }
    };

    const getMessageIcon = () => {
        switch (messageType) {
            case 'error':
                return <AlertTriangle className="h-5 w-5 text-red-400" />;
            case 'success':
                return <CheckCircle2 className="h-5 w-5 text-emerald-400" />;
            default:
                return <Info className="h-5 w-5 text-blue-400" />;
        }
    };

    const handleEditorChange = (value) => {
        setCode(value || '');
    };

    // Add this function to generate random delays for shine animation
    const getRandomDelay = () => {
        return `${Math.random() * 3}s`; // Reduced from 10s to 3s
    };

    const privacyOptions = [
        {
            value: 'public',
            label: 'Public',
            icon: <FiGlobe className="w-4 h-4 text-green-400" />
        },
        {
            value: 'private',
            label: 'Private',
            icon: <FiLock className="w-4 h-4 text-red-400" />
        },
        {
            value: 'unlisted',
            label: 'Unlisted',
            icon: <FiLink className="w-4 h-4 text-blue-400" />
        },
    ];

    const handlePrivacyChange = (value) => {
        console.log('Changing privacy to:', value);
        setSelectedPrivacy(value);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-gray-100 flex flex-col">
            <Header user={user} />

            <main className="flex-grow flex flex-col lg:flex-row relative">
                <div className={`${
                    showEditor ? 'hidden' : 'flex'
                } lg:flex lg:w-[450px] flex-shrink-0 h-[calc(100vh-64px)] flex-col border-r border-gray-800`}>
                    <div className="p-4 lg:p-6 space-y-6 flex-grow overflow-y-auto">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-blue-600/30 rounded-full">
                                    <Upload className="h-5 w-5 text-blue-400" />
                                </div>
                                <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-500">
                                    New Snippet
                                </h1>
                            </div>
                            <button
                                onClick={() => setShowEditor(true)}
                                className="lg:hidden flex items-center gap-2 text-sm text-blue-400"
                            >
                                <span>Editor</span>
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>

                        {message && (
                            <div className={`p-3 rounded-lg shadow-md flex items-start ${getMessageStyles()}`}>
                                <div className="flex-shrink-0">{getMessageIcon()}</div>
                                <div className="ml-3 flex-grow text-sm">{message}</div>
                                <button onClick={() => setMessage('')}>
                                    <X className="h-4 w-4 opacity-60 hover:opacity-100" />
                                </button>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-300 mb-2">
                                    <Type className="h-4 w-4 text-blue-400" />
                                    <span>Title</span>
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-900/70 border border-gray-700/50 rounded-lg"
                                    placeholder="Snippet title"
                                    required
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-300 mb-2">
                                    <FileText className="h-4 w-4 text-blue-400" />
                                    <span>Description</span>
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-900/70 border border-gray-700/50 rounded-lg"
                                    rows="3"
                                    placeholder="What does this code do?"
                                    required
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-300 mb-2">
                                    <Tag className="h-4 w-4 text-blue-400" />
                                    <span>Tags ({selectedTags.length}/{MAX_TAGS})</span>
                                </label>
                                <div className="flex flex-wrap gap-1.5">
                                    {availableTags.map(tag => (
                                        <button
                                            key={tag}
                                            type="button"
                                            onClick={() => handleTagToggle(tag)}
                                            disabled={selectedTags.length >= MAX_TAGS && !selectedTags.includes(tag)}
                                            className={`px-2 py-1 text-xs rounded-md transition-all ${
                                                selectedTags.includes(tag)
                                                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                                    : 'bg-gray-800/40 text-gray-400 border border-gray-700/30'
                                            }`}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                                <Dropdown
                                    options={privacyOptions}
                                    value={selectedPrivacy}
                                    onChange={handlePrivacyChange}
                                    placeholder="Select privacy"
                                    className="w-48"
                                />
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
                                >
                                    <Save className="h-4 w-4" />
                                    <span className="hidden sm:inline">Save</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <div className={`${
                    showEditor ? 'flex' : 'hidden'
                } lg:flex flex-col flex-grow h-[calc(100vh-64px)]`}>
                    <div className="p-4 border-b border-gray-800 flex items-center gap-4">
                        <button
                            onClick={() => setShowEditor(false)}
                            className="lg:hidden flex items-center gap-2 text-sm text-blue-400"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            <span>Back</span>
                        </button>
                        
                        <div className="flex items-center gap-4">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-800 rounded-full">
                                <Terminal className="h-4 w-4 text-blue-400" />
                                <span className="text-sm font-medium">
                                    {codeStats.language === 'plaintext' ? 'No language detected' : codeStats.language}
                                </span>
                            </span>
                            <div className="hidden sm:flex items-center gap-3 text-sm text-gray-400">
                                <span>{codeStats.lines} lines</span>
                                <span>{codeStats.chars} chars</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex-grow">
                        <Editor
                            height="100%"
                            defaultLanguage="javascript"
                            language={codeStats.language}
                            value={code}
                            onChange={handleEditorChange}
                            theme="vs-dark"
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                lineHeight: 21,
                                padding: { top: 16, bottom: 16 },
                                wordWrap: 'on'
                            }}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}
