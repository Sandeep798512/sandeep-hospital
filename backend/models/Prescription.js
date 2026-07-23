const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: false,
    },
    medicines: [
      {
        name: {
          type: String,
          required: [true, 'Medicine name is required'],
        },
        dosage: {
          type: String, // e.g. "1-0-1" or "5ml"
          required: [true, 'Dosage is required'],
        },
        duration: {
          type: String, // e.g. "5 days" or "1 week"
          required: [true, 'Duration is required'],
        },
        instructions: {
          type: String, // e.g. "Before food" or "After food"
          default: '',
        },
      },
    ],
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Prescription', prescriptionSchema);
