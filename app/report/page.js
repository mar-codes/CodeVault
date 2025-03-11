'use client';

import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Dropdown from '../components/Dropdown';
import { AlertTriangle, Send, CheckCircle2, Loader2, FileText, BarChart3, Zap, MessageSquare, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReportPage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: '',
        pageUrl: '',
        priority: 'medium'
    });

    // Form validation state
    const [isFormValid, setIsFormValid] = useState({
        step0: false,
        step1: false
    });

    const reportTypes = [
        { value: 'bug', label: 'Bug Report' },
        { value: 'feature', label: 'Feature Request' },
        { value: 'security', label: 'Security Issue' },
        { value: 'content', label: 'Content Issue' },
        { value: 'other', label: 'Other' }
    ];

    const priorities = [
        { value: 'low', label: 'Low Priority' },
        { value: 'medium', label: 'Medium Priority' },
        { value: 'high', label: 'High Priority' },
        { value: 'critical', label: 'Critical Priority' }
    ];

    const pages = [
        { value: '/', label: 'Home Page' },
        { value: '/auth/login', label: 'Login Page' },
        { value: '/auth/signup', label: 'Signup Page' },
        { value: '/lander/explore', label: 'Explore Page' },
        { value: '/auth/user/profile/dashboard', label: 'Dashboard' },
        { value: '/lander/upload', label: 'Upload Page' }
    ];

    // Steps configuration
    const steps = [
        { title: 'Report Type', icon: <Zap className="h-5 w-5" /> },
        { title: 'Details', icon: <MessageSquare className="h-5 w-5" /> },
    ];

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch('/api/auth/me/auth');
                const data = await res.json();
                if (data.success) {
                    setUser(data.user);
                }
            } catch (error) {
                console.error('Auth check failed:', error);
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    // Validate form steps
    useEffect(() => {
        setIsFormValid({
            step0: formData.type !== '' && formData.priority !== '' && formData.pageUrl !== '',
            step1: formData.title.trim() !== '' && formData.description.trim() !== ''
        });
    }, [formData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        
        try {
            const res = await fetch('/api/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    userId: user?._id
                })
            });

            const data = await res.json();
            if (data.success) {
                setSubmitted(true);
                setFormData({
                    title: '',
                    description: '',
                    type: '',
                    pageUrl: '',
                    priority: 'medium'
                });
                setActiveStep(0);
                
                // Reset success message after 5 seconds
                setTimeout(() => {
                    setSubmitted(false);
                }, 5000);
            }
        } catch (error) {
            console.error('Failed to submit report:', error);
            alert('Failed to submit report. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const nextStep = () => {
        if (activeStep < steps.length - 1) {
            setActiveStep(activeStep + 1);
        }
    };

    const prevStep = () => {
        if (activeStep > 0) {
            setActiveStep(activeStep - 1);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 flex flex-col">
                <Header user={null} />
                <main className="flex-grow flex items-center justify-center">
                    <div className="flex flex-col items-center space-y-4 p-8 rounded-2xl bg-gray-800/30 backdrop-blur-lg border border-gray-700/50 shadow-lg shadow-blue-500/5">
                        <div className="w-10 h-10 border-t-2 border-r-2 border-blue-400 rounded-full animate-spin"></div>
                        <span className="text-lg font-medium bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">
                            Loading...
                        </span>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 flex flex-col">
            <Header user={user} />

            <main className="flex-grow container mx-auto px-4 py-6 md:py-8 flex items-center">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-6xl mx-auto"
                >
                    <AnimatePresence mode="wait">
                        {submitted ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ type: "spring", damping: 20 }}
                                className="bg-gradient-to-br from-blue-600/20 via-blue-600/10 to-indigo-600/20 rounded-2xl shadow-xl border border-blue-500/30 p-8 text-center max-w-xl mx-auto"
                            >
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                                    className="flex justify-center mb-6"
                                >
                                    <CheckCircle2 className="w-16 h-16 text-green-400" />
                                </motion.div>
                                <h2 className="text-2xl font-bold text-white mb-2">Report Submitted Successfully!</h2>
                                <p className="text-gray-300 mb-6">Thank you for helping us improve CodeVault.</p>
                                <button 
                                    onClick={() => setSubmitted(false)}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg shadow-blue-700/20"
                                >
                                    Submit Another Report
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                            >
                                {/* Sidebar with progress steps */}
                                <div className="lg:col-span-4 xl:col-span-3">
                                    <div className="sticky top-24 bg-gradient-to-br from-gray-800/50 via-gray-800/30 to-gray-900/50 rounded-2xl shadow-xl border border-gray-700/50 p-6">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-2 bg-blue-600/20 rounded-lg">
                                                <FileText className="h-6 w-6 text-blue-400" />
                                            </div>
                                            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 text-transparent bg-clip-text">
                                                Submit a Report
                                            </h1>
                                        </div>
                                        
                                        <div className="space-y-2 mb-6">
                                            {steps.map((step, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => setActiveStep(index)}
                                                    className={`w-full flex items-center p-3 rounded-lg transition-all ${
                                                        activeStep === index
                                                            ? 'bg-blue-600/20 border border-blue-500/30 text-white'
                                                            : 'text-gray-400 hover:bg-gray-800/50'
                                                    }`}
                                                >
                                                    <div className={`flex items-center justify-center h-8 w-8 rounded-full mr-3 ${
                                                        activeStep === index ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'
                                                    }`}>
                                                        {index + 1}
                                                    </div>
                                                    <span className="flex items-center gap-2">
                                                        {step.icon}
                                                        {step.title}
                                                    </span>
                                                    {isFormValid[`step${index}`] && (
                                                        <CheckCircle2 className="h-4 w-4 ml-auto text-green-400" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                        
                                        {!user && (
                                            <div className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg backdrop-blur-sm">
                                                <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                                                <p className="text-sm text-yellow-200">
                                                    You are not logged in. Your report will be submitted anonymously.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Main form content */}
                                <div className="lg:col-span-8 xl:col-span-9">
                                    <form onSubmit={handleSubmit} className="h-full flex flex-col">
                                        <div className="bg-gradient-to-br from-gray-800/40 via-gray-800/20 to-gray-900/40 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 p-6">
                                            <AnimatePresence mode="wait">
                                                {activeStep === 0 && (
                                                    <motion.div
                                                        key="step0"
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: 20 }}
                                                        transition={{ duration: 0.3 }}
                                                        className="space-y-6"
                                                    >
                                                        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                                            <Zap className="h-5 w-5 text-blue-400" />
                                                            Report Classification
                                                        </h2>
                                                        
                                                        <div className="grid gap-6 md:grid-cols-2">
                                                            <div className="space-y-2">
                                                                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                                                                    <Zap className="h-4 w-4 mr-2 text-blue-400" />
                                                                    Report Type
                                                                </label>
                                                                <Dropdown
                                                                    options={reportTypes}
                                                                    value={formData.type}
                                                                    onChange={(value) => setFormData({ ...formData, type: value })}
                                                                    placeholder="Select report type"
                                                                    className="backdrop-blur-sm"
                                                                />
                                                            </div>

                                                            <div className="space-y-2">
                                                                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                                                                    <BarChart3 className="h-4 w-4 mr-2 text-blue-400" />
                                                                    Priority Level
                                                                </label>
                                                                <Dropdown
                                                                    options={priorities}
                                                                    value={formData.priority}
                                                                    onChange={(value) => setFormData({ ...formData, priority: value })}
                                                                    placeholder="Select priority"
                                                                    className="backdrop-blur-sm"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                                                                <MapPin className="h-4 w-4 mr-2 text-blue-400" />
                                                                Related Page
                                                            </label>
                                                            <Dropdown
                                                                options={pages}
                                                                value={formData.pageUrl}
                                                                onChange={(value) => setFormData({ ...formData, pageUrl: value })}
                                                                placeholder="Select related page"
                                                                className="backdrop-blur-sm"
                                                            />
                                                        </div>
                                                    </motion.div>
                                                )}

                                                {activeStep === 1 && (
                                                    <motion.div
                                                        key="step1"
                                                        initial={{ opacity: 0, x: 20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: -20 }}
                                                        transition={{ duration: 0.3 }}
                                                        className="space-y-6"
                                                    >
                                                        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                                            <MessageSquare className="h-5 w-5 text-blue-400" />
                                                            Report Details
                                                        </h2>
                                                        
                                                        <div className="space-y-2">
                                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                                Title
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={formData.title}
                                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                                className="w-full px-4 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all"
                                                                placeholder="Brief description of the issue"
                                                                required
                                                            />
                                                        </div>

                                                        <div className="space-y-2">
                                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                                Detailed Description
                                                            </label>
                                                            <textarea
                                                                value={formData.description}
                                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                                rows={8}
                                                                className="w-full px-4 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all"
                                                                placeholder="Please provide as much detail as possible..."
                                                                required
                                                            />
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                            
                                            <div className="flex justify-between mt-8 pt-6 border-t border-gray-700/50">
                                                {activeStep > 0 ? (
                                                    <button
                                                        type="button"
                                                        onClick={prevStep}
                                                        className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all duration-200 flex items-center gap-2"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                        </svg>
                                                        Back
                                                    </button>
                                                ) : (
                                                    <div></div>
                                                )}

                                                {activeStep === steps.length - 1 ? (
                                                    <motion.button
                                                        type="submit"
                                                        disabled={submitting || !isFormValid.step1}
                                                        className={`flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg shadow-blue-900/30 disabled:opacity-70 ${
                                                            !isFormValid.step1 ? 'cursor-not-allowed' : ''
                                                        }`}
                                                        whileHover={isFormValid.step1 ? { scale: 1.02 } : {}}
                                                        whileTap={isFormValid.step1 ? { scale: 0.98 } : {}}
                                                    >
                                                        {submitting ? (
                                                            <>
                                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                                <span>Submitting...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Send className="h-5 w-5" />
                                                                <span>Submit Report</span>
                                                            </>
                                                        )}
                                                    </motion.button>
                                                ) : (
                                                    <motion.button
                                                        type="button"
                                                        onClick={nextStep}
                                                        disabled={!isFormValid.step0}
                                                        className={`flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg shadow-blue-900/30 disabled:opacity-70 ${
                                                            !isFormValid.step0 ? 'cursor-not-allowed' : ''
                                                        }`}
                                                        whileHover={isFormValid.step0 ? { scale: 1.02 } : {}}
                                                        whileTap={isFormValid.step0 ? { scale: 0.98 } : {}}
                                                    >
                                                        Continue
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </motion.button>
                                                )}
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        className="mt-6 text-center text-sm text-gray-500"
                    >
                        <p>
                            We take all reports seriously and will address them as soon as possible.
                        </p>
                    </motion.div>
                </motion.div>
            </main>

            <Footer />
        </div>
    );
}
