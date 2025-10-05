import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@deepgram/sdk';

const deepgram = createClient(process.env.DEEPGRAM_API_KEY!);

export async function POST(request: NextRequest) {
    try {
        console.log('🎤 Deepgram transcribe-live API called');

        // Check if API key is set
        if (!process.env.DEEPGRAM_API_KEY) {
            console.error('❌ DEEPGRAM_API_KEY not found in environment variables');
            return NextResponse.json({ error: 'Deepgram API key not configured' }, { status: 500 });
        }

        const formData = await request.formData();
        const audioFile = formData.get('audio') as File;

        if (!audioFile) {
            console.error('❌ No audio file in request');
            return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
        }

        console.log('📁 Audio file received:', {
            name: audioFile.name,
            type: audioFile.type,
            size: audioFile.size
        });

        // Convert File to buffer
        const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
        console.log('📦 Audio buffer size:', audioBuffer.length);

        // Use Deepgram's pre-recorded transcription with optimized settings for lower latency
        console.log('🔄 Calling Deepgram API...');
        const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
            audioBuffer,
            {
                model: 'nova-2', // Use standard nova-2 model
                language: 'en',
                smart_format: true,
                punctuate: true,
                diarize: false,
                // Optimize for speed - remove invalid parameters
                multichannel: false,
                profanity_filter: false, // Skip profanity filtering for speed
                redact: false, // Skip redaction for speed
                search: [], // No search terms for speed
                keywords: [], // No keyword boosting for speed
                // Reduce processing overhead
                utterances: false, // Disable utterance detection for speed
                utt_split: 0.8, // Lower utterance split threshold
            }
        );

        if (error) {
            console.error('❌ Deepgram API error:', error);
            return NextResponse.json({ error: `Deepgram error: ${error}` }, { status: 500 });
        }

        console.log('📊 Deepgram response:', JSON.stringify(result, null, 2));

        const transcription = result?.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';
        const confidence = result?.results?.channels?.[0]?.alternatives?.[0]?.confidence || 0;

        console.log('✅ Transcription successful:', {
            length: transcription.length,
            confidence,
            preview: transcription.substring(0, 100)
        });

        return NextResponse.json({
            transcription: transcription.trim(),
            confidence
        });

    } catch (error: any) {
        console.error('❌ Live transcription error:', error);
        console.error('Error stack:', error.stack);
        return NextResponse.json(
            { error: error.message || 'Failed to transcribe audio' },
            { status: 500 }
        );
    }
}
