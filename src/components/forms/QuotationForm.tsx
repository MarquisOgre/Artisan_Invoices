import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";

interface QuotationFormProps {
  customers: any[];
  onSubmit: (quotationData: any) => Promise<void>;
  onCancel: () => void;
}

interface QuotationItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

const QuotationForm = ({ customers, onSubmit, onCancel }: QuotationFormProps) => {
  const [formData, setFormData] = useState({
    customer_id: "",
    date: new Date().toISOString().split('T')[0],
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: "",
    status: "save"
  });

  const [items, setItems] = useState<QuotationItem[]>([
    { description: "", quantity: 1, rate: 0, amount: 0 }
  ]);

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customer_id) {
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

    const totalAmount = validItems.reduce((sum, item) => sum + item.amount, 0);

    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        items: validItems,
        amount: totalAmount
      });
      onCancel();
    } catch (error) {
      console.error("Error creating quotation:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index: number, field: keyof QuotationItem, value: string | number) => {
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

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Quotation</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customer">Customer *</Label>
              <Select value={formData.customer_id} onValueChange={(value) => handleChange("customer_id", value)}>
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
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="save">Save</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="valid_until">Valid Until</Label>
              <Input
                id="valid_until"
                type="date"
                value={formData.valid_until}
                onChange={(e) => handleChange("valid_until", e.target.value)}
              />
            </div>
          </div>

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

            <div className="text-right mt-4">
              <p className="text-lg font-semibold">Total: ₹{totalAmount.toFixed(2)}</p>
            </div>
          </div>

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
              {loading ? "Creating..." : "Create Quotation"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default QuotationForm;