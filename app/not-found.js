'use client';

import Link from 'next/link';
import { HomeIcon, FileQuestion } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-gray-100 flex items-center justify-center px-4 py-16">
            <div className="max-w-md w-full text-center space-y-8">
                <div className="inline-flex items-center justify-center p-3 bg-blue-600/30 rounded-full shadow-lg shadow-blue-500/10 mx-auto">
                    <FileQuestion className="h-12 w-12 text-blue-400" />
                </div>

                <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-500 tracking-tight">
                    404
                </h1>

                <h2 className="text-2xl font-semibold text-gray-200 mt-2">
                    Page Not Found
                </h2>

                <p className="text-gray-400 max-w-sm mx-auto mt-4">
                    The page you're looking for doesn't exist or has been moved to another location.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                    <Link href="/" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all">
                        <HomeIcon className="h-4 w-4 mr-2" />
                        Back to Home
                    </Link>

                    <Link href="/lander/explore" className="inline-flex items-center justify-center px-6 py-3 border border-gray-700 text-sm font-medium rounded-lg shadow-sm text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all">
                        Explore Snippets
                    </Link>
                </div>

                <div className="text-center text-xs text-gray-500 pt-8">
                    <p>© CodeVault | Looking for something?</p>
                </div>
            </div>
        </div>
    );
}
