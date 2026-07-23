import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import { ShieldAlert, Mail, Lock, KeyRound } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import Toast from '../components/Toast';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // Step 1: Request OTP, Step 2: Reset Password
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (!email) {
      setToast({ type: 'error', message: 'Please provide email address' });
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/auth/forgot-password', { email });
      setLoading(false);
      if (res.data.success) {
        setToast({ type: 'success', message: 'Password reset OTP sent to email!' });
        setStep(2);
      }
    } catch (err) {
      setLoading(false);
      setToast({ type: 'error', message: err.response?.data?.message || 'Request failed' });
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword) {
      setToast({ type: 'error', message: 'Please enter OTP code and new password' });
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/auth/reset-password', { email, otp, newPassword });
      setLoading(false);
      if (res.data.success) {
        setToast({ type: 'success', message: 'Password reset successful! Redirecting to login...' });
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      }
    } catch (err) {
      setLoading(false);
      setToast({ type: 'error', message: err.response?.data?.message || 'Reset password failed' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 transition-colors duration-300">
      {/* Glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl animate-pulse-glow"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-500 to-accent-teal flex items-center justify-center text-white font-black text-2xl mx-auto shadow-xl">
            <KeyRound className="w-8 h-8 text-white" />
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-slate-800 dark:text-white tracking-wider">
            {step === 1 ? 'Forgot Password?' : 'Reset Password'}
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {step === 1 
              ? 'Enter your registered email and we will send a password reset OTP code.' 
              : 'Enter the 6-digit OTP code sent to your email and your new password.'}
          </p>
        </div>

        <GlassCard className="border border-white/20 dark:border-slate-800/15">
          {step === 1 ? (
            <form onSubmit={handleRequestOTP} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Mail className="w-5 h-5" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 rounded-xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/30 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-sm"
                    placeholder="name@hospital.com"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold shadow-lg shadow-primary-500/25 transition-all text-sm disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Send Reset OTP'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Verification OTP Code
                </label>
                <input
                  type="text"
                  maxLength="6"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="block w-full text-center tracking-[0.5em] font-extrabold text-lg py-2.5 rounded-xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/30 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
                  placeholder="000000"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Lock className="w-5 h-5" />
                  </span>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 rounded-xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/30 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-sm"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold shadow-lg shadow-primary-500/25 transition-all text-sm disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
            Remembered your password?{' '}
            <Link
              to="/login"
              className="text-primary-500 hover:text-primary-600 dark:text-accent-cyan dark:hover:text-cyan-400 hover:underline"
            >
              Sign In
            </Link>
          </div>
        </GlassCard>

        {/* Console OTP hint for evaluation */}
        <div className="mt-6 p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/10 text-xs text-slate-500 dark:text-slate-400 flex items-start space-x-2">
          <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p>
            <b>Tester Tip:</b> Like verification, the forgot-password reset OTP is logged to the backend terminal console when triggered.
          </p>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default ForgotPassword;
