import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Receipt, 
  Trash2,
  Download,
  Send,
  CheckCircle,
  Clock
} from "lucide-react";

interface InvoiceListProps {
  invoices: any[];
  onCreateNew: () => void;
  onViewInvoice: (id: string) => void;
  onEditInvoice: (invoice: any) => void;
  onDelete: (invoiceId: string) => void;
  onMarkAsPaid?: (invoiceId: string) => void;
  onSendReminder?: (invoiceId: string) => void;
  onDownloadPDF?: (id: string) => void;
  onSendToCustomer?: (id: string) => void;
}

const InvoiceList = ({
  invoices,
  onCreateNew,
  onViewInvoice,
  onEditInvoice,
  onDelete,
  onMarkAsPaid,
  onSendReminder,
  onDownloadPDF,
  onSendToCustomer
}: InvoiceListProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const displayInvoices = invoices.map(i => ({
    id: i.id,
    invoiceNumber: i.invoice_number,
    customer: i.customer?.name || "Unknown Customer",
    amount: i.amount,
    status: i.status,
    date: i.date,
    dueDate: i.due_date,
    paidDate: i.paid_date || "-",
    fullInvoice: i
  }));

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      save: { variant: "secondary", label: "Save", icon: Edit },
      sent: { variant: "outline", label: "Sent", icon: Send },
      pending: { variant: "secondary", label: "Pending", icon: Clock },
      paid: { variant: "default", label: "Paid", className: "bg-success text-success-foreground", icon: CheckCircle },
      overdue: { variant: "destructive", label: "Overdue", icon: Clock }
    };

    const config = variants[status] || variants.save;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="mr-1 h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const filteredInvoices = displayInvoices.filter(invoice =>
    invoice.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header with Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={onCreateNew}>
          <Receipt className="mr-2 h-4 w-4" />
          New Invoice
        </Button>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Paid Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-6">
                      No invoices found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{invoice.customer}</TableCell>
                      <TableCell>₹{invoice.amount.toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell>{invoice.date}</TableCell>
                      <TableCell className={invoice.status === "overdue" ? "text-destructive font-medium" : ""}>
                        {invoice.dueDate}
                      </TableCell>
                      <TableCell>{invoice.paidDate}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => onViewInvoice(invoice.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEditInvoice(invoice.fullInvoice)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDownloadPDF?.(invoice.id)}>
                              <Download className="mr-2 h-4 w-4" />
                              Download PDF
                            </DropdownMenuItem>
                            {(invoice.status === "save" || invoice.status === "pending") && (
                              <DropdownMenuItem onClick={() => onSendReminder?.(invoice.id)}>
                                <Send className="mr-2 h-4 w-4" />
                                Send Reminder
                              </DropdownMenuItem>
                            )}
                            {invoice.status !== "paid" && (
                              <DropdownMenuItem onClick={() => onMarkAsPaid?.(invoice.id)}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Mark as Paid
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              className="text-destructive" 
                              onClick={() => {
                                console.log("Delete invoice:", invoice.id);
                                onDelete(invoice.id);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{filteredInvoices.length}</div>
            <p className="text-xs text-muted-foreground">Total Invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-success">
              ₹{filteredInvoices
                .filter(i => i.status === "paid")
                .reduce((sum, i) => sum + i.amount, 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Paid Amount</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">
              ₹{filteredInvoices
                .filter(i => i.status === "pending" || i.status === "sent")
                .reduce((sum, i) => sum + i.amount, 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Pending Amount</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-destructive">
              ₹{filteredInvoices
                .filter(i => i.status === "overdue")
                .reduce((sum, i) => sum + i.amount, 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Overdue Amount</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-muted-foreground">
              {filteredInvoices.filter(i => i.status === "save").length}
            </div>
            <p className="text-xs text-muted-foreground">Saved Drafts</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InvoiceList;