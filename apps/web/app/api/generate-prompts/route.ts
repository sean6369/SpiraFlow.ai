import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { UserPattern, JournalEntry } from '@spiraflow/shared';

export async function POST(request: NextRequest) {
    try {
        const { currentEntry, recentEntries, userPatterns } = await request.json() as {
            currentEntry?: JournalEntry;
            recentEntries: JournalEntry[];
            userPatterns?: UserPattern;
        };

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        // Build comprehensive context from user patterns
        let contextInfo = '';
        let emotionalInsights = '';
        let behavioralPatterns = '';

        if (userPatterns) {
            const topTopics = userPatterns.recurringTopics.slice(0, 5).map(t => `${t.topic} (${t.count} times)`).join(', ');
            const topMoods = userPatterns.emotionalTrends.slice(0, 5).map(e => `${e.mood} (${e.frequency} times)`).join(', ');

            // Analyze emotional patterns for deeper insights
            const moodTrends = userPatterns.emotionalTrends;
            const positiveMoods = moodTrends.filter(m => ['happy', 'content', 'calm'].includes(m.mood));
            const challengingMoods = moodTrends.filter(m => ['anxious', 'stressed', 'sad', 'angry'].includes(m.mood));

            // Identify trending emotions
            const increasingMoods = moodTrends.filter(m => m.trend === 'increasing').map(m => m.mood);
            const decreasingMoods = moodTrends.filter(m => m.trend === 'decreasing').map(m => m.mood);

            emotionalInsights = `
Emotional patterns:
- Positive moods: ${positiveMoods.map(m => m.mood).join(', ') || 'none recently'}
- Challenging moods: ${challengingMoods.map(m => m.mood).join(', ') || 'none recently'}
- Most frequent mood: ${moodTrends[0]?.mood || 'neutral'}
- Increasing trends: ${increasingMoods.join(', ') || 'none'}
- Decreasing trends: ${decreasingMoods.join(', ') || 'none'}
- Emotional range: ${moodTrends.length > 1 ? 'varied' : 'consistent'}`;

            behavioralPatterns = `
Behavioral patterns:
- Journaling time: ${userPatterns.commonTimeOfDay}
- Average session: ${Math.round(userPatterns.averageSessionLength)} seconds
- Total entries: ${recentEntries.length + 1}
- Most discussed topics: ${topTopics}`;

            contextInfo = `User context:
${emotionalInsights}
${behavioralPatterns}`;
        }

        // Enhanced recent entries context with emotional analysis
        const recentContext = recentEntries.slice(0, 5).map((entry, idx) => {
            const daysAgo = Math.floor((Date.now() - new Date(entry.timestamp).getTime()) / (1000 * 60 * 60 * 24));
            const timeAgo = daysAgo === 0 ? 'today' : daysAgo === 1 ? 'yesterday' : `${daysAgo} days ago`;
            return `Entry ${idx + 1} (${timeAgo}): Mood: ${entry.mood.primary} | Topics: ${entry.topics.slice(0, 2).join(', ')} | "${entry.transcription.substring(0, 120)}..."`;
        }).join('\n');

        const currentText = currentEntry?.transcription || '';
        const currentMood = currentEntry?.mood?.primary || 'unknown';
        const currentTopics = currentEntry?.topics || [];
        const currentEmotions = currentEntry?.emotions || [];

        const prompt = `You're a supportive friend helping someone reflect on their thoughts. Keep it natural and conversational.

${contextInfo}

Recent entries:
${recentContext}

Current entry:
- Mood: ${currentMood}
- Topics: ${currentTopics.join(', ') || 'none'}
- Content: ${currentText}

Create 3 short, thoughtful questions that feel like something a caring friend would ask. Make them:
- Simple and direct (1-2 sentences max)
- Personal to what they just shared
- Easy to think about
- Supportive, not clinical

Focus on:
1. How they're feeling right now
2. What's really going on for them
3. What matters most to them

Respond in JSON:
{
  "prompts": [
    {
      "prompt": "Short, natural question",
      "context": "Brief reason why this matters now",
      "category": "emotional|behavioral|values"
    }
  ]
}`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You\'re a caring friend who asks thoughtful questions. Keep your responses natural, short, and supportive. Avoid clinical language or overly complex questions.',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.8, // Higher for more natural, conversational responses
        });

        const result = JSON.parse(completion.choices[0].message.content || '{"prompts":[]}');

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Prompt generation error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate prompts' },
            { status: 500 }
        );
    }
}
