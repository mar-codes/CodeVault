"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../auth.module.css';
import { User, Mail, Lock, AlertTriangle, UserPlus, LogIn, ArrowRight } from 'lucide-react';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-gray-800 shadow-lg rounded-lg overflow-hidden border border-gray-700">
        <div className="px-8 pt-8 pb-6 flex flex-col items-center border-b border-gray-700">
          <div className="inline-flex items-center justify-center p-3 bg-blue-600/30 rounded-full mb-4 shadow-lg shadow-blue-500/10">
            <UserPlus className="h-7 w-7 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-500 tracking-tight">
            Create Account
          </h1>
          <p className="mt-2 text-gray-400 text-center">
            Join CodeVault to store and share your code snippets
          </p>
        </div>
        
        {error && (
          <div className="mx-8 mt-6 p-3 rounded-lg bg-red-900/30 border-l-4 border-red-500 text-red-200 flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
          <div>
            <label htmlFor="username" className="flex items-center gap-1.5 text-sm font-medium text-gray-300 mb-2">
              <User className="h-4 w-4 text-blue-400" />
              <span>Username</span>
            </label>
            <div className="relative">
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-700 rounded-lg shadow-sm placeholder-gray-500 bg-gray-900 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Choose a username"
                required
              />
            </div>
          </div>
          
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
                className="w-full px-4 py-3 border border-gray-700 rounded-lg shadow-sm placeholder-gray-500 bg-gray-900 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="password" className="flex items-center gap-1.5 text-sm font-medium text-gray-300 mb-2">
              <Lock className="h-4 w-4 text-blue-400" />
              <span>Password</span>
            </label>
            <div className="relative">
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-700 rounded-lg shadow-sm placeholder-gray-500 bg-gray-900 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Create a password (min. 6 characters)"
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="flex items-center gap-1.5 text-sm font-medium text-gray-300 mb-2">
              <Lock className="h-4 w-4 text-blue-400" />
              <span>Confirm Password</span>
            </label>
            <div className="relative">
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-700 rounded-lg shadow-sm placeholder-gray-500 bg-gray-900 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Confirm your password"
                required
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="h-4 w-4 border-t-2 border-blue-200 border-solid rounded-full animate-spin mr-2"></div>
                Creating Account...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Create Account
              </>
            )}
          </button>

          <div className="pt-4 text-center">
            <p className="text-gray-400">
              Already have an account? {' '}
              <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 inline-flex items-center transition-colors">
                <LogIn className="h-3.5 w-3.5 mr-1" />
                Log In
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
