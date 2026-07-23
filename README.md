# Sandeep Hospital Management System (HMS)

An industry-level, production-ready, and recruiter-friendly Hospital Management System built on the MERN (MongoDB, Express, React, Node) stack. Includes JWT authentication, Role-Based Access Control (RBAC), automatic PDF invoices and prescriptions generation, system audit logging, and Google Gemini API-powered AI Health Assistant.

---

## 🚀 Features & Modules

### 1. Security & Compliance (Production Ready)
- **Rate Limiting**: Protects authentication and public API endpoints from DDoS/brute force.
- **Helmet Headers**: Configured to secure HTTP headers.
- **MongoDB Injection Defense**: Sanitizes queries using `express-mongo-sanitize`.
- **RBAC (Role-Based Access Control)**: Enforces access bounds for Admins, Doctors, Receptionists, and Patients.
- **Security Audit Logs**: Track user operations, IP addresses, and timestamps.
- **Secure File Streaming**: Patient reports are served via an Express download stream that checks ownership permissions.

### 2. Google Gemini AI Integration
- **AI Health Assistant Chatbot**: Empathetic, conversational chatbot designed to answer general health queries.
- **AI Symptom Checker**: Evaluates symptoms, calculates a risk score, and recommends specialist departments.
- **Mock Fallback Core**: Runs deterministically if the Gemini API key is missing or invalid.

### 3. Automated Document Generation
- **Invoicing PDF**: Compiles items (Consultation, Medicine, Room, Lab), calculates 18% GST and discounts, and generates downloadable PDFs using PDFKit.
- **Prescription Rx PDF**: Generates print-ready doctor prescriptions with structured tables.

### 4. Role-Specific Portals
- **Admin**: Monitor hospital metrics, view audit logs, register doctors, and broadcast announcements.
- **Doctor**: Manage scheduled visits, write prescriptions, and customize shift times.
- **Receptionist**: Register walk-in patients, schedule appointments, and compile invoices.
- **Patient**: Request consultations, view past prescriptions, download bills, upload reports, and use the AI health assistant.

---

## 🛠 Tech Stack

- **Frontend**: React.js, Tailwind CSS, Axios, React Router, Chart.js.
- **Backend**: Node.js, Express.js, Mongoose, MongoDB.
- **Auth**: JSON Web Tokens (JWT), bcryptjs.
- **Files & PDF**: Multer, PDFKit.
- **Mailing**: Nodemailer.
- **AI Engine**: Google Gemini API (`@google/generative-ai`).

---

## 📦 Getting Started

### Prerequisites
- Node.js installed locally.
- MongoDB service running locally on port `27017` (or MongoDB Atlas string).

### Setup Instructions

1. **Clone & Refactor structure**:
   Ensure your local folders match:
   - `backend/` for server API.
   - `frontend/` for Vite React client.

2. **Configure Environment Variables**:
   Create `backend/.env` file:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/hospital
   JWT_SECRET=super_secret_jwt_key_123_abc_xyz
   JWT_EXPIRES_IN=7d
   
   # SMTP configurations (Default falls back to console logging)
   EMAIL_HOST=smtp.mailtrap.io
   EMAIL_PORT=2525
   EMAIL_USER=dummy_user
   EMAIL_PASS=dummy_pass
   EMAIL_FROM=noreply@sandeephospital.com

   # Gemini API Key (Optional, falls back to mock)
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Install Dependencies & Seed Database**:
   ```bash
   # Build Server
   cd backend
   npm install
   npm run seed # Seeds test users and metrics data
   
   # Build Client
   cd ../frontend
   npm install
   ```

4. **Run the Application**:
   ```bash
   # Start Backend (runs on http://localhost:5000)
   cd backend
   npm run dev
   
   # Start Frontend (runs on http://localhost:5173)
   cd frontend
   npm run dev
   ```

---

## 🔑 Recruiter Quick Test Credentials

- **Admin Account**: `admin@hospital.com` | `Password123`
- **Doctor Account**: `priya.sharma@hospital.com` | `Password123`
- **Receptionist Account**: `receptionist@hospital.com` | `Password123`
- **Patient Account**: `patient@hospital.com` | `Password123`
