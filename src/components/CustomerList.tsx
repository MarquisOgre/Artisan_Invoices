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
  Users, 
  Trash2,
  Mail,
  Phone,
  FileText,
  Receipt,
} from "lucide-react";

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  company?: string;
  totalQuotations?: number;
  totalInvoices?: number;
  totalAmount?: number;
  created_at?: string;
}

interface CustomerListProps {
  customers: Customer[];
  onCreateNew: () => void;
  onViewCustomer: (id: string) => void;
  onDelete: (customerId: string) => void;
}

const CustomerList = ({ customers, onCreateNew, onViewCustomer, onDelete }: CustomerListProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const displayCustomers = customers.map(c => ({
    id: c.id,
    name: c.name,
    email: c.email || "No email",
    phone: c.phone || "No phone",
    address: c.address || "No address",
    type: c.company ? "Business" : "Individual",
    totalQuotations: c.totalQuotations || 0,
    totalInvoices: c.totalInvoices || 0,
    totalAmount: c.totalAmount || 0,
    lastActivity: c.created_at?.split('T')[0] || "N/A"
  }));

  const getTypeBadge = (type: string) => {
    const variants: Record<string, any> = {
      Business: { variant: "default", label: "Business" },
      Enterprise: { variant: "default", label: "Enterprise", className: "bg-primary text-primary-foreground" },
      Startup: { variant: "secondary", label: "Startup" },
      Individual: { variant: "outline", label: "Individual" }
    };

    const config = variants[type] || variants.Business;
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const filteredCustomers = displayCustomers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header with Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={onCreateNew}>
          <Users className="mr-2 h-4 w-4" />
          New Customer
        </Button>
      </div>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Quotations</TableHead>
                  <TableHead>Invoices</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-6">
                      No customers found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-muted-foreground">{customer.id}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="mr-1 h-3 w-3" />
                            {customer.email}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Phone className="mr-1 h-3 w-3" />
                            {customer.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(customer.type)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <FileText className="mr-1 h-4 w-4 text-muted-foreground" />
                          {customer.totalQuotations}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Receipt className="mr-1 h-4 w-4 text-muted-foreground" />
                          {customer.totalInvoices}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        ₹{customer.totalAmount.toLocaleString()}
                      </TableCell>
                      <TableCell>{customer.lastActivity}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => onViewCustomer(customer.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Customer
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="mr-2 h-4 w-4" />
                              Create Quotation
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Receipt className="mr-2 h-4 w-4" />
                              Create Invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="mr-2 h-4 w-4" />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => onDelete(customer.id)}>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{filteredCustomers.length}</div>
            <p className="text-xs text-muted-foreground">Total Customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">
              {filteredCustomers.filter(c => c.type === "Enterprise").length}
            </div>
            <p className="text-xs text-muted-foreground">Enterprise Clients</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-success">
              ₹{filteredCustomers
                .reduce((sum, c) => sum + c.totalAmount, 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total Value</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-muted-foreground">
              {filteredCustomers.length > 0
                ? (filteredCustomers.reduce((sum, c) => sum + c.totalAmount, 0) / filteredCustomers.length).toFixed(0)
                : "0"}
            </div>
            <p className="text-xs text-muted-foreground">Avg. Customer Value</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerList;
