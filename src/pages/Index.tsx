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
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const { toast } = useToast();
  const {
    customers,
    quotations,
    invoices,
    addCustomer,
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
    setCurrentPage("customer-form");
  };

  const handleViewQuotation = (id: string) => {
    const quotation = quotations.find(q => q.id === id || q.quotation_number === id);
    if (quotation) {
      toast({
        title: "Quotation Details",
        description: `${quotation.quotation_number}: ₹${quotation.amount.toLocaleString()} for ${quotation.customer?.name || 'Unknown Customer'}`
      });
    }
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
    const newCustomer = await addCustomer(customerData);
    if (newCustomer) {
      toast({
        title: "Customer added",
        description: `${newCustomer.name} has been added to your customer list.`
      });
      setCurrentPage("customers");
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
    
    if (item) {
      toast({
        title: "PDF Downloaded",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} ${type === "quotation" ? (item as any).quotation_number : (item as any).invoice_number} PDF has been downloaded.`
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
            onDelete={deleteCustomer}
          />
        );
      case "customer-form":
        return (
          <CustomerForm 
            onSubmit={handleSubmitCustomer}
            onCancel={() => setCurrentPage("customers")}
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
    </Layout>
  );
};

export default Index;