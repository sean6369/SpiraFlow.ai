export declare class AudioRecorder {
    private mediaRecorder;
    private audioChunks;
    private stream;
    private audioContext;
    private analyser;
    private source;
    private lastTranscriptionChunk;
    init(): Promise<void>;
    getAnalyser(): AnalyserNode | null;
    start(onDataAvailable?: (chunk: Blob) => void): void;
    pause(): void;
    resume(): void;
    stop(): Promise<Blob>;
    getBlob(): Promise<Blob>;
    getNewAudioBlob(): Promise<Blob>;
    markTranscriptionComplete(): void;
    cleanup(): void;
    getState(): 'inactive' | 'recording' | 'paused';
}
export declare function formatDuration(seconds: number): string;
