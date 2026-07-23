const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      enum: [
        'Cardiology',
        'Neurology',
        'Orthopedics',
        'Dentist',
        'ENT',
        'General Physician',
        'Pediatrics',
        'Dermatology',
        'Gynecology',
        'Emergency',
      ],
    },
    experience: {
      type: Number,
      required: [true, 'Years of experience is required'],
      min: [0, 'Experience cannot be negative'],
    },
    fees: {
      type: Number,
      required: [true, 'Consultation fee is required'],
      min: [0, 'Fees cannot be negative'],
    },
    availability: {
      type: [String], // e.g., ["Monday", "Tuesday", "Wednesday"]
      required: true,
    },
    schedule: {
      start: {
        type: String, // e.g., "09:00"
        required: true,
      },
      end: {
        type: String, // e.g., "17:00"
        required: true,
      },
    },
    specialties: {
      type: [String],
      default: [],
    },
    bio: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Doctor', doctorSchema);
