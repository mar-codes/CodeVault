"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../auth.module.css'
import { LockKeyhole, Mail, LogIn, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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

      router.push('/auth/dashboard');
      router.refresh();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center mb-10 space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-blue-600/30 rounded-full mb-3 shadow-lg shadow-blue-500/10">
            <LogIn className="h-9 w-9 text-blue-400" />
          </div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-500 tracking-tight">
            Welcome Back
          </h1>
          <p className="text-md text-gray-400 max-w-sm mx-auto">
            Sign in to continue to your CodeVault account
          </p>
        </div>

        {error && (
          <div className="bg-red-900/30 border-l-4 border-red-500 text-red-200 p-4 rounded-lg mb-6 flex items-start">
            <AlertCircle className="h-5 w-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        <div className="bg-gray-800 shadow-lg rounded-lg overflow-hidden border border-gray-700">
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-5">
              <div>
                <label htmlFor="email" className="flex items-center gap-1.5 text-sm font-medium text-gray-300 mb-2">
                  <Mail className="h-4 w-4 text-blue-400" />
                  <span>Email</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-700 rounded-lg shadow-sm placeholder-gray-500 bg-gray-900 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="flex items-center gap-1.5 text-sm font-medium text-gray-300 mb-2">
                  <LockKeyhole className="h-4 w-4 text-blue-400" />
                  <span>Password</span>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-700 rounded-lg shadow-sm placeholder-gray-500 bg-gray-900 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Enter your password"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <button 
                type="submit" 
                className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-70"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 border-t-2 border-blue-200 border-solid rounded-full animate-spin mr-2"></div>
                    Logging in...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="px-8 py-5 bg-gray-900 text-center">
            <p className="text-sm text-gray-400">
              Don&apos;t have an account? <Link href="/auth/signup" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">Sign up</Link>
            </p>
          </div>
        </div>
        
        <div className="text-center text-xs text-gray-500 pt-4">
          <p>Secure login powered by CodeVault</p>
        </div>
      </div>
    </div>
  );
}
