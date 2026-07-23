import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import GlassCard from '../components/GlassCard';
import Loader from '../components/Loader';
import Toast from '../components/Toast';
import { 
  Users, Stethoscope, Calendar, AlertCircle, IndianRupee, 
  Megaphone, ShieldCheck, Plus, Download, Eye, CalendarClock 
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [toast, setToast] = useState(null);
  
  // Modal states
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [showAnnounceModal, setShowAnnounceModal] = useState(false);

  // New Doctor Form State
  const [docName, setDocName] = useState('');
  const [docEmail, setDocEmail] = useState('');
  const [docPass, setDocPass] = useState('');
  const [docDept, setDocDept] = useState('General Physician');
  const [docExp, setDocExp] = useState('');
  const [docFees, setDocFees] = useState('');
  const [docAvail, setDocAvail] = useState([]);
  const [docStart, setDocStart] = useState('09:00');
  const [docEnd, setDocEnd] = useState('17:00');
  const [docSpecialties, setDocSpecialties] = useState('');
  const [docBio, setDocBio] = useState('');
  const [docFile, setDocFile] = useState(null);

  // New Announcement Form State
  const [announceTitle, setAnnounceTitle] = useState('');
  const [announceContent, setAnnounceContent] = useState('');
  const [announceRoles, setAnnounceRoles] = useState([]);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const depts = [
    'Cardiology', 'Neurology', 'Orthopedics', 'Dentist',
    'ENT', 'General Physician', 'Pediatrics', 'Dermatology', 'Gynecology', 'Emergency'
  ];

  const fetchStats = async () => {
    try {
      const res = await API.get('/analytics/dashboard-stats');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to fetch dashboard stats' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    if (!docName || !docEmail || !docPass || !docExp || !docFees) {
      setToast({ type: 'error', message: 'Please fill in all required fields' });
      return;
    }

    const formData = new FormData();
    formData.append('name', docName);
    formData.append('email', docEmail);
    formData.append('password', docPass);
    formData.append('department', docDept);
    formData.append('experience', docExp);
    formData.append('fees', docFees);
    formData.append('availability', JSON.stringify(docAvail));
    formData.append('schedule', JSON.stringify({ start: docStart, end: docEnd }));
    formData.append('specialties', JSON.stringify(docSpecialties.split(',').map(s => s.trim())));
    formData.append('bio', docBio);
    if (docFile) {
      formData.append('profileImage', docFile);
    }

    try {
      const res = await API.post('/doctors', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setToast({ type: 'success', message: 'Doctor registered successfully!' });
        setShowDoctorModal(false);
        // Reset form
        setDocName(''); setDocEmail(''); setDocPass(''); setDocExp(''); setDocFees(''); setDocAvail([]); setDocSpecialties(''); setDocBio(''); setDocFile(null);
        fetchStats();
      }
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Failed to add doctor' });
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!announceTitle || !announceContent) {
      setToast({ type: 'error', message: 'Title and content are required' });
      return;
    }

    try {
      const res = await API.post('/announcements', {
        title: announceTitle,
        content: announceContent,
        targetRoles: announceRoles,
      });
      if (res.data.success) {
        setToast({ type: 'success', message: 'Announcement published!' });
        setShowAnnounceModal(false);
        setAnnounceTitle(''); setAnnounceContent(''); setAnnounceRoles([]);
        fetchStats();
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to create announcement' });
    }
  };

  if (loading || !data) return <Loader />;

  const { stats, recentActivities, monthlyRevenue, departmentStats, monthlyAppointments } = data;

  // Chart data setup
  const revenueChartData = {
    labels: monthlyRevenue.map((r) => r.month),
    datasets: [
      {
        label: 'Monthly Revenue (INR)',
        data: monthlyRevenue.map((r) => r.revenue),
        fill: true,
        borderColor: '#3a2bdc',
        backgroundColor: 'rgba(58, 43, 220, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const appointmentsChartData = {
    labels: monthlyAppointments.map((a) => a.month),
    datasets: [
      {
        label: 'Appointments Booked',
        data: monthlyAppointments.map((a) => a.appointments),
        backgroundColor: 'rgba(101, 228, 207, 0.6)',
        borderRadius: 8,
      },
    ],
  };

  const departmentChartData = {
    labels: departmentStats.filter((d) => d.count > 0).map((d) => d.department),
    datasets: [
      {
        data: departmentStats.filter((d) => d.count > 0).map((d) => d.count),
        backgroundColor: [
          '#3a2bdc', '#65e4cf', '#0ea5e9', '#f43f5e', '#eab308', '#a855f7', '#10b981'
        ],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">Admin Command Center</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Hospital performance, activity logs, and doctor registrations</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowDoctorModal(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold text-xs shadow-lg shadow-primary-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Doctor</span>
          </button>
          <button 
            onClick={() => setShowAnnounceModal(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-200/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 font-bold text-xs transition-colors"
          >
            <Megaphone className="w-4 h-4" />
            <span>Post Notice</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Patients', value: stats.totalPatients, icon: <Users className="w-5 h-5 text-indigo-500" />, desc: 'Registered Patients' },
          { label: 'Total Doctors', value: stats.totalDoctors, icon: <Stethoscope className="w-5 h-5 text-emerald-500" />, desc: 'Active Specialists' },
          { label: 'Today\'s Bookings', value: stats.todayAppointments, icon: <Calendar className="w-5 h-5 text-amber-500" />, desc: 'Appointments Scheduled' },
          { label: 'Pending Reviews', value: stats.pendingAppointments, icon: <AlertCircle className="w-5 h-5 text-rose-500" />, desc: 'Require Approval' },
          { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: <IndianRupee className="w-5 h-5 text-teal-500" />, desc: 'Invoice Collections' },
        ].map((m, idx) => (
          <GlassCard key={idx} className="p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{m.label}</span>
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900/60">{m.icon}</div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">{m.value}</h3>
              <p className="text-[10px] font-semibold text-slate-400 mt-1">{m.desc}</p>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Analytical Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2">
          <h3 className="text-sm font-bold tracking-wider text-slate-500 uppercase mb-4">Collected Monthly Revenues</h3>
          <div className="h-64">
            <Line data={revenueChartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="text-sm font-bold tracking-wider text-slate-500 uppercase mb-4">Doctor Departments Distribution</h3>
          <div className="h-64 flex items-center justify-center">
            {departmentChartData.labels.length > 0 ? (
              <Doughnut data={departmentChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            ) : (
              <span className="text-xs text-slate-400">No doctors added yet</span>
            )}
          </div>
        </GlassCard>

        <GlassCard className="lg:col-span-3">
          <h3 className="text-sm font-bold tracking-wider text-slate-500 uppercase mb-4">Appointments Booking Trajectory</h3>
          <div className="h-64">
            <Bar data={appointmentsChartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </GlassCard>
      </div>

      {/* Audit Logs Table & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System audit log */}
        <GlassCard className="lg:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200/30 dark:border-slate-800/20 pb-4 mb-4">
            <h3 className="text-sm font-bold tracking-wider text-slate-500 uppercase flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-primary-500" />
              <span>System Compliance Audit Log</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-semibold">Live Event Listeners</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="text-slate-400 font-bold border-b border-slate-200/30 dark:border-slate-800/20">
                  <th className="py-2.5">User</th>
                  <th className="py-2.5">Action</th>
                  <th className="py-2.5">IP Address</th>
                  <th className="py-2.5 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-900/40">
                {recentActivities.map((log) => (
                  <tr key={log._id} className="text-slate-600 dark:text-slate-350 hover:bg-slate-500/5 transition-colors">
                    <td className="py-3 font-semibold">{log.userEmail}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded bg-primary-500/10 text-primary-500 font-bold text-[10px]">
                        {log.action}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-xs">{log.details}</p>
                    </td>
                    <td className="py-3 font-mono">{log.ipAddress || 'localhost'}</td>
                    <td className="py-3 text-right text-slate-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* Quick action grid / Hospital News */}
        <GlassCard>
          <div className="border-b border-slate-200/30 dark:border-slate-800/20 pb-4 mb-4">
            <h3 className="text-sm font-bold tracking-wider text-slate-500 uppercase flex items-center space-x-2">
              <Megaphone className="w-4 h-4 text-accent-cyan" />
              <span>Internal Announcements</span>
            </h3>
          </div>
          
          <div className="space-y-4 max-h-[300px] overflow-y-auto">
            {/* Quick check to add announcements list if API feeds them. Otherwise static banner */}
            <div className="p-3.5 rounded-xl bg-primary-500/5 dark:bg-slate-900/60 border border-primary-500/10">
              <span className="text-[9px] font-extrabold text-primary-500 uppercase tracking-widest">Global Notice</span>
              <h4 className="font-bold text-xs text-slate-855 dark:text-slate-250 mt-1">Neurology Unit Opened</h4>
              <p className="text-slate-400 text-[10px] mt-1 line-clamp-3">We have successfully integrated a new state-of-the-art Neurology facility headed by Dr. Rahul Verma. Online bookings are active.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/20">
              <span className="text-[9px] font-extrabold text-amber-500 uppercase tracking-widest">Staff Alert</span>
              <h4 className="font-bold text-xs text-slate-855 dark:text-slate-250 mt-1">Maintenance Scheduled</h4>
              <p className="text-slate-400 text-[10px] mt-1 line-clamp-3">Database indexing optimizations will run this Sunday between 02:00 AM and 04:00 AM. Please save active bills before maintenance window.</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* MODAL: ADD DOCTOR */}
      {showDoctorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <GlassCard className="w-full max-w-xl max-h-[90vh] overflow-y-auto border border-white/20 dark:border-slate-800/20">
            <div className="flex items-center justify-between border-b border-slate-200/30 dark:border-slate-800/20 pb-4 mb-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Register New Medical Specialist</h3>
              <button 
                onClick={() => setShowDoctorModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
              >✕</button>
            </div>

            <form onSubmit={handleAddDoctor} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={docName}
                    onChange={e => setDocName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800 focus:outline-none"
                    placeholder="Dr. Priya Sharma"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={docEmail}
                    onChange={e => setDocEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800 focus:outline-none"
                    placeholder="priya.sharma@hospital.com"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Login Password *</label>
                  <input
                    type="password"
                    required
                    value={docPass}
                    onChange={e => setDocPass(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800 focus:outline-none"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Department *</label>
                  <select
                    value={docDept}
                    onChange={e => setDocDept(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800 focus:outline-none text-slate-700 dark:text-slate-300"
                  >
                    {depts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Experience (Years) *</label>
                  <input
                    type="number"
                    required
                    value={docExp}
                    onChange={e => setDocExp(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800 focus:outline-none"
                    placeholder="10"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Consultation Fees (INR) *</label>
                  <input
                    type="number"
                    required
                    value={docFees}
                    onChange={e => setDocFees(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800 focus:outline-none"
                    placeholder="500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Shift Start</label>
                  <input
                    type="time"
                    value={docStart}
                    onChange={e => setDocStart(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Shift End</label>
                  <input
                    type="time"
                    value={docEnd}
                    onChange={e => setDocEnd(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Specialties (comma separated)</label>
                <input
                  type="text"
                  value={docSpecialties}
                  onChange={e => setDocSpecialties(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800 focus:outline-none"
                  placeholder="Angioplasty, Heart Failures, Blockages"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Availability Days</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {daysOfWeek.map((day) => {
                    const selected = docAvail.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => {
                          if (selected) setDocAvail(docAvail.filter(d => d !== day));
                          else setDocAvail([...docAvail, day]);
                        }}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                          selected 
                            ? 'bg-primary-500 border-primary-500 text-white' 
                            : 'border-slate-300/30 text-slate-400 bg-transparent hover:text-slate-200'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Doctor Biography</label>
                <textarea
                  value={docBio}
                  onChange={e => setDocBio(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800 focus:outline-none h-16"
                  placeholder="Brief doctor bio summary..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Profile Photo Image</label>
                <input
                  type="file"
                  onChange={e => setDocFile(e.target.files[0])}
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary-500/10 file:text-primary-500 hover:file:bg-primary-500/20"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold text-xs shadow-lg transition-all"
              >
                Register Specialist
              </button>
            </form>
          </GlassCard>
        </div>
      )}

      {/* MODAL: POST ANNOUNCEMENT */}
      {showAnnounceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <GlassCard className="w-full max-w-md border border-white/20 dark:border-slate-800/20">
            <div className="flex items-center justify-between border-b border-slate-200/30 dark:border-slate-800/20 pb-4 mb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Publish Hospital Notification Notice</h3>
              <button 
                onClick={() => setShowAnnounceModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
              >✕</button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Title Notice</label>
                <input
                  type="text"
                  required
                  value={announceTitle}
                  onChange={e => setAnnounceTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800 focus:outline-none"
                  placeholder="Notice Title"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Target Roles</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {['doctor', 'receptionist', 'patient'].map((role) => {
                    const selected = announceRoles.includes(role);
                    return (
                      <button
                        type="button"
                        key={role}
                        onClick={() => {
                          if (selected) setAnnounceRoles(announceRoles.filter(r => r !== role));
                          else setAnnounceRoles([...announceRoles, role]);
                        }}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                          selected 
                            ? 'bg-accent-cyan border-accent-cyan text-slate-900' 
                            : 'border-slate-300/30 text-slate-400 bg-transparent hover:text-slate-200'
                        }`}
                      >
                        {role}s
                      </button>
                    );
                  })}
                </div>
                <p className="text-[8px] text-slate-500 mt-1">Leave all unselected to broadcast to all roles globally.</p>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Notice Description Details</label>
                <textarea
                  required
                  value={announceContent}
                  onChange={e => setAnnounceContent(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800 focus:outline-none h-24"
                  placeholder="Write the announcement description notice here..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold text-xs shadow-lg transition-all"
              >
                Publish Broadcast Notice
              </button>
            </form>
          </GlassCard>
        </div>
      )}

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

export default AdminDashboard;
