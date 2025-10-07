import { JournalEntry, DashboardStats, UserPattern } from '../types';
import { startOfWeek, format, subDays } from 'date-fns';

export function calculateDashboardStats(entries: JournalEntry[]): DashboardStats {
    const totalEntries = entries.length;
    const totalDuration = entries.reduce((sum, entry) => sum + entry.duration, 0);

    // Calculate mood frequency
    const moodMap = new Map<string, number>();
    entries.forEach(entry => {
        const mood = entry.mood.primary;
        moodMap.set(mood, (moodMap.get(mood) || 0) + 1);
    });
    const topMoods = Array.from(moodMap.entries())
        .map(([mood, count]) => ({ mood, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    // Calculate topic frequency
    const topicMap = new Map<string, number>();
    entries.forEach(entry => {
        entry.topics.forEach(topic => {
            topicMap.set(topic, (topicMap.get(topic) || 0) + 1);
        });
    });
    const topTopics = Array.from(topicMap.entries())
        .map(([topic, count]) => ({ topic, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    // Weekly activity (last 7 days)
    const weeklyActivity = calculateWeeklyActivity(entries);

    // Emotional trend (last 30 days)
    const emotionalTrend = calculateEmotionalTrend(entries);

    return {
        totalEntries,
        totalDuration,
        topMoods,
        topTopics,
        weeklyActivity,
        emotionalTrend,
    };
}

function calculateWeeklyActivity(entries: JournalEntry[]): { date: string; count: number }[] {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i);
        return format(date, 'yyyy-MM-dd');
    });

    const activityMap = new Map<string, number>();
    entries.forEach(entry => {
        const dateStr = format(new Date(entry.timestamp), 'yyyy-MM-dd');
        if (last7Days.includes(dateStr)) {
            activityMap.set(dateStr, (activityMap.get(dateStr) || 0) + 1);
        }
    });

    return last7Days.map(date => ({
        date,
        count: activityMap.get(date) || 0,
    }));
}

function calculateEmotionalTrend(entries: JournalEntry[]): { date: string; mood: string; value: number }[] {
    const moodScores: { [key: string]: number } = {
        'happy': 5,
        'content': 4,
        'calm': 3,
        'neutral': 3,
        'anxious': 2,
        'stressed': 2,
        'sad': 1,
        'angry': 1,
    };

    const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = subDays(new Date(), 29 - i);
        return format(date, 'yyyy-MM-dd');
    });

    const trendMap = new Map<string, { moods: string[]; values: number[] }>();

    entries.forEach(entry => {
        const dateStr = format(new Date(entry.timestamp), 'yyyy-MM-dd');
        if (last30Days.includes(dateStr)) {
            const existing = trendMap.get(dateStr) || { moods: [], values: [] };
            existing.moods.push(entry.mood.primary);
            existing.values.push(moodScores[entry.mood.primary.toLowerCase()] || 3);
            trendMap.set(dateStr, existing);
        }
    });

    return last30Days.map(date => {
        const data = trendMap.get(date);
        if (!data || data.values.length === 0) {
            return { date, mood: 'neutral', value: 3 };
        }
        const avgValue = data.values.reduce((a, b) => a + b, 0) / data.values.length;
        const primaryMood = data.moods[0]; // Use first mood of the day
        return { date, mood: primaryMood, value: avgValue };
    });
}

export function analyzeUserPatterns(entries: JournalEntry[]): UserPattern {
    // Analyze recurring topics
    const topicMap = new Map<string, { count: number; lastSeen: Date }>();
    entries.forEach(entry => {
        entry.topics.forEach(topic => {
            const existing = topicMap.get(topic);
            if (!existing || new Date(entry.timestamp) > existing.lastSeen) {
                topicMap.set(topic, {
                    count: (existing?.count || 0) + 1,
                    lastSeen: new Date(entry.timestamp),
                });
            }
        });
    });

    const recurringTopics = Array.from(topicMap.entries())
        .map(([topic, data]) => ({ topic, ...data }))
        .sort((a, b) => b.count - a.count);

    // Analyze emotional trends
    const moodCounts = new Map<string, number>();
    entries.forEach(entry => {
        const mood = entry.mood.primary;
        moodCounts.set(mood, (moodCounts.get(mood) || 0) + 1);
    });

    // Calculate actual emotional trends over time
    const moodTimeline = entries
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        .map(entry => entry.mood.primary);

    const emotionalTrends = Array.from(moodCounts.entries()).map(([mood, frequency]) => {
        // Calculate trend by comparing first half vs second half of entries
        const midPoint = Math.floor(moodTimeline.length / 2);
        const firstHalf = moodTimeline.slice(0, midPoint).filter(m => m === mood).length;
        const secondHalf = moodTimeline.slice(midPoint).filter(m => m === mood).length;

        let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
        if (moodTimeline.length > 4) { // Only calculate trends if we have enough data
            const firstHalfRate = firstHalf / Math.max(midPoint, 1);
            const secondHalfRate = secondHalf / Math.max(moodTimeline.length - midPoint, 1);

            if (secondHalfRate > firstHalfRate * 1.2) trend = 'increasing';
            else if (secondHalfRate < firstHalfRate * 0.8) trend = 'decreasing';
        }

        return {
            mood,
            frequency,
            trend,
        };
    });

    // Common time of day
    const hours = entries.map(entry => new Date(entry.timestamp).getHours());
    const avgHour = hours.reduce((a, b) => a + b, 0) / hours.length;
    const commonTimeOfDay = avgHour < 12 ? 'morning' : avgHour < 17 ? 'afternoon' : 'evening';

    // Average session length
    const averageSessionLength = entries.reduce((sum, entry) => sum + entry.duration, 0) / entries.length;

    return {
        userId: 'default',
        recurringTopics,
        emotionalTrends,
        commonTimeOfDay,
        averageSessionLength,
    };
}

