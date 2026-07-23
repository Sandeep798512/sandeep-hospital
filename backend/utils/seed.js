const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Bill = require('../models/Bill');
const Announcement = require('../models/Announcement');

dotenv.config();

const seedDB = async () => {
  try {
    // Connect to DB
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hospital');
    console.log(`Connected to database to seed: ${conn.connection.host}`);

    // Clear old data
    await User.deleteMany();
    await Doctor.deleteMany();
    await Patient.deleteMany();
    await Appointment.deleteMany();
    await Bill.deleteMany();
    await Announcement.deleteMany();
    console.log('Cleared existing database records.');

    // 1. Create Admins
    const adminUser = await User.create({
      name: 'Er. Sandeep Gaud (Admin)',
      email: 'admin@hospital.com',
      password: 'Password123',
      role: 'admin',
      isEmailVerified: true,
      profileImage: '/SANDEEP GAUD.JPG',
    });
    console.log('Seeded Admin: admin@hospital.com / Password123');

    // 2. Create Receptionists
    const receptionistUser = await User.create({
      name: 'Riya Sen (Receptionist)',
      email: 'receptionist@hospital.com',
      password: 'Password123',
      role: 'receptionist',
      isEmailVerified: true,
    });
    console.log('Seeded Receptionist: receptionist@hospital.com / Password123');

    // 3. Create Doctors Users & Profiles
    const doctorData = [
      {
        name: 'Dr. Priya Sharma',
        email: 'priya.sharma@hospital.com',
        password: 'Password123',
        department: 'Cardiology',
        experience: 12,
        fees: 800,
        availability: ['Monday', 'Wednesday', 'Friday'],
        schedule: { start: '09:00', end: '15:00' },
        specialties: ['Heart Failures', 'Angioplasty'],
        bio: 'Senior cardiologist with 12+ years of experience in cardiovascular interventions.',
        profileImage: '/priya.jpg',
      },
      {
        name: 'Dr. Rahul Verma',
        email: 'rahul.verma@hospital.com',
        password: 'Password123',
        department: 'Neurology',
        experience: 8,
        fees: 1000,
        availability: ['Tuesday', 'Thursday'],
        schedule: { start: '10:00', end: '16:00' },
        specialties: ['Stroke Management', 'Epilepsy'],
        bio: 'Dedicated neurologist specializing in neuro-developmental disorders and epilepsy care.',
        profileImage: '/rahul v.jpg',
      },
      {
        name: 'Dr. Sandeep Gaud',
        email: 'sandeepgaud8081@gmail.com',
        password: 'Password123',
        department: 'General Physician',
        experience: 16,
        fees: 400,
        availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        schedule: { start: '09:00', end: '17:00' },
        specialties: ['Chronic Illnesses', 'Preventive Care', 'Healthcare IT'],
        bio: 'General family physician & Medical Director with a focus on comprehensive health maintenance and diagnostic services.',
        profileImage: '/sandy.jpg',
      },
    ];

    const seededDoctors = [];
    for (const doc of doctorData) {
      const u = await User.create({
        name: doc.name,
        email: doc.email,
        password: doc.password,
        role: 'doctor',
        isEmailVerified: true,
        profileImage: doc.profileImage,
      });

      const d = await Doctor.create({
        user: u._id,
        department: doc.department,
        experience: doc.experience,
        fees: doc.fees,
        availability: doc.availability,
        schedule: doc.schedule,
        specialties: doc.specialties,
        bio: doc.bio,
      });
      seededDoctors.push(d);
      console.log(`Seeded Doctor: ${doc.email} / Password123`);
    }

    // 4. Create Patient User & Profile
    const patientUser = await User.create({
      name: 'Aditya Roy',
      email: 'patient@hospital.com',
      password: 'Password123',
      role: 'patient',
      isEmailVerified: true,
    });

    const patientProfile = await Patient.create({
      user: patientUser._id,
      name: 'Aditya Roy',
      email: 'patient@hospital.com',
      age: 28,
      gender: 'Male',
      bloodGroup: 'O+',
      address: '42 Baker Street, New Delhi, India',
      emergencyContact: {
        name: 'Suman Roy',
        relation: 'Father',
        phone: '+919988776655',
      },
      medicalHistory: {
        allergies: ['Penicillin'],
        chronicConditions: ['Asthma'],
        pastSurgeries: ['Appendectomy (2021)'],
      },
    });
    console.log('Seeded Patient: patient@hospital.com / Password123');

    // Add another standalone patient
    const patient2 = await Patient.create({
      name: 'Sneha Gupta',
      email: 'sneha.gupta@gmail.com',
      age: 34,
      gender: 'Female',
      bloodGroup: 'AB+',
      address: 'Flat 4B, Emerald Heights, Mumbai',
      emergencyContact: {
        name: 'Karan Gupta',
        relation: 'Spouse',
        phone: '+919876543210',
      },
      medicalHistory: {
        allergies: ['Sulfonamides'],
        chronicConditions: ['None'],
        pastSurgeries: ['None'],
      },
    });
    console.log('Seeded Standalone Patient (No user account): sneha.gupta@gmail.com');

    // 5. Create Announcements
    await Announcement.create([
      {
        title: 'New Neurology Department Added',
        content: 'We are pleased to introduce our state-of-the-art Neurology facility headed by Dr. Rahul Verma. Bookings are now open.',
        targetRoles: [], // all
        createdBy: adminUser._id,
      },
      {
        title: 'System Upgrades Scheduled',
        content: 'Please note that the patient management portal will undergo routine database maintenance on Sunday from 02:00 AM to 04:00 AM.',
        targetRoles: ['admin', 'doctor', 'receptionist'],
        createdBy: adminUser._id,
      },
    ]);
    console.log('Seeded System Announcements');

    // 6. Create Appointments (Past and Future for charts data)
    const today = new Date();
    
    // Past Approved Appointment
    const appointmentPast = await Appointment.create({
      patient: patientProfile._id,
      doctor: seededDoctors[0]._id, // Dr Priya
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 5),
      timeSlot: '10:30',
      status: 'Approved',
      reason: 'Routine checkup for cardiovascular health monitoring.',
      notes: 'Blood pressure levels looking stable. Advised light exercise.',
    });

    // Today's Pending Appointment
    await Appointment.create({
      patient: patient2._id,
      doctor: seededDoctors[2]._id, // Dr Sandeep
      date: today,
      timeSlot: '14:00',
      status: 'Pending',
      reason: 'Persistent mild dry cough and fatigue.',
      notes: '',
    });
    console.log('Seeded Sample Appointments');

    // 7. Seed Bills
    await Bill.create([
      {
        patient: patientProfile._id,
        appointment: appointmentPast._id,
        consultationCharges: 800,
        medicineCharges: 350,
        roomCharges: 0,
        labCharges: 1500,
        discount: 150,
        gst: 18,
        totalAmount: 2950,
        paymentStatus: 'Paid',
        paymentMethod: 'UPI',
        transactionId: 'TXN82649275918',
        invoiceNumber: 'INV-20260705-3920',
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 5),
      },
      {
        patient: patient2._id,
        consultationCharges: 400,
        medicineCharges: 250,
        roomCharges: 0,
        labCharges: 0,
        discount: 0,
        gst: 18,
        totalAmount: 767,
        paymentStatus: 'Pending',
        paymentMethod: 'None',
        invoiceNumber: 'INV-20260710-4829',
        date: today,
      }
    ]);
    console.log('Seeded Sample Bills & Invoices');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Failed:', error.message);
    process.exit(1);
  }
};

seedDB();
