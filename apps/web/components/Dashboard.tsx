'use client';

import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DashboardStats } from '@spiraflow/shared';
import { BookOpen, Clock, TrendingUp, Heart } from 'lucide-react';

interface DashboardProps {
    stats: DashboardStats;
}

const MOOD_COLORS: { [key: string]: string } = {
    happy: '#fbbf24',
    content: '#10b981',
    calm: '#3b82f6',
    neutral: '#6b7280',
    anxious: '#f97316',
    stressed: '#ef4444',
    sad: '#6366f1',
    angry: '#dc2626',
};

export default function Dashboard({ stats }: DashboardProps) {
    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    };

    return (
        <div className="space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={<BookOpen className="w-5 h-5" />}
                    label="Total Entries"
                    value={stats.totalEntries.toString()}
                    color="blue"
                />
                <StatCard
                    icon={<Clock className="w-5 h-5" />}
                    label="Total Time"
                    value={formatDuration(stats.totalDuration)}
                    color="green"
                />
                <StatCard
                    icon={<Heart className="w-5 h-5" />}
                    label="Top Mood"
                    value={stats.topMoods[0]?.mood || 'N/A'}
                    color="purple"
                />
                <StatCard
                    icon={<TrendingUp className="w-5 h-5" />}
                    label="This Week"
                    value={stats.weeklyActivity.reduce((sum, day) => sum + day.count, 0).toString()}
                    color="orange"
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weekly Activity */}
                <ChartCard title="Weekly Activity">
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={stats.weeklyActivity}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                                stroke="#6b7280"
                                fontSize={12}
                            />
                            <YAxis stroke="#9ca3af" fontSize={12} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                }}
                            />
                            <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Mood Distribution */}
                <ChartCard title="Mood Distribution">
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={stats.topMoods}
                                dataKey="count"
                                nameKey="mood"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                label={(entry) => entry.mood}
                            >
                                {stats.topMoods.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={MOOD_COLORS[entry.mood.toLowerCase()] || '#6b7280'} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            {/* Emotional Trend */}
            <ChartCard title="Emotional Trend (Last 30 Days)">
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={stats.emotionalTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
                        <XAxis
                            dataKey="date"
                            tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            stroke="#6b7280"
                            fontSize={12}
                        />
                        <YAxis domain={[1, 5]} stroke="#9ca3af" fontSize={12} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#fff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                            }}
                            labelFormatter={(date) => new Date(date).toLocaleDateString()}
                        />
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#8b5cf6"
                            strokeWidth={2}
                            dot={{ fill: '#8b5cf6', r: 4 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </ChartCard>

            {/* Top Topics */}
            <ChartCard title="Top Topics">
                <div className="space-y-3">
                    {stats.topTopics.slice(0, 8).map((topic, index) => (
                        <div key={index} className="flex items-center gap-3">
                            <div className="flex-1">
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm font-medium text-gray-700">
                                        {topic.topic}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        {topic.count}
                                    </span>
                                </div>
                                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(topic.count / stats.totalEntries) * 100}%` }}
                                        transition={{ duration: 0.5, delay: index * 0.05 }}
                                        className="h-full bg-gradient-to-r from-secondary-500 to-secondary-600"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </ChartCard>
        </div>
    );
}

function StatCard({ icon, label, value, color }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    color: 'blue' | 'green' | 'purple' | 'orange';
}) {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
        green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
        purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
        orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm"
        >
            <div className={`w-10 h-10 rounded-xl ${colorClasses[color]} flex items-center justify-center mb-3`}>
                {icon}
            </div>
            <p className="text-sm text-gray-600 mb-1">{label}</p>
            <p className="text-2xl font-semibold text-black">{value}</p>
        </motion.div>
    );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm"
        >
            <h3 className="text-lg font-semibold text-black mb-4">
                {title}
            </h3>
            {children}
        </motion.div>
    );
}
