import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import Loader from '../components/Loader';
import Toast from '../components/Toast';
import { 
  FolderHeart, Receipt, FileText, Download, Upload, 
  Trash2, Plus, Calendar, FileType, CheckCircle, CreditCard 
} from 'lucide-react';

const PatientHistory = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  
  // Lists
  const [bills, setBills] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [reports, setReports] = useState([]);
  
  // Modal Upload Form
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [reportTitle, setReportTitle] = useState('');
  const [reportType, setReportType] = useState('Lab Report');
  const [reportFile, setReportFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchHistoryData = async () => {
    try {
      const billsRes = await API.get('/bills');
      if (billsRes.data.success) setBills(billsRes.data.bills);

      const presRes = await API.get('/prescriptions');
      if (presRes.data.success) setPrescriptions(presRes.data.prescriptions);

      const repRes = await API.get('/reports');
      if (repRes.data.success) setReports(repRes.data.reports);
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to sync medical database records' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoryData();
  }, []);

  const handleDownloadInvoice = async (billId, invoiceNumber) => {
    try {
      const res = await API.get(`/bills/${billId}/pdf`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice-${invoiceNumber}.pdf`;
      link.click();
      setToast({ type: 'success', message: 'Invoice PDF downloaded successfully!' });
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to generate invoice PDF' });
    }
  };

  const handleDownloadPrescription = async (presId) => {
    try {
      const res = await API.get(`/prescriptions/${presId}/pdf`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Prescription-${presId.substring(18)}.pdf`;
      link.click();
      setToast({ type: 'success', message: 'Prescription PDF downloaded successfully!' });
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to generate prescription PDF' });
    }
  };

  const handleDownloadReport = async (reportId, filename) => {
    try {
      const res = await API.get(`/reports/${reportId}/download`, { responseType: 'blob' });
      const blob = new Blob([res.data]);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to download report file' });
    }
  };

  const handleRazorpayPay = async (bill) => {
    try {
      const res = await API.post(`/bills/${bill._id}/razorpay-order`);
      if (res.data.success) {
        const { order, key } = res.data;

        const options = {
          key: key,
          amount: order.amount,
          currency: order.currency,
          name: 'Sandeep Super Specialty Hospital',
          description: `Invoice Payment (${bill.invoiceNumber})`,
          image: '/SANDEEP GAUD.JPG',
          order_id: order.id,
          handler: async function (response) {
            try {
              const verifyRes = await API.post(`/bills/${bill._id}/razorpay-verify`, {
                paymentId: response.razorpay_payment_id || `pay_${Date.now()}`,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
              });

              if (verifyRes.data.success) {
                setToast({ type: 'success', message: 'Razorpay Payment Successful! Invoice status updated.' });
                fetchHistoryData();
              }
            } catch (err) {
              setToast({ type: 'error', message: 'Payment verification failed' });
            }
          },
          prefill: {
            name: user?.name || 'Patient',
            email: user?.email || 'patient@hospital.com',
            contact: '+917985126471',
          },
          theme: {
            color: '#3a2bdc',
          },
        };

        if (window.Razorpay) {
          const rzp = new window.Razorpay(options);
          rzp.open();
        } else {
          const confirmPay = window.confirm(`Simulate Razorpay Test Payment of ₹${bill.totalAmount.toFixed(2)} for invoice ${bill.invoiceNumber}?`);
          if (confirmPay) {
            const verifyRes = await API.post(`/bills/${bill._id}/razorpay-verify`, {
              paymentId: `pay_simulated_${Date.now()}`,
              orderId: order.id,
              signature: 'simulated_sig',
            });
            if (verifyRes.data.success) {
              setToast({ type: 'success', message: 'Razorpay Test Payment Recorded! Bill is Paid.' });
              fetchHistoryData();
            }
          }
        }
      }
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Failed to initiate Razorpay payment' });
    }
  };

  const handleUploadReport = async (e) => {
    e.preventDefault();
    if (!reportTitle || !reportFile) {
      setToast({ type: 'error', message: 'Title and file are required' });
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('title', reportTitle);
    formData.append('reportType', reportType);
    formData.append('reportFile', reportFile);

    try {
      const meRes = await API.get('/auth/me');
      if (meRes.data.success && meRes.data.profile) {
        formData.append('patientId', meRes.data.profile._id);
        const res = await API.post('/reports', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (res.data.success) {
          setToast({ type: 'success', message: 'Medical report uploaded successfully!' });
          setShowUploadModal(false);
          setReportTitle(''); setReportFile(null);
          fetchHistoryData();
        }
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to upload diagnostic report' });
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Medical Records & Invoices</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Access your historical prescriptions, diagnostic lab files, and billing receipts</p>
        </div>
        <div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold text-xs shadow-lg transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Lab File</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Prescriptions */}
        <GlassCard>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 pb-2 border-b border-slate-200/30 dark:border-slate-800/20 flex items-center space-x-2">
            <FileText className="w-4.5 h-4.5 text-indigo-500" />
            <span>Doctor Prescriptions</span>
          </h3>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {prescriptions.length > 0 ? (
              prescriptions.map((pres) => (
                <div key={pres._id} className="p-3.5 rounded-xl bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/20 flex justify-between items-center hover:border-indigo-500/20 transition-all">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">Rx - Medication Advice</h4>
                    <p className="text-[10px] text-slate-400 mt-1">Doctor: Dr. {pres.doctor?.user?.name || 'Staff'}</p>
                    <span className="text-[9px] text-slate-550 block mt-1">{new Date(pres.date).toLocaleDateString()}</span>
                  </div>
                  <button
                    onClick={() => handleDownloadPrescription(pres._id)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-500 transition-colors"
                    title="Download Rx PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">No prescriptions issued yet</div>
            )}
          </div>
        </GlassCard>

        {/* Bills / Invoices */}
        <GlassCard>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 pb-2 border-b border-slate-200/30 dark:border-slate-800/20 flex items-center space-x-2">
            <Receipt className="w-4.5 h-4.5 text-accent-cyan" />
            <span>Invoice Bills</span>
          </h3>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {bills.length > 0 ? (
              bills.map((bill) => (
                <div key={bill._id} className="p-3.5 rounded-xl bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/20 flex justify-between items-center hover:border-accent-cyan/20 transition-all">
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100">{bill.invoiceNumber}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                        bill.paymentStatus === 'Paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                      }`}>
                        {bill.paymentStatus}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1.5">Total Amount: ₹{bill.totalAmount.toFixed(2)}</p>
                    <span className="text-[9px] text-slate-550 block mt-0.5">{new Date(bill.date).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {bill.paymentStatus !== 'Paid' && (
                      <button
                        onClick={() => handleRazorpayPay(bill)}
                        className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] shadow transition-all"
                        title="Pay online via Razorpay"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Pay Now</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleDownloadInvoice(bill._id, bill.invoiceNumber)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-500 hover:text-cyan-500 transition-colors"
                      title="Download Invoice PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">No invoices issued yet</div>
            )}
          </div>
        </GlassCard>

        {/* Uploaded lab reports */}
        <GlassCard>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 pb-2 border-b border-slate-200/30 dark:border-slate-800/20 flex items-center space-x-2">
            <FileType className="w-4.5 h-4.5 text-teal-500" />
            <span>Lab & Diagnostic Reports</span>
          </h3>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {reports.length > 0 ? (
              reports.map((rep) => (
                <div key={rep._id} className="p-3.5 rounded-xl bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/20 flex justify-between items-center hover:border-teal-500/20 transition-all">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate max-w-[150px]">{rep.title}</h4>
                    <span className="inline-block mt-1 px-1.5 py-0.5 text-[8px] font-bold text-teal-500 uppercase bg-teal-500/10 rounded">
                      {rep.reportType}
                    </span>
                    <span className="text-[9px] text-slate-550 block mt-1">{new Date(rep.date).toLocaleDateString()}</span>
                  </div>
                  <button
                    onClick={() => handleDownloadReport(rep._id, `${rep.title}-${rep._id.substring(18)}`)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-500 hover:text-teal-500 transition-colors"
                    title="Download File"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">No diagnostic reports uploaded</div>
            )}
          </div>
        </GlassCard>

      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-md">
            <GlassCard className="space-y-4">
              <h3 className="text-base font-bold text-slate-800 dark:text-white">Upload Medical Report</h3>
              <form onSubmit={handleUploadReport} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Report Title *</label>
                  <input
                    type="text"
                    required
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800 focus:outline-none"
                    placeholder="e.g. Lipid Profile Scan"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Report Category</label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800 focus:outline-none text-slate-700 dark:text-slate-300"
                  >
                    <option value="Lab Report">Lab Report</option>
                    <option value="X-Ray / Scan">X-Ray / Scan</option>
                    <option value="Discharge Summary">Discharge Summary</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Attachment File (PDF, Image) *</label>
                  <input
                    type="file"
                    required
                    onChange={(e) => setReportFile(e.target.files[0])}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary-500/10 file:text-primary-500 hover:file:bg-primary-500/20"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-200/50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-4 py-2 rounded-xl bg-primary-500 text-white font-bold"
                  >
                    {uploading ? 'Uploading...' : 'Upload File'}
                  </button>
                </div>
              </form>
            </GlassCard>
          </div>
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

export default PatientHistory;
