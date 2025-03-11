'use client';

import Link from 'next/link';
import { HomeIcon, FileQuestion, ArrowRight, Code2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function NotFound() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-gray-100 flex items-center justify-center px-4 py-16 relative">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px]">
                    <div className="absolute inset-0 blur-[100px] opacity-20">
                        <div className="absolute top-1/2 left-0 w-1/2 h-1/2 bg-blue-500 rounded-full"></div>
                        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-indigo-500 rounded-full"></div>
                    </div>
                </div>
            </div>

            <div className={`max-w-2xl w-full backdrop-blur-xl bg-gradient-to-br from-gray-800/50 via-gray-900/50 to-gray-800/50 rounded-2xl border border-gray-700/30 p-8 shadow-2xl transition-all duration-700 ${mounted ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}>
                <div className="text-center space-y-8">
                    <div className="relative">
                        <div className="absolute inset-0 blur-2xl">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-blue-500 rounded-full opacity-20"></div>
                        </div>
                        <div className="relative inline-flex items-center justify-center p-4 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/20 mx-auto transition-all duration-300 hover:shadow-blue-500/30 hover:scale-105 group">
                            <Code2 className="h-10 w-10 text-white transition-transform duration-300 group-hover:rotate-12" />
                        </div>
                    </div>

                    <div>
                        <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-violet-400 to-indigo-400 tracking-tighter mb-4">
                            404
                        </h1>
                        <h2 className="text-3xl font-bold text-white bg-gradient-to-r from-blue-200 to-indigo-300 text-transparent bg-clip-text">
                            Page Not Found
                        </h2>
                    </div>

                    <p className="text-gray-400 max-w-md mx-auto mt-2 leading-relaxed text-lg">
                        The page you&apos;re looking for seems to have vanished into the digital void.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-5 justify-center mt-8">
                        <Link href="/" className="group relative inline-flex items-center justify-center px-6 py-3 font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-200">
                            <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600/20 to-indigo-600/20 blur opacity-0 group-hover:opacity-100 transition-opacity"></span>
                            <HomeIcon className="h-5 w-5 mr-2" />
                            <span>Back to Home</span>
                        </Link>

                        <Link href="/lander/explore" className="group relative inline-flex items-center justify-center px-6 py-3 font-medium text-gray-300 border border-gray-700 rounded-xl transition-all duration-200 hover:border-gray-600 hover:bg-gray-800/50">
                            <span className="flex items-center">
                                Explore Creations
                                <ArrowRight className="h-5 w-5 ml-2 transform transition-transform duration-300 group-hover:translate-x-1" />
                            </span>
                        </Link>
                    </div>

                    <div className="pt-8 mt-4 border-t border-gray-800/50">
                        <p className="text-gray-500 text-sm">© CodeVault | Crafting Digital Experiences</p>
                    </div>
                </div>
            </div>
        </div>
    );
}