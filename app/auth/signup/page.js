"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, LockKeyhole, AlertCircle, Code2, UserPlus, LogIn } from 'lucide-react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userRes = await fetch('/api/auth/me/auth');
        const userData = await userRes.json();

        setUser(userData.user);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      router.push('/auth/login');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950">
      <Header user={user}/>

      <main className="flex-grow flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-violet-500/20 blur-3xl opacity-10 -z-10" />

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-blue-600/30 to-violet-600/30 rounded-xl mb-6">
              <Code2 className="h-8 w-8 text-blue-400" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-200 to-violet-300 text-transparent bg-clip-text mb-3">
              Create Account
            </h1>
            <p className="text-gray-400 text-sm sm:text-base">
              Join CodeVault to store and share your code snippets
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-lg p-4 mb-6">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-200">{error}</p>
              </div>
            </div>
          )}

          <div className="bg-gradient-to-br from-gray-800/50 via-gray-900/50 to-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/30">
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
              <div className="space-y-5">
                <div>
                  <label htmlFor="username" className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                    <User className="h-4 w-4 text-blue-400" />
                    <span>Username</span>
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-900/70 border border-gray-700/50 focus:border-blue-500/50 rounded-lg text-gray-200 placeholder-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Choose a username"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                    <Mail className="h-4 w-4 text-blue-400" />
                    <span>Email address</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-900/70 border border-gray-700/50 focus:border-blue-500/50 rounded-lg text-gray-200 placeholder-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="name@example.com"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                    <LockKeyhole className="h-4 w-4 text-blue-400" />
                    <span>Password</span>
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-900/70 border border-gray-700/50 focus:border-blue-500/50 rounded-lg text-gray-200 placeholder-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Create a password (min. 6 characters)"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                    <LockKeyhole className="h-4 w-4 text-blue-400" />
                    <span>Confirm Password</span>
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-900/70 border border-gray-700/50 focus:border-blue-500/50 rounded-lg text-gray-200 placeholder-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Confirm your password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="relative w-full group flex items-center justify-center"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-violet-600 rounded-lg blur opacity-60 group-hover:opacity-70 transition-opacity"></div>
                <div className="relative w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white px-6 py-2.5 rounded-lg font-medium shadow-xl shadow-blue-900/20 hover:shadow-blue-900/30 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50">
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white/70" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Create Account</span>
                    </>
                  )}
                </div>
              </button>
            </form>

            <div className="border-t border-gray-800 p-6 sm:p-8 text-center bg-gray-900/50">
              <p className="text-sm text-gray-400">
                Already have an account?{' '}
                <Link
                  href="/auth/login"
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  Sign in now
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
