import jsPDF from "jspdf";

interface QuotationData {
  quotation_number: string;
  date: string;
  valid_until: string;
  status: string;
  amount: number;
  subtotal?: number;
  gst_amount?: number;
  items: Array<{
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
  notes?: string;
  customer?: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    company?: string;
    gst_number?: string;
  };
}

interface CompanySettings {
  name: string;
  email: string;
  phone: string;
  address: string;
  website?: string;
  taxNumber?: string;
  logo?: string;
  bankName?: string;
  accountNumber?: string;
  routingNumber?: string;
  accountHolderName?: string;
  branchAddress?: string;
  swiftCode?: string;
}

export const generateQuotationPDF = (quotation: QuotationData, companySettings: CompanySettings) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  let yPosition = 20;

  // Header with company name
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text(companySettings.name || "Company Name", 20, yPosition);
  
  // QUOTATION title
  doc.setFontSize(16);
  doc.setTextColor(100, 100, 100);
  doc.text("QUOTATION", pageWidth - 60, yPosition);
  yPosition += 15;

  // Company details
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  if (companySettings.address) {
    const addressLines = doc.splitTextToSize(companySettings.address, 80);
    doc.text(addressLines, 20, yPosition);
    yPosition += addressLines.length * 4;
  }
  if (companySettings.email) {
    doc.text(`Email: ${companySettings.email}`, 20, yPosition);
    yPosition += 4;
  }
  if (companySettings.phone) {
    doc.text(`Phone: ${companySettings.phone}`, 20, yPosition);
    yPosition += 4;
  }
  if (companySettings.website) {
    doc.text(`Website: ${companySettings.website}`, 20, yPosition);
    yPosition += 4;
  }
  if (companySettings.taxNumber) {
    doc.text(`GST Number: ${companySettings.taxNumber}`, 20, yPosition);
    yPosition += 4;
  }

  // Quotation details (right side)
  yPosition = 35;
  doc.setFontSize(10);
  doc.text(`Quotation #: ${quotation.quotation_number}`, pageWidth - 80, yPosition);
  yPosition += 5;
  doc.text(`Date: ${quotation.date}`, pageWidth - 80, yPosition);
  yPosition += 5;
  doc.text(`Valid Until: ${quotation.valid_until}`, pageWidth - 80, yPosition);
  yPosition += 5;
  doc.text(`Status: ${quotation.status.toUpperCase()}`, pageWidth - 80, yPosition);

  yPosition += 20;

  // Customer details
  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text("Bill To:", 20, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(quotation.customer?.name || "Unknown Customer", 20, yPosition);
  yPosition += 5;
  
  if (quotation.customer?.company) {
    doc.text(quotation.customer.company, 20, yPosition);
    yPosition += 5;
  }
  
  if (quotation.customer?.address) {
    const customerAddressLines = doc.splitTextToSize(quotation.customer.address, 80);
    doc.text(customerAddressLines, 20, yPosition);
    yPosition += customerAddressLines.length * 4;
  }
  
  if (quotation.customer?.email) {
    doc.text(`Email: ${quotation.customer.email}`, 20, yPosition);
    yPosition += 5;
  }
  
  if (quotation.customer?.phone) {
    doc.text(`Phone: ${quotation.customer.phone}`, 20, yPosition);
    yPosition += 5;
  }
  
  if (quotation.customer?.gst_number) {
    doc.text(`GST Number: ${quotation.customer.gst_number}`, 20, yPosition);
    yPosition += 5;
  }

  yPosition += 15;

  // Items table header
  doc.setFillColor(240, 240, 240);
  doc.rect(20, yPosition, pageWidth - 40, 10, 'F');
  
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  doc.text("Description", 25, yPosition + 7);
  doc.text("Qty", pageWidth - 120, yPosition + 7);
  doc.text("Rate", pageWidth - 90, yPosition + 7);
  doc.text("Amount", pageWidth - 50, yPosition + 7);
  
  yPosition += 15;

  // Items
  quotation.items.forEach((item, index) => {
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    
    // Description with text wrapping
    const descriptionLines = doc.splitTextToSize(item.description, 80);
    doc.text(descriptionLines, 25, yPosition);
    
    // Quantity, Rate, Amount
    doc.text(item.quantity.toString(), pageWidth - 120, yPosition);
    doc.text(`₹${item.rate.toFixed(2)}`, pageWidth - 90, yPosition);
    doc.text(`₹${item.amount.toFixed(2)}`, pageWidth - 50, yPosition);
    
    yPosition += Math.max(descriptionLines.length * 4, 8);
    
    // Add line separator
    if (index < quotation.items.length - 1) {
      doc.setDrawColor(220, 220, 220);
      doc.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 5;
    }
  });

  yPosition += 10;

  // Totals
  const subtotal = quotation.subtotal || quotation.amount;
  const gstAmount = quotation.gst_amount || 0;
  const total = quotation.amount;

  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  
  if (gstAmount > 0) {
    doc.text(`Subtotal: ₹${subtotal.toFixed(2)}`, pageWidth - 80, yPosition);
    yPosition += 6;
    doc.text(`GST: ₹${gstAmount.toFixed(2)}`, pageWidth - 80, yPosition);
    yPosition += 6;
  }
  
  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text(`Total: ₹${total.toFixed(2)}`, pageWidth - 80, yPosition);

  yPosition += 20;

  // Notes
  if (quotation.notes) {
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text("Notes:", 20, yPosition);
    yPosition += 6;
    const notesLines = doc.splitTextToSize(quotation.notes, pageWidth - 40);
    doc.text(notesLines, 20, yPosition);
    yPosition += notesLines.length * 4 + 10;
  }

  // Bank Details
  if (companySettings.bankName || companySettings.accountNumber) {
    yPosition += 10;
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text("Bank Details:", 20, yPosition);
    yPosition += 8;

    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    
    if (companySettings.bankName) {
      doc.text(`Bank Name: ${companySettings.bankName}`, 20, yPosition);
      yPosition += 5;
    }
    
    if (companySettings.accountHolderName) {
      doc.text(`Account Holder: ${companySettings.accountHolderName}`, 20, yPosition);
      yPosition += 5;
    }
    
    if (companySettings.accountNumber) {
      doc.text(`Account Number: ${companySettings.accountNumber}`, 20, yPosition);
      yPosition += 5;
    }
    
    if (companySettings.routingNumber) {
      doc.text(`IFSC Code: ${companySettings.routingNumber}`, 20, yPosition);
      yPosition += 5;
    }
    
    if (companySettings.branchAddress) {
      doc.text(`Branch: ${companySettings.branchAddress}`, 20, yPosition);
      yPosition += 5;
    }
    
    if (companySettings.swiftCode) {
      doc.text(`SWIFT Code: ${companySettings.swiftCode}`, 20, yPosition);
    }
  }

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text("Thank you for your business!", pageWidth / 2, pageHeight - 20, { align: 'center' });

  // Save the PDF
  doc.save(`${quotation.quotation_number}.pdf`);
};