# 🏥 Hospital Management System (HMS) - Customer Setup & Installation Guide

Thank you for purchasing the **Hospital Management System (HMS)**! This guide will walk you through setting up and running the application on your computer in just a few minutes.

---

## 📋 System Requirements (Prerequisites)

Before running the application, ensure your computer has the following software installed:

1. **Node.js** (v18.0.0 or higher)
   - Download: [https://nodejs.org/](https://nodejs.org/)
   - Verify installation: Open Terminal / Command Prompt and type `node -v`

2. **VS Code** (Recommended Code Editor)
   - Download: [https://code.visualstudio.com/](https://code.visualstudio.com/)

3. **MongoDB** (Database Option A or B)
   - **Option A (Local)**: Install [MongoDB Community Server](https://www.mongodb.com/try/download/community) on your PC.
   - **Option B (Cloud - Recommended)**: Create a free database at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).

---

## 🚀 Quick 5-Step Installation Guide

### Step 1: Extract the ZIP File
1. Download the provided ZIP file (`hospital-management-system-clean.zip` or `abc-hospital-management-clean.zip`).
2. Right-click the file and select **Extract All** (or use WinRAR / 7-Zip).
3. Open the extracted project folder.

### Step 2: Open in VS Code
1. Launch **Visual Studio Code**.
2. Click **File** ➔ **Open Folder** and select the extracted project folder.

### Step 3: Install All Project Dependencies
1. Open the built-in Terminal in VS Code (`Ctrl + ~` or top menu: `Terminal` ➔ `New Terminal`).
2. Run the following command:
   ```bash
   npm install
   ```
   *(This will automatically install all required packages for both Frontend and Backend).*

### Step 4: Environment Setup (`.env`)
1. Go to the `backend` folder inside VS Code.
2. Ensure there is a `.env` file (If missing, duplicate `.env.example` and rename it to `.env`).
3. Set your MongoDB connection string in `backend/.env`:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/hospital_management
   JWT_SECRET=your_super_secret_jwt_key
   JWT_REFRESH_SECRET=your_super_secret_refresh_key
   JWT_EXPIRES_IN=7d
   ```
   *(Note: If you use MongoDB Atlas, replace `MONGO_URI` with your MongoDB Atlas connection string).*

### Step 5: (Optional) Seed Sample Database Data
To pre-populate sample doctors, patients, appointments, and bills:
1. In the VS Code terminal, run:
   ```bash
   npm run seed
   ```

### Step 6: Start the Application!
1. In the terminal, run:
   ```bash
   npm run dev
   ```
2. Your terminal will launch both servers concurrently:
   - **Backend API**: `http://localhost:5000`
   - **Frontend App**: `http://localhost:5173`
3. Click or open **`http://localhost:5173`** in your browser to view the live app!

---

## 🔑 Demo Account Credentials

Once the application is running, you can log in with any of these pre-configured test roles:

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@hospital.com` | `Password123` | Full System & Financial Analytics Control |
| **Doctor** | `doctor@hospital.com` | `Password123` | Patient Records, Prescriptions & Schedules |
| **Receptionist** | `receptionist@hospital.com` | `Password123` | Appointments, OPD Queue & Billing |
| **Patient** | `patient@hospital.com` | `Password123` | Personal History, Medical Bills & AI Symptom Checker |

---

## 🛠️ Handy Commands Reference

| Action | Command |
| :--- | :--- |
| **Run Full Application (Frontend + Backend)** | `npm run dev` |
| **Run Backend Server Only** | `npm run dev-backend` |
| **Run Frontend Server Only** | `npm run dev-frontend` |
| **Seed Database Records** | `npm run seed` |
| **Build Production Package** | `npm run build` |

---

## ❓ Frequently Asked Questions (FAQ) & Troubleshooting

### Q1: `npm install` throws an error?
- Make sure Node.js is installed. Run `node -v` in Command Prompt to verify.
- Try running `npm install --legacy-peer-deps`.

### Q2: MongoDB connection error?
- If using Local MongoDB, ensure the MongoDB service is running on your machine (`services.msc`).
- If using MongoDB Atlas Cloud, make sure your IP Address is whitelisted in MongoDB Atlas under Network Access (`0.0.0.0/0` for development).

### Q3: Port 5000 or 5173 is already in use?
- Change `PORT=5000` in `backend/.env` to another port like `PORT=5001`.

---

## 📧 Support
If you have any questions or require custom modifications, feel free to reach out!


