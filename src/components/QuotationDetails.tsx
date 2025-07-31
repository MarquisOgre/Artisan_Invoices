import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface QuotationDetailsProps {
  quotation: any;
  isOpen: boolean;
  onClose: () => void;
}

const QuotationDetails = ({ quotation, isOpen, onClose }: QuotationDetailsProps) => {
  if (!quotation) return null;

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quotation Details - {quotation.quotation_number}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quotation Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Quotation Number:</span>
                  <span>{quotation.quotation_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Date:</span>
                  <span>{quotation.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Valid Until:</span>
                  <span>{quotation.valid_until}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Status:</span>
                  <span>{getStatusBadge(quotation.status)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Name:</span>
                  <span>{quotation.customer?.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Email:</span>
                  <span>{quotation.customer?.email || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Phone:</span>
                  <span>{quotation.customer?.phone || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Company:</span>
                  <span>{quotation.customer?.company || 'N/A'}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quotation.items && quotation.items.length > 0 ? (
                  quotation.items.map((item: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <span className="font-medium text-sm text-muted-foreground">Description</span>
                          <p className="mt-1">{item.description}</p>
                        </div>
                        <div>
                          <span className="font-medium text-sm text-muted-foreground">Quantity</span>
                          <p className="mt-1">{item.quantity}</p>
                        </div>
                        <div>
                          <span className="font-medium text-sm text-muted-foreground">Rate</span>
                          <p className="mt-1">₹{item.rate?.toFixed(2)}</p>
                        </div>
                        <div>
                          <span className="font-medium text-sm text-muted-foreground">Amount</span>
                          <p className="mt-1 font-semibold">₹{item.amount?.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No items found</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Total */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{quotation.subtotal?.toFixed(2) || '0.00'}</span>
                  </div>
                  {quotation.tax_type === 'IGST' ? (
                    <div className="flex justify-between">
                      <span>IGST (5%):</span>
                      <span>₹{quotation.tax_amount?.toFixed(2) || '0.00'}</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span>CGST (2.5%):</span>
                        <span>₹{((quotation.tax_amount || 0) / 2).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SGST (2.5%):</span>
                        <span>₹{((quotation.tax_amount || 0) / 2).toFixed(2)}</span>
                      </div>
                    </>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total Amount:</span>
                    <span>₹{quotation.amount?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {quotation.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{quotation.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuotationDetails;