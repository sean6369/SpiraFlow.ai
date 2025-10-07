import { openDB, DBSchema, IDBPDatabase } from 'idb';
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

let dbInstance: IDBPDatabase<SpiraFlowDB> | null = null;

export async function getDB() {
    if (dbInstance) return dbInstance;

    dbInstance = await openDB<SpiraFlowDB>('spiraflow-db', 1, {
        upgrade(db) {
            // Entries store
            const entryStore = db.createObjectStore('entries', { keyPath: 'id' });
            entryStore.createIndex('by-date', 'timestamp');
            entryStore.createIndex('by-mood', 'mood.primary');
            entryStore.createIndex('by-topic', 'topics', { multiEntry: true });

            // Patterns store
            db.createObjectStore('patterns', { keyPath: 'userId' });

            // Audio store (for offline storage)
            db.createObjectStore('audio', { keyPath: 'id' });
        },
    });

    return dbInstance;
}

export async function saveEntry(entry: JournalEntry): Promise<void> {
    const db = await getDB();
    await db.put('entries', entry);
}

export async function getEntry(id: string): Promise<JournalEntry | undefined> {
    const db = await getDB();
    return db.get('entries', id);
}

export async function getAllEntries(): Promise<JournalEntry[]> {
    const db = await getDB();
    return db.getAll('entries');
}

export async function getEntriesByDateRange(start: Date, end: Date): Promise<JournalEntry[]> {
    const db = await getDB();
    const allEntries = await db.getAllFromIndex('entries', 'by-date');
    return allEntries.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        return entryDate >= start && entryDate <= end;
    });
}

export async function getEntriesByMood(mood: string): Promise<JournalEntry[]> {
    const db = await getDB();
    return db.getAllFromIndex('entries', 'by-mood', mood);
}

export async function getEntriesByTopic(topic: string): Promise<JournalEntry[]> {
    const db = await getDB();
    return db.getAllFromIndex('entries', 'by-topic', topic);
}

export async function deleteEntry(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('entries', id);
}

export async function saveAudio(id: string, blob: Blob): Promise<void> {
    const db = await getDB();
    await db.put('audio', { id, blob, timestamp: new Date() });
}

export async function getAudio(id: string): Promise<Blob | undefined> {
    const db = await getDB();
    const record = await db.get('audio', id);
    return record?.blob;
}

export async function saveUserPatterns(patterns: UserPattern): Promise<void> {
    const db = await getDB();
    await db.put('patterns', patterns);
}

export async function getUserPatterns(userId: string): Promise<UserPattern | undefined> {
    const db = await getDB();
    return db.get('patterns', userId);
}

export async function updateEntryTitle(id: string, title: string): Promise<void> {
    const db = await getDB();
    const entry = await db.get('entries', id);
    if (entry) {
        entry.title = title;
        entry.metadata.lastModified = new Date();
        await db.put('entries', entry);
    }
}

export async function updateEntryTranscription(id: string, transcription: string): Promise<void> {
    const db = await getDB();
    const entry = await db.get('entries', id);
    if (entry) {
        entry.transcription = transcription;
        entry.metadata.lastModified = new Date();
        // Update word count
        entry.metadata.wordCount = transcription.trim().split(/\s+/).filter(word => word.length > 0).length;
        await db.put('entries', entry);
    }
}

