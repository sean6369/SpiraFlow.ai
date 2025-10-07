import { DBSchema, IDBPDatabase } from 'idb';
import { JournalEntry, UserPattern } from '../types';
interface SpiraFlowDB extends DBSchema {
    entries: {
        key: string;
        value: JournalEntry;
        indexes: {
            'by-date': Date;
            'by-mood': string;
            'by-topic': string;
        };
    };
    patterns: {
        key: string;
        value: UserPattern;
    };
    audio: {
        key: string;
        value: {
            id: string;
            blob: Blob;
            timestamp: Date;
        };
    };
}
export declare function getDB(): Promise<IDBPDatabase<SpiraFlowDB>>;
export declare function saveEntry(entry: JournalEntry): Promise<void>;
export declare function getEntry(id: string): Promise<JournalEntry | undefined>;
export declare function getAllEntries(): Promise<JournalEntry[]>;
export declare function getEntriesByDateRange(start: Date, end: Date): Promise<JournalEntry[]>;
export declare function getEntriesByMood(mood: string): Promise<JournalEntry[]>;
export declare function getEntriesByTopic(topic: string): Promise<JournalEntry[]>;
export declare function deleteEntry(id: string): Promise<void>;
export declare function saveAudio(id: string, blob: Blob): Promise<void>;
export declare function getAudio(id: string): Promise<Blob | undefined>;
export declare function saveUserPatterns(patterns: UserPattern): Promise<void>;
export declare function getUserPatterns(userId: string): Promise<UserPattern | undefined>;
export declare function updateEntryTitle(id: string, title: string): Promise<void>;
export declare function updateEntryTranscription(id: string, transcription: string): Promise<void>;
export {};
