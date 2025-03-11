'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import UserProfileContent from './UserProfile';

export default function PreviewProfileModal({ isOpen, onClose, previewData }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-gray-900 rounded-2xl shadow-xl"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors z-50"
                        >
                            <X size={20} />
                        </button>
                        
                        <div className="p-1">
                            <UserProfileContent previewMode={true} previewData={previewData} />
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
