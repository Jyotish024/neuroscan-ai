import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, ShieldAlert } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const validate = () => {
        const newErrors = {};
        if (!email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email format';

        if (!password) newErrors.password = 'Password is required';
        else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsLoading(false);
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-main">
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full max-w-md medical-card p-8 space-y-8"
            >
                <div className="flex flex-col items-center text-center space-y-2">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white shadow-lg shadow-primary/30 mb-2">
                        <Brain size={32} />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">
                        NeuroScan AI
                    </h1>
                    <p className="text-primary font-medium tracking-wide text-sm uppercase">
                        Medical Analytics
                    </p>
                    <h2 className="text-3xl font-bold pt-4 text-slate-900 dark:text-white">
                        Welcome Back
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                            Email Address
                        </label>
                        <div className={`relative transition-all duration-300 ${errors.email ? 'ring-2 ring-red-500' : 'focus-within:ring-2 focus-within:ring-primary/50'}`}>
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="doctor@hospital.com"
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none transition-all placeholder:text-slate-400 dark:text-white"
                            />
                        </div>
                        {errors.email && <p className="text-red-500 text-xs mt-1 ml-1 font-medium">{errors.email}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                            Security Pin / Password
                        </label>
                        <div className={`relative transition-all duration-300 ${errors.password ? 'ring-2 ring-red-500' : 'focus-within:ring-2 focus-within:ring-primary/50'}`}>
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-12 pr-12 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none transition-all dark:text-white"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {errors.password && <p className="text-red-500 text-xs mt-1 ml-1 font-medium">{errors.password}</p>}
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isLoading}
                        className="w-full bg-primary hover:bg-primary-light text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/25 transition-all disabled:opacity-70"
                    >
                        {isLoading ? (
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                Secure Login <ArrowRight size={20} />
                            </>
                        )}
                    </motion.button>
                </form>

                <div className="flex items-center justify-center gap-4 pt-4 grayscale opacity-60">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        <ShieldCheck size={14} className="text-green-600" />
                        HIPAA Compliant
                    </div>
                    <div className="w-1 h-1 bg-slate-300 rounded-full" />
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        <ShieldAlert size={14} className="text-blue-600" />
                        AES-256 Encryption
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
