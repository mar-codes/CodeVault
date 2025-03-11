'use client';
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const loadingMessages = [
    "Firing up the servers...",
    "Initializing quantum processors...",
    "Loading your secure vault...",
    "Establishing encrypted connection...",
    "Preparing your workspace..."
];

export default function Loading({ size = "default" }) {
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex(i => (i + 1) % loadingMessages.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const sizeClasses = {
        small: "w-6 h-6",
        default: "w-8 h-8",
        large: "w-10 h-10"
    };

    return (
        <div className="fixed top-0 left-0 w-full h-full bg-gradient-to-br from-gray-900 to-gray-950 flex flex-col items-center justify-center gap-8">
            <div className="relative">
                <motion.div
                    className={`${sizeClasses[size]} relative antialiased`}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                    <div className="absolute inset-0 border-2 border-blue-500/10 rounded-full" />
                    <div className="absolute inset-0 border-2 border-t-blue-400 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.4)]" />
                </motion.div>
            </div>

            <AnimatePresence mode='wait'>
                <motion.div
                    key={messageIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                    className="text-lg font-medium bg-gradient-to-r from-blue-200 to-indigo-300 text-transparent bg-clip-text"
                >
                    {loadingMessages[messageIndex]}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}