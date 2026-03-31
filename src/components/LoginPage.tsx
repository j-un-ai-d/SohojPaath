import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail, Lock, User, Eye, EyeOff, ChevronRight,
  Sparkles, BookOpen, Languages, Zap, AlertCircle
} from 'lucide-react';
import { cn } from '../lib/utils';

interface LoginPageProps {
  onLogin: (user: { name: string; email: string }) => void;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash.toString(36);
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (mode === 'register' && !name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (mode === 'register' && password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    setSuccessMessage('');

    if (!validate()) return;

    setIsLoading(true);

    await new Promise(r => setTimeout(r, 800));

    try {
      const usersRaw = localStorage.getItem('sp_users');
      const users: Record<string, { name: string; email: string; passwordHash: string }> =
        usersRaw ? JSON.parse(usersRaw) : {};

      if (mode === 'register') {
        if (users[email.toLowerCase()]) {
          setGeneralError('An account with this email already exists. Please sign in.');
          setIsLoading(false);
          return;
        }

        const newUser = {
          name: name.trim(),
          email: email.toLowerCase().trim(),
          passwordHash: simpleHash(password),
        };

        users[email.toLowerCase()] = newUser;
        localStorage.setItem('sp_users', JSON.stringify(users));

        localStorage.setItem('sp_session', JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          loggedInAt: Date.now(),
        }));

        onLogin({ name: newUser.name, email: newUser.email });
      } else {
        const user = users[email.toLowerCase()];
        if (!user) {
          setGeneralError('No account found with this email. Please register first.');
          setIsLoading(false);
          return;
        }

        if (user.passwordHash !== simpleHash(password)) {
          setGeneralError('Incorrect password. Please try again.');
          setIsLoading(false);
          return;
        }

        localStorage.setItem('sp_session', JSON.stringify({
          name: user.name,
          email: user.email,
          loggedInAt: Date.now(),
        }));

        onLogin({ name: user.name, email: user.email });
      }
    } catch {
      setGeneralError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setErrors({});
    setGeneralError('');
    setSuccessMessage('');
    setPassword('');
    setConfirmPassword('');
  };

  const features = [
    { icon: BookOpen, label: 'Adaptive Reading', color: 'text-blue-400' },
    { icon: Languages, label: 'Bilingual Support', color: 'text-emerald-400' },
    { icon: Sparkles, label: 'AI Assistance', color: 'text-purple-400' },
    { icon: Zap, label: 'Focus Tools', color: 'text-amber-400' },
  ];

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-violet-950">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-500/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-violet-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] bg-cyan-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
      </div>

      <div className="hidden lg:flex lg:w-[45%] relative z-10 flex-col justify-between p-12">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-4 mb-16"
          >
            <div className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white font-bold text-2xl border border-white/10">
              S
            </div>
            <span className="font-display font-bold text-3xl text-white tracking-tight">
              SohojPaath
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1 className="text-5xl font-display font-bold text-white leading-tight mb-6">
              Reading made
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                accessible.
              </span>
            </h1>
            <p className="text-lg text-white/60 leading-relaxed max-w-md">
              An AI-powered adaptive reading platform designed to support neurodiverse learners
              through multi-sensory, bilingual reading experiences.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-4"
        >
          {features.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
              className="flex items-center gap-4 text-white/70"
            >
              <div className="w-10 h-10 bg-white/5 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10">
                <f.icon size={18} className={f.color} />
              </div>
              <span className="font-medium">{f.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="flex-1 flex items-center justify-center relative z-10 p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="bg-white/[0.07] backdrop-blur-2xl rounded-[2rem] border border-white/10 shadow-2xl p-8 lg:p-10">
            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white font-bold text-lg border border-white/10">
                S
              </div>
              <span className="font-display font-bold text-xl text-white">SohojPaath</span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: mode === 'login' ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: mode === 'login' ? 20 : -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-display font-bold text-white mb-2">
                  {mode === 'login' ? 'Welcome back' : 'Create account'}
                </h2>
                <p className="text-white/50 text-sm mb-8">
                  {mode === 'login'
                    ? 'Sign in to continue your reading journey'
                    : 'Join SohojPaath to start your accessible reading experience'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {mode === 'register' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <label className="block text-xs font-bold uppercase tracking-wider text-white/40 mb-2 ml-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" />
                        <input
                          type="text"
                          value={name}
                          onChange={e => setName(e.target.value)}
                          placeholder="Enter your name"
                          className={cn(
                            "w-full pl-12 pr-4 py-3.5 bg-white/5 border rounded-xl text-white placeholder:text-white/25 outline-none transition-all focus:bg-white/10",
                            errors.name ? "border-red-400/50 focus:border-red-400" : "border-white/10 focus:border-blue-400/50"
                          )}
                        />
                      </div>
                      {errors.name && (
                        <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.name}</p>
                      )}
                    </motion.div>
                  )}

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-white/40 mb-2 ml-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className={cn(
                          "w-full pl-12 pr-4 py-3.5 bg-white/5 border rounded-xl text-white placeholder:text-white/25 outline-none transition-all focus:bg-white/10",
                          errors.email ? "border-red-400/50 focus:border-red-400" : "border-white/10 focus:border-blue-400/50"
                        )}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-white/40 mb-2 ml-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className={cn(
                          "w-full pl-12 pr-12 py-3.5 bg-white/5 border rounded-xl text-white placeholder:text-white/25 outline-none transition-all focus:bg-white/10",
                          errors.password ? "border-red-400/50 focus:border-red-400" : "border-white/10 focus:border-blue-400/50"
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.password}</p>
                    )}
                  </div>

                  {mode === 'register' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <label className="block text-xs font-bold uppercase tracking-wider text-white/40 mb-2 ml-1">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" />
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className={cn(
                            "w-full pl-12 pr-4 py-3.5 bg-white/5 border rounded-xl text-white placeholder:text-white/25 outline-none transition-all focus:bg-white/10",
                            errors.confirmPassword ? "border-red-400/50 focus:border-red-400" : "border-white/10 focus:border-blue-400/50"
                          )}
                        />
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.confirmPassword}</p>
                      )}
                    </motion.div>
                  )}

                  {mode === 'login' && (
                    <div className="flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => setSuccessMessage('Password reset is not available in this demo.')}
                        className="text-xs text-blue-400/80 hover:text-blue-400 transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}

                  {generalError && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 p-3.5 bg-red-500/10 border border-red-400/20 rounded-xl"
                    >
                      <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
                      <p className="text-red-300 text-sm">{generalError}</p>
                    </motion.div>
                  )}

                  {successMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 bg-blue-500/10 border border-blue-400/20 rounded-xl"
                    >
                      <p className="text-blue-300 text-sm">{successMessage}</p>
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-violet-600 text-white font-bold rounded-xl shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      />
                    ) : (
                      <>
                        {mode === 'login' ? 'Sign In' : 'Create Account'}
                        <ChevronRight size={18} />
                      </>
                    )}
                  </button>
                </form>

                <p className="text-center text-white/40 text-sm mt-8">
                  {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
                  <button
                    onClick={switchMode}
                    className="text-blue-400 font-bold hover:text-blue-300 transition-colors"
                  >
                    {mode === 'login' ? 'Register' : 'Sign In'}
                  </button>
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <p className="text-center text-white/20 text-xs mt-6">
            SohojPaath © 2026 — Adaptive Reading Platform
          </p>
        </motion.div>
      </div>
    </div>
  );
};
