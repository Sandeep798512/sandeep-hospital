import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import Toast from '../components/Toast';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setToast({ type: 'error', message: 'Please enter all fields' });
      return;
    }

    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      setToast({ type: 'success', message: 'Logged in successfully!' });
      const role = res.user.role;
      setTimeout(() => {
        if (role === 'admin') navigate('/admin');
        else if (role === 'doctor') navigate('/doctor');
        else if (role === 'receptionist') navigate('/receptionist');
        else navigate('/patient');
      }, 800);
    } else {
      if (res.unverified) {
        setToast({ type: 'info', message: res.message });
        setTimeout(() => {
          navigate(`/verify-otp?userId=${res.userId}`);
        }, 1500);
      } else {
        setToast({ type: 'error', message: res.message });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 transition-colors duration-300">
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl animate-pulse-glow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-accent-teal/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1.5s' }}></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-500 to-accent-teal flex items-center justify-center text-white font-black text-2xl mx-auto shadow-xl">
            S
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-slate-800 dark:text-white tracking-wider">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Sign in to access Sandeep Hospital management portal
          </p>
        </div>

        <GlassCard className="border border-white/20 dark:border-slate-800/15">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
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
                  className="block w-full pl-10 pr-4 py-3 rounded-xl bg-slate-100/50 dark:bg-slate-900/80 border border-slate-200/50 dark:border-slate-800/50 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-sm"
                  placeholder="name@hospital.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-12 py-3 rounded-xl bg-slate-100/50 dark:bg-slate-900/80 border border-slate-200/50 dark:border-slate-800/50 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-sm"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-primary-500 dark:hover:text-cyan-400 transition-colors cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-bold">
              <label className="flex items-center text-slate-600 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  className="mr-2 rounded text-primary-500 focus:ring-primary-500/30 border-slate-300 dark:border-slate-700 dark:bg-slate-900"
                />
                Remember Me
              </label>
              <Link
                to="/forgot-password"
                className="text-primary-600 dark:text-cyan-400 font-bold hover:text-primary-700 dark:hover:text-cyan-300 hover:underline transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold shadow-lg shadow-primary-500/25 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs font-medium text-slate-600 dark:text-slate-300">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-primary-600 dark:text-cyan-400 font-bold hover:underline"
            >
              Register as Patient
            </Link>
          </div>
        </GlassCard>

        {/* Demo Credentials Alert box */}
        <div className="mt-6 p-4 rounded-2xl bg-primary-500/5 dark:bg-primary-950/20 border border-primary-500/10 text-xs text-slate-600 dark:text-slate-300 space-y-1">
          <div className="flex items-center space-x-2 text-primary-600 dark:text-cyan-400 font-bold mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>Recruiter Quick Testing Credentials:</span>
          </div>
          <p>• <b>Admin:</b> admin@hospital.com | Password123</p>
          <p>• <b>Doctor (Sandeep Gaud):</b> sandeepgaud8081@gmail.com | Password123</p>
          <p>• <b>Receptionist:</b> receptionist@hospital.com | Password123</p>
          <p>• <b>Patient:</b> patient@hospital.com | Password123</p>
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

export default Login;
