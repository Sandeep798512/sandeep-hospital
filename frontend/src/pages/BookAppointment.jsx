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

  const formatDocName = (name) => {
    if (!name) return 'Medical Officer';
    return name.startsWith('Dr.') ? name : `Dr. ${name}`;
  };

  const getDoctorImage = (doc) => {
    const email = doc.user?.email || '';
    const name = doc.user?.name || '';
    const img = doc.user?.profileImage;

    if (img && !img.includes('dicebear')) {
      return img;
    }
    if (email.includes('priya') || name.includes('Priya')) return '/priya.jpg';
    if (email.includes('rahul') || name.includes('Rahul')) return '/rahul v.jpg';
    if (email.includes('rajesh') || name.includes('Rajesh') || name.includes('Sandeep')) return '/sandy.jpg';

    return img || '/sandy.jpg';
  };

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
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Schedule Doctor Appointment</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">Select a specialist and choose your preferred date and time slot</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doctor Selection Grid */}
        <div className="lg:col-span-2 space-y-4 max-h-[520px] overflow-y-auto pr-2">
          <span className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 block mb-2">1. Choose a Specialist</span>
          {doctors.map((doc) => {
            const isSelected = selectedDoctor?._id === doc._id;
            return (
              <GlassCard
                key={doc._id}
                onClick={() => setSelectedDoctor(doc)}
                className={`flex gap-4 items-start border p-4 transition-all duration-300 ${
                  isSelected 
                    ? 'border-primary-500 ring-2 ring-primary-500/40 bg-primary-500/10 dark:bg-primary-950/40' 
                    : 'border-slate-200 dark:border-slate-800 hover:border-primary-500/50'
                }`}
              >
                <img
                  src={getDoctorImage(doc)}
                  alt={doc.user?.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-primary-500/30 shadow-md flex-shrink-0"
                />
                <div className="flex-grow">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-slate-900 dark:text-white text-base">
                      {formatDocName(doc.user?.name)}
                    </h3>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-primary-500" />}
                  </div>
                  <span className="inline-block mt-1 px-2.5 py-0.5 text-[10px] font-extrabold text-primary-600 dark:text-accent-cyan uppercase bg-primary-500/10 rounded-full">
                    {doc.department}
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed line-clamp-2">{doc.bio || 'General medical consultation'}</p>
                  
                  <div className="flex items-center gap-5 mt-3 text-xs font-bold text-slate-700 dark:text-slate-200">
                    <span>Exp: {doc.experience} Years</span>
                    <span className="text-emerald-600 dark:text-emerald-400">Fees: ₹{doc.fees}</span>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>

        {/* Date & Slot selection Form */}
        <GlassCard>
          <span className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 block mb-4">2. Select Schedule</span>
          
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">Appointment Date *</label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-primary-500"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div>
              <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">Select Time Slot *</label>
              <div className="grid grid-cols-3 gap-2 max-h-[160px] overflow-y-auto p-1.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950">
                {timeSlots.map((slot) => {
                  const isSelectedSlot = timeSlot === slot;
                  return (
                    <button
                      type="button"
                      key={slot}
                      onClick={() => setTimeSlot(slot)}
                      className={`py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        isSelectedSlot 
                          ? 'bg-primary-500 border-primary-500 text-white shadow-md shadow-primary-500/30' 
                          : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800/80 hover:bg-primary-500/10 hover:border-primary-500/40'
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">Reason for Visit *</label>
              <input
                type="text"
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Fever, cough, or general checkup"
              />
            </div>

            <div>
              <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">Additional Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 h-16"
                placeholder="List any drug allergies or current symptoms..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !selectedDoctor}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold shadow-lg shadow-primary-500/25 transition-all text-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
