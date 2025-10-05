'use client';

import { Mic, Square, Pause, Play, X } from 'lucide-react';
import { motion } from 'framer-motion';
import SoundWaves from './SoundWaves';

interface RecordButtonProps {
    isRecording: boolean;
    isPaused: boolean;
    onStart: () => void;
    onStop: () => void;
    onPause: () => void;
    onResume: () => void;
    onCancel: () => void;
    duration: number;
    analyser: AnalyserNode | null;
}

export default function RecordButton({
    isRecording,
    isPaused,
    onStart,
    onStop,
    onPause,
    onResume,
    onCancel,
    duration,
    analyser,
}: RecordButtonProps) {
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col items-center gap-6">
            {/* Main Record Button */}
            <div className="relative">
                {isRecording && (
                    <motion.div
                        className="absolute inset-0 rounded-full bg-red-500/20"
                        animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.5, 0, 0.5],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    />
                )}

                <motion.button
                    onClick={isRecording ? onStop : onStart}
                    className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${isRecording
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-gradient-to-br from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700'
                        }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {isRecording ? (
                        <Square className="w-8 h-8 text-white" fill="white" />
                    ) : (
                        <Mic className="w-8 h-8 text-white" />
                    )}
                </motion.button>
            </div>

            {/* Sound Waves */}
            {isRecording && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4"
                >
                    <SoundWaves isRecording={isRecording} isPaused={isPaused} analyser={analyser} />
                </motion.div>
            )}

            {/* Duration Display */}
            {isRecording && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-light text-gray-700 tabular-nums"
                >
                    {formatTime(duration)}
                </motion.div>
            )}

            {/* Control Buttons */}
            {isRecording && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3"
                >
                    {/* Pause/Resume Button */}
                    <button
                        onClick={isPaused ? onResume : onPause}
                        className="px-6 py-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors flex items-center gap-2 text-gray-700"
                    >
                        {isPaused ? (
                            <>
                                <Play className="w-4 h-4" />
                                <span className="text-sm font-medium">Resume</span>
                            </>
                        ) : (
                            <>
                                <Pause className="w-4 h-4" />
                                <span className="text-sm font-medium">Pause</span>
                            </>
                        )}
                    </button>

                    {/* Cancel Button */}
                    <button
                        onClick={onCancel}
                        className="px-6 py-2 rounded-full bg-red-100 hover:bg-red-200 transition-colors flex items-center gap-2 text-red-700"
                    >
                        <X className="w-4 h-4" />
                        <span className="text-sm font-medium">Cancel</span>
                    </button>
                </motion.div>
            )}

            {/* Helper Text */}
            {!isRecording && (
                <p className="text-sm text-gray-500">
                    Click to start recording
                </p>
            )}
        </div>
    );
}

