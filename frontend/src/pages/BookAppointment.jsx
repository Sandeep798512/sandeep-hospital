import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import GlassCard from '../components/GlassCard';
import Loader from '../components/Loader';
import Toast from '../components/Toast';
import { Calendar, Stethoscope, Clock, FileText, CheckCircle2 } from 'lucide-react';

const BookAppointment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [toast, setToast] = useState(null);

  // Form states
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('10:00');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const timeSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '14:00', '14:30', '15:00', '15:30', '16:00'];

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await API.get('/doctors');
        if (res.data.success) {
          setDoctors(res.data.doctors);
        }
      } catch (err) {
        setToast({ type: 'error', message: 'Failed to fetch doctor lists' });
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctor || !date || !timeSlot || !reason) {
      setToast({ type: 'error', message: 'Please fill in all required fields' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await API.post('/appointments', {
        doctorId: selectedDoctor._id,
        date,
        timeSlot,
        reason,
        notes,
      });

      if (res.data.success) {
        setToast({ type: 'success', message: 'Appointment booked successfully! Pending approval.' });
        setTimeout(() => {
          navigate('/patient');
        }, 1500);
      }
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Booking failed. Try choosing another slot.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Schedule Doctor Appointment</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Select a specialist and choose your preferred date and time slot</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doctor Selection Grid */}
        <div className="lg:col-span-2 space-y-4 max-h-[500px] overflow-y-auto pr-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">1. Choose a Specialist</span>
          {doctors.map((doc) => {
            const isSelected = selectedDoctor?._id === doc._id;
            return (
              <GlassCard
                key={doc._id}
                onClick={() => setSelectedDoctor(doc)}
                className={`flex gap-4 items-start border p-4 transition-all duration-300 ${
                  isSelected 
                    ? 'border-primary-500 ring-2 ring-primary-500/20 bg-primary-500/5' 
                    : 'border-slate-200/50 dark:border-slate-800/20 hover:border-primary-500/30'
                }`}
              >
                <img
                  src={doc.user?.profileImage || `https://api.dicebear.com/7.x/adventurer/svg?seed=${doc.user?.name}`}
                  alt={doc.user?.name}
                  className="w-14 h-14 rounded-2xl object-cover border"
                />
                <div className="flex-grow">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 dark:text-slate-250 text-sm">Dr. {doc.user?.name}</h3>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-primary-500" />}
                  </div>
                  <span className="inline-block mt-0.5 px-2 py-0.5 text-[9px] font-bold text-primary-500 uppercase bg-primary-500/10 rounded-full">
                    {doc.department}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-2 line-clamp-2">{doc.bio || 'General medical consultation'}</p>
                  
                  <div className="flex items-center gap-4 mt-3 text-[10px] font-semibold text-slate-450">
                    <span>Exp: {doc.experience} Years</span>
                    <span>Fees: ₹{doc.fees}</span>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>

        {/* Date & Slot selection Form */}
        <GlassCard>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-4">2. Select Schedule</span>
          
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Appointment Date *</label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800 text-slate-700 dark:text-slate-250 focus:outline-none"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Select Time Slot *</label>
              <div className="grid grid-cols-3 gap-1.5 max-h-[150px] overflow-y-auto p-1 border border-slate-350/10 dark:border-slate-800/10 rounded-xl bg-slate-100/20 dark:bg-slate-900/10">
                {timeSlots.map((slot) => {
                  const isSelectedSlot = timeSlot === slot;
                  return (
                    <button
                      type="button"
                      key={slot}
                      onClick={() => setTimeSlot(slot)}
                      className={`py-1.5 rounded-lg text-[10px] font-bold border transition-colors ${
                        isSelectedSlot 
                          ? 'bg-primary-500 border-primary-500 text-white shadow-md' 
                          : 'border-slate-300/20 text-slate-400 bg-transparent hover:text-slate-200'
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Reason for Visit *</label>
              <input
                type="text"
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800 focus:outline-none"
                placeholder="Fever, cough, or general checkup"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Additional Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800 focus:outline-none h-16"
                placeholder="List any drug allergies or current symptoms..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !selectedDoctor}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold shadow-lg shadow-primary-500/25 transition-all text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting Booking Request...' : 'Book Consult Session'}
            </button>
          </form>
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

export default BookAppointment;
