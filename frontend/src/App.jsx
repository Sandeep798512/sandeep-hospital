import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import OTPVerify from './pages/OTPVerify';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Dashboards
import AdminDashboard from './pages/AdminDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import ReceptionistDashboard from './pages/ReceptionistDashboard';
import PatientDashboard from './pages/PatientDashboard';

// Patient specific pages
import BookAppointment from './pages/BookAppointment';
import PatientHistory from './pages/PatientHistory';
import AISymptomChecker from './pages/AISymptomChecker';
import AIChatbot from './pages/AIChatbot';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing & Auth Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<OTPVerify />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Private Dashboard Shell Routes */}
        <Route element={<DashboardLayout />}>
          {/* Settings */}
          <Route path="/profile" element={<Profile />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/doctors" element={<AdminDashboard />} />
          <Route path="/admin/patients" element={<AdminDashboard />} />
          <Route path="/admin/appointments" element={<AdminDashboard />} />
          <Route path="/admin/billing" element={<AdminDashboard />} />
          <Route path="/admin/announcements" element={<AdminDashboard />} />
          <Route path="/admin/audit-logs" element={<AdminDashboard />} />

          {/* Doctor Routes */}
          <Route path="/doctor" element={<DoctorDashboard />} />
          <Route path="/doctor/appointments" element={<DoctorDashboard />} />
          <Route path="/doctor/prescriptions" element={<DoctorDashboard />} />
          <Route path="/doctor/patients" element={<DoctorDashboard />} />

          {/* Receptionist Routes */}
          <Route path="/receptionist" element={<ReceptionistDashboard />} />
          <Route path="/receptionist/patients" element={<ReceptionistDashboard />} />
          <Route path="/receptionist/appointments" element={<ReceptionistDashboard />} />
          <Route path="/receptionist/billing" element={<ReceptionistDashboard />} />

          {/* Patient Routes */}
          <Route path="/patient" element={<PatientDashboard />} />
          <Route path="/patient/book" element={<BookAppointment />} />
          <Route path="/patient/history" element={<PatientHistory />} />
          <Route path="/patient/ai-symptoms" element={<AISymptomChecker />} />
          <Route path="/patient/ai-chatbot" element={<AIChatbot />} />
        </Route>

        {/* Fallback to 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
