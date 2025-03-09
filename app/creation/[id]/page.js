'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Editor from '@monaco-editor/react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

export default function CreationDetail() {
  const [creation, setCreation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const params = useParams();
  const router = useRouter();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedCode, setEditedCode] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    const fetchCreation = async () => {
      try {
        const creationRes = await fetch(`/api/creations/${params.id}`);
        
        if (!creationRes.ok) {
          if (creationRes.status === 404) {
            throw new Error('Creation not found');
          } else {
            throw new Error('Failed to fetch creation details');
          }
        }
        
        const data = await creationRes.json();
        setCreation(data.creation);
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchCreation();
    }
  }, [params.id]);

  useEffect(() => {
    // Enable smooth scrolling
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Reset on cleanup
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(creation.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveAsNew = async () => {
    if (!editedCode) return;
    
    setIsSaving(true);
    try {
      const response = await fetch('/api/creations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${creation.title} (Copy)`,
          description: creation.description,
          code: editedCode,
          language: creation.language,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/auth/creation/${data.creation._id}`);
      } else {
        throw new Error('Failed to save creation');
      }
    } catch (error) {
      console.error('Error saving creation:', error);
      alert('Failed to save creation. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-6 text-gray-300 text-lg">Loading creation...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col">
        <Header />
        <div className="flex-1 p-8">
          <div className="max-w-5xl mx-auto">
            <div className="bg-red-900/40 backdrop-blur-sm border border-red-700 text-red-100 px-6 py-4 rounded-lg mb-6 shadow-lg">
              <p className="text-lg">Error: {error}</p>
            </div>
            <Link href="/auth/dashboard" className="text-blue-400 hover:text-blue-300 transition flex items-center gap-2 group">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!creation) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col">
        <Header />
        <div className="flex-1 p-8">
          <div className="max-w-5xl mx-auto">
            <div className="bg-yellow-900/40 backdrop-blur-sm border border-yellow-700 text-yellow-100 px-6 py-4 rounded-lg mb-6 shadow-lg">
              <p className="text-lg">Creation not found</p>
            </div>
            <Link href="/auth/dashboard" className="text-blue-400 hover:text-blue-300 transition flex items-center gap-2 group">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col">
      <Header />
      <main className="flex-1 w-full p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <Link href="/auth/dashboard" className="text-blue-400 hover:text-blue-300 transition flex items-center gap-2 group w-fit">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
          </div>
          
          <header className="mb-10">
            <h1 className="text-4xl font-bold mb-3 text-white">{creation.title}</h1>
            <div className="flex flex-wrap gap-x-6 gap-y-2 items-center text-gray-400">
              {creation.author && (
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>{creation.author}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{formatDate(creation.createdAt)}</span>
              </div>
            </div>
          </header>
          
          {creation.description && (
            <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-xl p-8 mb-8 border border-gray-700/50">
              <h2 className="text-2xl font-semibold mb-4 text-blue-300">Description</h2>
              <p className="text-gray-300 leading-relaxed text-lg">{creation.description}</p>
            </div>
          )}
          
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-xl mb-8 border border-gray-700/50 overflow-hidden">
            <div className="flex justify-between items-center bg-gray-800 p-5 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-semibold text-blue-300">Code</h2>
                <span className="px-2 py-1 rounded-md bg-blue-500/10 text-blue-400 text-sm border border-blue-500/20">
                  {creation.language || "javascript"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  className={`
                    px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200
                    ${isEditMode 
                      ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' 
                      : 'bg-gray-500/20 text-gray-300 border border-gray-500/30 hover:bg-gray-500/30'
                    }
                  `}
                  onClick={() => {
                    setIsEditMode(!isEditMode);
                    if (!isEditMode) {
                      setEditedCode(creation.code);
                    }
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  {isEditMode ? 'Editing' : 'Edit'}
                </button>
                {isEditMode && (
                  <button
                    className={`
                      px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200
                      bg-green-500/20 text-green-300 border border-green-500/30
                      hover:bg-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                    onClick={handleSaveAsNew}
                    disabled={isSaving}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    {isSaving ? 'Saving...' : 'Save as New'}
                  </button>
                )}
                {!isEditMode && (
                  <button 
                    className={`
                      px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200
                      ${copied 
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30'
                      }
                    `}
                    onClick={copyToClipboard}
                    disabled={copied}
                  >
                    {copied ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
            <div className="relative h-[70vh]">
              <Editor
                height="100%"
                width="100%"
                defaultLanguage={creation.language || "javascript"}
                value={isEditMode ? editedCode : creation.code}
                onChange={isEditMode ? setEditedCode : undefined}
                theme="vs-dark"
                options={{
                  readOnly: !isEditMode,
                  minimap: { enabled: true },
                  scrollBeyondLastLine: false,
                  fontSize: 15,
                  lineHeight: 1.6,
                  padding: { top: 20, bottom: 20 },
                  scrollbar: {
                    useShadows: false,
                    verticalScrollbarSize: 12,
                    horizontalScrollbarSize: 12,
                    vertical: 'visible',
                    horizontal: 'visible',
                    verticalSliderSize: 8,
                    horizontalSliderSize: 8,
                    verticalScrollbarBackground: '#1a1b1e50',
                    horizontalScrollbarBackground: '#1a1b1e50'
                  },
                  smoothScrolling: true,
                  mouseWheelScrollSensitivity: 0.5,
                  wordWrap: "on",
                  automaticLayout: true,
                  lineNumbers: "on",
                  folding: true,
                  foldingHighlight: true,
                  fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
                  fontLigatures: true,
                  formatOnType: true,
                  formatOnPaste: true,
                  renderLineHighlight: 'all',
                  guides: {
                    indentation: true,
                    bracketPairs: true
                  }
                }}
                beforeMount={(monaco) => {
                  monaco.editor.defineTheme('custom-dark', {
                    base: 'vs-dark',
                    inherit: true,
                    rules: [],
                    colors: {
                      'editor.background': '#1a1b1e'
                    }
                  });
                }}
                onMount={(editor) => {
                  editor.layout();
                }}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
