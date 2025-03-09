'use client';

import Link from 'next/link';
import { HomeIcon, FileQuestion, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function NotFound() {
    const [mounted, setMounted] = useState(false);
    
    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-gray-100 flex items-center justify-center px-4 py-16 relative">
            <div className="absolute inset-0 overflow-hidden opacity-10">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-500 rounded-full filter blur-[120px]"></div>
            </div>
            
            <div className={`max-w-lg w-full backdrop-blur-sm bg-gray-900/40 rounded-2xl border border-gray-700/20 p-8 shadow-xl transition-all duration-700 ${mounted ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}>
                <div className="text-center space-y-6">
                    <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/10 mx-auto transition-all duration-300 hover:shadow-blue-500/20 hover:scale-105">
                        <FileQuestion className="h-10 w-10 text-white" />
                    </div>
                    
                    <div>
                        <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-violet-400 to-indigo-400 tracking-tighter">
                            404
                        </h1>
                        <h2 className="text-2xl font-bold text-white mt-2">
                            Page Not Found
                        </h2>
                    </div>

                    <p className="text-gray-300 max-w-sm mx-auto mt-2 leading-relaxed">
                        The page you're looking for doesn't exist or has been moved to another location.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-5 justify-center mt-6">
                        <Link href="/" className="group relative inline-flex items-center justify-center px-6 py-3 font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-md transition-all duration-500 ease-in-out hover:shadow-blue-500/25 overflow-hidden">
                            <span className="absolute inset-0 flex items-center justify-center w-full h-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <HomeIcon className="h-4 w-4" />
                            </span>
                            <span className="inline-block transition-all duration-500 ease-in-out group-hover:opacity-0 group-hover:translate-y-8">Back to Home</span>
                        </Link>

                        <Link href="/lander/explore" className="group relative inline-flex items-center justify-center px-6 py-3 font-medium text-indigo-300 border border-indigo-300/30 rounded-lg transition-all duration-500 ease-in-out hover:text-white">
                            <span className="absolute inset-0 w-0 bg-indigo-600 opacity-50 transition-all duration-500 ease-out group-hover:w-full"></span>
                            <span className="relative flex items-center z-10">
                                Explore Creations
                                <ArrowRight className="h-4 w-4 ml-2 transform transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
                            </span>
                        </Link>
                    </div>

                    <div className="pt-6 mt-4 border-t border-gray-800/50">
                        <p className="text-gray-500 text-sm">© CodeVault | Building better experiences</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
