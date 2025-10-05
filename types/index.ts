export interface JournalEntry {
    id: string;
    userId?: string;
    title: string;
    transcription: string;
    audioBlob?: Blob;
    audioUrl?: string;
    timestamp: Date;
    duration: number; // in seconds
    topics: string[];
    mood: Mood;
    emotions: string[];
    aiPrompts?: AIPrompt[];
    metadata: {
        recordingDate: Date;
        lastModified: Date;
        wordCount: number;
    };
}

export interface Mood {
    primary: string; // e.g., 'calm', 'stressed', 'happy', 'anxious'
    confidence: number; // 0-1
    secondaryMoods?: string[];
}

export interface AIPrompt {
    id: string;
    prompt: string;
    context: string;
    timestamp: Date;
    responseId?: string;
    category?: 'emotional' | 'behavioral' | 'values' | 'live';
    therapeutic_approach?: string;
}

export interface AIAnalysis {
    topics: string[];
    mood: Mood;
    emotions: string[];
    keywords: string[];
    summary: string;
}

export interface UserPattern {
    userId: string;
    recurringTopics: { topic: string; count: number; lastSeen: Date }[];
    emotionalTrends: { mood: string; frequency: number; trend: 'increasing' | 'decreasing' | 'stable' }[];
    commonTimeOfDay: string;
    averageSessionLength: number;
}

export interface RecordingState {
    isRecording: boolean;
    isPaused: boolean;
    duration: number;
    audioChunks: Blob[];
}

export interface DashboardStats {
    totalEntries: number;
    totalDuration: number;
    topMoods: { mood: string; count: number }[];
    topTopics: { topic: string; count: number }[];
    weeklyActivity: { date: string; count: number }[];
    emotionalTrend: { date: string; mood: string; value: number }[];
}

