'use client';

import { useEffect, useRef, useState } from 'react';

interface SoundWavesProps {
    isRecording: boolean;
    isPaused: boolean;
    analyser: AnalyserNode | null;
}

export default function SoundWaves({ isRecording, isPaused, analyser }: SoundWavesProps) {
    const [barHeights, setBarHeights] = useState<number[]>([]);
    const animationRef = useRef<number>();

    useEffect(() => {
        if (!isRecording || !analyser || isPaused) {
            setBarHeights([]);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            return;
        }

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        const numBars = 50; // Number of bars to display (more bars like iOS)
        const samplesPerBar = Math.floor(bufferLength / numBars);

        const updateBars = () => {
            if (!isRecording || isPaused) return;

            // Get time domain data
            analyser.getByteTimeDomainData(dataArray);

            const newBarHeights: number[] = [];

            for (let i = 0; i < numBars; i++) {
                let sum = 0;
                let count = 0;

                // Sample data points for this bar
                for (let j = 0; j < samplesPerBar; j++) {
                    const index = i * samplesPerBar + j;
                    if (index < bufferLength) {
                        // Convert audio data (0-255) to amplitude (0-1)
                        const amplitude = Math.abs(dataArray[index] - 128) / 128;
                        sum += amplitude;
                        count++;
                    }
                }

                // Calculate average amplitude for this bar
                const avgAmplitude = count > 0 ? sum / count : 0;
                // Scale to bar height (0-25px for half-height, extends both ways)
                // More subtle amplification like iOS Voice Memos
                const barHeight = Math.min(25, avgAmplitude * 5 * 25);
                newBarHeights.push(barHeight);
            }

            setBarHeights(newBarHeights);
            animationRef.current = requestAnimationFrame(updateBars);
        };

        updateBars();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isRecording, isPaused, analyser]);

    if (!isRecording) return null;

    return (
        <div className="flex items-center justify-center h-16">
            <div className="flex items-center gap-0.5 h-16">
                {barHeights.map((height, index) => (
                    <div
                        key={index}
                        className="bg-secondary-500 rounded-full transition-all duration-100 ease-out"
                        style={{
                            width: '2px',
                            height: `${Math.max(2, height)}px`,
                            minHeight: '2px',
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
