import { AxiosRequestConfig } from 'axios';
import { AIPrompt, AIAnalysis, JournalEntry, UserPattern } from '../types';
export interface RequestOptions extends AxiosRequestConfig {
    baseUrl?: string;
}
export declare function fetchLivePrompts(transcription: string, options?: RequestOptions): Promise<AIPrompt[]>;
export declare function transcribeLiveAudio(formData: FormData, options?: RequestOptions): Promise<string>;
export interface TranscriptionOptions extends RequestOptions {
    retries?: number;
    retryDelayMs?: number;
}
export declare function transcribeAudio(formData: FormData, options?: TranscriptionOptions): Promise<string>;
export declare function analyzeTranscription(transcription: string, options?: RequestOptions): Promise<AIAnalysis>;
export declare function generateTitle(transcription: string, options?: RequestOptions): Promise<string>;
export interface PromptGenerationArgs {
    currentEntry: JournalEntry;
    recentEntries: JournalEntry[];
    userPatterns: UserPattern;
}
export declare function generatePrompts(args: PromptGenerationArgs, options?: RequestOptions): Promise<AIPrompt[]>;
