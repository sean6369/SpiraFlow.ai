import axios, { AxiosRequestConfig } from 'axios';
import { AIPrompt, AIAnalysis, JournalEntry, UserPattern } from '../types';

export interface RequestOptions extends AxiosRequestConfig {
  baseUrl?: string;
}

const resolveUrl = (path: string, baseUrl?: string) => {
  if (!baseUrl) return path;
  const sanitizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${sanitizedBase}${path}`;
};

export async function fetchLivePrompts(transcription: string, options?: RequestOptions): Promise<AIPrompt[]> {
  const { baseUrl, ...axiosConfig } = options ?? {};
  const url = resolveUrl('/api/generate-live-prompts', baseUrl);
  const response = await axios.post(
    url,
    { transcription },
    { timeout: 6000, ...axiosConfig },
  );

  return (response.data?.prompts ?? []).map((prompt: any, index: number) => ({
    id: `live-prompt-${Date.now()}-${index}`,
    prompt: prompt.prompt,
    context: prompt.context,
    timestamp: new Date(),
    category: 'live',
  }));
}

export async function transcribeLiveAudio(formData: FormData, options?: RequestOptions): Promise<string> {
  const { baseUrl, ...axiosConfig } = options ?? {};
  const url = resolveUrl('/api/transcribe-live', baseUrl);
  const response = await axios.post(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 5000,
    ...axiosConfig,
  });
  return response.data?.transcription ?? '';
}

export interface TranscriptionOptions extends RequestOptions {
  retries?: number;
  retryDelayMs?: number;
}

export async function transcribeAudio(
  formData: FormData,
  options?: TranscriptionOptions,
): Promise<string> {
  const {
    retries = 2,
    retryDelayMs = 2000,
    baseUrl,
    ...axiosConfig
  } = options ?? {};

  const url = resolveUrl('/api/transcribe', baseUrl);

  let attempt = 0;
  for (;;) {
    try {
      const response = await axios.post(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
        ...axiosConfig,
      });
      return response.data?.transcription ?? '';
    } catch (error) {
      attempt += 1;
      if (attempt > retries) throw error;
      await new Promise(resolve => setTimeout(resolve, retryDelayMs));
    }
  }
}

export async function analyzeTranscription(
  transcription: string,
  options?: RequestOptions,
): Promise<AIAnalysis> {
  const { baseUrl, ...axiosConfig } = options ?? {};
  const url = resolveUrl('/api/analyze', baseUrl);
  const response = await axios.post(url, { transcription }, axiosConfig);
  return response.data as AIAnalysis;
}

export async function generateTitle(
  transcription: string,
  options?: RequestOptions,
): Promise<string> {
  const { baseUrl, ...axiosConfig } = options ?? {};
  const url = resolveUrl('/api/generate-title', baseUrl);
  const response = await axios.post(url, { transcription }, axiosConfig);
  return response.data?.title ?? 'Untitled Entry';
}

export interface PromptGenerationArgs {
  currentEntry: JournalEntry;
  recentEntries: JournalEntry[];
  userPatterns: UserPattern;
}

export async function generatePrompts(
  args: PromptGenerationArgs,
  options?: RequestOptions,
): Promise<AIPrompt[]> {
  const { baseUrl, ...axiosConfig } = options ?? {};
  const url = resolveUrl('/api/generate-prompts', baseUrl);
  const response = await axios.post(url, args, axiosConfig);

  return (response.data?.prompts ?? []).map((prompt: any, index: number) => ({
    id: `prompt-${Date.now()}-${index}`,
    prompt: prompt.prompt,
    context: prompt.context,
    timestamp: new Date(),
    category: prompt.category,
    therapeutic_approach: prompt.therapeutic_approach,
  }));
}
