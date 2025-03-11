'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mail, Lock, CheckCircle, AlertCircle, KeyRound } from 'lucide-react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [user, setUser] = useState(null);

    const router = useRouter();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { 
                duration: 0.5,
                when: "beforeChildren",
                staggerChildren: 0.1
            }
        },
        exit: {
            opacity: 0,
            transition: { duration: 0.3 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { 
            y: 0, 
            opacity: 1,
            transition: { duration: 0.5 }
        }
    };

    const requestResetCode = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/login/forgot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            setSuccess('Reset code sent to your email. Please check your inbox.');
            setStep(2);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const verifyCode = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/login/forgot', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code: verificationCode }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to verify code');
            }

            setSuccess('Code verified successfully');
            setStep(3);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters long');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/auth/login/forgot', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password: newPassword }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to reset password');
            }

            setSuccess('Password reset successfully');
            setTimeout(() => {
                router.push('/auth/login');
            }, 2000);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };
    
    const getStepTitle = () => {
        switch(step) {
            case 1:
                return 'Reset your password';
            case 2:
                return 'Enter verification code';
            case 3:
                return 'Create new password';
            default:
                return 'Reset your password';
        }
    }
    
    const getStepProgress = () => {
        return (step / 3) * 100;
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 overflow-x-hidden">
            <Header user={user} />
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
                <div className="max-w-md mx-auto">
                    <motion.div 
                        className="bg-gradient-to-br from-gray-800/50 via-gray-900/50 to-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/30 p-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* Progress bar and step indicator */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-200 to-indigo-300 text-transparent bg-clip-text">
                                    {getStepTitle()}
                                </h2>
                                <span className="text-sm text-gray-400">Step {step} of 3</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                <motion.div 
                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                                    initial={{ width: `${((step-1)/3) * 100}%` }}
                                    animate={{ width: `${getStepProgress()}%` }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>
                        </div>

                        {/* Go back button */}
                        {step > 1 && (
                            <motion.button
                                onClick={() => setStep(step - 1)}
                                className="flex items-center text-sm text-gray-400 hover:text-blue-400 transition-colors mb-6"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                <ArrowLeft className="h-4 w-4 mr-1" />
                                Back to previous step
                            </motion.button>
                        )}

                        {/* Alert messages */}
                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div 
                                    className="bg-red-900/20 border border-red-700/50 p-4 rounded-xl backdrop-blur-lg mb-6"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="flex items-center">
                                        <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                                        <span className="text-sm text-red-300">{error}</span>
                                    </div>
                                </motion.div>
                            )}

                            {success && (
                                <motion.div 
                                    className="bg-green-900/20 border border-green-700/50 p-4 rounded-xl backdrop-blur-lg mb-6"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="flex items-center">
                                        <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                                        <span className="text-sm text-green-300">{success}</span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Step 1 - Request Reset Code */}
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.form 
                                    className="space-y-5" 
                                    onSubmit={requestResetCode}
                                    key="step1"
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                >
                                    <motion.div variants={itemVariants}>
                                        <label htmlFor="email-address" className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Mail className="h-5 w-5 text-gray-500" />
                                            </div>
                                            <input
                                                id="email-address"
                                                name="email"
                                                type="email"
                                                autoComplete="email"
                                                required
                                                className="appearance-none pl-10 block w-full px-3 py-3 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800/50 text-gray-300 placeholder-gray-500"
                                                placeholder="Enter your email address"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </div>
                                        <p className="mt-2 text-sm text-gray-400">We'll send a verification code to this email</p>
                                    </motion.div>

                                    <motion.div variants={itemVariants}>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 disabled:opacity-60"
                                        >
                                            {loading ? 'Sending...' : 'Send Reset Code'}
                                        </button>
                                    </motion.div>

                                    <motion.div variants={itemVariants} className="text-center">
                                        <Link href="/auth/login" className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">
                                            Return to login
                                        </Link>
                                    </motion.div>
                                </motion.form>
                            )}

                            {/* Step 2 - Verify Code */}
                            {step === 2 && (
                                <motion.form 
                                    className="space-y-5" 
                                    onSubmit={verifyCode}
                                    key="step2"
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                >
                                    <motion.div variants={itemVariants}>
                                        <label htmlFor="verification-code" className="block text-sm font-medium text-gray-300 mb-2">Verification Code</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <KeyRound className="h-5 w-5 text-gray-500" />
                                            </div>
                                            <input
                                                id="verification-code"
                                                name="code"
                                                type="text"
                                                required
                                                className="appearance-none pl-10 block w-full px-3 py-3 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800/50 text-gray-300 placeholder-gray-500"
                                                placeholder="Enter 6-digit code"
                                                pattern="\d{6}"
                                                value={verificationCode}
                                                onChange={(e) => setVerificationCode(e.target.value)}
                                            />
                                        </div>
                                        <p className="mt-2 text-sm text-gray-400">Enter the 6-digit code we sent to {email}</p>
                                    </motion.div>

                                    <motion.div variants={itemVariants}>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 disabled:opacity-60"
                                        >
                                            {loading ? 'Verifying...' : 'Verify Code'}
                                        </button>
                                    </motion.div>
                                </motion.form>
                            )}

                            {/* Step 3 - Reset Password */}
                            {step === 3 && (
                                <motion.form 
                                    className="space-y-5" 
                                    onSubmit={resetPassword}
                                    key="step3"
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                >
                                    <motion.div variants={itemVariants}>
                                        <label htmlFor="new-password" className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Lock className="h-5 w-5 text-gray-500" />
                                            </div>
                                            <input
                                                id="new-password"
                                                name="password"
                                                type="password"
                                                required
                                                className="appearance-none pl-10 block w-full px-3 py-3 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800/50 text-gray-300 placeholder-gray-500"
                                                placeholder="Create new password"
                                                minLength={8}
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                            />
                                        </div>
                                        <p className="mt-2 text-sm text-gray-400">Password must be at least 8 characters</p>
                                    </motion.div>

                                    <motion.div variants={itemVariants}>
                                        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Lock className="h-5 w-5 text-gray-500" />
                                            </div>
                                            <input
                                                id="confirm-password"
                                                name="confirmPassword"
                                                type="password"
                                                required
                                                className="appearance-none pl-10 block w-full px-3 py-3 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800/50 text-gray-300 placeholder-gray-500"
                                                placeholder="Confirm your password"
                                                minLength={8}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                            />
                                        </div>
                                    </motion.div>

                                    <motion.div variants={itemVariants}>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 disabled:opacity-60"
                                        >
                                            {loading ? 'Resetting...' : 'Reset Password'}
                                        </button>
                                    </motion.div>
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </main>
            
            <Footer />
        </div>
    );
}