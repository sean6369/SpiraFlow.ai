import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 10000,
    maxRetries: 1,
});

export async function GET() {
    try {
        console.log('Testing OpenAI connection...');
        console.log('API Key exists:', !!process.env.OPENAI_API_KEY);
        console.log('API Key starts with:', process.env.OPENAI_API_KEY?.substring(0, 10) + '...');

        // Test simple API call
        const models = await openai.models.list();

        return NextResponse.json({
            success: true,
            message: 'OpenAI connection successful',
            modelsCount: models.data.length,
            whisperAvailable: models.data.some(m => m.id === 'whisper-1')
        });
    } catch (error: any) {
        console.error('OpenAI test error:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            code: error.code,
            type: error.type,
            status: error.status
        }, { status: 500 });
    }
}
