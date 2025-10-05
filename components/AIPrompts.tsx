'use client';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { AIPrompt } from '@/types';

interface AIPromptsProps {
    prompts: AIPrompt[];
    isLoading: boolean;
}

export default function AIPrompts({ prompts, isLoading }: AIPromptsProps) {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[80px]">
                <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-black animate-spin drop-shadow-sm" />
                    <p className="text-sm text-black drop-shadow-sm">
                        Generating reflection prompts...
                    </p>
                </div>
            </div>
        );
    }

    if (!prompts || prompts.length === 0) {
        return (
            <div className="flex items-center justify-center h-full min-h-[80px]">
                <p className="text-black/80 italic text-sm drop-shadow-sm">
                    Prompts will appear as you speak...
                </p>
            </div>
        );
    }

    return (
        <motion.div
            key={`prompts-${prompts.length}-${prompts[0]?.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
        >
            <div className="space-y-0">
                {prompts.map((prompt, index) => {
                    return (
                        <div key={prompt.id}>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="space-y-2 py-3"
                            >
                                <p className="text-sm text-black leading-relaxed drop-shadow-sm">
                                    {prompt.prompt}
                                </p>
                                {prompt.context && (
                                    <p className="text-xs text-black/80 italic drop-shadow-sm">
                                        {prompt.context}
                                    </p>
                                )}
                            </motion.div>
                            {index < prompts.length - 1 && (
                                <hr className="border-black/30" />
                            )}
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
}

