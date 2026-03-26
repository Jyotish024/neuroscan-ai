import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, ShieldCheck, CheckCircle2 } from 'lucide-react';

const ResultsCard = ({ results }) => {
    const [counter, setCounter] = useState(0);

    useEffect(() => {
        if (results) {
            setCounter(0);
            const duration = 2000;
            const stepTime = Math.abs(Math.floor(duration / results.confidence));
            const timer = setInterval(() => {
                setCounter((prev) => {
                    if (prev >= results.confidence) {
                        clearInterval(timer);
                        return results.confidence;
                    }
                    return prev + 1;
                });
            }, stepTime);
            return () => clearInterval(timer);
        }
    }, [results]);

    if (!results) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: "spring", damping: 20 }}
            className="medical-card p-6 space-y-6 overflow-hidden relative"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 dark:bg-green-900/30 text-green-600 rounded-lg">
                        <Activity size={20} />
                    </div>
                    <h3 className="font-bold text-slate-800 dark:text-white">Analysis Results</h3>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-600 uppercase tracking-wider bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full border border-green-100 dark:border-green-900/30">
                    <CheckCircle2 size={12} />
                    Confirmed
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        Predicted Stage
                    </p>
                    <p className="text-xl font-bold text-slate-800 dark:text-white">
                        {results.stage}
                    </p>
                </div>
                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-primary/10 border border-blue-100 dark:border-primary/20">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-primary/70 uppercase tracking-widest mb-1">
                        Confidence
                    </p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-primary dark:text-blue-400 tabular-nums">
                            {counter}%
                        </span>
                        <motion.div
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="w-2 h-2 rounded-full bg-primary"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4 pt-2">
                <div className="flex justify-between items-end mb-1">
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Statistical Probability</p>
                    <p className="text-xs font-black text-primary">{results.confidence}% accurate</p>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${counter}%` }}
                        className="h-full bg-primary rounded-full shadow-[0_0_12px_rgba(0,74,153,0.4)]"
                    />
                </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                {results.probs.map((prob, idx) => (
                    <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                            <span className="text-slate-500">{prob.name}</span>
                            <span className="text-slate-700 dark:text-slate-300">{prob.value}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${prob.value}%` }}
                                transition={{ delay: 0.2 + idx * 0.1, duration: 0.8 }}
                                className={`h-full rounded-full ${idx === 0 ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

export default ResultsCard;
