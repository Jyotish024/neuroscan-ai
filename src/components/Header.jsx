import React from 'react';
import { Brain, User } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { motion } from 'framer-motion';

const Header = () => {
    return (
        <header className="sticky top-0 z-50 glass-nav px-4 py-3 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
                <div className="p-2 bg-primary rounded-lg text-white">
                    <Brain size={20} />
                </div>
                <h1 className="text-lg font-bold tracking-tight text-slate-800 dark:text-white">
                    NeuroScan <span className="text-primary">AI</span>
                </h1>
            </div>

            <div className="flex items-center gap-3">
                <ThemeToggle />
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                >
                    <User size={20} />
                </motion.button>
            </div>
        </header>
    );
};

export default Header;
