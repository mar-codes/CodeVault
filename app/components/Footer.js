"use client";

import Link from 'next/link';
import { 
  Code2, Github, Twitter, Linkedin,
  ExternalLink, Heart, Coffee, Globe
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 border-t border-gray-800/30 py-10">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center bg-gradient-to-br from-gray-800/50 via-gray-900/50 to-gray-800/50 backdrop-blur-xl px-4 py-2 rounded-xl border border-gray-700/30">
              <div className="bg-blue-500/20 p-1.5 rounded-md mr-2">
                <Code2 className="h-5 w-5 text-blue-400" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-200 to-indigo-300 text-transparent bg-clip-text">
                CodeVault
              </span>
            </div>
            
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto my-6">
              Your secure repository for code snippets, examples, and programming solutions. Save, organize, and share your code effortlessly.
            </p>
            
            <div className="flex space-x-4">
              {[
                { href: "https://github.com", icon: <Github className="h-5 w-5" />, label: "GitHub" },
                { href: "https://twitter.com", icon: <Twitter className="h-5 w-5" />, label: "Twitter" },
                { href: "https://linkedin.com", icon: <Linkedin className="h-5 w-5" />, label: "LinkedIn" }
              ].map((social) => (
                <a 
                  key={social.label}
                  href={social.href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-400 hover:scale-110 transition-all p-2 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg border border-gray-700/30"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
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
                <Link href="/auth/user/dashboard" className="text-gray-400 hover:text-blue-400 transition-all duration-300 text-sm flex items-center justify-center group">
                  <span className="h-1.5 w-1.5 bg-blue-500 rounded-full mr-2 group-hover:scale-150 transition-transform"></span>
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col items-center">
            <h3 className="text-xl font-semibold mb-6 bg-gradient-to-r from-blue-200 to-indigo-300 text-transparent bg-clip-text">
              Resources
            </h3>
            <ul className="space-y-4">
              <li>
                <a 
                  href="https://github.com/your-repo/issues" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-400 hover:text-blue-400 transition-all duration-300 text-sm flex items-center group"
                >
                  <span className="h-1.5 w-1.5 bg-blue-500 rounded-full mr-2 group-hover:scale-150 transition-transform"></span>
                  Report Issue
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800/30 my-8 w-full"></div>

        <div className="flex flex-col items-center space-y-6">
          <div className="flex space-x-8 justify-center">
            {['Privacy Policy', 'Terms of Service', 'Cookies'].map((item) => (
              <Link 
                key={item}
                href={`/${item.toLowerCase().replace(' ', '-')}`} 
                className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
              >
                {item}
              </Link>
            ))}
          </div>
          
          <p className="text-gray-500 text-xs flex items-center justify-center bg-gradient-to-br from-gray-800/50 via-gray-900/50 to-gray-800/50 backdrop-blur-xl py-3 px-6 rounded-xl border border-gray-700/30">
            <Globe className="h-3 w-3 mr-1" />
            Made with 
            <Heart className="h-3 w-3 mx-1 text-red-400 animate-pulse" />
            and
            <Coffee className="h-3 w-3 mx-1 text-amber-400" />
            by the CodeVault Team
          </p>
          
          <div className="text-gray-500 text-xs">
            © {new Date().getFullYear()} CodeVault. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}