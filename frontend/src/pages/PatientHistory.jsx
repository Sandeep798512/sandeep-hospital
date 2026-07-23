import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import GlassCard from '../components/GlassCard';
import Loader from '../components/Loader';
import Toast from '../components/Toast';
import { 
  FolderHeart, Receipt, FileText, Download, Upload, 
  Trash2, Plus, Calendar, FileType, CheckCircle 
} from 'lucide-react';

const PatientHistory = () => {
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
      // Find patient profile to link report
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
      setToast({ type: 'error', message: 'Failed to upload report' });
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Medical Records & History</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Access invoices, prescription advice, and upload external reports</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold text-xs shadow-lg transition-all"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Lab Report</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Prescriptions lists */}
        <GlassCard>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 pb-2 border-b border-slate-200/30 dark:border-slate-800/20 flex items-center space-x-2">
            <FolderHeart className="w-4.5 h-4.5 text-indigo-500" />
            <span>Prescriptions</span>
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
                  <button
                    onClick={() => handleDownloadInvoice(bill._id, bill.invoiceNumber)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-500 hover:text-cyan-500 transition-colors"
                    title="Download Invoice PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>
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
              <div className="py-12 text-center text-slate-400 text-xs">No reports uploaded yet</div>
            )}
          </div>
        </GlassCard>

      </div>

      {/* MODAL: UPLOAD REPORT */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <GlassCard className="w-full max-w-md border border-white/20 dark:border-slate-800/20">
            <div className="flex items-center justify-between border-b border-slate-200/30 dark:border-slate-800/20 pb-4 mb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Upload Lab Medical Report</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <form onSubmit={handleUploadReport} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Report Title *</label>
                <input
                  type="text"
                  required
                  value={reportTitle}
                  onChange={e => setReportTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800 focus:outline-none"
                  placeholder="e.g. Chest X-Ray Report"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Report Category *</label>
                <select
                  value={reportType}
                  onChange={e => setReportType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
                >
                  {['X-Ray', 'MRI', 'CT Scan', 'Prescription', 'Lab Report', 'PDF', 'Other'].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Select File (PDF / Images) *</label>
                <input
                  type="file"
                  required
                  onChange={e => setReportFile(e.target.files[0])}
                  className="w-full text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary-500/10 file:text-primary-500 hover:file:bg-primary-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold shadow-lg transition-all"
              >
                {uploading ? 'Uploading File...' : 'Upload Medical File'}
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

export default PatientHistory;
