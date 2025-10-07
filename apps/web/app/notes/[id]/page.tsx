'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, Tag, Heart, Play, Download, MoreVertical, Trash2 } from 'lucide-react';
import { getEntry, getAudio, updateEntryTitle, updateEntryTranscription, deleteEntry, JournalEntry } from '@spiraflow/shared';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

export default function NoteDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [entry, setEntry] = useState<JournalEntry | null>(null);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState('');
    const [isSavingTitle, setIsSavingTitle] = useState(false);
    const [isEditingContent, setIsEditingContent] = useState(false);
    const [editedContent, setEditedContent] = useState('');
    const [isSavingContent, setIsSavingContent] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const moodColors: { [key: string]: string } = {
        happy: 'bg-yellow-100 text-yellow-700',
        content: 'bg-green-100 text-green-700',
        calm: 'bg-blue-100 text-blue-700',
        neutral: 'bg-gray-100 text-gray-700',
        anxious: 'bg-orange-100 text-orange-700',
        stressed: 'bg-red-100 text-red-700',
        sad: 'bg-indigo-100 text-indigo-700',
        angry: 'bg-red-100 text-red-700',
    };

    useEffect(() => {
        if (params.id) {
            loadEntry(params.id as string);
        }
    }, [params.id]);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const loadEntry = async (entryId: string) => {
        try {
            const [entryData, audioData] = await Promise.all([
                getEntry(entryId),
                getAudio(entryId)
            ]);

            setEntry(entryData);
            setAudioBlob(audioData);
        } catch (error) {
            console.error('Error loading entry:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const playAudio = () => {
        if (!audioBlob) return;

        if (audioElement) {
            if (isPlaying) {
                audioElement.pause();
                setIsPlaying(false);
            } else {
                audioElement.play();
                setIsPlaying(true);
            }
        } else {
            const audio = new Audio();
            const url = URL.createObjectURL(audioBlob);
            audio.src = url;
            audio.onended = () => {
                setIsPlaying(false);
                URL.revokeObjectURL(url);
            };
            audio.onplay = () => setIsPlaying(true);
            audio.onpause = () => setIsPlaying(false);

            setAudioElement(audio);
            audio.play();
            setIsPlaying(true);
        }
    };

    const downloadAudio = () => {
        if (!audioBlob) return;

        const url = URL.createObjectURL(audioBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `journal-entry-${entry?.id || 'unknown'}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const startEditingTitle = () => {
        if (entry) {
            setEditedTitle(entry.title);
            setIsEditingTitle(true);
        }
    };

    const cancelEditingTitle = () => {
        setIsEditingTitle(false);
        setEditedTitle('');
    };

    const saveTitle = async () => {
        if (!entry || !editedTitle.trim()) return;

        setIsSavingTitle(true);
        try {
            await updateEntryTitle(entry.id, editedTitle.trim());
            setEntry({ ...entry, title: editedTitle.trim() });
            setIsEditingTitle(false);
        } catch (error) {
            console.error('Error saving title:', error);
        } finally {
            setIsSavingTitle(false);
        }
    };

    const handleTitleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveTitle();
        } else if (e.key === 'Escape') {
            cancelEditingTitle();
        }
    };

    const handleTitleBlur = () => {
        if (editedTitle.trim() && editedTitle.trim() !== entry?.title) {
            saveTitle();
        } else {
            cancelEditingTitle();
        }
    };

    const startEditingContent = (e?: React.MouseEvent) => {
        if (entry) {
            setEditedContent(entry.transcription);
            setIsEditingContent(true);

            // Focus and position cursor
            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.focus();

                    // Auto-resize to fit content
                    textareaRef.current.style.height = 'auto';
                    textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';

                    // If click event exists, try to position cursor at click location
                    if (e) {
                        const rect = textareaRef.current.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;

                        // Approximate character position based on click coordinates
                        const lineHeight = parseInt(getComputedStyle(textareaRef.current).lineHeight) || 24;
                        const fontSize = parseInt(getComputedStyle(textareaRef.current).fontSize) || 16;
                        const charWidth = fontSize * 0.6; // Approximate character width

                        const lineIndex = Math.floor(y / lineHeight);
                        const charInLine = Math.floor(x / charWidth);

                        const lines = entry.transcription.split('\n');
                        let charIndex = 0;

                        for (let i = 0; i < Math.min(lineIndex, lines.length - 1); i++) {
                            charIndex += lines[i].length + 1; // +1 for newline
                        }
                        charIndex += Math.min(charInLine, lines[lineIndex]?.length || 0);
                        charIndex = Math.min(charIndex, entry.transcription.length);

                        textareaRef.current.setSelectionRange(charIndex, charIndex);
                    }
                }
            }, 0);
        }
    };

    const cancelEditingContent = () => {
        setIsEditingContent(false);
        setEditedContent('');
    };

    const saveContent = async () => {
        if (!entry || !editedContent.trim()) return;

        setIsSavingContent(true);
        try {
            await updateEntryTranscription(entry.id, editedContent.trim());
            setEntry({ ...entry, transcription: editedContent.trim() });
            setIsEditingContent(false);
        } catch (error) {
            console.error('Error saving content:', error);
        } finally {
            setIsSavingContent(false);
        }
    };

    const handleContentKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            saveContent();
        } else if (e.key === 'Escape') {
            cancelEditingContent();
        }
    };

    const handleContentBlur = () => {
        if (editedContent.trim() && editedContent.trim() !== entry?.transcription) {
            saveContent();
        } else {
            cancelEditingContent();
        }
    };

    const handleDelete = async () => {
        if (!entry) return;

        const confirmed = window.confirm('Are you sure you want to delete this entry? This action cannot be undone.');
        if (!confirmed) return;

        setIsDeleting(true);
        try {
            await deleteEntry(entry.id);
            router.push('/history'); // Redirect to history page after deletion
        } catch (error) {
            console.error('Error deleting entry:', error);
            alert('Failed to delete entry. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <Loader2 className="w-8 h-8 text-secondary-500 animate-spin" />
            </div>
        );
    }

    if (!entry) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center">
                    <h1 className="text-2xl font-poppins font-bold text-black mb-4">
                        Entry Not Found
                    </h1>
                    <p className="text-gray-600 mb-8">
                        The journal entry you're looking for doesn't exist.
                    </p>
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center px-6 py-3 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Document-style Header Bar */}
            <div className="sticky top-16 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-8 py-3 flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center text-gray-500 hover:text-gray-700 transition-colors text-sm"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back
                    </button>

                    <div className="flex items-center gap-2">
                        {audioBlob && (
                            <button
                                onClick={playAudio}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm transition-colors ${isPlaying
                                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {isPlaying ? (
                                    <div className="w-3.5 h-3.5 flex items-center justify-center">
                                        <div className="w-2 h-2 bg-current rounded-sm"></div>
                                    </div>
                                ) : (
                                    <Play className="w-3.5 h-3.5" />
                                )}
                                <span>{isPlaying ? 'Pause' : 'Play'}</span>
                            </button>
                        )}

                        {/* Menu Button */}
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setShowMenu(!showMenu)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm transition-colors"
                            >
                                <MoreVertical className="w-3.5 h-3.5" />
                            </button>

                            {/* Dropdown Menu */}
                            {showMenu && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                                >
                                    {audioBlob && (
                                        <button
                                            onClick={downloadAudio}
                                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            <Download className="w-4 h-4" />
                                            Download Audio
                                        </button>
                                    )}
                                    <button
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        {isDeleting ? 'Deleting...' : 'Delete Entry'}
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Three-column layout: metadata left, notes center, prompts right */}
            <div className="flex justify-center px-8 py-16">
                <div className="flex gap-8 max-w-7xl w-full">
                    {/* Left sidebar - Mood, Topics, Emotions */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="hidden lg:block w-64 flex-shrink-0"
                    >
                        <div className="sticky top-24 space-y-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Entry Details
                            </h2>

                            {/* Mood */}
                            <div className="space-y-2">
                                <h3 className="text-sm font-medium text-gray-700">Mood</h3>
                                <div className={`px-3 py-2 rounded-lg text-sm font-medium ${moodColors[entry.mood.primary.toLowerCase()] || moodColors.neutral}`}>
                                    {entry.mood.primary}
                                </div>
                                <div className="text-xs text-gray-500">
                                    Confidence: {Math.round((entry.mood.confidence || 0) * 100)}%
                                </div>
                            </div>

                            {/* Topics */}
                            {entry.topics.length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium text-gray-700">Topics</h3>
                                    <div className="space-y-2">
                                        {entry.topics.map((topic, idx) => (
                                            <span
                                                key={idx}
                                                className="inline-block px-2.5 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                                            >
                                                {topic}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Emotions */}
                            {entry.emotions.length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium text-gray-700">Emotions</h3>
                                    <div className="space-y-2">
                                        {entry.emotions.map((emotion, idx) => (
                                            <span
                                                key={idx}
                                                className="inline-block px-2.5 py-1 bg-pink-50 text-pink-700 rounded text-xs"
                                            >
                                                {emotion}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Additional metadata */}
                            <div className="space-y-3 pt-4 border-t border-gray-200">
                                <div className="text-xs text-gray-500">
                                    <div className="flex justify-between">
                                        <span>Duration:</span>
                                        <span>{Math.round(entry.duration)}s</span>
                                    </div>
                                </div>
                                {entry.metadata?.wordCount && (
                                    <div className="text-xs text-gray-500">
                                        <div className="flex justify-between">
                                            <span>Words:</span>
                                            <span>{entry.metadata.wordCount}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Main note content - centered */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full max-w-3xl"
                    >
                        {/* Title - Document style */}
                        {isEditingTitle ? (
                            <div className="mb-4">
                                <input
                                    type="text"
                                    value={editedTitle}
                                    onChange={(e) => setEditedTitle(e.target.value)}
                                    onKeyDown={handleTitleKeyDown}
                                    onBlur={handleTitleBlur}
                                    className="text-5xl font-bold text-gray-900 bg-transparent focus:outline-none w-full placeholder-gray-300"
                                    placeholder="Untitled"
                                    autoFocus
                                />
                            </div>
                        ) : (
                            <h1
                                onClick={startEditingTitle}
                                className="text-5xl font-bold text-gray-900 cursor-text hover:bg-gray-50 px-2 -mx-2 py-1 rounded transition-colors mb-4"
                            >
                                {entry.title}
                            </h1>
                        )}

                        {/* Date and time metadata */}
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 mb-8 pb-8 border-b border-gray-200">
                            <div className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                <span>{format(new Date(entry.timestamp), 'MMM dd, yyyy')}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4" />
                                <span>{format(new Date(entry.timestamp), 'h:mm a')}</span>
                            </div>
                        </div>

                        {/* Editable Content Area */}
                        <div className="mb-12">
                            {isEditingContent ? (
                                <textarea
                                    ref={textareaRef}
                                    value={editedContent}
                                    onChange={(e) => {
                                        setEditedContent(e.target.value);
                                        // Auto-resize textarea
                                        e.target.style.height = 'auto';
                                        e.target.style.height = e.target.scrollHeight + 'px';
                                    }}
                                    onKeyDown={handleContentKeyDown}
                                    onBlur={handleContentBlur}
                                    className="w-full text-base text-gray-800 leading-relaxed bg-transparent focus:outline-none resize-none border-none p-0"
                                    style={{
                                        minHeight: '200px',
                                        overflow: 'hidden'
                                    }}
                                    placeholder="Start typing your note..."
                                />
                            ) : (
                                <div
                                    onClick={(e) => startEditingContent(e)}
                                    className="text-base text-gray-800 leading-relaxed whitespace-pre-wrap cursor-text min-h-[200px]"
                                >
                                    {entry.transcription}
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* AI Prompts sidebar - on the right */}
                    {entry.aiPrompts && entry.aiPrompts.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="hidden lg:block w-80 flex-shrink-0"
                        >
                            <div className="sticky top-24 space-y-4">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                    AI Reflection Prompts
                                </h2>
                                <div className="space-y-4">
                                    {entry.aiPrompts.map((prompt) => (
                                        <div
                                            key={prompt.id}
                                            className="bg-gradient-to-br from-secondary-50 to-secondary-100 border border-secondary-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                                        >
                                            <p className="text-sm text-gray-800 leading-relaxed mb-2">
                                                {prompt.prompt}
                                            </p>
                                            {prompt.context && (
                                                <p className="text-xs text-gray-500 italic">
                                                    {prompt.context}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
