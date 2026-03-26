import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X, Search, Sparkles } from 'lucide-react';

const UploadCard = ({ onUpload, isAnalyzing }) => {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setSelectedFile(e.dataTransfer.files[0]);
        }
    }, []);

    const handleChange = useCallback((e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    }, []);

    const removeFile = (e) => {
        e.stopPropagation();
        setSelectedFile(null);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            layout
            whileHover={{ y: -2 }}
            className="medical-card p-6 space-y-6"
        >
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                    <Upload size={20} />
                </div>
                <h3 className="font-bold text-slate-800 dark:text-white">Upload MRI Scan</h3>
            </div>

            <motion.div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                layout
                whileHover={{ borderColor: 'rgb(59, 130, 246)', scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                drag={!selectedFile}
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                whileDrag={{ scale: 0.98, opacity: 0.8 }}
                className={`relative border-2 border-dashed rounded-2xl transition-all duration-300 group cursor-pointer
          ${dragActive ? 'border-primary bg-primary/5 ring-4 ring-primary/10' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50 dark:bg-slate-800/50'}
          ${selectedFile ? 'py-8' : 'py-12'}`}
            >
                <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleChange}
                    accept=".jpg,.jpeg,.png,.dcm"
                />

                <div className="flex flex-col items-center text-center space-y-4 px-4">
                    <AnimatePresence mode="wait">
                        {!selectedFile ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="flex flex-col items-center"
                            >
                                <div className="w-16 h-16 bg-white dark:bg-slate-700 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-600 flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:scale-110 transition-all duration-300 mb-4">
                                    <Upload size={32} />
                                </div>
                                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                                    Drag and drop MRI scan or <span className="text-primary">browse</span>
                                </p>
                                <p className="text-xs text-slate-400 mt-2 font-medium">
                                    Supports DICOM, JPEG, PNG (max 10MB)
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="selected"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="flex flex-col items-center w-full"
                            >
                                <motion.div 
                                    layout
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="relative w-full max-w-[240px] aspect-video bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner mb-3"
                                >
                                    {selectedFile && selectedFile.type.startsWith('image/') ? (
                                        <img
                                            src={URL.createObjectURL(selectedFile)}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                            onLoad={(e) => URL.revokeObjectURL(e.target.src)}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                            <FileText size={48} />
                                        </div>
                                    )}
                                    <button
                                        onClick={removeFile}
                                        className="absolute top-2 right-2 w-8 h-8 bg-white/90 dark:bg-slate-800/90 backdrop-blur shadow-lg rounded-full flex items-center justify-center text-red-500 hover:scale-110 transition-transform z-10"
                                    >
                                        <X size={18} />
                                    </button>
                                </motion.div>
                                <div className="flex flex-col items-center">
                                    <p className="text-sm font-bold text-slate-800 dark:text-white max-w-[200px] truncate">
                                        {selectedFile.name}
                                    </p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • READY
                                    </p>
                                </div>
                            </motion.div>

                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onUpload(selectedFile)}
                disabled={!selectedFile || isAnalyzing}
                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-slate-200 dark:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isAnalyzing ? (
                    <>
                        <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                        Analyzing Data...
                    </>
                ) : (
                    <>
                        <Search size={20} />
                        Predict Analysis Stage
                    </>
                )}
            </motion.button>
        </motion.div>
    );
};

export default UploadCard;
