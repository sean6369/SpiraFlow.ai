import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { AIAnalysis } from '@/types';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 30000, // 30 seconds timeout
    maxRetries: 2,
});

export async function POST(request: NextRequest) {
    try {
        const { transcription } = await request.json();

        if (!transcription) {
            return NextResponse.json(
                { error: 'No transcription provided' },
                { status: 400 }
            );
        }

        const prompt = `Analyze the following journal entry and provide:
1. Main topics/themes (as an array of strings)
2. Primary mood (one of: happy, content, calm, neutral, anxious, stressed, sad, angry)
3. Secondary emotions detected (as an array)
4. Key keywords (as an array)
5. A brief one-sentence summary

Journal entry:
"""
${transcription}
"""

Respond in JSON format with this structure:
{
  "topics": ["topic1", "topic2"],
  "mood": {
    "primary": "calm",
    "confidence": 0.85,
    "secondaryMoods": ["content"]
  },
  "emotions": ["emotion1", "emotion2"],
  "keywords": ["keyword1", "keyword2"],
  "summary": "Brief summary here"
}`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are an empathetic AI assistant that analyzes journal entries. Provide thoughtful, accurate analysis in valid JSON format only.',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
        });

        const analysis: AIAnalysis = JSON.parse(completion.choices[0].message.content || '{}');

        return NextResponse.json(analysis);
    } catch (error: any) {
        console.error('Analysis error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to analyze transcription' },
            { status: 500 }
        );
    }
}

