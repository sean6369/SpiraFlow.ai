'use client';

import { motion } from 'framer-motion';
import { Settings, Database, Shield, Download, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function SettingsPage() {
    const [exportStatus, setExportStatus] = useState<string>('');

    const handleExportData = async () => {
        setExportStatus('Exporting...');
        // TODO: Implement data export
        setTimeout(() => {
            setExportStatus('Export complete!');
            setTimeout(() => setExportStatus(''), 3000);
        }, 1000);
    };

    const handleClearData = async () => {
        if (!confirm('Are you sure you want to delete all your data? This cannot be undone.')) {
            return;
        }
        // TODO: Implement data clearing
        alert('Data clearing functionality coming soon');
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl md:text-4xl font-poppins font-bold text-black mb-2">
                    Settings
                </h1>
                <p className="text-gray-600">
                    Manage your SpiraFlow preferences
                </p>
            </motion.div>

            <div className="space-y-6">
                {/* Privacy & Data */}
                <SettingSection
                    icon={<Shield className="w-5 h-5" />}
                    title="Privacy & Data"
                    description="Your data is stored locally on your device"
                >
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                            <div>
                                <p className="font-medium text-neutral-900 dark:text-neutral-100">
                                    Local Storage
                                </p>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                    All entries are encrypted and stored on your device
                                </p>
                            </div>
                            <div className="w-3 h-3 bg-green-500 rounded-full" />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                            <div>
                                <p className="font-medium text-neutral-900 dark:text-neutral-100">
                                    Cloud Sync
                                </p>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                    Optional backup to encrypted cloud storage
                                </p>
                            </div>
                            <button className="px-4 py-2 text-sm bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors">
                                Enable
                            </button>
                        </div>
                    </div>
                </SettingSection>

                {/* Data Management */}
                <SettingSection
                    icon={<Database className="w-5 h-5" />}
                    title="Data Management"
                    description="Export or delete your data"
                >
                    <div className="space-y-3">
                        <button
                            onClick={handleExportData}
                            className="w-full flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Download className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
                                <div className="text-left">
                                    <p className="font-medium text-neutral-900 dark:text-neutral-100">
                                        Export Data
                                    </p>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                        Download all your entries as JSON
                                    </p>
                                </div>
                            </div>
                        </button>
                        {exportStatus && (
                            <p className="text-sm text-green-600 dark:text-green-400">
                                {exportStatus}
                            </p>
                        )}

                        <button
                            onClick={handleClearData}
                            className="w-full flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                                <div className="text-left">
                                    <p className="font-medium text-red-900 dark:text-red-100">
                                        Delete All Data
                                    </p>
                                    <p className="text-sm text-red-600 dark:text-red-400">
                                        Permanently remove all your entries
                                    </p>
                                </div>
                            </div>
                        </button>
                    </div>
                </SettingSection>

                {/* About */}
                <SettingSection
                    icon={<Settings className="w-5 h-5" />}
                    title="About SpiraFlow"
                    description="Version 0.1.0"
                >
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                        <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                            SpiraFlow is an AI-powered voice-first thought journal designed to help you
                            capture and reflect on your thoughts with intelligent prompts and insights.
                            All your data is private and stored securely on your device.
                        </p>
                    </div>
                </SettingSection>
            </div>
        </div>
    );
}

function SettingSection({
    icon,
    title,
    description,
    children,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-sm"
        >
            <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-secondary-50 dark:bg-secondary-900/20 rounded-lg text-secondary-600 dark:text-secondary-400">
                    {icon}
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                        {title}
                    </h2>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {description}
                    </p>
                </div>
            </div>
            {children}
        </motion.div>
    );
}

