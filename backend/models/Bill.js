const mongoose = require('mongoose');

const billSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: false,
    },
    consultationCharges: {
      type: Number,
      default: 0,
      min: 0,
    },
    medicineCharges: {
      type: Number,
      default: 0,
      min: 0,
    },
    roomCharges: {
      type: Number,
      default: 0,
      min: 0,
    },
    labCharges: {
      type: Number,
      default: 0,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0, // Discount amount in absolute value
      min: 0,
    },
    gst: {
      type: Number,
      default: 18, // GST percentage, e.g. 18%
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid'],
      default: 'Pending',
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Online', 'Card', 'UPI', 'None'],
      default: 'None',
    },
    transactionId: {
      type: String,
      trim: true,
      default: '',
    },
    invoiceNumber: {
      type: String,
      unique: true,
      required: true,
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

module.exports = mongoose.model('Bill', billSchema);
