import React, { useState } from 'react';
import Header from './Header';
import BottomNav from './BottomNav';
import UploadCard from './UploadCard';
import ResultsCard from './ResultsCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity } from 'lucide-react';


const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('analyze');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResults, setAnalysisResults] = useState(null);
    const [error, setError] = useState(null);

    const handleUpload = async (file) => {
        if (!file) {
            setError("Please upload an MRI image.");
            return;
        }

        setIsAnalyzing(true);
        setAnalysisResults(null);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('http://localhost:8000/predict', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Prediction failed');

            const data = await response.json();

            // CRITICAL: Set results from API
            setAnalysisResults({
                stage: data.stage,
                confidence: data.confidence,
                probs: data.probs,
            });
        } catch (error) {
            console.error('Error:', error);
            setError("Error connecting to backend.");
        } finally {
            setIsAnalyzing(false);
        }
    };



    return (
        <div className="min-h-screen flex flex-col pb-24 bg-main">
            <Header />

            <main className="flex-1 max-w-lg mx-auto w-full p-4 space-y-6">
                <motion.div layout>
                    <UploadCard onUpload={handleUpload} isAnalyzing={isAnalyzing} />
                </motion.div>

                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div
                            layout
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            whileHover={{ scale: 1.02, backgroundColor: 'rgba(220, 38, 38, 0.1)' }}
                            whileTap={{ scale: 0.98 }}
                            className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm font-medium border border-red-100 dark:border-red-900/30 text-center cursor-pointer transition-colors"
                        >
                            {error}
                        </motion.div>
                    )}

                    {analysisResults && (
                        <motion.div layout>
                            <ResultsCard results={analysisResults} />
                        </motion.div>
                    )}
                </AnimatePresence>


                {!analysisResults && !isAnalyzing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        drag
                        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        whileDrag={{ scale: 0.98, opacity: 0.8 }}
                        className="flex flex-col items-center justify-center py-12 text-center space-y-4 cursor-grab active:cursor-grabbing"
                    >
                        <div className="w-12 h-12 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-300">
                            <Activity size={24} className="opacity-20" />
                        </div>
                        <p className="text-sm font-medium text-slate-400">
                            Upload a scan to begin analysis
                        </p>
                    </motion.div>
                )}
            </main>

            <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
    );
};

export default Dashboard;
