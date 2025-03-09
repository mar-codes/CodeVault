'use client';

import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

// Lazy load the Editor component
const Editor = lazy(() => import('@monaco-editor/react'));

export default function EditCreation() {
  const [user, setUser] = useState(null);
  const [creation, setCreation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    code: '',
    language: ''
  });
  const [mounted, setMounted] = useState(false);
  
  const languageOptions = [
    { value: 'javascript', label: 'JavaScript', icon: 'js' },
    { value: 'typescript', label: 'TypeScript', icon: 'ts' },
    { value: 'python', label: 'Python', icon: 'py' },
    { value: 'java', label: 'Java', icon: 'java' },
    { value: 'csharp', label: 'C#', icon: 'cs' },
    { value: 'cpp', label: 'C++', icon: 'cpp' },
    { value: 'php', label: 'PHP', icon: 'php' },
    { value: 'ruby', label: 'Ruby', icon: 'rb' },
    { value: 'swift', label: 'Swift', icon: 'swift' },
    { value: 'go', label: 'Go', icon: 'go' },
  ];

  const dropdownRef = useRef(null);
  const confirmDialogRef = useRef(null);
  const params = useParams();
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (confirmDialogRef.current && !confirmDialogRef.current.contains(event.target) && confirmDelete) {
        setConfirmDelete(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownRef, confirmDialogRef, confirmDelete]);

  useEffect(() => {
    const fetchCreation = async () => {
      try {
        const sessionRes = await fetch('/api/auth/session');
        const sessionData = await sessionRes.json();

        if (!sessionData.user) {
          router.push('/auth/login');
          return;
        }
        
        setUser(sessionData.user);
        const authToken = document.cookie.split('auth_token=')[1]?.split(';')[0];

        const creationRes = await fetch(`/api/creations/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        
        if (!creationRes.ok) {
          throw new Error('Failed to fetch creation');
        }
        
        const data = await creationRes.json();
        setCreation(data.creation);
        setFormData(prev => ({
          ...prev,
          title: data.creation.title,
          description: data.creation.description || '',
          code: data.creation.code,
          language: data.creation.language || 'javascript'
        }));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchCreation();
    }
  }, [params.id, router]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Add scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (dropdownOpen) {
        setDropdownOpen(false);
      }
    };

    const handleResize = () => {
      if (dropdownOpen) {
        setDropdownOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [dropdownOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const authToken = document.cookie.split('auth_token=')[1]?.split(';')[0];
      const res = await fetch(`/api/creations/${params.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update creation');
      }

      router.push(`/auth/creation/${params.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (confirmDelete) {
      setDeleting(true);
      try {
        const res = await fetch(`/api/creations/${params.id}`, {
          method: 'DELETE',
        });

        if (!res.ok) throw new Error('Failed to delete creation');

        router.push('/auth/dashboard');
      } catch (err) {
        setError(err.message);
      } finally {
        setDeleting(false);
        setConfirmDelete(false);
      }
    } else {
      setConfirmDelete(true);
    }
  };

  const getLanguageIcon = (language) => {
    const option = languageOptions.find(opt => opt.value === language);
    return option ? option.icon : 'code';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col">
        <Header user={user} />
        <div className="flex-1 flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-6 text-gray-300 text-lg font-medium">Loading your creation...</p>
            <p className="text-gray-400 mt-2">Just a moment while we fetch your masterpiece</p>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col">
        <Header user={user} />
        <div className="flex-1 p-8 flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl w-full"
          >
            <div className="bg-red-900/40 backdrop-blur-sm border border-red-700 text-red-100 px-6 py-8 rounded-lg mb-6 shadow-lg">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-red-800/80 rounded-full p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">Something went wrong</h3>
              </div>
              <p className="text-lg ml-12">{error}</p>
            </div>
            <Link 
              href="/auth/dashboard" 
              className="text-blue-400 hover:text-blue-300 transition flex items-center gap-2 group font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  const renderLanguageDropdown = () => (
    <div className="group">
      <label htmlFor="language" className="block text-sm font-medium text-gray-300 mb-2">
        Language
      </label>
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white hover:border-gray-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all outline-none flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-800 rounded text-xs font-medium">
              {getLanguageIcon(formData.language)}
            </span>
            <span>
              {languageOptions.find(opt => opt.value === formData.language)?.label || 'Select language'}
            </span>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {dropdownOpen && (
          <div 
            className="absolute left-0 right-0 mt-2 py-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-60 overflow-auto scrollbar-thin scrollbar-thumb-gray-600 z-50"
          >
            {languageOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`px-4 py-2 text-left w-full hover:bg-gray-700/70 flex items-center gap-2 ${
                  formData.language === option.value ? 'bg-blue-900/30 text-blue-300' : 'text-white'
                }`}
                onClick={() => {
                  setFormData(prev => ({ ...prev, language: option.value }));
                  setDropdownOpen(false);
                }}
              >
                <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-700 rounded text-xs font-medium">
                  {option.icon}
                </span>
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col overflow-x-hidden">
      <Header user={user} />
      <main className="flex-1 w-full p-4 md:p-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-5xl mx-auto"
        >
          <div className="flex items-center justify-between mb-8">
            <Link 
              href={`/auth/creation/${params.id}`}
              className="text-blue-400 hover:text-blue-300 transition flex items-center gap-2 group font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Creation
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-xl p-8 border border-gray-700/50"
            >
              <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                <span className="text-blue-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </span>
                Edit Creation
              </h1>
              
              <div className="space-y-6">
                <div className="group">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2 group-focus-within:text-blue-400 transition-colors">
                    Title
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all outline-none shadow-sm"
                      required
                      placeholder="My awesome code snippet"
                    />
                  </div>
                </div>

                <div className="group">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2 group-focus-within:text-blue-400 transition-colors">
                    Description
                  </label>
                  <div className="relative">
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all outline-none shadow-sm resize-none"
                      placeholder="Add a description of what your code does..."
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                      {formData.description.length} characters
                    </div>
                  </div>
                </div>

                {renderLanguageDropdown()}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-gray-700/50 overflow-hidden"
            >
              <div className="p-5 border-b border-gray-700 flex items-center justify-between">
                <label htmlFor="code" className="text-xl font-semibold text-blue-300 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  Code
                </label>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span className="inline-flex items-center justify-center h-6 px-2 bg-gray-700 rounded text-xs font-medium">
                    {formData.language}
                  </span>
                </div>
              </div>
              <div className="h-[500px] border-t border-gray-700/50">
                <Suspense fallback={
                  <div className="flex items-center justify-center h-full bg-gray-900">
                    <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                }>
                  <Editor
                    height="100%"
                    language={formData.language}
                    value={formData.code}
                    onChange={(value) => setFormData(prev => ({ ...prev, code: value }))}
                    theme="vs-dark"
                    options={{
                      fontSize: 15,
                      lineHeight: 1.6,
                      minimap: { enabled: false }, // Disable minimap for better performance
                      scrollbar: {
                        vertical: 'visible',
                        horizontal: 'visible',
                      },
                      automaticLayout: true,
                      wordWrap: 'on',
                      padding: { top: 15 },
                      lineNumbers: 'on',
                      glyphMargin: false,
                      renderWhitespace: 'none', // Disable whitespace rendering
                      bracketPairColorization: { enabled: false }, // Disable bracket pair colorization
                      smoothScrolling: true,
                    }}
                    loading={null} // Remove loading state as we're using Suspense
                  />
                </Suspense>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="flex items-center justify-between"
            >
              <div className="relative">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-6 py-3 bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition flex items-center gap-2 disabled:opacity-50 relative overflow-hidden group"
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-red-300 border-t-transparent rounded-full animate-spin"></div>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete Creation
                    </>
                  )}
                  <span className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/20 to-red-500/0 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
                </button>

                <AnimatePresence>
                  {confirmDelete && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      transition={{ duration: 0.2 }}
                      ref={confirmDialogRef}
                      className="absolute top-full left-0 mt-2 p-4 bg-gray-800 border border-red-500/30 rounded-lg shadow-xl z-10 w-80"
                    >
                      <div className="flex items-start gap-3">
                        <div className="bg-red-500/20 p-2 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium text-white">Confirm deletion</h4>
                          <p className="text-sm text-gray-300 mt-1">This action cannot be undone. Are you sure?</p>
                          <div className="mt-4 flex gap-2">
                            <button
                              type="button"
                              onClick={() => setConfirmDelete(false)}
                              className="px-3 py-2 bg-gray-700 text-gray-200 rounded hover:bg-gray-600 transition-colors text-sm"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={handleDelete}
                              className="px-3 py-2 bg-red-500/30 text-red-200 rounded hover:bg-red-500/50 transition-colors text-sm font-medium"
                            >
                              Yes, delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center gap-4">
                <Link
                  href={`/auth/creation/${params.id}`}
                  className="px-6 py-3 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-700/70 transition"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition flex items-center gap-2 disabled:opacity-50 relative overflow-hidden group"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-blue-300 border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      </svg>
                      <span>Save Changes</span>
                    </>
                  )}
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/20 to-blue-500/0 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
                </button>
              </div>
            </motion.div>
          </form>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
