export class AudioRecorder {
    private mediaRecorder: MediaRecorder | null = null;
    private audioChunks: Blob[] = [];
    private stream: MediaStream | null = null;
    private audioContext: AudioContext | null = null;
    private analyser: AnalyserNode | null = null;
    private source: MediaStreamAudioSourceNode | null = null;
    private lastTranscriptionChunk: number = 0;

    async init(): Promise<void> {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Create audio context for visualization
            this.audioContext = new AudioContext();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            this.analyser.smoothingTimeConstant = 0.8;

            this.source = this.audioContext.createMediaStreamSource(this.stream);
            this.source.connect(this.analyser);
        } catch (error) {
            console.error('Error accessing microphone:', error);
            throw new Error('Microphone access denied');
        }
    }

    getAnalyser(): AnalyserNode | null {
        return this.analyser;
    }

    start(onDataAvailable?: (chunk: Blob) => void): void {
        if (!this.stream) {
            throw new Error('AudioRecorder not initialized');
        }

        this.audioChunks = [];
        this.mediaRecorder = new MediaRecorder(this.stream);

        this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                this.audioChunks.push(event.data);
                if (onDataAvailable) {
                    onDataAvailable(event.data);
                }
            }
        };

        this.mediaRecorder.start(500); // Collect data every 500ms for faster processing
    }

    pause(): void {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.pause();
        }
    }

    resume(): void {
        if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
            this.mediaRecorder.resume();
        }
    }

    async stop(): Promise<Blob> {
        return new Promise((resolve, reject) => {
            if (!this.mediaRecorder) {
                reject(new Error('No active recording'));
                return;
            }

            this.mediaRecorder.onstop = () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
                resolve(audioBlob);
            };

            this.mediaRecorder.stop();
        });
    }

    async getBlob(): Promise<Blob> {
        // Return current audio chunks without stopping the recording
        if (this.audioChunks.length === 0) {
            return new Blob([], { type: 'audio/webm' });
        }
        return new Blob(this.audioChunks, { type: 'audio/webm' });
    }

    async getNewAudioBlob(): Promise<Blob> {
        // Return only new audio chunks since last transcription
        if (this.audioChunks.length <= this.lastTranscriptionChunk) {
            return new Blob([], { type: 'audio/webm' });
        }

        const newChunks = this.audioChunks.slice(this.lastTranscriptionChunk);
        this.lastTranscriptionChunk = this.audioChunks.length;

        // Keep WebM format for compatibility with Whisper
        return new Blob(newChunks, { type: 'audio/webm' });
    }

    markTranscriptionComplete(): void {
        // Mark current position as transcribed
        this.lastTranscriptionChunk = this.audioChunks.length;
    }

    cleanup(): void {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        if (this.source) {
            this.source.disconnect();
            this.source = null;
        }
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        this.analyser = null;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.lastTranscriptionChunk = 0;
    }

    getState(): 'inactive' | 'recording' | 'paused' {
        return this.mediaRecorder?.state || 'inactive';
    }
}

export function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

