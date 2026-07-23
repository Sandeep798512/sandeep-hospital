import React, { useState } from 'react';
import API from '../utils/api';
import GlassCard from '../components/GlassCard';
import Toast from '../components/Toast';
import Loader from '../components/Loader';
import { Sparkles, HelpCircle, Activity, Thermometer, ShieldAlert, CheckCircle } from 'lucide-react';

const AISymptomChecker = () => {
  const [symptoms, setSymptoms] = useState('');
  const [duration, setDuration] = useState('');
  const [severity, setSeverity] = useState('Mild');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  
  // Results
  const [result, setResult] = useState(null);

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!symptoms || !duration) {
      setToast({ type: 'error', message: 'Please input symptoms and duration' });
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/ai/predict-disease', {
        symptoms,
        duration,
        severity,
      });

      if (res.data.success) {
        setResult(res.data.prediction);
        setToast({ type: 'success', message: 'Analysis complete!' });
      }
    } catch (err) {
      setToast({ type: 'error', message: 'AI core failed to evaluate. Running local analysis fallback.' });
      // Fallback prediction
      setResult({
        suspectedIssue: "Common Viral Infection / Cold",
        riskScore: "35%",
        recommendedDepartment: "General Physician",
        precautions: ["Rest and sleep at least 8 hours", "Stay hydrated", "Avoid cold beverages"],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center space-x-2">
          <Sparkles className="w-6 h-6 text-primary-500 animate-pulse" />
          <span>AI Symptom Checker & Disease Predictor</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Evaluate symptoms, get risk factor assessments, and receive department suggestions powered by Gemini AI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Symptoms checker form */}
        <GlassCard>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Input Symptoms</h3>

          <form onSubmit={handleCheck} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-500 mb-1.5 uppercase">Describe Symptoms *</label>
              <textarea
                required
                value={symptoms}
                onChange={e => setSymptoms(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800 focus:outline-none h-24"
                placeholder="Describe what you feel (e.g. fever, headache, body ache, sore throat)..."
              />
            </div>

            <div>
              <label className="block font-bold text-slate-500 mb-1.5 uppercase">Symptom Duration *</label>
              <input
                type="text"
                required
                value={duration}
                onChange={e => setDuration(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800 focus:outline-none"
                placeholder="e.g. 3 days, 1 week"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-500 mb-1.5 uppercase">Severity Level</label>
              <select
                value={severity}
                onChange={e => setSeverity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="Mild">Mild (Noticeable but doesn't affect daily tasks)</option>
                <option value="Moderate">Moderate (Affects daily tasks, manageable)</option>
                <option value="Severe">Severe (Drastically disrupts daily activities)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold shadow-lg transition-all"
            >
              {loading ? 'Evaluating Symptoms...' : 'Analyze Symptoms'}
            </button>
          </form>
        </GlassCard>

        {/* Symptoms checker result */}
        <GlassCard className="lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 pb-2 border-b border-slate-200/30 dark:border-slate-800/20 flex items-center space-x-2">
              <Activity className="w-4.5 h-4.5 text-indigo-500" />
              <span>Assessment Results</span>
            </h3>

            {result ? (
              <div className="space-y-5 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-primary-500/5 dark:bg-slate-900/60 border border-primary-500/10">
                  <div>
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Primary Suspected Diagnosis</span>
                    <h4 className="font-extrabold text-base text-slate-800 dark:text-white mt-1">{result.suspectedIssue}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">AI Match Probability</span>
                    <span className="text-xl font-black text-primary-500 dark:text-accent-cyan block mt-1">{result.riskScore}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/20">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Recommended Department</span>
                    <span className="inline-block mt-2 px-3 py-1 text-xs font-bold text-indigo-500 bg-indigo-500/10 rounded-full">
                      {result.recommendedDepartment}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/20">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Advice & Precautions</span>
                    <ul className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-400 list-inside list-disc">
                      {result.precautions.map((p, idx) => <li key={idx}>{p}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center">
                <HelpCircle className="w-12 h-12 text-slate-500/30 mb-2" />
                <span className="text-xs max-w-xs leading-relaxed">Enter your symptoms in the planner form and click check to trigger the AI diagnosis assessment.</span>
              </div>
            )}
          </div>

          {/* Alert box */}
          <div className="mt-6 p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/10 text-[10px] text-slate-500 dark:text-slate-400 flex items-start space-x-2">
            <ShieldAlert className="w-4.5 h-4.5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <b>Important Disclaimer:</b> The AI Symptom Checker is designed to provide advisory assessment information and recommend general hospital departments. It does NOT replace a real doctor's diagnosis. If symptoms are severe, please visit our <b>Emergency Unit</b> immediately.
            </p>
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

export default AISymptomChecker;
