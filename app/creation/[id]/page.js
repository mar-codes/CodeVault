'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Editor from '@monaco-editor/react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { Copy, Check, Edit, Save, ArrowLeft, Calendar, User, Code2 } from 'lucide-react';

export default function CreationDetail() {
  const [creation, setCreation] = useState(null);
  const [editorState, setEditorState] = useState({
    isEditMode: false,
    editedCode: '',
    isSaving: false,
    hasChanges: false,
    isCopied: false,
    editError: null
  });
  const [uiState, setUiState] = useState({
    loading: true,
    error: null,
    editorReady: false
  });

  const params = useParams();
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userRes = await fetch('/api/auth/me/auth');
        const userData = await userRes.json();

        setUser(userData.user);
      } catch (error) {
        setUiState(prev => ({ ...prev, error: error.message }));
      }
    };

    checkAuth();
  }, [router]);

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
        setUiState(prev => ({ ...prev, error: err.message }));
      } finally {
        setUiState(prev => ({ ...prev, loading: false }));
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

  const handleCodeChange = useCallback((value) => {
    setEditorState(prev => ({
      ...prev,
      editedCode: value,
      hasChanges: value !== creation?.code
    }));
  }, [creation]);

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(creation?.code);
    setEditorState(prev => ({ ...prev, isCopied: true }));
    setTimeout(() => setEditorState(prev => ({ ...prev, isCopied: false })), 2000);
  }, [creation]);

  const handleSaveAsNew = useCallback(async () => {
    if (!editorState.hasChanges) return;
    if (!editorState.editedCode?.trim()) {
      setEditorState(prev => ({
        ...prev,
        editError: 'Code cannot be empty'
      }));
      setTimeout(() => {
        setEditorState(prev => ({ ...prev, editError: null }));
      }, 3000);
      return;
    }

    setEditorState(prev => ({ ...prev, isSaving: true }));
    try {
      const response = await fetch('/api/creations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${creation.title} (Copy)`,
          description: creation.description,
          code: editorState.editedCode,
          language: creation.language,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/creation/${data.creation._id}`);
      } else {
        throw new Error('Failed to save creation');
      }
    } catch (error) {
      console.error('Error saving creation:', error);
      setUiState(prev => ({ ...prev, error: 'Failed to save creation' }));
    } finally {
      setEditorState(prev => ({ ...prev, isSaving: false }));
    }
  }, [creation, editorState.editedCode, editorState.hasChanges, router]);

  const handleEditToggle = useCallback(() => {
    try {
      if (!user) {
        throw new Error('You must be logged in to edit');
      }

      if (creation?.author && user?.username !== creation.author) {
        throw new Error('You can only edit your own creations');
      }

      if (!creation?.code?.trim()) {
        throw new Error('Cannot edit empty code');
      }

      setEditorState(prev => ({
        ...prev,
        isEditMode: !prev.isEditMode,
        editedCode: !prev.isEditMode ? creation.code : prev.editedCode,
        editError: null
      }));
    } catch (error) {
      setEditorState(prev => ({
        ...prev,
        editError: error.message
      }));
      setTimeout(() => {
        setEditorState(prev => ({ ...prev, editError: null }));
      }, 3000);
    }
  }, [user, creation]);

  if (uiState.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 flex flex-col">
        <Header user={user} />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-gray-400 animate-pulse">Loading creation...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (uiState.error) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col">
        <Header user={user} />
        <div className="flex-1 p-8">
          <div className="max-w-5xl mx-auto">
            <div className="bg-red-900/40 backdrop-blur-sm border border-red-700 text-red-100 px-6 py-4 rounded-lg mb-6 shadow-lg">
              <p className="text-lg">Error: {uiState.error}</p>
            </div>
            <Link href="/auth/user/dashboard" className="text-blue-400 hover:text-blue-300 transition flex items-center gap-2 group">
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
        <Header user={user} />
        <div className="flex-1 p-8">
          <div className="max-w-5xl mx-auto">
            <div className="bg-yellow-900/40 backdrop-blur-sm border border-yellow-700 text-yellow-100 px-6 py-4 rounded-lg mb-6 shadow-lg">
              <p className="text-lg">Creation not found</p>
            </div>
            <Link href="/auth/user/dashboard" className="text-blue-400 hover:text-blue-300 transition flex items-center gap-2 group">
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-gray-100 flex flex-col">
      <Header user={user} />
      <main className="flex-1 flex flex-col lg:flex-row relative">
        <div className="lg:w-[450px] flex-shrink-0 h-[calc(100vh-64px)] flex flex-col border-r border-gray-800/80 shadow-[1px_0_3px_0_rgba(0,0,0,0.3)]">
          <div className="p-4 lg:p-6 space-y-6 flex-grow overflow-y-auto">
            <div className="flex items-center gap-2">
              <Link
                href="/auth/user/dashboard"
                className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-blue-400 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Link>
            </div>

            {/* Title Area */}
            <h1 className="text-2xl font-bold text-white">
              {creation.title}
            </h1>

            {/* Author Info */}
            <div className="bg-gray-900/70 border border-gray-700/50 rounded-lg p-4 
              shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)] backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <User className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Created by</p>
                  <p className="text-white font-medium">{creation.author || 'Anonymous'}</p>
                </div>
              </div>
            </div>

            {/* Project Details */}
            <div className="space-y-4">
              <div className="bg-gray-900/70 border border-gray-700/50 rounded-lg p-4 
                shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)] backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <p className="text-sm text-gray-400">Created</p>
                </div>
                <p className="text-white">{new Date(creation.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
              </div>

              <div className="bg-gray-900/70 border border-gray-700/50 rounded-lg p-4 
                shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)] backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Code2 className="w-4 h-4 text-purple-400" />
                  <p className="text-sm text-gray-400">Language</p>
                </div>
                <p className="text-white font-medium">{creation.language || 'JavaScript'}</p>
              </div>

              {creation.description && (
                <div className="bg-gray-900/70 border border-gray-700/50 rounded-lg p-4 
                  shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)] backdrop-blur-sm">
                  <p className="text-sm text-gray-400 mb-2">Description</p>
                  <p className="text-white">{creation.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Code Editor Section */}
        <div className="flex-grow flex flex-col h-[calc(100vh-64px)]">
          <div className="p-4 border-b border-gray-800/80 shadow-md bg-gray-900/50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 rounded-lg border border-gray-700/50 shadow-inner">
                <Code2 className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium">{creation.language || 'JavaScript'}</span>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-2">
                {editorState.editError && (
                  <div className="absolute top-16 right-4 p-3 bg-red-900/80 border border-red-700 
                    text-red-200 text-sm rounded-lg shadow-lg backdrop-blur-sm animate-in 
                    fade-in duration-300 max-w-md">
                    {editorState.editError}
                  </div>
                )}
                <button
                  onClick={handleEditToggle}
                  className={`
                    px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200
                    shadow-[0_4px_12px_-2px_rgba(0,0,0,0.4)] backdrop-blur-sm
                    ${editorState.isEditMode
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.2)]'
                      : 'bg-gray-800/90 text-gray-300 border border-gray-700/50'
                    }
                    ${!user ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  disabled={!user}
                >
                  <Edit className="w-4 h-4" />
                  <span>{editorState.isEditMode ? 'Editing' : 'Edit'}</span>
                </button>
              </div>

              {editorState.hasChanges && (
                <button
                  onClick={handleSaveAsNew}
                  disabled={editorState.isSaving}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50 
                    flex items-center gap-2 transition-colors duration-200
                    shadow-[0_4px_12px_-2px_rgba(29,78,216,0.4)] backdrop-blur-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>{editorState.isSaving ? 'Saving...' : 'Save as New'}</span>
                </button>
              )}

              {!editorState.isEditMode && (
                <button
                  onClick={copyToClipboard}
                  disabled={editorState.isCopied}
                  className={`
                    px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200
                    shadow-[0_4px_12px_-2px_rgba(0,0,0,0.4)] backdrop-blur-sm
                    ${editorState.isCopied
                      ? 'bg-green-500/20 text-green-300 border border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.2)]'
                      : 'bg-gray-800/90 text-gray-300 border border-gray-700/50'
                    }
                  `}
                >
                  {editorState.isCopied ? (
                    <><Check className="w-4 h-4" /><span>Copied!</span></>
                  ) : (
                    <><Copy className="w-4 h-4" /><span>Copy Code</span></>
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="flex-grow border-l border-gray-800/80 shadow-[-1px_0_3px_0_rgba(0,0,0,0.3)]">
            <Editor
              height="100%"
              defaultLanguage={creation.language || "javascript"}
              value={editorState.isEditMode ? editorState.editedCode : creation.code}
              onChange={handleCodeChange}
              theme="vs-dark"
              options={{
                readOnly: !editorState.isEditMode,
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                fontSize: 15,
                lineHeight: 1.6,
                padding: { top: 20, bottom: 20 },
                fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
                fontLigatures: true
              }}
              onMount={(editor) => {
                try {
                  setUiState(prev => ({ ...prev, editorReady: true }));
                  editor.layout();
                } catch (error) {
                  setUiState(prev => ({ 
                    ...prev, 
                    error: 'Failed to initialize editor. Please refresh the page.' 
                  }));
                }
              }}
              onError={(error) => {
                setUiState(prev => ({ 
                  ...prev, 
                  error: 'Editor encountered an error. Please refresh the page.' 
                }));
              }}
              className="transition-opacity duration-200"
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
