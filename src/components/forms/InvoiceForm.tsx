import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";

interface InvoiceFormProps {
  customers: any[];
  onSubmit: (invoiceData: any) => Promise<void>;
  onCancel: () => void;
  initialData?: any;
  mode?: 'create' | 'edit';
}

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

const InvoiceForm = ({ customers, onSubmit, onCancel, initialData, mode = 'create' }: InvoiceFormProps) => {
  const [formData, setFormData] = useState({
    customerId: "",
    date: new Date().toISOString().split('T')[0],
    dueDate: "",
    notes: "",
    taxType: "IGST",
    status: "save"
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    { description: "", quantity: 1, rate: 0, amount: 0 }
  ]);

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (initialData && mode === 'edit') {
      setFormData({
        customerId: initialData.customer_id || "",
        date: initialData.date || new Date().toISOString().split('T')[0],
        dueDate: initialData.due_date || "",
        notes: initialData.notes || "",
        taxType: initialData.tax_type || "IGST",
        status: initialData.status || "save"
      });
      setItems(initialData.items || []);
    }
  }, [initialData, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerId) {
      toast({
        title: "Validation Error",
        description: "Please select a customer.",
        variant: "destructive"
      });
      return;
    }

    const validItems = items.filter(item => item.description.trim() && item.quantity > 0 && item.rate > 0);
    
    if (validItems.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one valid item.",
        variant: "destructive"
      });
      return;
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const taxRate = formData.taxType === 'IGST' ? 0.05 : 0.05; // Both options are 5% total
    const taxAmount = subtotal * taxRate;
    const grandTotal = subtotal + taxAmount;

    const invoiceData = {
      customer_id: formData.customerId,
      date: formData.date,
      due_date: formData.dueDate,
      notes: formData.notes,
      tax_type: formData.taxType,
      items: items,
      amount: grandTotal,
      subtotal: subtotal,
      tax_amount: taxAmount,
      status: formData.status
    };

    setLoading(true);
    try {
      await onSubmit(invoiceData);
      onCancel();
    } catch (error) {
      console.error("Error creating invoice:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'rate') {
      newItems[index].amount = newItems[index].quantity * newItems[index].rate;
    }
    
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, rate: 0, amount: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  // Calculate totals for display
  const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
  const taxRate = formData.taxType === 'IGST' ? 0.05 : 0.05;
  const taxAmount = subtotal * taxRate;
  const grandTotal = subtotal + taxAmount;

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === 'edit' ? 'Edit Invoice' : 'Create New Invoice'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customer">Customer *</Label>
              <Select value={formData.customerId} onValueChange={(value) => handleChange("customerId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Tax Type</Label>
              <div className="mt-2 flex gap-6">
                <Label className="flex items-center">
                  <input
                    type="radio"
                    name="taxType"
                    value="IGST"
                    checked={formData.taxType === 'IGST'}
                    onChange={(e) => handleChange('taxType', e.target.value)}
                    className="mr-2"
                  />
                  IGST 5%
                </Label>
                <Label className="flex items-center">
                  <input
                    type="radio"
                    name="taxType"
                    value="CGST_SGST"
                    checked={formData.taxType === 'CGST_SGST'}
                    onChange={(e) => handleChange('taxType', e.target.value)}
                    className="mr-2"
                  />
                  CGST 2.5% & SGST 2.5%
                </Label>
              </div>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date">Invoice Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleChange("dueDate", e.target.value)}
              />
            </div>
          </div>

          {/* Items Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <Label className="text-lg font-semibold">Items</Label>
              <Button type="button" onClick={addItem} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    <Label htmlFor={`description-${index}`}>Description</Label>
                    <Input
                      id={`description-${index}`}
                      value={item.description}
                      onChange={(e) => handleItemChange(index, "description", e.target.value)}
                      placeholder="Item description"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor={`quantity-${index}`}>Qty</Label>
                    <Input
                      id={`quantity-${index}`}
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor={`rate-${index}`}>Rate</Label>
                    <Input
                      id={`rate-${index}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.rate}
                      onChange={(e) => handleItemChange(index, "rate", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Amount</Label>
                    <Input value={`₹${item.amount.toFixed(2)}`} disabled />
                  </div>
                  <div className="col-span-1">
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="flex justify-end mt-6">
              <div className="w-64 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                {formData.taxType === 'IGST' ? (
                  <div className="flex justify-between">
                    <span>IGST (5%):</span>
                    <span>₹{taxAmount.toFixed(2)}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span>CGST (2.5%):</span>
                      <span>₹{(taxAmount / 2).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SGST (2.5%):</span>
                      <span>₹{(taxAmount / 2).toFixed(2)}</span>
                    </div>
                  </>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Grand Total:</span>
                  <span>₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Additional notes"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (mode === 'edit' ? "Updating..." : "Creating...") : (mode === 'edit' ? "Update Invoice" : "Create Invoice")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default InvoiceForm;