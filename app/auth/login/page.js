"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LockKeyhole, Mail, LogIn, AlertCircle, Code2, Github, Chrome } from 'lucide-react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userRes = await fetch('/api/auth/me/auth');
        const userData = await userRes.json();

        if (!userData.success) {
          router.push('/auth/login');
          return;
        }

        setUser(userData.user);
        const userId = userData.user._id;
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

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      router.push('/auth/user/profile/dashboard');
      router.refresh();
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
          {/* Glowing background effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-violet-500/20 blur-3xl opacity-10 -z-10" />

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-blue-600/30 to-violet-600/30 rounded-xl mb-6">
              <Code2 className="h-8 w-8 text-blue-400" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-200 to-violet-300 text-transparent bg-clip-text mb-3">
              Welcome Back
            </h1>
            <p className="text-gray-400 text-sm sm:text-base">
              Continue your coding journey with CodeVault
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
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      <div className="h-5 w-5 border-2 border-gray-600 rounded group-hover:border-gray-500 peer-checked:border-blue-500 peer-checked:bg-blue-500/20 transition-all duration-200"></div>
                      <div className="absolute inset-0 flex items-center justify-center text-blue-400 opacity-0 peer-checked:opacity-100 transition-opacity">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">Remember me</span>
                  </label>

                  <Link href="/auth/login/forgot" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                    Forgot password?
                  </Link>
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
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Sign in</span>
                    </>
                  )}
                </div>
              </button>
            </form>

            <div className="border-t border-gray-800 p-6 sm:p-8 text-center bg-gray-900/50">
              <p className="text-sm text-gray-400">
                Don&apos;t have an account?{' '}
                <Link
                  href="/auth/signup"
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  Create one now
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
