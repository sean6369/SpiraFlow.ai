import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { fetch as undiciFetch, Agent } from 'undici';

// Create a custom agent with better connection settings
const agent = new Agent({
    keepAliveTimeout: 60000,
    keepAliveMaxTimeout: 120000,
    connections: 100,
});

export async function POST(request: NextRequest) {
    try {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            timeout: 30000, // Reduced to 30 seconds for faster response
            maxRetries: 0, // No retries for live transcription to reduce latency
            // @ts-ignore - Type compatibility between undici fetch and standard fetch
            fetch: (url: RequestInfo | URL, init?: RequestInit) => {
                // @ts-ignore - Type compatibility between undici and standard fetch
                return undiciFetch(url, {
                    ...init,
                    // @ts-ignore - duplex is required for undici but not in standard RequestInit type
                    duplex: 'half',
                    dispatcher: agent,
                });
            },
        });

        const formData = await request.formData();
        const audioFile = formData.get('audio') as File;

        if (!audioFile) {
            return NextResponse.json(
                { error: 'No audio file provided' },
                { status: 400 }
            );
        }

        // Validate file size (max 25MB for Whisper)
        const maxSize = 25 * 1024 * 1024; // 25MB
        if (audioFile.size > maxSize) {
            return NextResponse.json(
                { error: 'Audio file too large. Maximum size is 25MB.' },
                { status: 400 }
            );
        }

        console.log(`Processing audio file: ${audioFile.name}, size: ${audioFile.size} bytes`);

        // Convert File to format Whisper API expects
        const transcription = await openai.audio.transcriptions.create({
            file: audioFile,
            model: 'whisper-1',
            language: 'en',
            response_format: 'verbose_json',
        });

        return NextResponse.json({
            transcription: transcription.text,
            duration: transcription.duration,
            language: transcription.language,
        });
    } catch (error: any) {
        console.error('Transcription error:', error);

        // Handle specific error types
        if (error.code === 'ECONNRESET' || error.type === 'system') {
            return NextResponse.json(
                { error: 'Network connection error. Please check your internet connection and try again.' },
                { status: 503 }
            );
        }

        if (error.status === 401) {
            return NextResponse.json(
                { error: 'Invalid API key. Please check your OpenAI API key.' },
                { status: 401 }
            );
        }

        if (error.status === 429) {
            return NextResponse.json(
                { error: 'Rate limit exceeded. Please wait a moment and try again.' },
                { status: 429 }
            );
        }

        return NextResponse.json(
            { error: error.message || 'Failed to transcribe audio. Please try again.' },
            { status: 500 }
        );
    }
}

