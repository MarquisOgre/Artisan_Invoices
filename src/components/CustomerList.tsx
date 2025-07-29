import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  MapPin,
  Building,
  Hash
} from "lucide-react";

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  company?: string;
  gst_number?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  totalQuotations?: number;
  totalInvoices?: number;
  totalAmount?: number;
  created_at?: string;
}

interface CustomerListProps {
  customers: Customer[];
  onCreateNew: () => void;
  onViewCustomer: (id: string) => void;
  onEditCustomer: (customer: Customer) => void;
  onDelete: (customerId: string) => void;
}

const CustomerList = ({ customers, onCreateNew, onViewCustomer, onEditCustomer, onDelete }: CustomerListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);

  const displayCustomers = customers.map(c => ({
    ...c,
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

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowViewDialog(true);
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
          <CardTitle>All Customers ({customers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Company/GST</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                      No customers found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-muted-foreground">{customer.id.slice(0, 8)}...</div>
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
                      <TableCell>
                        <div className="space-y-1">
                          {customer.company && (
                            <div className="flex items-center text-sm">
                              <Building className="mr-1 h-3 w-3" />
                              {customer.company}
                            </div>
                          )}
                          {customer.gst_number && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Hash className="mr-1 h-3 w-3" />
                              {customer.gst_number}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {customer.city && (
                            <div className="flex items-center text-sm">
                              <MapPin className="mr-1 h-3 w-3" />
                              {customer.city}
                            </div>
                          )}
                          {customer.state && (
                            <div className="text-sm text-muted-foreground">
                              {customer.state}, {customer.country}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(customer.type)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => handleViewCustomer(customer)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEditCustomer(customer)}>
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

      {/* Customer View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground">BASIC INFORMATION</h3>
                  <div className="mt-2 space-y-2">
                    <div>
                      <span className="font-medium">Name:</span> {selectedCustomer.name}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span> {selectedCustomer.email || "N/A"}
                    </div>
                    <div>
                      <span className="font-medium">Phone:</span> {selectedCustomer.phone || "N/A"}
                    </div>
                    <div>
                      <span className="font-medium">Company:</span> {selectedCustomer.company || "N/A"}
                    </div>
                    <div>
                      <span className="font-medium">GST Number:</span> {selectedCustomer.gst_number || "N/A"}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground">ADDRESS INFORMATION</h3>
                  <div className="mt-2 space-y-2">
                    <div>
                      <span className="font-medium">Address:</span> {selectedCustomer.address || "N/A"}
                    </div>
                    <div>
                      <span className="font-medium">City:</span> {selectedCustomer.city || "N/A"}
                    </div>
                    <div>
                      <span className="font-medium">State:</span> {selectedCustomer.state || "N/A"}
                    </div>
                    <div>
                      <span className="font-medium">Country:</span> {selectedCustomer.country || "N/A"}
                    </div>
                    <div>
                      <span className="font-medium">Pincode:</span> {selectedCustomer.pincode || "N/A"}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowViewDialog(false)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setShowViewDialog(false);
                  onEditCustomer(selectedCustomer);
                }}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Customer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{filteredCustomers.length}</div>
            <p className="text-xs text-muted-foreground">Total Customers</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerList;
