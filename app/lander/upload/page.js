"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { detectLanguage } from '../../utils/languageUtils';
import {
    AlertCircle, Code2, Save, Info,
    FileCode, AlertTriangle, CheckCircle2, X, Terminal,
    Braces, Type, FileText
} from 'lucide-react';
import { Editor } from '@monaco-editor/react';

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
                    language: codeStats.language, // Add the detected language
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
                setTitle('');
                setDescription('');
                setCode('');
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
            <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
                    <div className="text-xl text-gray-300 font-medium">Loading...</div>
                </div>
            </div>
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

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-gray-100 flex flex-col">
            <Header user={user} />

            <main className="py-12 px-4 sm:px-6 lg:px-8 flex-grow">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12 space-y-4">
                        <div className="inline-flex items-center justify-center p-3 bg-blue-600/30 rounded-full mb-3 shadow-lg shadow-blue-500/10">
                            <Code2 className="h-9 w-9 text-blue-400" />
                        </div>
                        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-500 tracking-tight">
                            CodeVault
                        </h1>
                        <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
                            Store, share and organize your code snippets in one secure place
                        </p>
                    </div>

                    {!user && (
                        <div className="bg-gray-800/80 backdrop-blur-sm shadow-xl rounded-xl overflow-hidden mb-10 border border-gray-700/50 max-w-3xl mx-auto">
                            <div className="px-8 py-6">
                                <div className="flex items-center justify-center mb-5">
                                    <div className="p-2.5 bg-amber-500/20 rounded-full">
                                        <AlertCircle className="h-6 w-6 text-amber-400" />
                                    </div>
                                </div>
                                <p className="text-amber-400 font-semibold text-lg text-center mb-4">
                                    Not logged in
                                </p>
                                <div className="space-y-4">
                                    <p className="text-gray-300 leading-relaxed text-center">
                                        You can still submit your code snippets anonymously, but logging in provides additional benefits:
                                    </p>
                                    <ul className="text-gray-300 space-y-2 max-w-md mx-auto">
                                        <li className="flex items-start">
                                            <div className="flex-shrink-0 h-5 w-5 text-blue-400 mr-2">•</div>
                                            <span>Track and manage all your code snippets</span>
                                        </li>
                                        <li className="flex items-start">
                                            <div className="flex-shrink-0 h-5 w-5 text-blue-400 mr-2">•</div>
                                            <span>Update or delete submissions later</span>
                                        </li>
                                        <li className="flex items-start">
                                            <div className="flex-shrink-0 h-5 w-5 text-blue-400 mr-2">•</div>
                                            <span>Build a personal code library</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {message && (
                        <div className={`mb-8 p-4 rounded-lg shadow-md flex items-start ${getMessageStyles()}`}>
                            <div className="flex-shrink-0">
                                {getMessageIcon()}
                            </div>
                            <div className="ml-3 flex-grow">
                                <p className="text-sm">{message}</p>
                            </div>
                            <button
                                onClick={() => setMessage('')}
                                className="flex-shrink-0 ml-2 focus:outline-none"
                            >
                                <X className="h-4 w-4 opacity-60 hover:opacity-100" />
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="bg-gray-800 shadow-lg rounded-lg overflow-hidden border border-gray-700">
                        <div className="p-8 border-b border-gray-700">
                            <div className="space-y-8">
                                <div>
                                    <label htmlFor="title" className="flex items-center gap-1.5 text-sm font-medium text-gray-300 mb-2">
                                        <Type className="h-4 w-4 text-blue-400" />
                                        <span>Title</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="title"
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-700 rounded-lg shadow-sm placeholder-gray-500 bg-gray-900 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                            placeholder="Give your snippet a descriptive title"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="description" className="flex items-center gap-1.5 text-sm font-medium text-gray-300 mb-2">
                                        <FileText className="h-4 w-4 text-blue-400" />
                                        <span>Description</span>
                                    </label>
                                    <textarea
                                        id="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-700 rounded-lg shadow-sm placeholder-gray-500 bg-gray-900 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        rows="4"
                                        placeholder="What does this code do? Add any relevant details."
                                        required
                                    ></textarea>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label htmlFor="code" className="flex items-center gap-1.5 text-sm font-medium text-gray-300">
                                            <Braces className="h-4 w-4 text-blue-400" />
                                            <span>Code</span>
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <Terminal className="h-4 w-4 text-gray-400" />
                                            <span className="text-sm font-medium text-gray-400">
                                                {codeStats.language === 'plaintext' ? 'No language detected' : codeStats.language}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="relative border border-gray-700 rounded-lg overflow-hidden shadow-inner">
                                        <div className="h-[400px]">
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
                                                    scrollBeyondLastLine: false,
                                                    roundedSelection: false,
                                                    padding: { top: 8, bottom: 8 },
                                                    scrollbar: {
                                                        verticalScrollbarSize: 8,
                                                        horizontalScrollbarSize: 8
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-4 flex flex-col space-y-2 text-sm">
                                        <div className="flex justify-between items-center">
                                            <div className="flex space-x-6">
                                                <span className="inline-flex items-center gap-1">
                                                    <span className="h-2 w-2 rounded-full bg-blue-400"></span>
                                                    Lines: {codeStats.lines}
                                                </span>
                                                <span className="inline-flex items-center gap-1">
                                                    <span className="h-2 w-2 rounded-full bg-violet-400"></span>
                                                    Characters: {codeStats.chars}
                                                </span>
                                            </div>
                                        </div>

                                        {errors.length > 0 && (
                                            <div className="text-red-400 space-y-1">
                                                {errors.map((error, i) => (
                                                    <div key={i} className="flex items-center gap-1">
                                                        <AlertTriangle className="h-3 w-3" />
                                                        Line {error.line}: {error.message}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {warnings.length > 0 && (
                                            <div className="text-amber-400 space-y-1">
                                                {warnings.map((warning, i) => (
                                                    <div key={i} className="flex items-center gap-1">
                                                        <AlertCircle className="h-3 w-3" />
                                                        Line {warning.line}: {warning.message}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="px-8 py-5 bg-gray-900 flex justify-end">
                            <button
                                type="submit"
                                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Save Snippet
                            </button>
                        </div>
                    </form>
                </div>
            </main>
            <Footer />
        </div>
    );
}