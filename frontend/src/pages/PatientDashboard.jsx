import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import GlassCard from '../components/GlassCard';
import Loader from '../components/Loader';
import Toast from '../components/Toast';
import { 
  Calendar, ClipboardList, AlertCircle, Sparkles, Bot, 
  Clock, UserCheck, HeartHandshake, BellRing 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const PatientDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [myAppointments, setMyAppointments] = useState([]);
  const [toast, setToast] = useState(null);

  const fetchPatientData = async () => {
    try {
      const statsRes = await API.get('/analytics/patient-stats');
      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }

      const announceRes = await API.get('/announcements');
      if (announceRes.data.success) {
        setAnnouncements(announceRes.data.announcements);
      }

      const apptsRes = await API.get('/appointments');
      if (apptsRes.data.success) {
        setMyAppointments(apptsRes.data.appointments.slice(0, 3));
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to synchronize patient portal data' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientData();
  }, []);

  const formatDocName = (name) => {
    if (!name) return 'Medical Specialist';
    return name.startsWith('Dr.') ? name : `Dr. ${name}`;
  };

  if (loading || !stats) return <Loader />;

  return (
    <div className="space-y-6">
      {/* Welcome Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Patient Wellness Hub</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Welcome to your personal healthcare portal. Manage your wellness plan below.</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/patient/book"
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold text-xs shadow-lg shadow-primary-500/20 transition-all"
          >
            <Calendar className="w-4 h-4" />
            <span>Book Consultation</span>
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Consultations', value: stats.totalAppointments, icon: <UserCheck className="w-5 h-5 text-indigo-500" />, desc: 'Visits with our specialists' },
          { label: 'Active Prescriptions', value: stats.activePrescriptions, icon: <ClipboardList className="w-5 h-5 text-emerald-500" />, desc: 'Current medication sheets' },
          { label: 'Pending Dues / Bills', value: stats.unpaidBills, icon: <AlertCircle className="w-5 h-5 text-rose-500" />, desc: 'Pending invoice bills' },
        ].map((m, idx) => (
          <GlassCard key={idx} className="p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{m.label}</span>
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50">{m.icon}</div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">{m.value}</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">{m.desc}</p>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Grid: AI options, announcements, visits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* AI Quick consult */}
        <GlassCard className="flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center space-x-2 mb-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
              <Sparkles className="w-4 h-4 text-accent-cyan" />
              <span>AI Health Assistant Desk</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              Consult our advanced artificial intelligence engine for quick symptom checks or interactive conversations regarding general medical queries.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <Link
              to="/patient/ai-symptoms"
              className="flex flex-col items-center justify-center p-4 rounded-2xl bg-primary-500/10 dark:bg-primary-950/40 border border-primary-500/20 hover:border-primary-500/40 text-center transition-all group"
            >
              <Sparkles className="w-6 h-6 text-primary-500 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Symptom Checker</span>
            </Link>

            <Link
              to="/patient/ai-chatbot"
              className="flex flex-col items-center justify-center p-4 rounded-2xl bg-cyan-500/10 dark:bg-cyan-950/40 border border-cyan-500/20 hover:border-cyan-500/40 text-center transition-all group"
            >
              <Bot className="w-6 h-6 text-accent-cyan mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Interactive Chat</span>
            </Link>
          </div>
        </GlassCard>

        {/* Next Visits */}
        <GlassCard>
          <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center space-x-2 mb-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
            <Clock className="w-4 h-4 text-indigo-500" />
            <span>Upcoming Consultations</span>
          </h3>

          <div className="space-y-3">
            {myAppointments.length > 0 ? (
              myAppointments.map((appt) => (
                <div key={appt._id} className="p-3.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                      {formatDocName(appt.doctor?.user?.name)}
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{appt.doctor?.department} • Slot: {appt.timeSlot}</p>
                    <span className="text-[10px] text-slate-400 dark:text-slate-400 mt-0.5 block">{new Date(appt.date).toLocaleDateString()}</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase ${
                    appt.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                    appt.status === 'Pending' ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' : 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                  }`}>
                    {appt.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs flex flex-col items-center">
                <HeartHandshake className="w-8 h-8 text-slate-400 dark:text-slate-600 mb-2" />
                <span>No active consultations booked</span>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Notices */}
        <GlassCard>
          <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center space-x-2 mb-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
            <BellRing className="w-4 h-4 text-amber-500" />
            <span>Wellness Advisories</span>
          </h3>

          <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
            {announcements.length > 0 ? (
              announcements.map((ann) => (
                <div key={ann._id} className="p-3.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">{ann.title}</h4>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-1 leading-relaxed">{ann.content}</p>
                  <span className="text-[10px] text-slate-400 block mt-1.5">{new Date(ann.createdAt).toLocaleDateString()}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs">No active advisories today</div>
            )}
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

export default PatientDashboard;
