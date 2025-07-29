import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface CompanySettings {
  name: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  taxNumber: string;
  logo: string;
  bankName?: string;
  accountNumber?: string;
  routingNumber?: string;
  accountHolderName?: string;
  branchAddress?: string;
  swiftCode?: string;
}

export interface InvoiceSettings {
  prefix: string;
  quotationPrefix: string;
  defaultTerms: string;
  defaultNotes: string;
  currency: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  paymentReminders: boolean;
  reminderDays: number;
}

export const useSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    name: "Your Company Name",
    email: "info@yourcompany.com",
    phone: "+91 98765 43210",
    address: "123 Business Street, City, State 12345",
    website: "www.yourcompany.com",
    taxNumber: "GSTIN123456789",
    logo: "",
    bankName: "",
    accountNumber: "",
    routingNumber: "",
    accountHolderName: "",
    branchAddress: "",
    swiftCode: ""
  });

  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings>({
    prefix: "INV",
    quotationPrefix: "QUO",
    defaultTerms: "Payment is due within 30 days of invoice date.",
    defaultNotes: "Thank you for your business!",
    currency: "INR"
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: false,
    paymentReminders: false,
    reminderDays: 3
  });

  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    if (!user) return;

    try {
      const { data: settings } = await supabase
        .from("settings")
        .select("*")
        .eq("user_id", user.id);

      if (settings) {
        settings.forEach((setting) => {
          switch (setting.setting_type) {
            case "company":
              setCompanySettings(setting.setting_data as unknown as CompanySettings);
              break;
            case "invoice":
              setInvoiceSettings(setting.setting_data as unknown as InvoiceSettings);
              break;
            case "notifications":
              setNotificationSettings(setting.setting_data as unknown as NotificationSettings);
              break;
          }
        });
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, [user]);

  const saveSettings = async (settingType: string, settingData: any) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("settings")
        .upsert({
          user_id: user.id,
          setting_type: settingType,
          setting_data: settingData
        }, {
          onConflict: "user_id,setting_type"
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Settings Saved",
        description: "Your settings have been updated successfully."
      });
      return true;
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  const saveCompanySettings = async (settings: CompanySettings) => {
    const success = await saveSettings("company", settings);
    if (success) {
      setCompanySettings(settings);
    }
    return success;
  };

  const saveInvoiceSettings = async (settings: InvoiceSettings) => {
    const success = await saveSettings("invoice", settings);
    if (success) {
      setInvoiceSettings(settings);
    }
    return success;
  };

  const saveNotificationSettings = async (settings: NotificationSettings) => {
    const success = await saveSettings("notifications", settings);
    if (success) {
      setNotificationSettings(settings);
    }
    return success;
  };

  return {
    companySettings,
    invoiceSettings,
    notificationSettings,
    loading,
    setCompanySettings,
    setInvoiceSettings,
    setNotificationSettings,
    saveCompanySettings,
    saveInvoiceSettings,
    saveNotificationSettings
  };
};