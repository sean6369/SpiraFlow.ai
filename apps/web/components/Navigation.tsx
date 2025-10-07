'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, BarChart3, FileText, Settings } from 'lucide-react';

export default function Navigation() {
    const pathname = usePathname();

    const links = [
        { href: '/', label: 'Home', icon: Home },
        { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
        { href: '/history', label: 'Notes', icon: FileText },
        { href: '/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center h-full">
                        <span
                            className="text-4xl font-bold leading-none"
                            style={{
                                fontFamily: 'Bagel Fat One, cursive',
                                color: '#3F3A36',
                                lineHeight: '1'
                            }}
                        >
                            SpiraFlow
                        </span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="flex items-center gap-1">
                        {links.map((link) => {
                            const isActive = pathname === link.href;
                            const Icon = link.icon;

                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="relative px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <Icon className={`w-4 h-4 ${isActive ? 'text-secondary-600' : 'text-gray-600'}`} />
                                        <span className={isActive ? 'text-secondary-600' : 'text-gray-600'}>
                                            {link.label}
                                        </span>
                                    </div>

                                    {isActive && (
                                        <motion.div
                                            layoutId="active-nav"
                                            className="absolute inset-0 bg-secondary-50 rounded-lg -z-10"
                                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </nav>
    );
}

