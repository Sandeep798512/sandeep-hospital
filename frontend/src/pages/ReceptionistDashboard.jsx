import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import GlassCard from '../components/GlassCard';
import Loader from '../components/Loader';
import Toast from '../components/Toast';
import { 
  Users, Calendar, Receipt, Plus, Search, 
  Download, Edit2, FileText, ClipboardCheck, ArrowUpDown 
} from 'lucide-react';

const ReceptionistDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  
  // Dashboard Lists
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [bills, setBills] = useState([]);
  
  // Search & Filters
  const [patSearch, setPatSearch] = useState('');
  const [billSearch, setBillSearch] = useState('');
  
  // Modal states
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showApptModal, setShowApptModal] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);

  // New Patient Form
  const [patName, setPatName] = useState('');
  const [patEmail, setPatEmail] = useState('');
  const [patAge, setPatAge] = useState('');
  const [patGender, setPatGender] = useState('Male');
  const [patBlood, setPatBlood] = useState('O+');
  const [patAddr, setPatAddr] = useState('');
  const [patEcName, setPatEcName] = useState('');
  const [patEcRelation, setPatEcRelation] = useState('');
  const [patEcPhone, setPatEcPhone] = useState('');

  // New Appointment Form
  const [apptPatId, setApptPatId] = useState('');
  const [apptDocId, setApptDocId] = useState('');
  const [apptDate, setApptDate] = useState('');
  const [apptSlot, setApptSlot] = useState('10:00');
  const [apptReason, setApptReason] = useState('');

  // New Bill Form
  const [billPatId, setBillPatId] = useState('');
  const [consultFees, setConsultFees] = useState(0);
  const [medCharges, setMedCharges] = useState(0);
  const [roomCharges, setRoomCharges] = useState(0);
  const [labCharges, setLabCharges] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [payStatus, setPayStatus] = useState('Pending');
  const [payMethod, setPayMethod] = useState('Cash');

  const fetchDashboardData = async () => {
    try {
      const patRes = await API.get('/patients');
      if (patRes.data.success) setPatients(patRes.data.patients);

      const docRes = await API.get('/doctors');
      if (docRes.data.success) setDoctors(docRes.data.doctors);

      const billRes = await API.get('/bills');
      if (billRes.data.success) setBills(billRes.data.bills);
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to sync desk records' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRegisterPatient = async (e) => {
    e.preventDefault();
    if (!patName || !patAge || !patAddr || !patEcName || !patEcPhone) {
      setToast({ type: 'error', message: 'Please fill in all required fields' });
      return;
    }

    try {
      const res = await API.post('/patients', {
        name: patName,
        email: patEmail,
        age: parseInt(patAge),
        gender: patGender,
        bloodGroup: patBlood,
        address: patAddr,
        emergencyContact: { name: patEcName, relation: patEcRelation, phone: patEcPhone },
      });
      if (res.data.success) {
        setToast({ type: 'success', message: 'Patient profile registered successfully!' });
        setShowPatientModal(false);
        // Reset form
        setPatName(''); setPatEmail(''); setPatAge(''); setPatAddr(''); setPatEcName(''); setPatEcPhone('');
        fetchDashboardData();
      }
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Registration failed' });
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!apptPatId || !apptDocId || !apptDate || !apptReason) {
      setToast({ type: 'error', message: 'Please complete booking selections' });
      return;
    }

    try {
      const res = await API.post('/appointments', {
        patientId: apptPatId,
        doctorId: apptDocId,
        date: apptDate,
        timeSlot: apptSlot,
        reason: apptReason,
      });
      if (res.data.success) {
        setToast({ type: 'success', message: 'Appointment booking submitted successfully!' });
        setShowApptModal(false);
        setApptPatId(''); setApptDocId(''); setApptDate(''); setApptReason('');
        fetchDashboardData();
      }
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Booking failed' });
    }
  };

  const handleGenerateInvoice = async (e) => {
    e.preventDefault();
    if (!billPatId) {
      setToast({ type: 'error', message: 'Please select a patient' });
      return;
    }

    try {
      const res = await API.post('/bills', {
        patientId: billPatId,
        consultationCharges: parseFloat(consultFees || 0),
        medicineCharges: parseFloat(medCharges || 0),
        roomCharges: parseFloat(roomCharges || 0),
        labCharges: parseFloat(labCharges || 0),
        discount: parseFloat(discount || 0),
        paymentStatus: payStatus,
        paymentMethod: payStatus === 'Paid' ? payMethod : 'None',
      });

      if (res.data.success) {
        setToast({ type: 'success', message: 'Invoice generated successfully!' });
        setShowBillModal(false);
        setBillPatId(''); setConsultFees(0); setMedCharges(0); setRoomCharges(0); setLabCharges(0); setDiscount(0);
        fetchDashboardData();
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to generate bill invoice' });
    }
  };

  const handleDownloadInvoice = async (billId, invNum) => {
    try {
      const res = await API.get(`/bills/${billId}/pdf`, { responseType: 'blob' });
      const file = new Blob([res.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);
      
      const link = document.createElement('a');
      link.href = fileURL;
      link.download = `Invoice-${invNum}.pdf`;
      link.click();
      
      setToast({ type: 'success', message: 'Downloading invoice PDF...' });
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to download invoice' });
    }
  };

  if (loading) return <Loader />;

  // Filtered lists
  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(patSearch.toLowerCase()) || 
    (p.email && p.email.toLowerCase().includes(patSearch.toLowerCase()))
  );

  const filteredBills = bills.filter(b => 
    b.invoiceNumber.toLowerCase().includes(billSearch.toLowerCase()) ||
    (b.patient && b.patient.name.toLowerCase().includes(billSearch.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Reception Operations Desk</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Register incoming walk-in patients, schedule appointments, and checkout invoices</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowPatientModal(true)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold text-xs shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Register Patient</span>
          </button>
          <button
            onClick={() => setShowApptModal(true)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-200/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors font-bold text-xs"
          >
            <Calendar className="w-4 h-4" />
            <span>Book Visit</span>
          </button>
          <button
            onClick={() => setShowBillModal(true)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-accent-cyan hover:bg-cyan-400 text-slate-900 font-bold text-xs transition-colors shadow-lg shadow-cyan-500/10"
          >
            <Receipt className="w-4 h-4" />
            <span>Create Invoice</span>
          </button>
        </div>
      </div>

      {/* Grid containing Patients CRUD desk & Billings Cashier desk */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Patient Register CRUD */}
        <GlassCard>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-200/30 dark:border-slate-800/20">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-2">
              <Users className="w-4.5 h-4.5 text-primary-500" />
              <span>Patients Directory</span>
            </h3>
            
            {/* Search */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={patSearch}
                onChange={e => setPatSearch(e.target.value)}
                className="pl-9 pr-3 py-1.5 rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500/50 text-slate-750 dark:text-slate-200"
                placeholder="Search patient name..."
              />
            </div>
          </div>

          <div className="max-h-[350px] overflow-y-auto pr-1">
            <div className="divide-y divide-slate-100 dark:divide-slate-900/30">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((pat) => (
                  <div key={pat._id} className="py-3 flex items-center justify-between hover:bg-slate-500/5 px-2 rounded-xl transition-colors">
                    <div>
                      <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">{pat.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Age: {pat.age} • Gender: {pat.gender} • Blood Group: {pat.bloodGroup}
                      </p>
                      {pat.email && <span className="text-[9px] text-slate-450 block">{pat.email}</span>}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">
                      EC: {pat.emergencyContact?.name || 'N/A'} ({pat.emergencyContact?.phone || ''})
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">No registered patients found</div>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Invoice Cashier Desk */}
        <GlassCard>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-200/30 dark:border-slate-800/20">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-2">
              <Receipt className="w-4.5 h-4.5 text-accent-cyan" />
              <span>Invoices & Billings</span>
            </h3>
            
            {/* Search */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={billSearch}
                onChange={e => setBillSearch(e.target.value)}
                className="pl-9 pr-3 py-1.5 rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500/50 text-slate-750 dark:text-slate-200"
                placeholder="Search invoice number..."
              />
            </div>
          </div>

          <div className="max-h-[350px] overflow-y-auto pr-1">
            <div className="divide-y divide-slate-100 dark:divide-slate-900/30">
              {filteredBills.length > 0 ? (
                filteredBills.map((bill) => (
                  <div key={bill._id} className="py-3 flex items-center justify-between hover:bg-slate-500/5 px-2 rounded-xl transition-colors">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-slate-750 dark:text-slate-200">{bill.invoiceNumber}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                          bill.paymentStatus === 'Paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                        }`}>
                          {bill.paymentStatus}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Patient: {bill.patient?.name || 'Deleted Patient'} • Total: ₹{bill.totalAmount.toFixed(2)}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDownloadInvoice(bill._id, bill.invoiceNumber)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-500 hover:text-primary-500 transition-colors"
                      title="Download PDF Invoice"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">No billing records found</div>
              )}
            </div>
          </div>
        </GlassCard>

      </div>

      {/* MODAL: REGISTER PATIENT */}
      {showPatientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <GlassCard className="w-full max-w-lg max-h-[90vh] overflow-y-auto border border-white/20 dark:border-slate-800/20">
            <div className="flex items-center justify-between border-b border-slate-200/30 dark:border-slate-800/20 pb-4 mb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Patient Demographic Registration Form</h3>
              <button onClick={() => setShowPatientModal(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <form onSubmit={handleRegisterPatient} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Full Name *</label>
                  <input type="text" required value={patName} onChange={e => setPatName(e.target.value)} className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800 focus:outline-none" placeholder="Name"/>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Email Address</label>
                  <input type="email" value={patEmail} onChange={e => setPatEmail(e.target.value)} className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800 focus:outline-none" placeholder="email@address.com"/>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Age *</label>
                  <input type="number" required value={patAge} onChange={e => setPatAge(e.target.value)} className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800 focus:outline-none" placeholder="Age" min="0"/>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Gender *</label>
                  <select value={patGender} onChange={e => setPatGender(e.target.value)} className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800 focus:outline-none text-slate-700 dark:text-slate-300">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Blood Group *</label>
                  <select value={patBlood} onChange={e => setPatBlood(e.target.value)} className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800 focus:outline-none text-slate-700 dark:text-slate-300">
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Address *</label>
                  <input type="text" required value={patAddr} onChange={e => setPatAddr(e.target.value)} className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800 focus:outline-none" placeholder="Street Address"/>
                </div>
              </div>

              <div className="border-t border-slate-200/30 dark:border-slate-800/20 pt-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">Emergency Contact details</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-0.5">Person Name *</label>
                    <input type="text" required value={patEcName} onChange={e => setPatEcName(e.target.value)} className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800 focus:outline-none" placeholder="Name"/>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-0.5">Relation *</label>
                    <input type="text" required value={patEcRelation} onChange={e => setPatEcRelation(e.target.value)} className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800 focus:outline-none" placeholder="Spouse"/>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-0.5">Phone *</label>
                    <input type="text" required value={patEcPhone} onChange={e => setPatEcPhone(e.target.value)} className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800 focus:outline-none" placeholder="Phone"/>
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold text-xs shadow-lg transition-all">Register Walk-in Profile</button>
            </form>
          </GlassCard>
        </div>
      )}

      {/* MODAL: BOOK APPOINTMENT */}
      {showApptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <GlassCard className="w-full max-w-md border border-white/20 dark:border-slate-800/20">
            <div className="flex items-center justify-between border-b border-slate-200/30 dark:border-slate-800/20 pb-4 mb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Book Doctor Appointment Visit</h3>
              <button onClick={() => setShowApptModal(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <form onSubmit={handleBookAppointment} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Select Patient *</label>
                <select required value={apptPatId} onChange={e => setApptPatId(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                  <option value="">-- Choose Patient --</option>
                  {patients.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Select Medical Officer *</label>
                <select required value={apptDocId} onChange={e => setApptDocId(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                  <option value="">-- Choose Doctor --</option>
                  {doctors.map(d => <option key={d._id} value={d._id}>{d.user?.name} ({d.department})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Appointment Date *</label>
                  <input type="date" required value={apptDate} onChange={e => setApptDate(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800 text-slate-700 dark:text-slate-300"/>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Preferred Slot Time *</label>
                  <input type="text" required value={apptSlot} onChange={e => setApptSlot(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800 text-slate-700 dark:text-slate-300" placeholder="10:30"/>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Reason for Visit *</label>
                <input type="text" required value={apptReason} onChange={e => setApptReason(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800 focus:outline-none" placeholder="Fever and Cough"/>
              </div>

              <button type="submit" className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold shadow-lg transition-all">Submit Appointment Booking</button>
            </form>
          </GlassCard>
        </div>
      )}

      {/* MODAL: CREATE INVOICE */}
      {showBillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <GlassCard className="w-full max-w-md max-h-[90vh] overflow-y-auto border border-white/20 dark:border-slate-800/20">
            <div className="flex items-center justify-between border-b border-slate-200/30 dark:border-slate-800/20 pb-4 mb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Generate Bill Invoice Receipts</h3>
              <button onClick={() => setShowBillModal(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <form onSubmit={handleGenerateInvoice} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Select Patient *</label>
                <select required value={billPatId} onChange={e => setBillPatId(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                  <option value="">-- Choose Patient --</option>
                  {patients.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Consultation Fee</label>
                  <input type="number" value={consultFees} onChange={e => setConsultFees(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800" min="0"/>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Pharmacy / Medicine</label>
                  <input type="number" value={medCharges} onChange={e => setMedCharges(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800" min="0"/>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Room Rent charges</label>
                  <input type="number" value={roomCharges} onChange={e => setRoomCharges(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800" min="0"/>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Laboratory tests</label>
                  <input type="number" value={labCharges} onChange={e => setLabCharges(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800" min="0"/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Flat Discount (INR)</label>
                  <input type="number" value={discount} onChange={e => setDiscount(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800" min="0"/>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Invoice GST (%)</label>
                  <input type="number" readOnly value="18" className="w-full px-3 py-2 rounded-xl bg-slate-100/50 dark:bg-slate-900/30 border border-slate-300/10 dark:border-slate-800/10 text-slate-450" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 border-t border-slate-200/30 dark:border-slate-800/20 pt-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Payment Status</label>
                  <select value={payStatus} onChange={e => setPayStatus(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
                {payStatus === 'Paid' && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Payment Method</label>
                    <select value={payMethod} onChange={e => setPayMethod(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                      <option value="Cash">Cash</option>
                      <option value="Card">Card</option>
                      <option value="UPI">UPI / QR Scan</option>
                    </select>
                  </div>
                )}
              </div>

              <button type="submit" className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold shadow-lg transition-all">Compile & Generate Invoice</button>
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

export default ReceptionistDashboard;
