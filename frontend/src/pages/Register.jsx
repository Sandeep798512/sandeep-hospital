import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, User, Mail, Lock, Eye, EyeOff, Heart, Phone, MapPin, ClipboardList } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import Toast from '../components/Toast';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [address, setAddress] = useState('');
  const [ecName, setEcName] = useState('');
  const [ecRelation, setEcRelation] = useState('');
  const [ecPhone, setEcPhone] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !age || !address || !ecName || !ecRelation || !ecPhone) {
      setToast({ type: 'error', message: 'Please fill in all required fields' });
      return;
    }

    setLoading(true);
    const res = await register({
      name,
      email,
      password,
      age: parseInt(age),
      gender,
      bloodGroup,
      address,
      emergencyContact: {
        name: ecName,
        relation: ecRelation,
        phone: ecPhone,
      },
    });
    setLoading(false);

    if (res.success) {
      setToast({ type: 'success', message: 'Account created! Sending OTP code...' });
      setTimeout(() => {
        navigate(`/verify-otp?userId=${res.userId}`);
      }, 1500);
    } else {
      setToast({ type: 'error', message: res.message });
    }
  };

  return (
    <div className="min-h-screen py-12 flex items-center justify-center bg-slate-100 dark:bg-slate-950 px-4 transition-colors duration-300">
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse-glow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1.5s' }}></div>

      <div className="w-full max-w-2xl relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-wider">
            Patient Registration
          </h2>
          <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">
            Create an account to schedule appointments, consult our AI health assistant, and access medical summaries.
          </p>
        </div>

        <GlassCard className="border border-slate-200 dark:border-slate-800 shadow-2xl bg-white/95 dark:bg-slate-900/95">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-sm font-bold tracking-widest text-primary-500 uppercase border-b border-slate-200/50 dark:border-slate-800/20 pb-2 flex items-center space-x-2">
              <ClipboardList className="w-4 h-4" />
              <span>Personal Credentials</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <User className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/30 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                    placeholder="Aditya Roy"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Mail className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/30 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                    placeholder="aditya@example.com"
                    required
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Lock className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/30 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>
            </div>

            <h3 className="text-sm font-bold tracking-widest text-primary-500 uppercase border-b border-slate-200/50 dark:border-slate-800/20 pb-2 flex items-center space-x-2 pt-2">
              <Heart className="w-4 h-4" />
              <span>Demographic & Health Data</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Age
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="block w-full px-4 py-2.5 rounded-xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/30 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  placeholder="28"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="block w-full px-4 py-2.5 rounded-xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/30 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Blood Group
                </label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="block w-full px-4 py-2.5 rounded-xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/30 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Residential Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <MapPin className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/30 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                    placeholder="Street, City, State, Country"
                    required
                  />
                </div>
              </div>
            </div>

            <h3 className="text-sm font-bold tracking-widest text-primary-500 uppercase border-b border-slate-200/50 dark:border-slate-800/20 pb-2 flex items-center space-x-2 pt-2">
              <Phone className="w-4 h-4" />
              <span>Emergency Contact Details</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Contact Person
                </label>
                <input
                  type="text"
                  value={ecName}
                  onChange={(e) => setEcName(e.target.value)}
                  className="block w-full px-4 py-2.5 rounded-xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/30 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  placeholder="Contact Name"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Relationship
                </label>
                <input
                  type="text"
                  value={ecRelation}
                  onChange={(e) => setEcRelation(e.target.value)}
                  className="block w-full px-4 py-2.5 rounded-xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/30 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  placeholder="Spouse / Father"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={ecPhone}
                  onChange={(e) => setEcPhone(e.target.value)}
                  className="block w-full px-4 py-2.5 rounded-xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/30 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  placeholder="+91 XXXXX XXXXX"
                  required
                />
              </div>
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
                  <UserPlus className="w-4.5 h-4.5" />
                  <span>Register Profile</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-primary-500 hover:text-primary-600 dark:text-accent-cyan dark:hover:text-cyan-400 hover:underline"
            >
              Sign In
            </Link>
          </div>
        </GlassCard>
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

export default Register;
