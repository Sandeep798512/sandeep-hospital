# Sandeep Super Specialty Hospital Management System (HMS)

An industry-level, production-ready, and recruiter-friendly Hospital Management System built on the MERN (MongoDB Atlas, Express, React, Node) stack. Features JWT authentication, Role-Based Access Control (RBAC), Razorpay Test Payment Gateway, instant OTP Email verification, official PDF invoices and prescriptions generation, system audit logging, and Google Gemini 1.5 Flash AI Health Assistant.

---

## 🚀 Key Features & Modules

### 1. Security & Compliance (Production Ready)
- **Rate Limiting**: Protects authentication and public API endpoints from DDoS/brute force.
- **Helmet Headers**: Configured to secure HTTP headers.
- **MongoDB Injection Defense**: Sanitizes queries using `express-mongo-sanitize`.
- **RBAC (Role-Based Access Control)**: Enforces access bounds for Admins, Doctors, Receptionists, and Patients.
- **Security Audit Logs**: Track user operations, IP addresses, and timestamps.
- **Secure File Streaming**: Patient reports are served via an Express download stream that checks ownership permissions.

### 2. Razorpay Online Payment Gateway (Test Mode)
- Integrated Razorpay Checkout SDK for instant online payment of pending patient hospital bills.
- Automatic backend order creation, test signature validation, and real-time status updates to `Paid`.

### 3. Google Gemini 1.5 Flash AI Integration
- **AI Health Assistant Chatbot**: Empathetic, conversational chatbot designed to answer general health queries.
- **AI Symptom Checker**: Evaluates symptoms, calculates a risk score, and recommends specialist departments.
- **Candidate Fallback Core**: Seamless fallback pipeline ensuring high availability.

### 4. Automated Document Generation
- **Invoicing PDF**: Compiles items (Consultation, Medicine, Room, Lab), calculates 18% GST and discounts, and generates downloadable PDFs using PDFKit with Sandeep Hospital letterhead.
- **Prescription Rx PDF**: Generates print-ready doctor prescriptions with structured tables and digital seal placeholders.

### 5. Role-Specific Portals
- **Admin**: Monitor hospital metrics, view audit logs, register doctors, and broadcast announcements.
- **Doctor**: Manage scheduled visits, write prescriptions, and customize shift times. Founder: Dr. Sandeep Gaud.
- **Receptionist**: Register walk-in patients, schedule appointments, and compile invoices.
- **Patient**: Request consultations, view past prescriptions, pay bills via Razorpay, download PDFs, upload reports, and use the AI health assistant.

---

## 🛠 Tech Stack

- **Frontend**: React.js, Tailwind CSS v4, Axios, React Router, Chart.js, Lucide Icons.
- **Backend**: Node.js, Express.js, Mongoose, MongoDB Atlas Cloud.
- **Auth**: JSON Web Tokens (JWT), bcryptjs, Gmail App Password Nodemailer OTP.
- **Payments**: Razorpay API.
- **Files & PDF**: Multer, PDFKit.
- **AI Engine**: Google Gemini API (`@google/generative-ai`).

---

## 📦 Getting Started & Local Setup

### Setup Instructions

1. **Clone & Install Dependencies**:
   ```bash
   # Backend
   cd backend
   npm install
   
   # Seed Database with Founder Dr. Sandeep Gaud & Demo Records
   npm run seed

   # Frontend
   cd ../frontend
   npm install
   ```

2. **Configure Environment Variables** (`backend/.env`):
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=super_secret_jwt_key_123_abc_xyz
   JWT_EXPIRES_IN=7d
   
   # SMTP Email Configuration
   EMAIL_USER=sandeepgaud8081@gmail.com
   EMAIL_PASS=your_gmail_app_password
   
   # Gemini API Key
   GEMINI_API_KEY=your_gemini_api_key_here

   # Razorpay Credentials
   RAZORPAY_KEY_ID=rzp_test_sandeep_hospital_key_123
   RAZORPAY_KEY_SECRET=rzp_test_secret_123
   ```

3. **Run Locally**:
   ```bash
   # Backend (http://localhost:5000)
   cd backend
   npm run dev

   # Frontend (http://localhost:5173)
   cd frontend
   npm run dev
   ```

---

## ☁️ Live Cloud Deployment Guide

### Deploying Backend to Render
1. Push project repository to GitHub (`https://github.com/Sandeep798512/sandeep-hospital.git`).
2. Go to [Render Dashboard](https://dashboard.render.com/) -> **New Web Service**.
3. Select your GitHub repository `sandeep-hospital`.
4. Set **Root Directory**: `backend`.
5. Set **Build Command**: `npm install`.
6. Set **Start Command**: `npm start`.
7. Under **Environment Variables**, add:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `EMAIL_USER`
   - `EMAIL_PASS`
   - `GEMINI_API_KEY`
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`

### Deploying Frontend to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/) -> **Add New Project**.
2. Select your GitHub repository `sandeep-hospital`.
3. Set **Framework Preset**: `Vite`.
4. Set **Root Directory**: `frontend`.
5. Under **Environment Variables**, add:
   - `VITE_API_BASE_URL` = `https://your-render-backend-url.onrender.com/api`
6. Click **Deploy**.

---

## 🔑 Recruiter Quick Test Credentials

- **Admin Account**: `admin@hospital.com` | `Password123`
- **Founder Doctor Account**: `sandeepgaud8081@gmail.com` | `Password123`
- **Receptionist Account**: `receptionist@hospital.com` | `Password123`
- **Patient Account**: `patient@hospital.com` | `Password123`
