import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import GlassCard from '../components/GlassCard';
import Loader from '../components/Loader';
import Toast from '../components/Toast';
import { 
  Calendar, Check, X, FileEdit, Clock, Stethoscope, 
  User, Clipboard, Plus, Trash2, ShieldCheck, Download
} from 'lucide-react';

const DoctorDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [toast, setToast] = useState(null);

  // Prescription Modal State
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [medicines, setMedicines] = useState([{ name: '', dosage: '1-0-1', duration: '5 days', instructions: 'After food' }]);
  const [prescriptionNotes, setPrescriptionNotes] = useState('');
  const [submittingPrescription, setSubmittingPrescription] = useState(false);

  // Availability state
  const [availability, setAvailability] = useState([]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [savingSchedule, setSavingSchedule] = useState(false);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const fetchDoctorData = async () => {
    try {
      const statsRes = await API.get('/analytics/doctor-stats');
      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }

      const apptsRes = await API.get('/appointments');
      if (apptsRes.data.success) {
        setAppointments(apptsRes.data.appointments);
      }

      // Fetch doctor profile to populate schedule
      const meRes = await API.get('/auth/me');
      if (meRes.data.success && meRes.data.profile) {
        setAvailability(meRes.data.profile.availability || []);
        setStartTime(meRes.data.profile.schedule?.start || '09:00');
        setEndTime(meRes.data.profile.schedule?.end || '17:00');
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to fetch doctor dashboard details' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorData();
  }, []);

  const handleUpdateStatus = async (apptId, status) => {
    try {
      const res = await API.put(`/appointments/${apptId}/status`, { status });
      if (res.data.success) {
        setToast({ type: 'success', message: `Appointment status updated to ${status}!` });
        fetchDoctorData();
      }
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Failed to update status' });
    }
  };

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    setSavingSchedule(true);
    try {
      const meRes = await API.get('/auth/me');
      if (meRes.data.success && meRes.data.profile) {
        const docId = meRes.data.profile._id;
        const res = await API.put(`/doctors/${docId}`, {
          availability,
          schedule: { start: startTime, end: endTime },
        });
        if (res.data.success) {
          setToast({ type: 'success', message: 'Duty schedule updated successfully!' });
        }
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to update schedule' });
    } finally {
      setSavingSchedule(false);
    }
  };

  // Prescription medicines handlers
  const handleAddMedRow = () => {
    setMedicines([...medicines, { name: '', dosage: '1-0-1', duration: '5 days', instructions: 'After food' }]);
  };

  const handleRemoveMedRow = (idx) => {
    if (medicines.length === 1) return;
    setMedicines(medicines.filter((_, i) => i !== idx));
  };

  const handleMedChange = (idx, field, val) => {
    const updated = [...medicines];
    updated[idx][field] = val;
    setMedicines(updated);
  };

  const handleSubmitPrescription = async (e) => {
    e.preventDefault();
    const emptyMedName = medicines.some(m => !m.name);
    if (emptyMedName) {
      setToast({ type: 'error', message: 'Please write medicine names' });
      return;
    }

    setSubmittingPrescription(true);
    try {
      const res = await API.post('/prescriptions', {
        patientId: selectedAppointment.patient._id,
        appointmentId: selectedAppointment._id,
        medicines,
        notes: prescriptionNotes,
      });

      if (res.data.success) {
        setToast({ type: 'success', message: 'Prescription successfully uploaded & sent!' });
        setShowPrescriptionModal(false);
        setMedicines([{ name: '', dosage: '1-0-1', duration: '5 days', instructions: 'After food' }]);
        setPrescriptionNotes('');
        fetchDoctorData();
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to upload prescription' });
    } finally {
      setSubmittingPrescription(false);
    }
  };

  const openPrescription = (appt) => {
    setSelectedAppointment(appt);
    setShowPrescriptionModal(true);
  };

  if (loading || !stats) return <Loader />;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Doctor Consultation Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">View upcoming patient check-ins, write prescriptions, and adjust availability times</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Today\'s Checkins', value: stats.todayAppointments, icon: <Clock className="w-5 h-5 text-indigo-500" />, desc: 'Remaining today' },
          { label: 'Total Scheduled', value: stats.totalAppointments, icon: <Calendar className="w-5 h-5 text-emerald-500" />, desc: 'All bookings count' },
          { label: 'Pending Approvals', value: stats.pendingReview, icon: <Stethoscope className="w-5 h-5 text-amber-500" />, desc: 'Needs confirmation' },
          { label: 'Prescriptions Issued', value: stats.totalPrescriptions, icon: <Clipboard className="w-5 h-5 text-teal-500" />, desc: 'Uploaded medical advice' },
        ].map((m, idx) => (
          <GlassCard key={idx} className="p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{m.label}</span>
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900/60">{m.icon}</div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-black text-slate-800 dark:text-white">{m.value}</h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">{m.desc}</p>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Main Grid: Appointments & Shift Times */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appointments Table */}
        <GlassCard className="lg:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200/30 dark:border-slate-800/20 pb-4 mb-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Scheduled Patient Visits</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-slate-450 border-b border-slate-200/30 dark:border-slate-800/20">
                  <th className="py-2">Patient Details</th>
                  <th className="py-2">Date & Time</th>
                  <th className="py-2">Status</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-900/40">
                {appointments.length > 0 ? (
                  appointments.map((appt) => (
                    <tr key={appt._id} className="hover:bg-slate-500/5 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-500 font-bold">
                            {appt.patient.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-700 dark:text-slate-200 block">{appt.patient.name}</span>
                            <span className="text-[10px] text-slate-400 block">{appt.patient.age} / {appt.patient.gender} • {appt.patient.bloodGroup}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="block font-semibold text-slate-750 dark:text-slate-300">
                          {new Date(appt.date).toLocaleDateString()}
                        </span>
                        <span className="block text-[10px] text-slate-450">{appt.timeSlot}</span>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          appt.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500' :
                          appt.status === 'Pending' ? 'bg-amber-500/10 text-amber-500' :
                          appt.status === 'Cancelled' ? 'bg-red-500/10 text-red-500' :
                          'bg-primary-500/10 text-primary-500'
                        }`}>
                          {appt.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-1.5">
                          {appt.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(appt._id, 'Approved')}
                                className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 transition-colors"
                                title="Approve Visit"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(appt._id, 'Rejected')}
                                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors"
                                title="Reject Visit"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          {appt.status === 'Approved' && (
                            <button
                              onClick={() => openPrescription(appt)}
                              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-primary-500/10 hover:bg-primary-500/20 text-primary-500 font-bold transition-all"
                            >
                              <FileEdit className="w-3.5 h-3.5" />
                              <span>Prescribe</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-400">No scheduled appointments found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* Schedule Duty Planner */}
        <GlassCard>
          <div className="border-b border-slate-200/30 dark:border-slate-800/20 pb-4 mb-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Duty Scheduler</h3>
          </div>

          <form onSubmit={handleSaveSchedule} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Available Consultation Days</label>
              <div className="flex flex-wrap gap-1.5">
                {daysOfWeek.map((day) => {
                  const selected = availability.includes(day);
                  return (
                    <button
                      type="button"
                      key={day}
                      onClick={() => {
                        if (selected) setAvailability(availability.filter(d => d !== day));
                        else setAvailability([...availability, day]);
                      }}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                        selected 
                          ? 'bg-primary-500 border-primary-500 text-white' 
                          : 'border-slate-300/30 text-slate-400 bg-transparent hover:text-slate-200'
                      }`}
                    >
                      {day.substring(0, 3)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Shift Start</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Shift End</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingSchedule}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold text-xs shadow-lg transition-all"
            >
              {savingSchedule ? 'Saving Schedule...' : 'Save Shifts Plan'}
            </button>
          </form>
        </GlassCard>
      </div>

      {/* PRESCRIPTION GENERATOR MODAL */}
      {showPrescriptionModal && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <GlassCard className="w-full max-w-xl max-h-[90vh] overflow-y-auto border border-white/20 dark:border-slate-800/20">
            <div className="flex items-center justify-between border-b border-slate-200/30 dark:border-slate-800/20 pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Rx - Prescription Writer</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Patient: {selectedAppointment.patient.name} ({selectedAppointment.patient.age}y / {selectedAppointment.patient.gender})</p>
              </div>
              <button 
                onClick={() => setShowPrescriptionModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
              >✕</button>
            </div>

            <form onSubmit={handleSubmitPrescription} className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Medicines Prescribed</span>
                  <button
                    type="button"
                    onClick={handleAddMedRow}
                    className="flex items-center space-x-1 px-2.5 py-1 text-[10px] font-bold bg-primary-500/10 text-primary-500 rounded-lg hover:bg-primary-500/20 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add row</span>
                  </button>
                </div>

                {medicines.map((med, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      required
                      placeholder="Medicine Name (e.g. Paracetamol)"
                      value={med.name}
                      onChange={e => handleMedChange(idx, 'name', e.target.value)}
                      className="flex-grow px-3 py-2 text-xs rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Dosage (e.g. 1-0-1)"
                      value={med.dosage}
                      onChange={e => handleMedChange(idx, 'dosage', e.target.value)}
                      className="w-20 px-3 py-2 text-xs rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Duration"
                      value={med.duration}
                      onChange={e => handleMedChange(idx, 'duration', e.target.value)}
                      className="w-20 px-3 py-2 text-xs rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Instructions"
                      value={med.instructions}
                      onChange={e => handleMedChange(idx, 'instructions', e.target.value)}
                      className="w-24 px-3 py-2 text-xs rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800 focus:outline-none"
                    />
                    {medicines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMedRow(idx)}
                        className="p-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Doctor Advice / Diet / Exercises</label>
                <textarea
                  value={prescriptionNotes}
                  onChange={e => setPrescriptionNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800 focus:outline-none h-20"
                  placeholder="Drink steam, avoid oily food, rest for 3 days..."
                />
              </div>

              <button
                type="submit"
                disabled={submittingPrescription}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold text-xs shadow-lg transition-all"
              >
                {submittingPrescription ? 'Saving & Transmitting Prescription...' : 'Issue Prescription'}
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

export default DoctorDashboard;
