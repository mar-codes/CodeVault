'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, ArrowLeft, CheckCircle } from 'lucide-react';

export default function SignOut() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);
  const [isAnimating, setIsAnimating] = useState(false);
  const [logoutStatus, setLogoutStatus] = useState('loading');

  useEffect(() => {
    const performLogout = async () => {
      try {
        const response = await fetch('/api/auth/logout');
        
        if (response.ok) {
          setLogoutStatus('success');
          setIsAnimating(true);
        } else {
          setLogoutStatus('error');
        }
      } catch (error) {
        console.error('Logout failed:', error);
        setLogoutStatus('error');
      }
    };

    performLogout();
  }, []);
  
  useEffect(() => {
    let timer;
    
    if (logoutStatus === 'success') {
      timer = setTimeout(() => {
        if (countdown > 1) {
          setCountdown(countdown - 1);
        } else {
          router.push('/auth/login');
        }
      }, 1000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown, logoutStatus, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 flex items-center justify-center px-4">
      <div className={`max-w-md w-full mx-auto transition-all duration-700 ease-out transform ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-gray-700/30 p-8 shadow-xl">
          <div className="text-center space-y-6">
            {logoutStatus === 'loading' && (
              <div className="inline-flex items-center justify-center p-4 mx-auto">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            
            {logoutStatus === 'success' && (
              <div className="inline-flex items-center justify-center p-4 bg-emerald-500/10 rounded-full mx-auto mb-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-500 rounded-full opacity-25 animate-ping"></div>
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-3 rounded-full shadow-lg relative">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            )}
            
            {logoutStatus === 'error' && (
              <div className="inline-flex items-center justify-center p-4 bg-red-500/10 rounded-full mx-auto">
                <div className="bg-gradient-to-r from-red-500 to-orange-500 p-3 rounded-full shadow-lg">
                  <LogOut className="h-6 w-6 text-white" />
                </div>
              </div>
            )}
            
            <div>
              <h1 className="text-3xl font-bold text-white">
                {logoutStatus === 'loading' ? 'Signing Out...' : 
                 logoutStatus === 'success' ? 'Successfully Signed Out' : 
                 'Sign Out Failed'}
              </h1>
              <p className="mt-3 text-gray-300">
                {logoutStatus === 'loading' ? 'Please wait while we secure your account...' :
                 logoutStatus === 'success' ? 'Thank you for using CodeVault. You\'ve been securely logged out of your account.' :
                 'There was a problem signing you out. Please try again.'}
              </p>
            </div>
            
            {logoutStatus === 'success' && (
              <div className="py-3 px-4 bg-gray-800/50 rounded-lg">
                <p className="text-gray-400">
                  Redirecting to login in <span className="text-white font-semibold">{countdown}</span> {countdown === 1 ? 'second' : 'seconds'}...
                </p>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4 mt-2 justify-center">
              <Link href="/auth/login" 
                className="group relative inline-flex items-center justify-center px-6 py-3 w-full sm:w-auto font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-md transition-all duration-300 ease-in-out hover:shadow-blue-500/25 overflow-hidden">
                <span className="absolute inset-0 flex items-center justify-center w-full h-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <LogOut className="h-4 w-4" />
                </span>
                <span className="inline-block transition-all duration-300 ease-in-out group-hover:opacity-0 group-hover:translate-y-8">
                  Login Now
                </span>
              </Link>
              
              <Link href="/" 
                className="group relative inline-flex items-center justify-center px-6 py-3 w-full sm:w-auto font-medium text-indigo-300 border border-indigo-300/30 rounded-lg transition-all duration-300 ease-in-out hover:text-white hover:border-indigo-400/50">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </div>
            
            <div className="pt-6 border-t border-gray-800/50">
              <p className="text-sm text-gray-500">
                {logoutStatus === 'success' 
                  ? 'Your session has been terminated and all authentication tokens have been cleared from this device.'
                  : logoutStatus === 'error' 
                  ? 'If you continue to experience issues, please clear your browser cookies or contact support.'
                  : 'Processing your request...'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">© CodeVault | Building better experiences</p>
        </div>
      </div>
    </div>
  );
}