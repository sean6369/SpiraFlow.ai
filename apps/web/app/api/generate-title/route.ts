import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 30000,
    maxRetries: 2,
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

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are an AI assistant that creates concise, meaningful titles for journal entries. 
                    
                    Guidelines:
                    - Create titles that are 3-8 words long
                    - Capture the main theme, emotion, or topic of the entry
                    - Use natural, conversational language
                    - Avoid generic titles like "My Thoughts" or "Journal Entry"
                    - Focus on the most important or recurring themes
                    - Make titles that would help someone quickly identify the entry later
                    
                    Return only the title text, nothing else.`
                },
                {
                    role: 'user',
                    content: `Create a title for this journal entry:\n\n${transcription}`
                }
            ],
            max_tokens: 50,
            temperature: 0.7,
        });

        const title = response.choices[0]?.message?.content?.trim();

        if (!title) {
            throw new Error('No title generated');
        }

        return NextResponse.json({ title });

    } catch (error: any) {
        console.error('Error generating title:', error);

        // Fallback: create a simple title from the first few words
        try {
            const { transcription } = await request.json();
            const words = transcription.trim().split(/\s+/).slice(0, 4);
            const fallbackTitle = words.join(' ') + (words.length < transcription.split(/\s+/).length ? '...' : '');

            return NextResponse.json({ title: fallbackTitle });
        } catch (fallbackError) {
            return NextResponse.json(
                { error: 'Failed to generate title' },
                { status: 500 }
            );
        }
    }
}
