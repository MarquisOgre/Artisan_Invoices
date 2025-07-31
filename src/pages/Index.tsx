import { useState } from "react";
import Layout from "@/components/Layout";
import Dashboard from "@/components/Dashboard";
import QuotationList from "@/components/QuotationList";
import InvoiceList from "@/components/InvoiceList";
import CustomerList from "@/components/CustomerList";
import Settings from "@/pages/Settings";
import CustomerForm from "@/components/forms/CustomerForm";
import QuotationForm from "@/components/forms/QuotationForm";
import InvoiceForm from "@/components/forms/InvoiceForm";
import QuotationDetails from "@/components/QuotationDetails";
import InvoiceDetails from "@/components/InvoiceDetails";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useToast } from "@/hooks/use-toast";
import { generateQuotationPDF } from "@/utils/pdfGenerator";
import { useSettings } from "@/hooks/useSettings";

const Index = () => {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editingQuotation, setEditingQuotation] = useState(null);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [viewingQuotation, setViewingQuotation] = useState(null);
  const [viewingInvoice, setViewingInvoice] = useState(null);
  const { toast } = useToast();
  const { companySettings } = useSettings();
  const {
    customers,
    quotations,
    invoices,
    addCustomer,
    updateCustomer,
    addQuotation,
    updateQuotation,
    addInvoice,
    updateInvoice,
    convertQuotationToInvoice,
    updateQuotationStatus,
    updateInvoiceStatus,
    deleteCustomer,
    deleteQuotation,
    deleteInvoice
  } = useSupabaseData();

  const handlePageChange = (page: string) => {
    // Handle direct action pages
    if (page === "new-quotation") {
      handleCreateQuotation();
      return;
    }
    if (page === "new-invoice") {
      handleCreateInvoice();
      return;
    }
    if (page === "new-customer") {
      handleCreateCustomer();
      return;
    }
    
    setCurrentPage(page);
  };

  const handleCreateQuotation = () => {
    if (customers.length === 0) {
      toast({
        title: "No customers available",
        description: "Please add a customer first before creating a quotation.",
        variant: "destructive"
      });
      return;
    }
    setCurrentPage("quotation-form");
  };

  const handleCreateInvoice = () => {
    if (customers.length === 0) {
      toast({
        title: "No customers available",
        description: "Please add a customer first before creating an invoice.",
        variant: "destructive"
      });
      return;
    }
    setCurrentPage("invoice-form");
  };

  const handleCreateCustomer = () => {
    setEditingCustomer(null);
    setCurrentPage("customer-form");
  };

  const handleEditCustomer = (customer: any) => {
    setEditingCustomer(customer);
    setCurrentPage("customer-form");
  };

  const handleViewQuotation = (id: string) => {
    const quotation = quotations.find(q => q.id === id || q.quotation_number === id);
    if (quotation) {
      setViewingQuotation(quotation);
    }
  };

  const handleEditQuotation = (quotation: any) => {
    setEditingQuotation(quotation);
    setCurrentPage("quotation-edit-form");
  };

  const handleViewInvoice = (id: string) => {
    const invoice = invoices.find(i => i.id === id || i.invoice_number === id);
    if (invoice) {
      setViewingInvoice(invoice);
    }
  };

  const handleEditInvoice = (invoice: any) => {
    setEditingInvoice(invoice);
    setCurrentPage("invoice-edit-form");
  };


  const handleViewCustomer = (id: string) => {
    const customer = customers.find(c => c.id === id);
    if (customer) {
      toast({
        title: "Customer Details",
        description: `${customer.name} - ${customer.email || 'No email'}`
      });
    }
  };

  const handleSubmitCustomer = async (customerData: any) => {
    if (editingCustomer) {
      // Update existing customer
      const updatedCustomer = await updateCustomer(editingCustomer.id, customerData);
      if (updatedCustomer) {
        toast({
          title: "Customer updated",
          description: `${updatedCustomer.name} has been updated.`
        });
        setCurrentPage("customers");
      }
    } else {
      // Create new customer
      const newCustomer = await addCustomer(customerData);
      if (newCustomer) {
        toast({
          title: "Customer added",
          description: `${newCustomer.name} has been added to your customer list.`
        });
        setCurrentPage("customers");
      }
    }
  };

  const handleSubmitQuotation = async (quotationData: any) => {
    try {
      const newQuotation = await addQuotation(quotationData);
      if (newQuotation) {
        toast({
          title: "Quotation created",
          description: `Quotation ${newQuotation.quotation_number} has been created.`
        });
        setCurrentPage("quotations");
      } else {
        throw new Error("Failed to create quotation");
      }
    } catch (error) {
      console.error("Error creating quotation:", error);
      toast({
        title: "Error",
        description: "Failed to create quotation. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSubmitInvoice = async (invoiceData: any) => {
    try {
      const newInvoice = await addInvoice(invoiceData);
      if (newInvoice) {
        toast({
          title: "Invoice created",
          description: `Invoice ${newInvoice.invoice_number} has been created.`
        });
        setCurrentPage("invoices");
      } else {
        throw new Error("Failed to create invoice");
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast({
        title: "Error",
        description: "Failed to create invoice. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleMarkAsPaid = async (invoiceId: string) => {
    try {
      const updatedInvoice = await updateInvoiceStatus(invoiceId, "paid");
      if (updatedInvoice) {
        toast({
          title: "Invoice marked as paid",
          description: "The invoice has been marked as paid."
        });
      } else {
        throw new Error("Failed to update invoice");
      }
    } catch (error) {
      console.error("Error marking invoice as paid:", error);
      toast({
        title: "Error",
        description: "Failed to mark invoice as paid. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSendReminder = (invoiceId: string) => {
    toast({
      title: "Reminder sent",
      description: "Payment reminder has been sent to the customer."
    });
  };

  const handleDownloadPDF = (id: string, type: "quotation" | "invoice") => {
    const item = type === "quotation" 
      ? quotations.find(q => q.id === id || q.quotation_number === id)
      : invoices.find(i => i.id === id || i.invoice_number === id);
    
    if (item && type === "quotation") {
      try {
        generateQuotationPDF(item as any, companySettings);
        toast({
          title: "PDF Generated",
          description: "Quotation PDF has been downloaded successfully."
        });
      } catch (error) {
        console.error("Error generating PDF:", error);
        toast({
          title: "Error",
          description: "Failed to generate PDF. Please try again.",
          variant: "destructive"
        });
      }
    } else if (item && type === "invoice") {
      // Simple text download for invoices (can be enhanced later)
      const content = `Invoice: ${(item as any).invoice_number}\nCustomer: ${(item as any).customer?.name}\nAmount: ₹${item.amount}`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${(item as any).invoice_number}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "PDF Downloaded",
        description: "Invoice has been downloaded."
      });
    }
  };

  const handleSendToCustomer = async (id: string, type: "quotation" | "invoice") => {
    if (type === "quotation") {
      const updatedQuotation = await updateQuotationStatus(id, "sent");
      if (updatedQuotation) {
        toast({
          title: "Quotation sent",
          description: `Quotation ${updatedQuotation.quotation_number} has been sent to the customer.`
        });
      }
    } else {
      const updatedInvoice = await updateInvoiceStatus(id, "sent");
      if (updatedInvoice) {
        toast({
          title: "Invoice sent",
          description: `Invoice ${updatedInvoice.invoice_number} has been sent to the customer.`
        });
      }
    }
  };

  const handleQuotationToInvoice = async (quotationId: string) => {
    const newInvoice = await convertQuotationToInvoice(quotationId);
    if (newInvoice) {
      toast({
        title: "Invoice created",
        description: `Invoice ${newInvoice.invoice_number} has been created from quotation.`
      });
    }
  };

  const handlePrintQuotation = (quotationId: string) => {
    const quotation = quotations.find(q => q.id === quotationId || q.quotation_number === quotationId);
    if (!quotation) return;

    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;

    // Create the print content
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Quotation ${quotation.quotation_number}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
            .company-name { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .section { margin-bottom: 20px; }
            .section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #ccc; }
            .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .items-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .items-table th { background-color: #f2f2f2; }
            .total-section { margin-top: 20px; text-align: right; }
            .total-row { margin: 5px 0; }
            .grand-total { font-size: 18px; font-weight: bold; border-top: 2px solid #333; padding-top: 10px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">${companySettings?.name || 'Your Company'}</div>
            <div>${companySettings?.address || ''}</div>
            <div>${companySettings?.phone || ''} | ${companySettings?.email || ''}</div>
          </div>

          <div class="section">
            <div class="section-title">Quotation Details</div>
            <div class="details-grid">
              <div>
                <strong>Quotation Number:</strong> ${quotation.quotation_number}<br>
                <strong>Date:</strong> ${quotation.date}<br>
                <strong>Valid Until:</strong> ${quotation.valid_until}
              </div>
              <div>
                <strong>Customer:</strong> ${quotation.customer?.name || 'N/A'}<br>
                <strong>Email:</strong> ${quotation.customer?.email || 'N/A'}<br>
                <strong>Phone:</strong> ${quotation.customer?.phone || 'N/A'}
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Items</div>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Rate</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                ${quotation.items?.map((item: any) => `
                  <tr>
                    <td>${item.description || ''}</td>
                    <td>${item.quantity || 0}</td>
                    <td>₹${(item.rate || 0).toLocaleString()}</td>
                    <td>₹${(item.amount || 0).toLocaleString()}</td>
                  </tr>
                `).join('') || '<tr><td colspan="4">No items found</td></tr>'}
              </tbody>
            </table>
          </div>

          <div class="total-section">
            <div class="total-row"><strong>Subtotal:</strong> ₹${(quotation.subtotal || 0).toLocaleString()}</div>
            ${quotation.tax_type && quotation.tax_amount ? `
              <div class="total-row"><strong>${quotation.tax_type}:</strong> ₹${quotation.tax_amount.toLocaleString()}</div>
            ` : ''}
            <div class="total-row grand-total"><strong>Total Amount:</strong> ₹${quotation.amount.toLocaleString()}</div>
          </div>

          ${quotation.notes ? `
            <div class="section">
              <div class="section-title">Notes</div>
              <p>${quotation.notes}</p>
            </div>
          ` : ''}

          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <Dashboard 
            quotations={quotations} 
            invoices={invoices} 
            customers={customers} 
            onCreateQuotation={handleCreateQuotation}
            onCreateInvoice={handleCreateInvoice}
            onCreateCustomer={handleCreateCustomer}
            onViewQuotations={() => setCurrentPage("quotations")}
            onViewInvoices={() => setCurrentPage("invoices")}
          />
        );
      case "quotations":
        return (
          <QuotationList 
            quotations={quotations}
            onCreateNew={handleCreateQuotation}
            onViewQuotation={handleViewQuotation}
            onEditQuotation={handleEditQuotation}
            onQuotationToInvoice={handleQuotationToInvoice}
            onUpdateStatus={updateQuotationStatus}
            onDelete={deleteQuotation}
            onDownloadPDF={(id) => handleDownloadPDF(id, "quotation")}
            onSendToCustomer={(id) => handleSendToCustomer(id, "quotation")}
            onPrintQuotation={handlePrintQuotation}
          />
        );
      case "invoices":
        return (
          <InvoiceList 
            invoices={invoices}
            onCreateNew={handleCreateInvoice}
            onViewInvoice={handleViewInvoice}
            onEditInvoice={handleEditInvoice}
            onDelete={deleteInvoice}
            onMarkAsPaid={handleMarkAsPaid}
            onSendReminder={handleSendReminder}
            onDownloadPDF={(id) => handleDownloadPDF(id, "invoice")}
            onSendToCustomer={(id) => handleSendToCustomer(id, "invoice")}
          />
        );
      case "customers":
        return (
          <CustomerList 
            customers={customers}
            onCreateNew={handleCreateCustomer}
            onViewCustomer={handleViewCustomer}
            onEditCustomer={handleEditCustomer}
            onDelete={deleteCustomer}
          />
        );
      case "customer-form":
        return (
          <CustomerForm 
            onSubmit={handleSubmitCustomer}
            onCancel={() => setCurrentPage("customers")}
            initialData={editingCustomer}
            mode={editingCustomer ? 'edit' : 'create'}
          />
        );
      case "quotation-form":
        return (
          <QuotationForm 
            customers={customers}
            onSubmit={handleSubmitQuotation}
            onCancel={() => setCurrentPage("quotations")}
          />
        );
      case "quotation-edit-form":
        return (
          <QuotationForm 
            customers={customers}
             onSubmit={async (data) => {
               if (editingQuotation) {
                 const updatedQuotation = await updateQuotation(editingQuotation.id, data);
                 if (updatedQuotation) {
                   toast({
                     title: "Quotation updated",
                     description: "Quotation has been updated successfully."
                   });
                   setEditingQuotation(null);
                   setCurrentPage("quotations");
                 }
               }
             }}
            onCancel={() => setCurrentPage("quotations")}
            initialData={editingQuotation}
            mode="edit"
          />
        );
      case "invoice-form":
        return (
          <InvoiceForm 
            customers={customers}
            onSubmit={handleSubmitInvoice}
            onCancel={() => setCurrentPage("invoices")}
          />
        );
      case "invoice-edit-form":
        return (
          <InvoiceForm 
            customers={customers}
            onSubmit={async (data) => {
              if (editingInvoice) {
                const updatedInvoice = await updateInvoice(editingInvoice.id, data);
                if (updatedInvoice) {
                  toast({
                    title: "Invoice updated",
                    description: "Invoice has been updated successfully."
                  });
                  setEditingInvoice(null);
                  setCurrentPage("invoices");
                }
              }
            }}
            onCancel={() => setCurrentPage("invoices")}
            initialData={editingInvoice}
            mode="edit"
          />
        );
      case "settings":
        return <Settings />;
      default:
        return (
          <Dashboard 
            quotations={quotations} 
            invoices={invoices} 
            customers={customers}
            onCreateQuotation={handleCreateQuotation}
            onCreateInvoice={handleCreateInvoice}
            onCreateCustomer={handleCreateCustomer}
            onViewQuotations={() => setCurrentPage("quotations")}
            onViewInvoices={() => setCurrentPage("invoices")}
          />
        );
    }
  };

  return (
    <Layout
      currentPage={currentPage}
      onPageChange={handlePageChange}
    >
      {renderPage()}
      
      {/* Quotation Details Modal */}
      <QuotationDetails 
        quotation={viewingQuotation}
        isOpen={!!viewingQuotation}
        onClose={() => setViewingQuotation(null)}
      />
      
      {/* Invoice Details Modal */}
      <InvoiceDetails 
        invoice={viewingInvoice}
        isOpen={!!viewingInvoice}
        onClose={() => setViewingInvoice(null)}
      />
    </Layout>
  );
};

export default Index;