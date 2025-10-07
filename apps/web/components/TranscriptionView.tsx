'use client';

import { motion } from 'framer-motion';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface TranscriptionViewProps {
    transcription: string;
    isProcessing: boolean;
    error?: string;
}

export default function TranscriptionView({
    transcription,
    isProcessing,
    error,
}: TranscriptionViewProps) {
    if (error) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 bg-red-50 rounded-2xl border border-red-200"
            >
                <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-sm font-medium text-red-900">
                            Processing Error
                        </h3>
                        <p className="text-sm text-red-700 mt-1">
                            {error}
                        </p>
                    </div>
                </div>
            </motion.div>
        );
    }

    if (isProcessing) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-8 flex flex-col items-center justify-center gap-4"
            >
                <Loader2 className="w-8 h-8 text-secondary-500 animate-spin" />
                <p className="text-sm text-gray-600">
                    Processing your recording...
                </p>
            </motion.div>
        );
    }

    if (!transcription) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
        >
            <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Transcription complete</span>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {transcription}
                </p>
            </div>
        </motion.div>
    );
}

