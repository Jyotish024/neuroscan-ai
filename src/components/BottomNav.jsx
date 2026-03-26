import React from 'react';
import { LayoutDashboard, History, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const BottomNav = ({ activeTab, onTabChange }) => {
    const tabs = [
        { id: 'analyze', icon: LayoutDashboard, label: 'Analyze' },
        { id: 'history', icon: History, label: 'History' },
        { id: 'settings', icon: Settings, label: 'Settings' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 glass-nav shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe">
            <div className="max-w-md mx-auto flex items-center justify-around py-2 px-6">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className="relative group flex flex-col items-center gap-1 p-2 min-w-[64px]"
                        >
                            <div className={`transition-all duration-300 p-1.5 rounded-xl ${isActive ? 'bg-primary/10 text-primary' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'}`}>
                                <Icon size={24} />
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${isActive ? 'text-primary opacity-100' : 'text-slate-400 opacity-70'}`}>
                                {tab.label}
                            </span>
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute -top-2 w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_rgba(0,74,153,0.8)]"
                                />
                            )}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNav;
