const PDFDocument = require('pdfkit');

/**
 * Generates a clean, professional invoice PDF
 */
const generateInvoicePDF = (bill, patient, stream) => {
  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(stream);

  // Header Banner
  doc.fillColor('#0b2970').rect(0, 0, 612, 100).fill();
  doc.fillColor('#ffffff').fontSize(24).font('Helvetica-Bold').text('SANDEEP HOSPITAL', 50, 30);
  doc.fontSize(10).font('Helvetica').text('Quality Healthcare & Patient Care Services', 50, 60);

  // Invoice Title
  doc.fillColor('#333333').fontSize(20).font('Helvetica-Bold').text('INVOICE', 50, 130);
  
  // Invoice Details
  doc.fontSize(10).font('Helvetica')
    .text(`Invoice Number: ${bill.invoiceNumber}`, 50, 160)
    .text(`Date: ${new Date(bill.date).toLocaleDateString()}`, 50, 175)
    .text(`Payment Status: ${bill.paymentStatus.toUpperCase()}`, 50, 190)
    .text(`Payment Method: ${bill.paymentMethod}`, 50, 205);

  // Patient Details
  doc.fontSize(12).font('Helvetica-Bold').text('Patient Details:', 350, 130);
  doc.fontSize(10).font('Helvetica')
    .text(`Name: ${patient.name}`, 350, 150)
    .text(`Age/Gender: ${patient.age} / ${patient.gender}`, 350, 165)
    .text(`Blood Group: ${patient.bloodGroup}`, 350, 180)
    .text(`Contact: ${patient.emergencyContact?.phone || 'N/A'}`, 350, 195);

  // Horizontal Rule
  doc.moveTo(50, 230).lineTo(562, 230).stroke('#cccccc');

  // Items Table Header
  doc.fontSize(10).font('Helvetica-Bold')
    .text('Description', 50, 250)
    .text('Amount (INR)', 450, 250, { width: 112, align: 'right' });

  doc.moveTo(50, 265).lineTo(562, 265).stroke('#e6e6e6');

  // Table Content
  let y = 280;
  const items = [
    { name: 'Consultation Charges', amount: bill.consultationCharges },
    { name: 'Medicine Charges', amount: bill.medicineCharges },
    { name: 'Room Charges', amount: bill.roomCharges },
    { name: 'Lab Charges', amount: bill.labCharges }
  ];

  items.forEach(item => {
    if (item.amount > 0) {
      doc.fontSize(10).font('Helvetica').text(item.name, 50, y);
      doc.text(item.amount.toFixed(2), 450, y, { width: 112, align: 'right' });
      y += 20;
    }
  });

  doc.moveTo(50, y).lineTo(562, y).stroke('#cccccc');
  y += 15;

  // Subtotal & Calculations
  const subtotal = bill.consultationCharges + bill.medicineCharges + bill.roomCharges + bill.labCharges;
  const gstAmount = (subtotal - bill.discount) * (bill.gst / 100);

  doc.fontSize(10).font('Helvetica')
    .text('Subtotal:', 300, y)
    .text(subtotal.toFixed(2), 450, y, { width: 112, align: 'right' });
  y += 15;

  if (bill.discount > 0) {
    doc.text(`Discount:`, 300, y)
      .text(`-${bill.discount.toFixed(2)}`, 450, y, { width: 112, align: 'right' });
    y += 15;
  }

  doc.text(`GST (${bill.gst}%):`, 300, y)
    .text(gstAmount.toFixed(2), 450, y, { width: 112, align: 'right' });
  y += 20;

  // Grand Total
  doc.fontSize(12).font('Helvetica-Bold')
    .text('Total Amount:', 300, y)
    .text(`INR ${bill.totalAmount.toFixed(2)}`, 450, y, { width: 112, align: 'right' });

  // Footer
  doc.fillColor('#777777').fontSize(9).font('Helvetica')
    .text('Thank you for choosing Sandeep Hospital. Wishing you a speedy recovery!', 50, 700, { align: 'center' });

  doc.end();
};

/**
 * Generates a clean, professional prescription PDF
 */
const generatePrescriptionPDF = (prescription, patient, doctor, stream) => {
  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(stream);

  // Header Banner
  doc.fillColor('#0b2970').rect(0, 0, 612, 100).fill();
  doc.fillColor('#ffffff').fontSize(24).font('Helvetica-Bold').text('SANDEEP HOSPITAL', 50, 30);
  doc.fontSize(10).font('Helvetica').text('Quality Healthcare & Patient Care Services', 50, 60);

  // RX Symbol
  doc.fillColor('#0b2970').fontSize(28).font('Helvetica-Bold').text('Rx', 50, 120);

  // Date
  doc.fillColor('#333333').fontSize(10).font('Helvetica')
    .text(`Date: ${new Date(prescription.date).toLocaleDateString()}`, 450, 120, { align: 'right' });

  // Doctor Details (Left Side)
  doc.fontSize(11).font('Helvetica-Bold').text('Doctor:', 50, 170);
  doc.fontSize(10).font('Helvetica')
    .text(`Dr. ${doctor.user.name}`, 50, 185)
    .text(`Dept: ${doctor.department}`, 50, 200)
    .text(`Reg No: DOC-${doctor._id.toString().substring(18).toUpperCase()}`, 50, 215);

  // Patient Details (Right Side)
  doc.fontSize(11).font('Helvetica-Bold').text('Patient:', 350, 170);
  doc.fontSize(10).font('Helvetica')
    .text(`Name: ${patient.name}`, 350, 185)
    .text(`Age/Gender: ${patient.age} / ${patient.gender}`, 350, 200)
    .text(`Blood Group: ${patient.bloodGroup}`, 350, 215);

  // Divider
  doc.moveTo(50, 240).lineTo(562, 240).stroke('#cccccc');

  // Medicines Table
  doc.fontSize(12).font('Helvetica-Bold').text('Prescribed Medicines', 50, 260);

  doc.fontSize(10).font('Helvetica-Bold')
    .text('Medicine Name', 50, 290)
    .text('Dosage', 220, 290)
    .text('Duration', 330, 290)
    .text('Instructions', 430, 290);

  doc.moveTo(50, 305).lineTo(562, 305).stroke('#cccccc');

  let y = 320;
  prescription.medicines.forEach((med) => {
    doc.fontSize(10).font('Helvetica')
      .text(med.name, 50, y, { width: 160 })
      .text(med.dosage, 220, y, { width: 100 })
      .text(med.duration, 330, y, { width: 90 })
      .text(med.instructions, 430, y, { width: 130 });
    y += 25;
  });

  // Notes
  if (prescription.notes) {
    y += 20;
    doc.moveTo(50, y).lineTo(562, y).stroke('#e6e6e6');
    y += 15;
    doc.fontSize(11).font('Helvetica-Bold').text('Doctor Notes / Advice:', 50, y);
    y += 20;
    doc.fontSize(10).font('Helvetica').text(prescription.notes, 50, y, { width: 512 });
  }

  // Doctor Signature Placeholder
  doc.fontSize(10).font('Helvetica-Bold').text('Signature / Seal', 450, 680, { align: 'center' });
  doc.moveTo(430, 670).lineTo(530, 670).stroke('#cccccc');

  // Footer
  doc.fillColor('#777777').fontSize(9).font('Helvetica')
    .text('Sandeep Hospital • Contact: +91 9876543210 • Email: contact@sandeephospital.com', 50, 720, { align: 'center' });

  doc.end();
};

module.exports = {
  generateInvoicePDF,
  generatePrescriptionPDF
};
