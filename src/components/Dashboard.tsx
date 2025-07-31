import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Receipt, 
  Users, 
  DollarSign,
  TrendingUp,
  Eye,
  Clock,
  CheckCircle
} from "lucide-react";

interface DashboardProps {
  quotations: any[];
  invoices: any[];
  customers: any[];
  onCreateQuotation: () => void;
  onCreateInvoice: () => void;
  onCreateCustomer: () => void;
  onViewQuotations: () => void;
  onViewInvoices: () => void;
}

const Dashboard = ({ quotations, invoices, customers, onCreateQuotation, onCreateInvoice, onCreateCustomer, onViewQuotations, onViewInvoices }: DashboardProps) => {
  const totalRevenue = invoices
    .filter(i => i.status === "paid")
    .reduce((sum, i) => sum + i.amount, 0);

  const stats = [
    {
      title: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString()}`,
      change: "+12.5%",
      icon: DollarSign,
      color: "text-success"
    },
    {
      title: "Active Quotations",
      value: quotations.filter(q => q.status === "sent" || q.status === "save").length.toString(),
      change: "+3",
      icon: FileText,
      color: "text-primary"
    },
    {
      title: "Pending Invoices", 
      value: invoices.filter(i => i.status === "pending" || i.status === "sent" || i.status === "draft" || i.status === "save").length.toString(),
      change: "-2",
      icon: Receipt,
      color: "text-warning"
    },
    {
      title: "Total Customers",
      value: customers.length.toString(),
      change: "+5",
      icon: Users,
      color: "text-muted-foreground"
    }
  ];

  const recentQuotations = quotations.slice(0, 3).map(q => ({
    id: q.quotation_number || q.id,
    customer: q.customer?.name || "Unknown Customer",
    amount: `₹${q.amount.toLocaleString()}`,
    status: q.status,
    date: q.date
  }));

  const recentInvoices = invoices.slice(0, 3).map(i => ({
    id: i.invoice_number || i.id,
    customer: i.customer?.name || "Unknown Customer",
    amount: `₹${i.amount.toLocaleString()}`,
    status: i.status,
    date: i.date
  }));

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      draft: { variant: "secondary", label: "Draft" },
      save: { variant: "secondary", label: "Save" },
      sent: { variant: "outline", label: "Sent" },
      accepted: { variant: "default", label: "Accepted" },
      paid: { variant: "default", label: "Paid", className: "bg-success text-success-foreground" },
      pending: { variant: "secondary", label: "Pending" },
      overdue: { variant: "destructive", label: "Overdue" }
    };
    
    const config = variants[status] || variants.save;
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Quotations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Recent Quotations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentQuotations.map((quotation) => (
                <div key={quotation.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="space-y-1">
                    <p className="font-medium">{quotation.id}</p>
                    <p className="text-sm text-muted-foreground">{quotation.customer}</p>
                    <p className="text-xs text-muted-foreground">{quotation.date}</p>
                  </div>
                  <div className="text-right space-y-2">
                    <p className="font-semibold">{quotation.amount}</p>
                    {getStatusBadge(quotation.status)}
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full" onClick={onViewQuotations}>
                <Eye className="mr-2 h-4 w-4" />
                View All Quotations
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Receipt className="mr-2 h-5 w-5" />
              Recent Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentInvoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="space-y-1">
                    <p className="font-medium">{invoice.id}</p>
                    <p className="text-sm text-muted-foreground">{invoice.customer}</p>
                    <p className="text-xs text-muted-foreground">{invoice.date}</p>
                  </div>
                  <div className="text-right space-y-2">
                    <p className="font-semibold">{invoice.amount}</p>
                    {getStatusBadge(invoice.status)}
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full" onClick={onViewInvoices}>
                <Eye className="mr-2 h-4 w-4" />
                View All Invoices
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-20 flex-col space-y-2" onClick={onCreateQuotation}>
              <FileText className="h-6 w-6" />
              <span>Create Quotation</span>
            </Button>
            <Button className="h-20 flex-col space-y-2" variant="outline" onClick={onCreateInvoice}>
              <Receipt className="h-6 w-6" />
              <span>Create Invoice</span>
            </Button>
            <Button className="h-20 flex-col space-y-2" variant="outline" onClick={onCreateCustomer}>
              <Users className="h-6 w-6" />
              <span>Add Customer</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;