'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import EntryCard from '@/components/EntryCard';
import { getAllEntries, JournalEntry } from '@spiraflow/shared';
import { Search, Filter, Loader2 } from 'lucide-react';

export default function HistoryPage() {
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMood, setSelectedMood] = useState<string>('all');

    useEffect(() => {
        loadEntries();
    }, []);

    useEffect(() => {
        filterEntries();
    }, [searchQuery, selectedMood, entries]);

    const loadEntries = async () => {
        try {
            const allEntries = await getAllEntries();
            // Sort by date, newest first
            const sorted = allEntries.sort((a, b) =>
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );
            setEntries(sorted);
            setFilteredEntries(sorted);
        } catch (error) {
            console.error('Error loading entries:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filterEntries = () => {
        let filtered = [...entries];

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(entry =>
                entry.transcription.toLowerCase().includes(query) ||
                entry.topics.some(topic => topic.toLowerCase().includes(query)) ||
                entry.emotions.some(emotion => emotion.toLowerCase().includes(query))
            );
        }

        // Filter by mood
        if (selectedMood !== 'all') {
            filtered = filtered.filter(entry =>
                entry.mood.primary.toLowerCase() === selectedMood.toLowerCase()
            );
        }

        setFilteredEntries(filtered);
    };

    const uniqueMoods = Array.from(new Set(entries.map(e => e.mood.primary)));

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <Loader2 className="w-8 h-8 text-secondary-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl md:text-4xl font-poppins font-bold text-black mb-2">
                    Notes
                </h1>
                <p className="text-gray-600">
                    Browse and search your journal entries
                </p>
            </motion.div>

            {entries.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-20"
                >
                    <h2 className="text-2xl font-poppins font-bold text-black mb-4">
                        No Notes Yet
                    </h2>
                    <p className="text-gray-600 mb-8">
                        Start recording your thoughts to build your journal.
                    </p>
                    <a
                        href="/"
                        className="inline-flex items-center px-6 py-3 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors"
                    >
                        Start Recording
                    </a>
                </motion.div>
            ) : (
                <>
                    {/* Filters */}
                    <div className="mb-6 flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search entries, topics, emotions..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary-500 text-black"
                            />
                        </div>

                        {/* Mood Filter */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                            <select
                                value={selectedMood}
                                onChange={(e) => setSelectedMood(e.target.value)}
                                className="pl-10 pr-8 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary-500 text-black appearance-none cursor-pointer min-w-[150px]"
                            >
                                <option value="all">All Moods</option>
                                {uniqueMoods.map(mood => (
                                    <option key={mood} value={mood}>{mood}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Results Count */}
                    <p className="text-sm text-gray-600 mb-4">
                        Showing {filteredEntries.length} of {entries.length} entries
                    </p>

                    {/* Entries List */}
                    {filteredEntries.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-600">
                                No entries match your filters.
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {filteredEntries.map((entry) => (
                                <EntryCard key={entry.id} entry={entry} />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
