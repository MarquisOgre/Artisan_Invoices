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
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useToast } from "@/hooks/use-toast";
import { generateQuotationPDF } from "@/utils/pdfGenerator";
import { useSettings } from "@/hooks/useSettings";

const Index = () => {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editingQuotation, setEditingQuotation] = useState(null);
  const [viewingQuotation, setViewingQuotation] = useState(null);
  const { toast } = useToast();
  const { companySettings } = useSettings();
  const {
    customers,
    quotations,
    invoices,
    addCustomer,
    updateCustomer,
    addQuotation,
    addInvoice,
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
      toast({
        title: "Invoice Details", 
        description: `${invoice.invoice_number}: ₹${invoice.amount.toLocaleString()} for ${invoice.customer?.name || 'Unknown Customer'}`
      });
    }
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
    const newQuotation = await addQuotation(quotationData);
    if (newQuotation) {
      toast({
        title: "Quotation created",
        description: `Quotation ${newQuotation.quotation_number} has been created.`
      });
      setCurrentPage("quotations");
    }
  };

  const handleSubmitInvoice = async (invoiceData: any) => {
    const newInvoice = await addInvoice(invoiceData);
    if (newInvoice) {
      toast({
        title: "Invoice created",
        description: `Invoice ${newInvoice.invoice_number} has been created.`
      });
      setCurrentPage("invoices");
    }
  };

  const handleMarkAsPaid = async (invoiceId: string) => {
    const updatedInvoice = await updateInvoiceStatus(invoiceId, "paid");
    if (updatedInvoice) {
      toast({
        title: "Invoice marked as paid",
        description: "The invoice has been marked as paid."
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
          />
        );
      case "invoices":
        return (
          <InvoiceList 
            invoices={invoices}
            onCreateNew={handleCreateInvoice}
            onViewInvoice={handleViewInvoice}
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
              // Handle quotation update logic here
              toast({
                title: "Quotation updated",
                description: "Quotation has been updated successfully."
              });
              setCurrentPage("quotations");
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
    </Layout>
  );
};

export default Index;