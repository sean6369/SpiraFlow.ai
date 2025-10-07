import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
    try {
        const { transcription } = await request.json();

        if (!transcription || typeof transcription !== 'string') {
            return NextResponse.json(
                { error: 'Transcription is required' },
                { status: 400 }
            );
        }

        if (transcription.trim().length < 10) {
            return NextResponse.json(
                { error: 'Transcription must be at least 10 characters long' },
                { status: 400 }
            );
        }

        const prompt = `You're a caring friend listening to someone share their thoughts. Create 2-3 short, natural questions based on what they just said.

What they're saying:
"""
${transcription}
"""

Make questions that:
- Are super short (1 sentence)
- Sound like a friend asking
- Help them think more about what they shared
- Feel natural to answer while talking

Focus on:
- How they're feeling
- What's really on their mind
- What they want to explore

Respond in JSON:
{
  "prompts": [
    {
      "prompt": "Short, natural question",
      "context": "Brief reason (1-3 words)"
    }
  ]
}`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You\'re a caring friend who asks short, natural questions. Keep it simple and conversational.',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.8,
            max_tokens: 300, // Limit response length for faster generation
        });

        const result = JSON.parse(completion.choices[0].message.content || '{"prompts":[]}');

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Live prompt generation error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate live prompts' },
            { status: 500 }
        );
    }
}
