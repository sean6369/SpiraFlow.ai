'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import RecordButton from '@/components/RecordButton';
import TranscriptionView from '@/components/TranscriptionView';
import AIPrompts from '@/components/AIPrompts';
import {
    AudioRecorder,
    saveEntry,
    saveAudio,
    getAllEntries,
    getUserPatterns,
    saveUserPatterns,
    analyzeUserPatterns,
    fetchLivePrompts,
    transcribeLiveAudio,
    transcribeAudio,
    analyzeTranscription,
    generateTitle,
    generatePrompts,
    JournalEntry,
    AIPrompt,
} from '@spiraflow/shared';

export default function HomePage() {
    const router = useRouter();
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [duration, setDuration] = useState(0);
    const [transcription, setTranscription] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string>();
    const [aiPrompts, setAiPrompts] = useState<AIPrompt[]>([]);
    const [isLoadingPrompts, setIsLoadingPrompts] = useState(false);
    const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
    const [liveTranscription, setLiveTranscription] = useState('');
    const [livePrompts, setLivePrompts] = useState<AIPrompt[]>([]);
    const [isGeneratingLivePrompts, setIsGeneratingLivePrompts] = useState(false);
    const [lastPromptGenerationText, setLastPromptGenerationText] = useState('');
    const [liveTranscriptionEnabled, setLiveTranscriptionEnabled] = useState(false);
    const [lastPromptWordCount, setLastPromptWordCount] = useState(0);
    const [isUserPausedSpeaking, setIsUserPausedSpeaking] = useState(false);
    const isUserPausedSpeakingRef = useRef(isUserPausedSpeaking);
    const [transcriptionBeforePause, setTranscriptionBeforePause] = useState('');
    const wasTranscribingBeforePauseRef = useRef<boolean>(false);
    const liveTranscriptionScrollRef = useRef<HTMLDivElement>(null);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Morning';
        if (hour < 18) return 'Afternoon';
        return 'Evening';
    };

    const audioRecorderRef = useRef<AudioRecorder | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const liveTranscribeRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number>(0);
    const pausedDurationRef = useRef<number>(0);
    const lastTranscriptionTimeRef = useRef<number>(0);
    const hasGeneratedPromptsRef = useRef<boolean>(false);
    const lastTranscriptionChangeRef = useRef<number>(0);
    const speechPauseTimerRef = useRef<NodeJS.Timeout | null>(null);
    const lastTranscriptionContentRef = useRef<string>(''); // Track actual content

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            if (liveTranscribeRef.current) {
                clearInterval(liveTranscribeRef.current);
            }
            if (speechPauseTimerRef.current) {
                clearTimeout(speechPauseTimerRef.current);
            }
            audioRecorderRef.current?.cleanup();
        };
    }, []);

    // Update the ref whenever isUserPausedSpeaking changes
    useEffect(() => {
        isUserPausedSpeakingRef.current = isUserPausedSpeaking;
    }, [isUserPausedSpeaking]);

    // Auto-scroll live transcription to bottom when new content is added
    useEffect(() => {
        if (liveTranscriptionScrollRef.current && liveTranscription) {
            const scrollContainer = liveTranscriptionScrollRef.current;
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
    }, [liveTranscription]);

    const generateLivePrompts = async (transcription: string, wordCount: number) => {
        try {
            setIsGeneratingLivePrompts(true);

            const prompts = await fetchLivePrompts(transcription);

            setLivePrompts(prompts);
            setLastPromptWordCount(wordCount); // Track when we last generated prompts
        } catch (error) {
            console.log('Live prompts generation error:', error);
            // Silently fail for live prompts
        } finally {
            setIsGeneratingLivePrompts(false);
        }
    };

    const performLiveTranscription = async () => {
        try {
            const recorder = audioRecorderRef.current;
            // Check the actual recorder state instead of React state
            const isRecorderPaused = recorder?.getState() === 'paused';

            console.log('🔄 performLiveTranscription called:', {
                recorder: !!recorder,
                isPaused,
                isRecorderPaused,
                liveTranscriptionEnabled,
                isUserPausedSpeaking: isUserPausedSpeakingRef.current
            });

            if (!recorder || isRecorderPaused || !liveTranscriptionEnabled) {
                console.log('❌ Early return from performLiveTranscription:', {
                    noRecorder: !recorder,
                    isRecorderPaused,
                    transcriptionDisabled: !liveTranscriptionEnabled
                });
                return;
            }

            // Get current time for all calculations
            const currentTime = Date.now();

            // Don't transcribe if user is paused for reading, but allow override if transcription is enabled
            if (isUserPausedSpeakingRef.current) {
                // Check if enough time has passed since last transcription to allow override
                const timeSinceLastTranscription = currentTime - lastTranscriptionTimeRef.current;
                if (timeSinceLastTranscription < 10000) { // Only skip if less than 10 seconds
                    console.log('Skipping transcription - user paused for reading');
                    return;
                } else {
                    console.log('Override pause - resuming transcription after long silence');
                    setIsUserPausedSpeaking(false);
                    isUserPausedSpeakingRef.current = false;
                }
            }

            // Only transcribe if we have enough new audio (at least 1.5 seconds for lower latency)
            const timeSinceLastTranscription = currentTime - lastTranscriptionTimeRef.current;
            console.log('⏰ Time check:', {
                timeSinceLastTranscription,
                needsMoreTime: timeSinceLastTranscription < 1500
            });
            if (timeSinceLastTranscription < 1500) {
                console.log('⏰ Skipping - not enough time since last transcription');
                return; // Skip if less than 1.5 seconds
            }

            // Get the full recording (WebM needs complete file with headers)
            const audioBlob = await recorder.getBlob();
            console.log('🎵 Audio blob check:', {
                hasBlob: !!audioBlob,
                size: audioBlob?.size || 0,
                needsMoreAudio: !audioBlob || audioBlob.size < 1000
            });
            if (!audioBlob || audioBlob.size < 1000) {
                console.log('🎵 Skipping transcription - not enough audio:', audioBlob?.size || 0);
                return; // Need at least 1KB of audio (reduced for faster processing)
            }

            console.log('🎵 Processing full audio:', audioBlob.size, 'bytes');

            // Check for audio activity using the analyser
            const analyser = recorder.getAnalyser();
            if (analyser) {
                const bufferLength = analyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);
                analyser.getByteFrequencyData(dataArray);

                // Calculate average volume
                const average = dataArray.reduce((a, b) => a + b) / bufferLength;

                // Skip transcription if audio is too quiet (likely silence)
                if (average < 5) {
                    console.log('Skipping transcription - audio too quiet:', average);
                    return;
                }
            }

            // Send to Deepgram live transcription API
            console.log('📤 Sending to Deepgram:', {
                blobSize: audioBlob.size,
                blobType: audioBlob.type
            });

            const formData = new FormData();
            formData.append('audio', audioBlob, 'recording.webm');

            const transcriptionResult = await transcribeLiveAudio(formData);

            console.log('📥 Deepgram transcription result:', transcriptionResult);

            if (transcriptionResult && transcriptionResult.trim()) {
                const newTranscription = transcriptionResult.trim();
                const previousTranscription = lastTranscriptionContentRef.current || liveTranscription;

                // Deepgram handles transcription better - simpler logic
                let finalTranscription = newTranscription;
                let transcriptionChanged = false;

                if (transcriptionBeforePause && transcriptionBeforePause.length > 0) {
                    // We're resuming after a pause - Deepgram should give us the full transcription
                    console.log('📝 Resuming after pause - using Deepgram transcription:', {
                        transcriptionBeforePause: transcriptionBeforePause.substring(0, 100),
                        newTranscription: newTranscription.substring(0, 100)
                    });

                    // Deepgram should provide the complete transcription, so use it directly
                    finalTranscription = newTranscription;
                    transcriptionChanged = newTranscription.length > transcriptionBeforePause.length + 10;
                    setTranscriptionBeforePause(''); // Clear the saved state
                } else {
                    // Normal transcription (no pause/resume) - be EXTREMELY strict about what constitutes a "change"
                    // Check if the transcription is actually different (not just punctuation changes)
                    const normalizeForComparison = (text: string) =>
                        text.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();

                    const normalizedPrev = normalizeForComparison(previousTranscription);
                    const normalizedNew = normalizeForComparison(newTranscription);

                    // First check: are they exactly the same?
                    const isSameContent = normalizedPrev === normalizedNew;

                    if (isSameContent) {
                        // Exact same content - no change
                        transcriptionChanged = false;
                        console.log('📊 Change detection: SAME CONTENT - no update');
                    } else {
                        // Content is different - check if it's significant
                        const previousWordCount = previousTranscription.split(/\s+/).filter(w => w.length > 0).length;
                        const newWordCount = newTranscription.split(/\s+/).filter(w => w.length > 0).length;

                        // Require at least 7 new words OR 40+ new characters
                        const wordCountIncreased = newWordCount > previousWordCount + 6;
                        const significantNewContent = normalizedNew.length > normalizedPrev.length + 40;

                        transcriptionChanged = wordCountIncreased || significantNewContent;

                        console.log('📊 Change detection:', {
                            previousWordCount,
                            newWordCount,
                            wordCountIncreased,
                            significantNewContent,
                            transcriptionChanged,
                            prevLength: normalizedPrev.length,
                            newLength: normalizedNew.length
                        });
                    }
                }

                setLiveTranscription(finalTranscription);
                lastTranscriptionContentRef.current = finalTranscription; // Store the actual content
                lastTranscriptionTimeRef.current = currentTime;

                if (transcriptionChanged) {
                    console.log('Transcription changed - user actively speaking');
                    // User is actively speaking - reset pause state
                    setIsUserPausedSpeaking(false);
                    isUserPausedSpeakingRef.current = false;
                    isUserPausedSpeakingRef.current = false; // Update ref immediately
                    lastTranscriptionChangeRef.current = currentTime;

                    // Clear any existing pause timer
                    if (speechPauseTimerRef.current) {
                        clearTimeout(speechPauseTimerRef.current);
                    }

                    // Set a timer to detect when user stops speaking (6 seconds of no change)
                    // Longer delay to allow prompts to generate before pausing
                    speechPauseTimerRef.current = setTimeout(() => {
                        console.log('User paused speaking - freezing prompts');
                        setIsUserPausedSpeaking(true);
                        isUserPausedSpeakingRef.current = true;
                        isUserPausedSpeakingRef.current = true; // Update ref immediately
                    }, 6000); // Increased to 6 seconds to allow prompt generation
                } else {
                    console.log('Transcription unchanged - no new speech detected');
                    // Even if transcription didn't change, check if we should pause
                    const timeSinceLastChange = currentTime - lastTranscriptionChangeRef.current;
                    if (timeSinceLastChange > 6000 && !isUserPausedSpeaking) {
                        console.log('No transcription changes for 6+ seconds - pausing prompts');
                        setIsUserPausedSpeaking(true);
                        isUserPausedSpeakingRef.current = true;
                        isUserPausedSpeakingRef.current = true; // Update ref immediately
                    }
                }

                // Progressive prompt generation: regenerate as user speaks more
                const wordCount = finalTranscription.split(/\s+/).length;

                // Generate prompts only when user is actively speaking
                // Block generation when user has paused to allow reading
                const shouldGeneratePrompts =
                    !isGeneratingLivePrompts &&
                    !isUserPausedSpeakingRef.current && // Use ref to get current value
                    (
                        // Initial generation at 10 words (allow even without transcription change)
                        (wordCount >= 10 && lastPromptWordCount === 0) ||
                        // Regenerate when transcription changes and we have enough new words
                        (transcriptionChanged && wordCount >= lastPromptWordCount + 20)
                    );

                console.log('Prompt generation check:', {
                    isGeneratingLivePrompts,
                    isUserPausedSpeaking,
                    isUserPausedSpeakingRef: isUserPausedSpeakingRef.current,
                    transcriptionChanged,
                    wordCount,
                    lastPromptWordCount,
                    shouldGeneratePrompts,
                    initialCondition: wordCount >= 10 && lastPromptWordCount === 0,
                    updateCondition: transcriptionChanged && wordCount >= lastPromptWordCount + 20
                });

                if (shouldGeneratePrompts) {
                    console.log('Generating new prompts...');
                    generateLivePrompts(finalTranscription, wordCount);
                }
            }
        } catch (error) {
            console.log('Live transcription error:', error);
            // Silently fail for live transcription
        }
    };

    const startRecording = async () => {
        try {
            setError(undefined);
            setTranscription('');
            setAiPrompts([]);
            setLiveTranscription('');
            lastTranscriptionContentRef.current = ''; // Reset content tracking
            setLivePrompts([]);
            setLastPromptGenerationText('');
            setLastPromptWordCount(0); // Reset word count for new recording
            setIsUserPausedSpeaking(false); // Reset pause state
            setTranscriptionBeforePause(''); // Reset transcription state
            lastTranscriptionTimeRef.current = 0;
            lastTranscriptionChangeRef.current = 0;
            hasGeneratedPromptsRef.current = false;

            // Clear any existing pause timer
            if (speechPauseTimerRef.current) {
                clearTimeout(speechPauseTimerRef.current);
            }

            const recorder = new AudioRecorder();
            await recorder.init();
            recorder.start();
            audioRecorderRef.current = recorder;

            // Get the analyser for sound wave visualization
            setAnalyser(recorder.getAnalyser());

            setIsRecording(true);
            setIsPaused(false);
            setDuration(0);
            pausedDurationRef.current = 0;
            startTimeRef.current = Date.now();

            timerRef.current = setInterval(() => {
                // Calculate total elapsed time: current session + all previous paused time
                const currentSessionTime = (Date.now() - startTimeRef.current) / 1000;
                const totalElapsed = currentSessionTime + (pausedDurationRef.current / 1000);
                setDuration(totalElapsed);
            }, 100);

            // Start live transcription every 2 seconds for lower latency
            liveTranscribeRef.current = setInterval(() => {
                performLiveTranscription();
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Failed to start recording');
        }
    };

    const stopRecording = async () => {
        try {
            if (!audioRecorderRef.current) return;

            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            if (liveTranscribeRef.current) {
                clearInterval(liveTranscribeRef.current);
            }

            const audioBlob = await audioRecorderRef.current.stop();
            audioRecorderRef.current.cleanup();

            console.log(`Audio recorded: ${audioBlob.size} bytes, type: ${audioBlob.type}, duration: ${duration}s`);

            setIsRecording(false);
            setIsPaused(false);
            setIsProcessing(true);
            setAnalyser(null);

            // Transcribe audio with retry logic
            const formData = new FormData();
            formData.append('audio', audioBlob, 'recording.webm');

            const text = await transcribeAudio(formData);
            setTranscription(text);

            // Analyze transcription
            const analysis = await analyzeTranscription(text);

            // Generate title
            let title = 'Untitled Entry';
            try {
                title = await generateTitle(text);
            } catch (error) {
                console.log('Title generation failed, using fallback:', error);
                // Fallback: use first few words
                const words = text.trim().split(/\s+/).slice(0, 4);
                title = words.join(' ') + (words.length < text.split(/\s+/).length ? '...' : '');
            }

            // Generate AI prompts first
            setIsLoadingPrompts(true);
            const allEntries = await getAllEntries();
            const patterns = analyzeUserPatterns(allEntries);

            // Create a temporary entry for prompt generation
            const tempEntry: JournalEntry = {
                id: `entry-${Date.now()}`,
                title,
                transcription: text,
                timestamp: new Date(),
                duration,
                topics: analysis.topics || [],
                mood: analysis.mood || { primary: 'neutral', confidence: 0.5 },
                emotions: analysis.emotions || [],
                metadata: {
                    recordingDate: new Date(),
                    lastModified: new Date(),
                    wordCount: text.split(/\s+/).length,
                },
            };

            const prompts = await generatePrompts({
                currentEntry: tempEntry,
                recentEntries: allEntries.slice(-5),
                userPatterns: patterns,
            });

            // Create journal entry with AI prompts
            const entry: JournalEntry = {
                ...tempEntry,
                aiPrompts: prompts,
            };

            // Save to IndexedDB
            await saveEntry(entry);
            await saveAudio(entry.id, audioBlob);

            // Update user patterns
            await saveUserPatterns(patterns);

            setAiPrompts(prompts);
            setIsLoadingPrompts(false);
            setIsProcessing(false);

            // Redirect to the notes page
            router.push(`/notes/${entry.id}`);
        } catch (err: any) {
            console.error('Error processing recording:', err);
            setError(err.message || 'Failed to process recording');
            setIsProcessing(false);
            setIsLoadingPrompts(false);
        }
    };

    const pauseRecording = () => {
        if (audioRecorderRef.current) {
            audioRecorderRef.current.pause();
            setIsPaused(true);

            // Save current transcription state before pausing
            setTranscriptionBeforePause(liveTranscription);

            // Track if live transcription was active AND enabled before pause
            const wasTranscribing = liveTranscribeRef.current !== null && liveTranscriptionEnabled;
            wasTranscribingBeforePauseRef.current = wasTranscribing;

            console.log('Pausing recording:', {
                liveTranscriptionEnabled,
                timerExists: liveTranscribeRef.current !== null,
                willResumeTranscription: wasTranscribing,
                currentTranscription: liveTranscription
            });

            // Record when we paused
            const pauseTime = Date.now();
            const sessionDuration = pauseTime - startTimeRef.current;
            pausedDurationRef.current += sessionDuration;

            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            if (liveTranscribeRef.current) {
                clearInterval(liveTranscribeRef.current);
                liveTranscribeRef.current = null;
            }
        }
    };

    const resumeRecording = () => {
        if (audioRecorderRef.current) {
            console.log('🔄 Resume function called, current isPaused state:', isPaused);
            audioRecorderRef.current.resume();
            setIsPaused(false);
            setIsUserPausedSpeaking(false); // Reset the user pause state
            console.log('✅ setIsPaused(false) and setIsUserPausedSpeaking(false) called');

            // Reset the start time to now (resume point)
            startTimeRef.current = Date.now();
            // Reset the last transcription change time to prevent immediate pause detection
            lastTranscriptionChangeRef.current = Date.now();

            timerRef.current = setInterval(() => {
                // Calculate total elapsed time: current session + all previous paused time
                const currentSessionTime = (Date.now() - startTimeRef.current) / 1000;
                const totalElapsed = currentSessionTime + (pausedDurationRef.current / 1000);
                setDuration(totalElapsed);
            }, 100);

            // Restart live transcription if it was running before pause
            console.log('Resuming recording:', {
                wasTranscribingBeforePause: wasTranscribingBeforePauseRef.current,
                liveTranscriptionEnabled,
                isPaused
            });

            if (wasTranscribingBeforePauseRef.current) {
                console.log('✅ Restarting live transcription after resume');
                // Add a small delay to allow state to update
                setTimeout(() => {
                    liveTranscribeRef.current = setInterval(performLiveTranscription, 2000); // Reduced from 3000ms to 2000ms
                    console.log('🔄 Live transcription timer restarted');
                }, 100);
                wasTranscribingBeforePauseRef.current = false; // Reset the flag
            } else {
                console.log('❌ NOT restarting live transcription - was not active before pause');
            }
        }
    };

    const cancelRecording = () => {
        try {
            // Stop the recording
            if (audioRecorderRef.current) {
                audioRecorderRef.current.cleanup();
            }

            // Clear the timer
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            if (liveTranscribeRef.current) {
                clearInterval(liveTranscribeRef.current);
            }
            if (speechPauseTimerRef.current) {
                clearTimeout(speechPauseTimerRef.current);
            }

            // Reset all states
            setIsRecording(false);
            setIsPaused(false);
            setDuration(0);
            setTranscription('');
            setAiPrompts([]);
            setError(undefined);
            setIsProcessing(false);
            setIsLoadingPrompts(false);
            setAnalyser(null);
            setLiveTranscription('');
            setLivePrompts([]);
            setLastPromptGenerationText('');
            setLastPromptWordCount(0); // Reset word count
            setIsUserPausedSpeaking(false); // Reset pause state
            setTranscriptionBeforePause(''); // Reset transcription state
            lastTranscriptionTimeRef.current = 0;
            lastTranscriptionChangeRef.current = 0;
            hasGeneratedPromptsRef.current = false;

            // Reset refs
            pausedDurationRef.current = 0;
            audioRecorderRef.current = null;
        } catch (err: any) {
            console.error('Error canceling recording:', err);
        }
    };

    return (
        <div className="relative">
            {/* Background Content */}
            <div className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 transition-all duration-500 ${isRecording ? 'blur-sm' : ''}`}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-poppins font-bold text-black mb-4">
                        Good {getGreeting()}, Sean
                    </h1>
                    <p className="text-lg text-gray-600">
                        Let your thoughts flow — we&apos;ll make sense of them.
                    </p>
                </motion.div>

                <div className="space-y-8">
                    {/* Recording Interface - Hidden when recording */}
                    {!isRecording && (
                        <div className="flex flex-col items-center py-12 space-y-6">
                            <RecordButton
                                isRecording={isRecording}
                                isPaused={isPaused}
                                onStart={startRecording}
                                onStop={stopRecording}
                                onPause={pauseRecording}
                                onResume={resumeRecording}
                                onCancel={cancelRecording}
                                duration={duration}
                                analyser={analyser}
                            />

                            {/* Live Transcription Toggle */}
                            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-200">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium text-gray-700">Live Transcription</span>
                                    <button
                                        onClick={() => setLiveTranscriptionEnabled(!liveTranscriptionEnabled)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2 ${liveTranscriptionEnabled ? 'bg-secondary-600' : 'bg-gray-200'
                                            }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${liveTranscriptionEnabled ? 'translate-x-6' : 'translate-x-1'
                                                }`}
                                        />
                                    </button>
                                    <span className="text-xs text-gray-500">
                                        {liveTranscriptionEnabled ? 'ON' : 'OFF'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Transcription */}
                    {(transcription || isProcessing || error) && (
                        <TranscriptionView
                            transcription={transcription}
                            isProcessing={isProcessing}
                            error={error}
                        />
                    )}

                    {/* AI Prompts */}
                    {(aiPrompts.length > 0 || isLoadingPrompts) && (
                        <AIPrompts prompts={aiPrompts} isLoading={isLoadingPrompts} />
                    )}
                </div>
            </div>

            {/* Frosted Glass Overlay - Only show when recording */}
            {isRecording && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-40 pointer-events-none"
                >
                    {/* Frosted glass background */}
                    <div className="absolute inset-0 bg-white/20 backdrop-blur-md" />

                    {/* Recording Controls Overlay - Keep these sharp and visible */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-auto px-6">
                        {liveTranscriptionEnabled ? (
                            /* Three-column layout when live transcription is enabled */
                            <div className="w-full max-w-7xl flex items-center justify-between gap-6">
                                {/* Left side - empty for now */}
                                <div className="flex-1"></div>

                                {/* Center - Live Transcription and Recording Controls */}
                                <div className="flex flex-col items-center gap-6">
                                    {/* Live Transcription Display */}
                                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/30 w-96">
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-2 mb-3">
                                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                                <span className="text-sm font-medium text-gray-600">Live Transcription</span>
                                            </div>
                                            <div
                                                ref={liveTranscriptionScrollRef}
                                                className="min-h-[120px] max-h-[200px] overflow-y-auto"
                                            >
                                                {liveTranscription ? (
                                                    <p className="text-lg text-gray-800 leading-relaxed text-left">
                                                        {liveTranscription}
                                                    </p>
                                                ) : (
                                                    <div className="flex items-center justify-center h-full min-h-[120px]">
                                                        <p className="text-gray-500 italic">
                                                            {isPaused ? 'Recording paused...' : 'Start speaking... (transcription updates every 3 seconds)'}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recording Controls */}
                                    <RecordButton
                                        isRecording={isRecording}
                                        isPaused={isPaused}
                                        onStart={startRecording}
                                        onStop={stopRecording}
                                        onPause={pauseRecording}
                                        onResume={resumeRecording}
                                        onCancel={cancelRecording}
                                        duration={duration}
                                        analyser={analyser}
                                    />
                                </div>

                                {/* Right side - AI Prompts */}
                                <div className="flex-1 max-w-md">
                                    <div className="text-center">
                                        <div className="flex items-center justify-center gap-2 mb-3">
                                            <div className={`w-2 h-2 rounded-full ${isGeneratingLivePrompts ? 'bg-amber-500 animate-pulse' :
                                                isUserPausedSpeaking && livePrompts.length > 0 ? 'bg-blue-500' :
                                                    livePrompts.length > 0 ? 'bg-green-500' :
                                                        'bg-gray-400'
                                                }`}></div>
                                            <span className="text-sm font-medium text-black drop-shadow-sm">
                                                AI Reflection Prompts
                                                {isGeneratingLivePrompts && <span className="text-xs text-amber-600 ml-2">(updating...)</span>}
                                            </span>
                                        </div>
                                        <div className="min-h-[120px] max-h-[400px] overflow-y-auto">
                                            <div className="space-y-2">
                                                <AIPrompts
                                                    prompts={livePrompts}
                                                    isLoading={isGeneratingLivePrompts && livePrompts.length === 0}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Centered layout when live transcription is disabled */
                            <div className="flex items-center justify-center">
                                <RecordButton
                                    isRecording={isRecording}
                                    isPaused={isPaused}
                                    onStart={startRecording}
                                    onStop={stopRecording}
                                    onPause={pauseRecording}
                                    onResume={resumeRecording}
                                    onCancel={cancelRecording}
                                    duration={duration}
                                    analyser={analyser}
                                />
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
