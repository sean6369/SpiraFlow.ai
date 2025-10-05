// Simple test script to verify Deepgram integration
const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

async function testDeepgram() {
    try {
        console.log('🧪 Testing Deepgram integration...');

        // Create a simple test audio file (you can replace this with a real audio file)
        const testAudioPath = './test-audio.webm'; // You'll need to create this

        if (!fs.existsSync(testAudioPath)) {
            console.log('❌ Test audio file not found. Please create test-audio.webm');
            return;
        }

        const formData = new FormData();
        formData.append('audio', fs.createReadStream(testAudioPath));

        const response = await axios.post('http://localhost:3000/api/transcribe-live', formData, {
            headers: {
                ...formData.getHeaders(),
            },
            timeout: 30000,
        });

        console.log('✅ Deepgram test successful!');
        console.log('Transcription:', response.data.transcription);
        console.log('Confidence:', response.data.confidence);

    } catch (error) {
        console.error('❌ Deepgram test failed:', error.response?.data || error.message);
    }
}

testDeepgram();
