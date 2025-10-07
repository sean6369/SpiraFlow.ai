import React, { useMemo } from 'react';
import { SafeAreaView, StatusBar, Text, View, ScrollView } from 'react-native';
import {
  JournalEntry,
  analyzeUserPatterns,
  calculateDashboardStats,
  formatDuration,
} from '@spiraflow/shared';

const mockEntries: JournalEntry[] = [
  {
    id: 'entry-1',
    title: 'Morning reflection',
    transcription:
      'Started the day feeling calm after a good sleep. Focused on gratitude and set intentions for the day.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    duration: 180,
    topics: ['sleep', 'gratitude', 'planning'],
    mood: { primary: 'calm', confidence: 0.8 },
    emotions: ['content', 'hopeful'],
    metadata: {
      recordingDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      lastModified: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      wordCount: 28,
    },
  },
  {
    id: 'entry-2',
    title: 'Midday check-in',
    transcription:
      'Work has been intense but manageable. Took breaks to walk and breathe which helped lower the stress.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12),
    duration: 240,
    topics: ['work', 'stress', 'self-care'],
    mood: { primary: 'stressed', confidence: 0.6 },
    emotions: ['determined', 'tense'],
    metadata: {
      recordingDate: new Date(Date.now() - 1000 * 60 * 60 * 12),
      lastModified: new Date(Date.now() - 1000 * 60 * 60 * 12),
      wordCount: 24,
    },
  },
  {
    id: 'entry-3',
    title: 'Evening unwind',
    transcription:
      'Wrapped up the day feeling grateful for support from friends. Planning to journal again tomorrow morning.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
    duration: 150,
    topics: ['gratitude', 'friends', 'planning'],
    mood: { primary: 'happy', confidence: 0.7 },
    emotions: ['relieved', 'connected'],
    metadata: {
      recordingDate: new Date(Date.now() - 1000 * 60 * 60 * 4),
      lastModified: new Date(Date.now() - 1000 * 60 * 60 * 4),
      wordCount: 23,
    },
  },
];

function App(): JSX.Element {
  const stats = useMemo(() => calculateDashboardStats(mockEntries), []);
  const patterns = useMemo(() => analyzeUserPatterns(mockEntries), []);

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerClassName="px-6 py-10 gap-6">
        <Text className="text-slate-100 text-3xl font-semibold">
          SpiraFlow Journal Overview
        </Text>

        <View className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <Text className="text-slate-300 text-sm uppercase tracking-wider">
            Totals
          </Text>
          <Text className="text-slate-100 text-lg mt-2">
            {stats.totalEntries} entries · {formatDuration(stats.totalDuration)} recorded
          </Text>
          <Text className="text-slate-400 mt-2">
            Frequent moods: {stats.topMoods.map(mood => mood.mood).join(', ') || '—'}
          </Text>
        </View>

        <View className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <Text className="text-slate-300 text-sm uppercase tracking-wider">
            Emerging Patterns
          </Text>
          {patterns.recurringTopics.slice(0, 3).map(topic => (
            <View
              key={topic.topic}
              className="mt-3 flex-row items-center justify-between"
            >
              <Text className="text-slate-100 text-base font-medium">
                {topic.topic}
              </Text>
              <Text className="text-slate-500 text-sm">
                {topic.count} mentions
              </Text>
            </View>
          ))}
        </View>

        <View className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <Text className="text-slate-300 text-sm uppercase tracking-wider">
            Recent Entries
          </Text>
          {mockEntries.map(entry => (
            <View key={entry.id} className="mt-4">
              <Text className="text-slate-100 text-lg font-medium">
                {entry.title}
              </Text>
              <Text className="text-slate-400 text-sm mt-1">
                Mood: {entry.mood.primary} · Topics: {entry.topics.join(', ')}
              </Text>
              <Text className="text-slate-500 text-sm mt-1 leading-5">
                {entry.transcription}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default App;
