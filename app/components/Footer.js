"use client";

import { useState } from 'react';
import Link from 'next/link';
import { 
  Code2, Github, Twitter, Linkedin, Send, 
  Mail, ExternalLink, Heart, Coffee, Globe
} from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    
    if (email) {
      setSubscribeStatus('success');
      setEmail('');
      setTimeout(() => setSubscribeStatus(''), 3000);
    } else {
      setSubscribeStatus('error');
    }
  };

  return (
    <footer className="bg-gray-900 border-t border-gray-800 py-10">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center bg-gray-800/50 px-4 py-2 rounded-full mb-6">
              <div className="bg-blue-600/20 p-1.5 rounded-md mr-2 backdrop-blur-sm">
                <Code2 className="h-5 w-5 text-blue-400" />
              </div>
              <span className="text-xl font-bold text-blue-400">
                CodeVault
              </span>
            </div>
            
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto mb-6">
              Your secure repository for code snippets, examples, and programming solutions. Save, organize, and share your code effortlessly.
            </p>
            
            <div className="flex space-x-6 justify-center">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white hover:scale-110 transition-all p-2 bg-gray-800/30 rounded-full"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white hover:scale-110 transition-all p-2 bg-gray-800/30 rounded-full"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white hover:scale-110 transition-all p-2 bg-gray-800/30 rounded-full"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <h3 className="text-white font-semibold mb-6 relative">
              <span className="before:block before:absolute before:-bottom-2 before:left-0 before:right-0 before:mx-auto before:w-10 before:h-0.5 before:bg-blue-500">Quick Links</span>
            </h3>
            <ul className="space-y-4">
              <li>
                <Link href="/" className="text-gray-400 hover:text-blue-400 transition-all duration-300 text-sm flex items-center justify-center group">
                  <span className="h-1.5 w-1.5 bg-blue-500 rounded-full mr-2 group-hover:scale-150 transition-transform"></span>
                  Home
                </Link>
              </li>
              <li>
                <Link href="/lander/explore" className="text-gray-400 hover:text-blue-400 transition-all duration-300 text-sm flex items-center justify-center group">
                  <span className="h-1.5 w-1.5 bg-blue-500 rounded-full mr-2 group-hover:scale-150 transition-transform"></span>
                  Explore Snippets
                </Link>
              </li>
              <li>
                <Link href="/auth/dashboard" className="text-gray-400 hover:text-blue-400 transition-all duration-300 text-sm flex items-center justify-center group">
                  <span className="h-1.5 w-1.5 bg-blue-500 rounded-full mr-2 group-hover:scale-150 transition-transform"></span>
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col items-center">
            <h3 className="text-white font-semibold mb-6 relative">
              <span className="before:block before:absolute before:-bottom-2 before:left-0 before:right-0 before:mx-auto before:w-10 before:h-0.5 before:bg-blue-500">Resources</span>
            </h3>
            <ul className="space-y-4">
              <li>
                <a 
                  href="https://github.com/your-repo/issues" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-400 hover:text-blue-400 transition-all duration-300 text-sm flex items-center justify-center group"
                >
                  <span className="h-1.5 w-1.5 bg-blue-500 rounded-full mr-2 group-hover:scale-150 transition-transform"></span>
                  Report Issue
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 my-8 w-full"></div>

        <div className="flex flex-col items-center space-y-4">
          <div className="text-gray-500 text-xs">
            © {new Date().getFullYear()} CodeVault. All rights reserved.
          </div>
          
          <div className="flex space-x-8 justify-center">
            <Link href="/privacy" className="text-gray-400 hover:text-blue-400 transition-colors text-xs">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-blue-400 transition-colors text-xs">
              Terms of Service
            </Link>
            <Link href="/cookies" className="text-gray-400 hover:text-blue-400 transition-colors text-xs">
              Cookies
            </Link>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-xs flex items-center justify-center bg-gray-800/30 py-3 px-6 rounded-full max-w-xs mx-auto">
            <Globe className="h-3 w-3 mr-1" />
            Made with 
            <Heart className="h-3 w-3 mx-1 text-red-400 animate-pulse" />
            and
            <Coffee className="h-3 w-3 mx-1 text-amber-400" />
            by the CodeVault Team
          </p>
        </div>
      </div>
    </footer>
  );
}