import jsPDF from "jspdf";

interface QuotationData {
  quotation_number: string;
  date: string;
  valid_until: string;
  status: string;
  amount: number;
  subtotal?: number;
  tax_amount?: number;
  tax_type?: string;
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

// Helper to format currency with ₹ and Indian locale spacing
const formatCurrency = (amount?: number) => `₹ ${Number(amount || 0).toLocaleString("en-IN")}`;

export const generateQuotationPDF = (quotation: QuotationData, companySettings: CompanySettings) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  let yPosition = 20;

  // Header section with company name and details (centered)
  doc.setFontSize(24);
  doc.setTextColor(40, 40, 40);
  doc.text(companySettings.name || "Your Company", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 10;

  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  const contactLine = `${companySettings.address || ""} | ${companySettings.phone || ""} | ${companySettings.email || ""}`;
  doc.text(contactLine, pageWidth / 2, yPosition, { align: "center" });
  yPosition += 5;

  doc.setDrawColor(60, 60, 60);
  doc.setLineWidth(2);
  doc.line(20, yPosition, pageWidth - 20, yPosition);
  yPosition += 20;

  // Quotation Details section (centered)
  doc.setFontSize(18);
  doc.setTextColor(40, 40, 40);
  doc.text("Quotation Details", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 15;

  // Two column layout for quotation and customer details
  const leftColX = 20;
  const rightColX = pageWidth / 2 + 10;

  // Left column - Quotation info
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  doc.text(`Quotation Number: ${quotation.quotation_number}`, leftColX, yPosition);
  yPosition += 7;
  doc.text(`Date: ${quotation.date}`, leftColX, yPosition);
  yPosition += 7;
  doc.text(`Valid Until: ${quotation.valid_until}`, leftColX, yPosition);

  // Right column - Customer info
  yPosition -= 14; // Reset to top of section
  doc.text(`Customer: ${quotation.customer?.name || "N/A"}`, rightColX, yPosition);
  yPosition += 7;
  doc.text(`Email: ${quotation.customer?.email || "N/A"}`, rightColX, yPosition);
  yPosition += 7;
  doc.text(`Phone: ${quotation.customer?.phone || "N/A"}`, rightColX, yPosition);

  yPosition += 25;

  // Items section
  doc.setFontSize(18);
  doc.setTextColor(40, 40, 40);
  doc.text("Items", 20, yPosition);
  yPosition += 15;

  // Table header
  doc.setFillColor(242, 242, 242);
  doc.rect(20, yPosition - 5, pageWidth - 40, 12, "F");

  doc.setFontSize(11);
  doc.setTextColor(40, 40, 40);
  doc.text("Description", 25, yPosition);
  doc.text("Quantity", pageWidth - 140, yPosition);
  doc.text("Rate", pageWidth - 90, yPosition);
  doc.text("Amount", pageWidth - 40, yPosition);

  yPosition += 10;

  // Table rows
  doc.setDrawColor(221, 221, 221);
  quotation.items?.forEach((item) => {
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);

    // Row separator
    doc.setLineWidth(1);
    doc.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 8;

    // Item data
    const descriptionLines = doc.splitTextToSize(item.description || "", 100);
    doc.text(descriptionLines, 25, yPosition);
    doc.text(item.quantity.toString(), pageWidth - 140, yPosition);
    doc.text(formatCurrency(item.rate), pageWidth - 90, yPosition);
    doc.text(formatCurrency(item.amount), pageWidth - 40, yPosition);

    yPosition += Math.max(descriptionLines.length * 5, 10);
  });

  if (!quotation.items || quotation.items.length === 0) {
    doc.setLineWidth(1);
    doc.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 8;
    doc.text("No items found", 25, yPosition);
    yPosition += 10;
  }

  // Final table border
  doc.line(20, yPosition, pageWidth - 20, yPosition);
  yPosition += 20;

  // Totals section - right aligned
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);

  const rightMargin = pageWidth - 20;
  const labelX = rightMargin - 80; // label left of value
  const valueX = rightMargin;

  // Subtotal
  doc.text("Subtotal:", labelX, yPosition);
  doc.text(formatCurrency(quotation.subtotal), valueX, yPosition, { align: "right" });

  // Tax
  if (quotation.tax_type && quotation.tax_amount) {
    yPosition += 7;
    doc.text(`${quotation.tax_type}:`, labelX, yPosition);
    doc.text(formatCurrency(quotation.tax_amount), valueX, yPosition, { align: "right" });
  }

  yPosition += 10;

  // Grand total with emphasis
  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.setLineWidth(0.5);
  doc.line(labelX, yPosition - 3, rightMargin, yPosition - 3);

  doc.text("Total Amount:", labelX, yPosition);
  doc.text(formatCurrency(quotation.amount), valueX, yPosition, { align: "right" });

  yPosition += 20;

  // Notes section
  if (quotation.notes) {
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text("Notes", 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    const notesLines = doc.splitTextToSize(quotation.notes, pageWidth - 40);
    doc.text(notesLines, 20, yPosition);
    yPosition += notesLines.length * 5;
  }

  // Bank details (if available)
  if (companySettings.bankName || companySettings.accountNumber) {
    yPosition += 15;
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text("Bank Details", 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
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
  }

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text("Thank you for your business!", pageWidth / 2, pageHeight - 20, { align: "center" });

  // Save the PDF
  doc.save(`${quotation.quotation_number}.pdf`);
};
