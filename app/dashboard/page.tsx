'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Dashboard from '@/components/Dashboard';
import { getAllEntries } from '@/lib/db';
import { calculateDashboardStats } from '@/lib/analytics';
import { DashboardStats } from '@/types';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const entries = await getAllEntries();
            const calculatedStats = calculateDashboardStats(entries);
            setStats(calculatedStats);
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <Loader2 className="w-8 h-8 text-secondary-500 animate-spin" />
            </div>
        );
    }

    if (!stats || stats.totalEntries === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-20"
                >
                    <h2 className="text-2xl font-poppins font-bold text-black mb-4">
                        No Entries Yet
                    </h2>
                    <p className="text-gray-600 mb-8">
                        Start recording your thoughts to see your insights here.
                    </p>
                    <a
                        href="/"
                        className="inline-flex items-center px-6 py-3 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors"
                    >
                        Start Recording
                    </a>
                </motion.div>
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
                    Your Dashboard
                </h1>
                <p className="text-gray-600">
                    Insights from your journal entries
                </p>
            </motion.div>

            <Dashboard stats={stats} />
        </div>
    );
}

