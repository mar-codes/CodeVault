'use client';

import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { FiSave, FiTrash2, FiGlobe, FiLock, FiHash, FiCode, FiPlus, FiEye } from 'react-icons/fi';
import { AlertTriangle, X } from 'lucide-react';
import Dropdown from '@/app/components/Dropdown';
import availableTags from '@/app/utils/Tags';
import { detectLanguage } from '@/app/utils/languageUtils';
import Loading from '@/app/components/Loading';

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
  const [selectedTags, setSelectedTags] = useState([]);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const tagInputRef = useRef(null);
  const editorRef = useRef(null);

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

  const tagOptions = availableTags.map(tag => ({
    value: tag,
    label: tag,
    icon: <FiHash className="w-4 h-4" />
  }));

  const dropdownRef = useRef(null);
  const confirmDialogRef = useRef(null);
  const params = useParams();
  const router = useRouter();

  // Filter available tags based on input
  const filteredTags = availableTags.filter(tag => 
    tag.toLowerCase().includes(tagInput.toLowerCase()) && 
    !formData.tags?.includes(tag)
  );

  const handleTagSelection = (tag) => {
    if (!formData.tags?.includes(tag) && (!formData.tags || formData.tags.length < 5)) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tag]
      }));
    }
  };

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

      router.push(`/creation/${params.id}`);
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

        router.push('/auth/user/dashboard');
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

  const handleCodeChange = (value) => {
    if (!formData.language) { // Only detect if no language is set
      const detectedLanguage = detectLanguage(value);
      setFormData(prev => ({
        ...prev,
        code: value,
        language: detectedLanguage
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        code: value
      }));
    }
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    if (formData.language) {
      monaco.editor.setModelLanguage(editor.getModel(), formData.language);
    }
  };

  if (loading) {
    return (
      <Loading />
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
              href="/auth/user/dashboard" 
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


  const PreviewModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 p-6 rounded-xl border border-gray-700 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-100">Preview Changes</h3>
          <button
            onClick={() => setShowPreview(false)}
            className="p-2 rounded-lg hover:bg-gray-700/50 text-gray-400 hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-6">
          <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
            <h4 className="text-sm font-medium text-gray-400 mb-2">Title</h4>
            <p className="text-lg text-gray-200">{formData.title || 'Untitled Project'}</p>
          </div>
          <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
            <h4 className="text-sm font-medium text-gray-400 mb-2">Description</h4>
            <p className="text-gray-200">{formData.description || 'No description provided'}</p>
          </div>
          <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
            <h4 className="text-sm font-medium text-gray-400 mb-2">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {formData.tags?.map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
            <h4 className="text-sm font-medium text-gray-400 mb-2">Code</h4>
            <pre className="p-4 bg-gray-900 rounded-lg overflow-x-auto">
              <code className="text-gray-200 font-mono">{formData.code}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950">
      <Header user={user} />

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Project Header Card - Enhanced */}
        <div className="bg-gradient-to-br from-gray-800/50 via-gray-900/50 to-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/30 p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-4 flex-1">
              <div className="relative group">
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Project Title"
                  className="text-3xl font-bold bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded-lg px-2 py-1 w-full text-gray-100 transition-all"
                />
                <div className="absolute inset-0 border border-transparent group-hover:border-gray-700/50 rounded-lg pointer-events-none"></div>
              </div>
              
              <div className="flex flex-wrap items-center gap-4">
                <Dropdown
                  options={[
                    { value: 'public', label: 'Public', icon: <FiGlobe className="w-4 h-4" /> },
                    { value: 'private', label: 'Private', icon: <FiLock className="w-4 h-4" /> }
                  ]}
                  value={formData.privacy}
                  onChange={(value) => setFormData(prev => ({ ...prev, privacy: value }))}
                  className="w-36"
                />
                <div className="flex items-center gap-6">
                  <span className="flex items-center gap-2 text-gray-400 bg-gray-800/40 px-3 py-1.5 rounded-lg">
                    <FiCode className="w-4 h-4" />
                    <span className="text-sm">{formData.metadata?.lines || 0} lines</span>
                  </span>
                  <span className="flex items-center gap-2 text-gray-400 bg-gray-800/40 px-3 py-1.5 rounded-lg">
                    <FiHash className="w-4 h-4" />
                    <span className="text-sm">{formData.tags?.length || 0} tags</span>
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setConfirmDelete(true)}
                className="group px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all flex items-center gap-2 relative overflow-hidden"
              >
                <FiTrash2 className="relative z-10" />
                <span className="relative z-10">Delete</span>
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
              </button>
              <button
                onClick={handleSubmit}
                className="group px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all flex items-center gap-2 relative overflow-hidden"
              >
                <FiSave className="relative z-10" />
                <span className="relative z-10">Save Changes</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area - Enhanced Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Code Editor Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gradient-to-br from-gray-800/50 via-gray-900/50 to-gray-800/50 backdrop-blur-xl rounded-xl shadow-xl border border-gray-700/30 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-700/30">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-8 bg-blue-500/50 rounded-full"></span>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-100">Code Editor</h2>
                    <p className="text-sm text-gray-400">Write or paste your code below</p>
                  </div>
                </div>
                <Dropdown
                  options={languageOptions}
                  value={formData.language}
                  onChange={(value) => setFormData(prev => ({ ...prev, language: value }))}
                  className="w-40"
                />
              </div>
              <div className="h-[500px] relative">
                <Suspense fallback={
                  <div className="w-full h-full flex items-center justify-center bg-gray-900/50">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                }>
                  <Editor
                    height="100%"
                    theme="vs-dark"
                    defaultLanguage={formData.language}
                    language={formData.language}
                    value={formData.code}
                    onChange={handleCodeChange}
                    onMount={handleEditorDidMount}
                    options={{
                      fontSize: 14,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      padding: { top: 16, bottom: 16 },
                      lineNumbers: 'on',
                      roundedSelection: true,
                      wordWrap: 'on'
                    }}
                    className="border-0"
                  />
                </Suspense>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-gray-800/50 via-gray-900/50 to-gray-800/50 backdrop-blur-xl rounded-xl shadow-xl border border-gray-700/30 p-6">
              <h2 className="text-xl font-semibold text-gray-100 mb-4">Description</h2>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full h-32 bg-gray-900/50 border border-gray-700 rounded-lg p-4 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder="Describe your project..."
              />
            </div>

            <div className="bg-gradient-to-br from-gray-800/50 via-gray-900/50 to-gray-800/50 backdrop-blur-xl rounded-xl shadow-xl border border-gray-700/30 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-100">Tags</h2>
                <span className="text-sm text-gray-400">
                  {formData.tags?.length || 0}/5 tags
                </span>
              </div>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {formData.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 flex items-center gap-2 group hover:bg-blue-500/20 transition-colors"
                    >
                      {tag}
                      <button
                        onClick={() => setFormData(prev => ({ 
                          ...prev, 
                          tags: prev.tags.filter(t => t !== tag) 
                        }))}
                        className="hover:text-blue-300 group-hover:opacity-100 opacity-50 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
                
                {(!formData.tags || formData.tags.length < 5) && (
                  <Dropdown
                    options={tagOptions.filter(opt => !formData.tags?.includes(opt.value))}
                    value=""
                    onChange={(value) => handleTagSelection(value)}
                    placeholder="Add tags..."
                    className="w-full"
                  />
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-800/50 via-gray-900/50 to-gray-800/50 backdrop-blur-xl rounded-xl shadow-xl border border-gray-700/30 p-6">
              <h2 className="text-xl font-semibold text-gray-100 mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Link
                  href={`/creation/${params.id}`}
                  className="w-full px-4 py-3 rounded-lg bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 transition-colors flex items-center justify-between group"
                >
                  <span>View Project</span>
                  <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </Link>
                <button
                  onClick={() => setShowPreview(true)}
                  className="w-full px-4 py-3 rounded-lg bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 transition-colors flex items-center justify-between group"
                >
                  <span className="flex items-center gap-2">
                    <FiEye className="w-4 h-4" />
                    Preview Changes
                  </span>
                  <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 p-6 rounded-xl border border-gray-700 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-100 mb-4">Delete Project?</h3>
            <p className="text-gray-300 mb-6">This action cannot be undone. Are you sure you want to delete this project?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 rounded-lg bg-gray-700/50 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showPreview && <PreviewModal />}
      
      <Footer />
    </div>
  );
}
