import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Lock, ShoppingBag, Heart, LogOut, Edit3, DollarSign, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPut } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "Northern Cape",
  "North West",
  "Western Cape",
];

const BUSINESS_TYPES = [
  { value: "electrician", label: "Electrician" },
  { value: "contractor", label: "Contractor" },
  { value: "reseller", label: "Reseller" },
  { value: "other", label: "Other" },
];

interface CustomerProfile {
  phone: string;
  customer_type: string;
  billing_address: string;
  billing_city: string;
  billing_province: string;
  billing_postal_code: string;
  delivery_address: string;
  delivery_city: string;
  delivery_province: string;
  delivery_postal_code: string;
  company_name?: string;
  vat_number?: string;
  company_registration?: string;
  business_type?: string;
  po_number?: string;
  procurement_contact?: string;
  monthly_statement_preference?: boolean;
  trade_docs?: string | null;
}

interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  customer_profile: CustomerProfile;
  total_orders: number;
  wishlist_items: number;
  total_spent: number;
}

interface FormData {
  first_name: string;
  last_name: string;
  phone: string;
  customer_type: string;
  billing_address: string;
  billing_city: string;
  billing_province: string;
  billing_postal_code: string;
  delivery_address: string;
  delivery_city: string;
  delivery_province: string;
  delivery_postal_code: string;
  company_name: string;
  vat_number: string;
  company_registration: string;
  business_type: string;
  po_number: string;
  procurement_contact: string;
  monthly_statement_preference: boolean;
  trade_docs: File | null;
}

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [existingTradeDocsUrl, setExistingTradeDocsUrl] = useState<string | null>(null);
  const [stats, setStats] = useState({ total_orders: 0, wishlist_items: 0, total_spent: 0 });
  const [formData, setFormData] = useState<FormData>({
    first_name: "",
    last_name: "",
    phone: "",
    customer_type: "Retail",
    billing_address: "",
    billing_city: "",
    billing_province: "",
    billing_postal_code: "",
    delivery_address: "",
    delivery_city: "",
    delivery_province: "",
    delivery_postal_code: "",
    company_name: "",
    vat_number: "",
    company_registration: "",
    business_type: "",
    po_number: "",
    procurement_contact: "",
    monthly_statement_preference: false,
    trade_docs: null,
  });

  // Fetch user profile on component mount
  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      navigate('/login');
      return;
    }
    fetchUserProfile();
  }, [navigate]);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const profile: UserProfile = await apiGet("/users/profile/");

      setUserEmail(profile.email);
      
      // Extract and store the trade docs URL if it exists
      const tradeDocsUrl = profile.customer_profile.trade_docs || null;
      if (tradeDocsUrl) {
        setExistingTradeDocsUrl(tradeDocsUrl);
      }

      // Store stats
      setStats({
        total_orders: profile.total_orders,
        wishlist_items: profile.wishlist_items,
        total_spent: profile.total_spent,
      });
      
      setFormData({
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.customer_profile.phone || "",
        customer_type: profile.customer_profile.customer_type || "Retail",
        billing_address: profile.customer_profile.billing_address || "",
        billing_city: profile.customer_profile.billing_city || "",
        billing_province: profile.customer_profile.billing_province || "",
        billing_postal_code: profile.customer_profile.billing_postal_code || "",
        delivery_address: profile.customer_profile.delivery_address || "",
        delivery_city: profile.customer_profile.delivery_city || "",
        delivery_province: profile.customer_profile.delivery_province || "",
        delivery_postal_code: profile.customer_profile.delivery_postal_code || "",
        company_name: profile.customer_profile.company_name || "",
        vat_number: profile.customer_profile.vat_number || "",
        company_registration: profile.customer_profile.company_registration || "",
        business_type: profile.customer_profile.business_type || "",
        po_number: profile.customer_profile.po_number || "",
        procurement_contact: profile.customer_profile.procurement_contact || "",
        monthly_statement_preference: profile.customer_profile.monthly_statement_preference || false,
      });
    } catch (err) {
      // console.error("Error fetching profile:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load profile. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);

      // Validation
      if (!formData.first_name?.trim()) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "First name is required",
        });
        setIsSaving(false);
        return;
      }

      if (!formData.last_name?.trim()) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Last name is required",
        });
        setIsSaving(false);
        return;
      }

      if (!formData.phone?.trim()) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Phone number is required",
        });
        setIsSaving(false);
        return;
      }

      // Trade-specific validation
      if (formData.customer_type === "Trade") {
        const tradeRequiredFields: (keyof FormData)[] = [
          "billing_address",
          "billing_city",
          "billing_province",
          "billing_postal_code",
          "company_name",
          "company_registration",
          "business_type",
          "po_number",
          "procurement_contact",
        ];

        for (const field of tradeRequiredFields) {
          if (!formData[field] || (typeof formData[field] === "string" && !formData[field].trim())) {
            const fieldLabel = field
              .replace(/_/g, " ")
              .replace(/\b\w/g, (l) => l.toUpperCase());
            toast({
              variant: "destructive",
              title: "Validation Error",
              description: `${fieldLabel} is required for Trade customers`,
            });
            setIsSaving(false);
            return;
          }
        }
      }

      // Build the nested customer profile data
      const customerProfileData = {
        phone: formData.phone,
        customer_type: formData.customer_type,
        billing_address: formData.billing_address,
        billing_city: formData.billing_city,
        billing_province: formData.billing_province,
        billing_postal_code: formData.billing_postal_code,
        delivery_address: formData.delivery_address,
        delivery_city: formData.delivery_city,
        delivery_province: formData.delivery_province,
        delivery_postal_code: formData.delivery_postal_code,
        company_name: formData.company_name,
        vat_number: formData.vat_number,
        company_registration: formData.company_registration,
        business_type: formData.business_type,
        po_number: formData.po_number,
        procurement_contact: formData.procurement_contact,
        monthly_statement_preference: formData.monthly_statement_preference,
      };

      // If there's a trade document, use FormData for multipart upload
      if (formData.trade_docs) {
        const updateFormData = new FormData();
        updateFormData.append("first_name", formData.first_name);
        updateFormData.append("last_name", formData.last_name);

        // Append each customer profile field individually
        Object.entries(customerProfileData).forEach(([key, value]) => {
          updateFormData.append(`customer_profile.${key}`, String(value));
        });

        updateFormData.append("customer_profile.trade_docs", formData.trade_docs);

        const token = localStorage.getItem("access_token");
        const API_URL = import.meta.env.VITE_API_URL;

        const response = await fetch(`${API_URL}/users/profile/update/`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: updateFormData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || "Failed to save profile");
        }
      } else {
        // Use JSON for non-file updates (more efficient and cleaner)
        const token = localStorage.getItem("access_token");
        const API_URL = import.meta.env.VITE_API_URL;

        const payload = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          customer_profile: customerProfileData,
        };

        const response = await fetch(`${API_URL}/users/profile/update/`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || "Failed to save profile");
        }
      }

      toast({
        title: "Success",
        description: "Profile updated successfully!",
        className: "bg-green-600 text-white border-green-700",
      });
      setIsEditingProfile(false);
      await fetchUserProfile();
    } catch (err) {
      // console.error("Error saving profile:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to save profile. Please try again.";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  const statsData = [
    { label: "Total Orders", value: stats.total_orders.toString(), icon: ShoppingBag, color: "text-blue-600" },
    { label: "Wishlist Items", value: stats.wishlist_items.toString(), icon: Heart, color: "text-red-500" },
    { label: "Total Spent", value: `$${stats.total_spent.toFixed(2)}`, icon: DollarSign, color: "text-green-600" }
  ];

  const actionButtons = [
    { label: "View Orders", icon: ShoppingBag, onClick: () => navigate("/orders") },
    { label: "View Wishlist", icon: Heart, onClick: () => navigate("/wishlist") },
    { label: "Change Password", icon: Lock, onClick: () => navigate("/change-password") }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header Section */}
      {/* <div className="bg-gradient-to-r from-[#399746] to-[#A6CD3D] text-white py-10 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center gap-3 mb-2">
            <User className="w-8 h-8" />
            <h1 className="text-3xl md:text-4xl font-bold">My Account</h1>
          </div>
          <p className="text-green-50 text-sm md:text-base max-w-2xl">Manage your profile, addresses, and account settings</p>
        </div>
      </div> */}

      <section className="py-8 px-4">
        <div className="container mx-auto max-w-6xl">

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Right Content - Main Profile Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Information Card */}
              <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#399746] to-[#A6CD3D] px-6 md:px-8 py-8 text-white flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                      <User className="w-7 h-7 flex-shrink-0" />
                      <span>Personal Information</span>
                    </h2>
                    <p className="text-green-50 mt-2 text-sm md:text-base">Update your profile details and addresses</p>
                  </div>
                  {!isEditingProfile && (
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex-shrink-0"
                    >
                      <Edit3 className="w-5 h-5 text-white" />
                    </button>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 md:p-8">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                      <div className="relative w-12 h-12">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#399746] to-[#A6CD3D] rounded-full animate-spin" style={{mask: 'radial-gradient(circle, transparent 30%, black 70%)'}}></div>
                      </div>
                    </div>
                  ) : isEditingProfile ? (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-900">Personal Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            First Name <span className="text-red-600">*</span>
                          </label>
                          <Input
                            type="text"
                            value={formData.first_name}
                            onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                            placeholder="Enter your first name"
                            className="h-11 rounded-lg border-gray-200"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Last Name <span className="text-red-600">*</span>
                          </label>
                          <Input
                            type="text"
                            value={formData.last_name}
                            onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                            placeholder="Enter your last name"
                            className="h-11 rounded-lg border-gray-200"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Email Address {" "}
                          <span className="font-normal text-gray-500 italic">(can't be changed)</span>
                        </label>
                        <Input
                          type="email"
                          value={userEmail}
                          disabled
                          placeholder="Your email"
                          className="h-11 rounded-lg border-gray-200 bg-gray-50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Phone Number <span className="text-red-600">*</span>
                        </label>
                        <Input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="Enter your phone number"
                          className="h-11 rounded-lg border-gray-200"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Customer Type
                        </label>
                        <select
                          value={formData.customer_type}
                          onChange={(e) => setFormData(prev => ({ ...prev, customer_type: e.target.value }))}
                          className="h-11 px-3 rounded-lg border border-gray-200 bg-white text-gray-900"
                        >
                          <option value="Retail">Retail</option>
                          <option value="Trade">Trade</option>
                        </select>
                      </div>

                      <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Address</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                              Street Address {formData.customer_type === "Trade" && <span className="text-red-600">*</span>}
                            </label>
                            <Input
                              type="text"
                              value={formData.billing_address}
                              onChange={(e) => setFormData(prev => ({ ...prev, billing_address: e.target.value }))}
                              placeholder="Enter your street address"
                              className="h-11 rounded-lg border-gray-200"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-semibold text-gray-900 mb-2">
                                City {formData.customer_type === "Trade" && <span className="text-red-600">*</span>}
                              </label>
                              <Input
                                type="text"
                                value={formData.billing_city}
                                onChange={(e) => setFormData(prev => ({ ...prev, billing_city: e.target.value }))}
                                placeholder="City"
                                className="h-11 rounded-lg border-gray-200"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Province {formData.customer_type === "Trade" && <span className="text-red-600">*</span>}
                              </label>
                              <select
                                value={formData.billing_province}
                                onChange={(e) => setFormData(prev => ({ ...prev, billing_province: e.target.value }))}
                                className="h-11 px-3 rounded-lg border border-gray-200 bg-white text-gray-900"
                              >
                                <option value="">Select Province</option>
                                {PROVINCES.map((province) => (
                                  <option key={province} value={province}>
                                    {province}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Postal Code {formData.customer_type === "Trade" && <span className="text-red-600">*</span>}
                              </label>
                              <Input
                                type="text"
                                value={formData.billing_postal_code}
                                onChange={(e) => setFormData(prev => ({ ...prev, billing_postal_code: e.target.value }))}
                                placeholder="Postal Code"
                                className="h-11 rounded-lg border-gray-200"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Address</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                              Street Address
                            </label>
                            <Input
                              type="text"
                              value={formData.delivery_address}
                              onChange={(e) => setFormData(prev => ({ ...prev, delivery_address: e.target.value }))}
                              placeholder="Enter your delivery address"
                              className="h-11 rounded-lg border-gray-200"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-semibold text-gray-900 mb-2">
                                City
                              </label>
                              <Input
                                type="text"
                                value={formData.delivery_city}
                                onChange={(e) => setFormData(prev => ({ ...prev, delivery_city: e.target.value }))}
                                placeholder="City"
                                className="h-11 rounded-lg border-gray-200"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Province
                              </label>
                              <select
                                value={formData.delivery_province}
                                onChange={(e) => setFormData(prev => ({ ...prev, delivery_province: e.target.value }))}
                                className="h-11 px-3 rounded-lg border border-gray-200 bg-white text-gray-900"
                              >
                                <option value="">Select Province</option>
                                {PROVINCES.map((province) => (
                                  <option key={province} value={province}>
                                    {province}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Postal Code
                              </label>
                              <Input
                                type="text"
                                value={formData.delivery_postal_code}
                                onChange={(e) => setFormData(prev => ({ ...prev, delivery_postal_code: e.target.value }))}
                                placeholder="Postal Code"
                                className="h-11 rounded-lg border-gray-200"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {formData.customer_type === "Trade" && (
                        <>
                          <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Details</h3>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                  Company Name <span className="text-red-600">*</span>
                                </label>
                                <Input
                                  type="text"
                                  value={formData.company_name}
                                  onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                                  placeholder="Enter company name"
                                  className="h-11 rounded-lg border-gray-200"
                                />
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    VAT Number {" "}
                                    <span className="font-normal text-gray-500 italic">(Optional)</span>
                                  </label>
                                  <Input
                                    type="text"
                                    value={formData.vat_number}
                                    onChange={(e) => setFormData(prev => ({ ...prev, vat_number: e.target.value }))}
                                    placeholder="VAT Number"
                                    className="h-11 rounded-lg border-gray-200"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Company Registration <span className="text-red-600">*</span>
                                  </label>
                                  <Input
                                    type="text"
                                    value={formData.company_registration}
                                    onChange={(e) => setFormData(prev => ({ ...prev, company_registration: e.target.value }))}
                                    placeholder="Registration Number"
                                    className="h-11 rounded-lg border-gray-200"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Business Type <span className="text-red-600">*</span>
                                  </label>
                                  <select
                                    value={formData.business_type}
                                    onChange={(e) => setFormData(prev => ({ ...prev, business_type: e.target.value }))}
                                    className="h-11 px-3 rounded-lg border border-gray-200 bg-white text-gray-900"
                                  >
                                    <option value="">Select Business Type</option>
                                    {BUSINESS_TYPES.map((type) => (
                                      <option key={type.value} value={type.value}>
                                        {type.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                  Trade Documents {" "}
                                  <span className="font-normal text-gray-500 italic">(Optional)</span>
                                </label>
                                
                                {/* Show existing file if present */}
                                {existingTradeDocsUrl && !formData.trade_docs && (
                                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                      <span className="font-semibold">Current file:</span> {existingTradeDocsUrl.split('/').pop()}
                                    </p>
                                    <a 
                                      href={existingTradeDocsUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-sm text-blue-600 hover:text-blue-800 underline mt-1 inline-block"
                                    >
                                      View file
                                    </a>
                                  </div>
                                )}
                                
                                <input
                                  type="file"
                                  onChange={(e) => setFormData(prev => ({ ...prev, trade_docs: e.target.files?.[0] || null }))}
                                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                                />
                                <p className="text-xs text-gray-500 mt-2">PDF, DOC, DOCX, JPG, JPEG, PNG {existingTradeDocsUrl && '(Upload to replace existing file)'}</p>
                                {formData.trade_docs && (
                                  <p className="text-sm text-green-600 mt-2">New file selected: {formData.trade_docs.name}</p>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Procurement & Preferences</h3>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                  PO Number <span className="text-red-600">*</span>
                                </label>
                                <Input
                                  type="text"
                                  value={formData.po_number}
                                  onChange={(e) => setFormData(prev => ({ ...prev, po_number: e.target.value }))}
                                  placeholder="Enter PO number"
                                  className="h-11 rounded-lg border-gray-200"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                  Procurement Contact <span className="text-red-600">*</span>
                                </label>
                                <Input
                                  type="text"
                                  value={formData.procurement_contact}
                                  onChange={(e) => setFormData(prev => ({ ...prev, procurement_contact: e.target.value }))}
                                  placeholder="Enter procurement contact"
                                  className="h-11 rounded-lg border-gray-200"
                                />
                              </div>

                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  id="monthly_statement"
                                  checked={formData.monthly_statement_preference}
                                  onChange={(e) => setFormData(prev => ({ ...prev, monthly_statement_preference: e.target.checked }))}
                                  className="w-4 h-4 rounded border-gray-200 cursor-pointer"
                                />
                                <label htmlFor="monthly_statement" className="text-sm font-medium text-gray-900 cursor-pointer">
                                  I prefer monthly statement by email
                                </label>
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      <div className="flex gap-3 pt-6 border-t border-gray-200">
                        <Button
                          onClick={handleSaveProfile}
                          disabled={isSaving}
                          className="flex-1 h-12 bg-gradient-to-r from-[#399746] to-[#A6CD3D] text-white font-semibold hover:shadow-lg disabled:opacity-50 rounded-lg transition-all"
                        >
                          {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                        <Button
                          onClick={() => setIsEditingProfile(false)}
                          variant="outline"
                          className="flex-1 h-12 rounded-lg border-2 border-gray-200"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">First Name</p>
                            <p className="text-gray-900">{formData.first_name || "—"}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Last Name</p>
                            <p className="text-gray-900">{formData.last_name || "—"}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Email Address</p>
                            <p className="text-gray-900">{userEmail || "—"}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Phone Number</p>
                            <p className="text-gray-900">{formData.phone || "—"}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Customer Type</p>
                            <p className="text-gray-900">{formData.customer_type || "—"}</p>
                          </div>
                        </div>
                      </div>

                      <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Address</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Street Address</p>
                            <p className="text-gray-900">{formData.billing_address || "—"}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">City</p>
                            <p className="text-gray-900">{formData.billing_city || "—"}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Province</p>
                            <p className="text-gray-900">{formData.billing_province || "—"}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Postal Code</p>
                            <p className="text-gray-900">{formData.billing_postal_code || "—"}</p>
                          </div>
                        </div>
                      </div>

                      <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Address</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Street Address</p>
                            <p className="text-gray-900">{formData.delivery_address || "—"}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">City</p>
                            <p className="text-gray-900">{formData.delivery_city || "—"}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Province</p>
                            <p className="text-gray-900">{formData.delivery_province || "—"}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Postal Code</p>
                            <p className="text-gray-900">{formData.delivery_postal_code || "—"}</p>
                          </div>
                        </div>
                      </div>

                      {formData.customer_type === "Trade" && (
                        <>
                          <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Company Name</p>
                                <p className="text-gray-900">{formData.company_name || "—"}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">VAT Number</p>
                                <p className="text-gray-900">{formData.vat_number || "—"}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Company Registration</p>
                                <p className="text-gray-900">{formData.company_registration || "—"}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Business Type</p>
                                <p className="text-gray-900">{formData.business_type || "—"}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Trade Documents</p>
                                {existingTradeDocsUrl ? (
                                  <a 
                                    href={existingTradeDocsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 underline"
                                  >
                                    View Document
                                  </a>
                                ) : (
                                  <p className="text-gray-500 italic">(No document uploaded)</p>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Procurement & Preferences</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">PO Number</p>
                                <p className="text-gray-900">{formData.po_number || "—"}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Procurement Contact</p>
                                <p className="text-gray-900">{formData.procurement_contact || "—"}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Monthly Statement Preference</p>
                                <p className="text-gray-900">{formData.monthly_statement_preference ? "Yes" : "No"}</p>
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      <Button
                        onClick={() => setIsEditingProfile(true)}
                        className="w-full h-12 bg-gradient-to-r from-[#399746] to-[#A6CD3D] text-white font-semibold hover:shadow-lg rounded-lg transition-all"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {statsData.map((stat, index) => {
                  const Icon = stat.icon;
                  const colors = [
                    'from-blue-50 to-cyan-50 border-blue-200',
                    'from-red-50 to-pink-50 border-red-200',
                    'from-green-50 to-emerald-50 border-green-200'
                  ];
                  return (
                    <div 
                      key={stat.label} 
                      className={`bg-gradient-to-br ${colors[index]} rounded-xl border-2 p-5 shadow-md hover:shadow-lg transition-all hover:scale-105 transform`}
                      style={{animation: `slideInUp 0.5s ease-out ${index * 0.1}s both`}}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs md:text-sm text-gray-600 font-semibold mb-1">{stat.label}</p>
                          <p className="text-2xl md:text-3xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                        <div className={`${stat.color}`}>
                          <Icon className="w-10 h-10 opacity-20" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Left Sidebar - Action Buttons */}
            <div className="lg:col-span-1 space-y-3">
              {actionButtons.map((btn, index) => {
                const Icon = btn.icon;
                return (
                  <button
                    key={btn.label}
                    onClick={btn.onClick}
                    className="w-full flex items-center justify-between px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl hover:border-[#399746] hover:bg-gradient-to-r hover:from-green-50 hover:to-lime-50 transition-all hover:shadow-md group"
                    style={{animation: `slideInRight 0.5s ease-out ${index * 0.1}s both`}}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-[#399746]/10 to-[#A6CD3D]/10 rounded-lg group-hover:bg-gradient-to-br group-hover:from-[#399746]/20 group-hover:to-[#A6CD3D]/20 transition-colors">
                        <Icon className="w-5 h-5 text-[#399746] group-hover:text-[#399746]" />
                      </div>
                      <span className="font-semibold text-gray-700 group-hover:text-gray-900">{btn.label}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#399746] group-hover:translate-x-1 transition-all" />
                  </button>
                );
              })}

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 rounded-xl hover:border-red-400 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-200/30 rounded-lg group-hover:bg-red-200/50 transition-colors">
                    <LogOut className="w-5 h-5 text-red-600" />
                  </div>
                  <span className="font-semibold text-red-600 group-hover:text-red-700">Logout</span>
                </div>
                <ArrowRight className="w-4 h-4 text-red-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
