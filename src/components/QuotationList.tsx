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
  FileText, 
  Trash2,
  Download,
  Send,
  Printer
} from "lucide-react";

interface QuotationListProps {
  quotations: any[];
  onCreateNew: () => void;
  onViewQuotation: (id: string) => void;
  onEditQuotation: (quotation: any) => void;
  onQuotationToInvoice: (quotationId: string) => void;
  onUpdateStatus: (quotationId: string, status: string) => void;
  onDelete: (quotationId: string) => void;
  onDownloadPDF?: (id: string) => void;
  onSendToCustomer?: (id: string) => void;
  onPrintQuotation?: (id: string) => void;
}

const QuotationList = ({ 
  quotations, 
  onCreateNew, 
  onViewQuotation, 
  onEditQuotation,
  onQuotationToInvoice, 
  onUpdateStatus, 
  onDelete,
  onDownloadPDF,
  onSendToCustomer,
  onPrintQuotation 
}: QuotationListProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const displayQuotations = quotations.map(q => ({
    id: q.id,
    quotationNumber: q.quotation_number,
    customer: q.customer?.name || 'Unknown Customer',
    amount: q.amount,
    status: q.status,
    date: q.date,
    validUntil: q.valid_until,
    fullQuotation: q
  }));

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      save: { variant: "secondary", label: "Save" },
      sent: { variant: "outline", label: "Sent" },
      accepted: { variant: "default", label: "Accepted", className: "bg-success text-success-foreground" },
      rejected: { variant: "destructive", label: "Rejected" },
      expired: { variant: "secondary", label: "Expired", className: "bg-muted text-muted-foreground" }
    };
    
    const config = variants[status] || variants.save;
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const filteredQuotations = displayQuotations.filter(quotation =>
    quotation.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quotation.quotationNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header with Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search quotations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={onCreateNew}>
          <FileText className="mr-2 h-4 w-4" />
          New Quotation
        </Button>
      </div>

      {/* Quotations Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Quotations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quotation ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotations.map((quotation) => (
                  <TableRow key={quotation.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{quotation.quotationNumber}</TableCell>
                    <TableCell>{quotation.customer}</TableCell>
                    <TableCell>₹{quotation.amount.toLocaleString()}</TableCell>
                    <TableCell>{getStatusBadge(quotation.status)}</TableCell>
                    <TableCell>{quotation.date}</TableCell>
                    <TableCell>{quotation.validUntil}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => onViewQuotation(quotation.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEditQuotation(quotation.fullQuotation)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDownloadPDF?.(quotation.id)}>
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onPrintQuotation?.(quotation.id)}>
                            <Printer className="mr-2 h-4 w-4" />
                            Print
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onQuotationToInvoice(quotation.id)}>
                            <FileText className="mr-2 h-4 w-4" />
                            Quotation to Invoice
                          </DropdownMenuItem>
                          {quotation.status === "save" && (
                            <DropdownMenuItem onClick={() => onSendToCustomer?.(quotation.id)}>
                              <Send className="mr-2 h-4 w-4" />
                              Send to Customer
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            className="text-destructive" 
                            onClick={() => {
                              console.log("Delete quotation:", quotation.id);
                              onDelete(quotation.id);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{filteredQuotations.length}</div>
            <p className="text-xs text-muted-foreground">Total Quotations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
             <div className="text-2xl font-bold text-success">
               ₹{filteredQuotations
                 .filter(q => q.status === "accepted")
                 .reduce((sum, q) => sum + q.amount, 0)
                 .toLocaleString()}
             </div>
            <p className="text-xs text-muted-foreground">Accepted Value</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">
              {filteredQuotations.filter(q => q.status === "sent").length}
            </div>
            <p className="text-xs text-muted-foreground">Pending Response</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-muted-foreground">
              {filteredQuotations.filter(q => q.status === "save").length}
            </div>
            <p className="text-xs text-muted-foreground">Save</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuotationList;