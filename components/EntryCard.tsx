'use client';

import { motion } from 'framer-motion';
import { Calendar, Clock, Tag, Heart } from 'lucide-react';
import { JournalEntry } from '@/types';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

interface EntryCardProps {
    entry: JournalEntry;
    onClick?: () => void;
}

export default function EntryCard({ entry, onClick }: EntryCardProps) {
    const router = useRouter();

    const moodColors: { [key: string]: string } = {
        happy: 'bg-yellow-100 text-yellow-700',
        content: 'bg-green-100 text-green-700',
        calm: 'bg-blue-100 text-blue-700',
        neutral: 'bg-gray-100 text-gray-700',
        anxious: 'bg-orange-100 text-orange-700',
        stressed: 'bg-red-100 text-red-700',
        sad: 'bg-indigo-100 text-indigo-700',
        angry: 'bg-red-100 text-red-700',
    };

    const moodColor = moodColors[entry.mood.primary.toLowerCase()] || moodColors.neutral;

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else {
            router.push(`/notes/${entry.id}`);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ x: 4 }}
            onClick={handleClick}
            className="p-4 bg-white rounded-lg border border-neutral-200 hover:border-secondary-300 hover:bg-neutral-50 transition-all cursor-pointer"
        >
            <div className="flex items-start gap-4">
                {/* Date & Time Badge */}
                <div className="flex-shrink-0 text-center min-w-[70px] pt-1">
                    <div className="text-sm font-semibold text-neutral-900">
                        {format(new Date(entry.timestamp), 'MMM dd')}
                    </div>
                    <div className="text-xs text-neutral-500">
                        {format(new Date(entry.timestamp), 'h:mm a')}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                    {/* Title & Mood */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="text-base font-semibold text-neutral-900 line-clamp-1 flex-1">
                            {entry.title}
                        </h3>
                        <div className={`flex-shrink-0 px-2.5 py-0.5 rounded-full text-xs font-medium ${moodColor}`}>
                            {entry.mood.primary}
                        </div>
                    </div>

                    {/* Transcription Preview */}
                    <p className="text-sm text-neutral-600 mb-3 line-clamp-2">
                        {entry.transcription}
                    </p>

                    {/* Topics & Emotions */}
                    <div className="flex items-center gap-4 text-xs">
                        {/* Topics */}
                        {entry.topics.length > 0 && (
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <Tag className="w-3.5 h-3.5 text-neutral-400" />
                                {entry.topics.slice(0, 3).map((topic, idx) => (
                                    <span
                                        key={idx}
                                        className="px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded"
                                    >
                                        {topic}
                                    </span>
                                ))}
                                {entry.topics.length > 3 && (
                                    <span className="text-neutral-500">
                                        +{entry.topics.length - 3}
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Emotions */}
                        {entry.emotions.length > 0 && (
                            <div className="flex items-center gap-1.5 text-neutral-500">
                                <Heart className="w-3.5 h-3.5" />
                                <span className="line-clamp-1">{entry.emotions.slice(0, 3).join(', ')}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

