import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';
import type { AuthMode } from '../types';
import type { RegisterRequest, Users, LoginRequest } from '../api/types';
import { login, register } from '../api';

interface AuthCardProps {
  onAuthSuccess: (userData: Users) => void;
} 

export function AuthCard({ onAuthSuccess }: AuthCardProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState<RegisterRequest>({
    username: '',
    password: '',
  });

  const isLogin = mode === 'login';

  const handleChange = (field: keyof RegisterRequest) => 
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setFormData(prev => ({ ...prev, [field]: e.target.value }));

  const handleModeToggle = () => {
    setMode(prev => (prev === 'login' ? 'register' : 'login'));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      let response;
      if(isLogin) {
        const loginRequest: LoginRequest = {
          username: formData.username,
          password: formData.password
        }
        response = await login(loginRequest)
      } else {
        response = await register(formData)
      }

      onAuthSuccess(response);
    } catch (err: any) {
      
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const fields = [
    {
      key: 'username',
      label: isLogin ? 'Username / Email' : 'Email Address',
      type: 'text',
      icon: isLogin ? User : Mail,
      show: true,
      placeholder: 'Enter your email',
    },
    {
      key: 'password',
      label: isLogin ? 'Security Key' : 'Password',
      type: showPassword ? 'text' : 'password',
      icon: Lock,
      show: true,
      placeholder: isLogin ? 'Enter your password' : 'Create a password',
      isPassword: true,
    },
  ];

  return (
    <div className="w-full flex items-center justify-center">
      <motion.div
        layout
        className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-b-lg p-8 w-full max-w-2xl border-t-0"
      >
        {/* Heading */}
        <div className="mb-6">
          <p className="text-zinc-400 text-sm">
            {isLogin
              ? 'Enter your credentials to access your trading account.'
              : 'Sign up to start your trading journey.'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {fields
            .filter(field => field.show)
            .map(field => {
              const Icon = field.icon;

              return (
                <div key={field.key}>
                  <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wide mb-2">
                    {field.label}
                  </label>

                  <div className="relative">
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />

                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      value={formData[field.key as keyof RegisterRequest]}
                      onChange={handleChange(field.key as keyof RegisterRequest)}
                      className="w-full pl-11 pr-11 py-3 bg-zinc-900 text-white rounded-md outline-none transition-all duration-200 font-medium focus:ring-1 focus:ring-emerald-500 focus:shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                    />

                    {field.isPassword && (
                      <button
                        type="button"
                        onClick={() => setShowPassword(prev => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-400 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <motion.button
            type="submit"
            disabled={isLoading}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3.5 px-4 bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-sm uppercase tracking-wider rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isLogin ? 'Initialize Session' : 'Create Account'}
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </form>

        {/* Mode Toggle */}
        <div className="mt-6 text-center">
          <p className="text-zinc-400 text-sm">
            {isLogin ? (
              <>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={handleModeToggle}
                  className="text-emerald-500 hover:text-emerald-400 font-semibold"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={handleModeToggle}
                  className="text-emerald-500 hover:text-emerald-400 font-semibold"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </motion.div>
    </div>
  );
}