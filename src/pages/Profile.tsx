import { useState, useEffect } from "react";
import { User, Lock, ShoppingBag, Heart, LogOut, Edit3, DollarSign, ArrowRight, Loader } from "lucide-react";
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

      const tradeDocsUrl = profile.customer_profile.trade_docs || null;
      if (tradeDocsUrl) {
        setExistingTradeDocsUrl(tradeDocsUrl);
      }

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

      if (formData.trade_docs) {
        const updateFormData = new FormData();
        updateFormData.append("first_name", formData.first_name);
        updateFormData.append("last_name", formData.last_name);

        Object.entries(customerProfileData).forEach(([key, value]) => {
          updateFormData.append(`customer_profile.${key}`, String(value));
        });

        updateFormData.append("customer_profile.trade_docs", formData.trade_docs);

        const token = localStorage.getItem("access_token");
        const API_URL = (import.meta as any).env.VITE_API_URL;

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
        const token = localStorage.getItem("access_token");
        const API_URL = (import.meta as any).env.VITE_API_URL;

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

  const inputCls = "w-full px-4 py-3 text-[.85rem] bg-white dark:bg-black/[.05] border border-black/[.1] dark:border-white/[.08] rounded-lg text-black/80 dark:text-[rgba(240,242,237,.8)] placeholder-black/40 dark:placeholder-[rgba(240,242,237,.4)] focus:outline-none focus:border-lime-brand/30 focus:bg-lime-brand/[.05] dark:focus:bg-lime-brand/[.05] transition-all duration-150";
  const labelCls = "block text-[.8rem] font-medium text-black/70 dark:text-[rgba(240,242,237,.7)] mb-2";
  const sectionTitleCls = "text-[.95rem] font-semibold text-black/80 dark:text-[rgba(240,242,237,.8)] mb-4";
  const dividerCls = "border-t border-black/[.08] dark:border-white/[.06]";

  return (
    <div className="font-outfit bg-white dark:bg-dark-surface min-h-screen flex flex-col">
      {/* Page Header */}
      <section className="bg-black/[.03] dark:bg-lime-brand/[.02] border-b border-black/[.06] dark:border-lime-brand/[.06] px-8 py-6 max-sm:px-4 max-sm:py-4">
        <div className="max-w-[1280px] mx-auto">
          <h1 className="font-bebas text-[2rem] tracking-[.08em] text-black/85 dark:text-[#f0f2ed] mb-1">
            My Account
          </h1>
          <p className="text-[.9rem] text-black/55 dark:text-[rgba(240,242,237,.55)]">
            Manage your profile, addresses, and account settings
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="flex-1 max-w-[1280px] mx-auto w-full px-8 py-8 max-sm:px-4 max-sm:py-4">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10">
          {/* Main Profile Section */}
          <div className="space-y-8">
            {/* Profile Card */}
            <div className="bg-white dark:bg-black/[.02] rounded-xl border border-black/[.08] dark:border-white/[.06] overflow-hidden">
              {/* Card Header */}
              <div className="px-6 sm:px-8 py-6 sm:py-8 flex items-center justify-between gap-4 border-b border-black/[.08] dark:border-white/[.06] bg-black/[.02] dark:bg-white/[.02]">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-lime-brand" />
                  <h2 className="text-[1.1rem] font-semibold text-black/80 dark:text-[rgba(240,242,237,.8)]">
                    Personal Information
                  </h2>
                </div>
                {!isEditingProfile && (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="p-2 hover:bg-black/[.05] dark:hover:bg-white/[.05] rounded-lg transition-colors"
                  >
                    <Edit3 className="w-5 h-5 text-black/60 dark:text-[rgba(240,242,237,.6)]" />
                  </button>
                )}
              </div>

              {/* Card Content */}
              <div className="p-6 sm:p-8">
                {isLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader className="w-8 h-8 text-lime-brand animate-spin" />
                  </div>
                ) : isEditingProfile ? (
                  <div className="space-y-6">
                    {/* Personal Details */}
                    <div>
                      <h3 className={sectionTitleCls}>Personal Details</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className={labelCls}>First Name <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            value={formData.first_name}
                            onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                            placeholder="Enter your first name"
                            className={inputCls}
                          />
                        </div>
                        <div>
                          <label className={labelCls}>Last Name <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            value={formData.last_name}
                            onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                            placeholder="Enter your last name"
                            className={inputCls}
                          />
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className={labelCls}>Email Address <span className="text-black/40 dark:text-[rgba(240,242,237,.4)]">(can't be changed)</span></label>
                        <input
                          type="email"
                          value={userEmail}
                          disabled
                          className={`${inputCls} opacity-60 cursor-not-allowed`}
                        />
                      </div>

                      <div className="mb-4">
                        <label className={labelCls}>Phone Number <span className="text-red-500">*</span></label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="Enter your phone number"
                          className={inputCls}
                        />
                      </div>

                      <div>
                        <label className={labelCls}>Customer Type</label>
                        <select
                          value={formData.customer_type}
                          onChange={(e) => setFormData(prev => ({ ...prev, customer_type: e.target.value }))}
                          className={inputCls}
                        >
                          <option value="Retail">Retail</option>
                          <option value="Trade">Trade</option>
                        </select>
                      </div>
                    </div>

                    <div className={dividerCls}></div>

                    {/* Billing Address */}
                    <div>
                      <h3 className={sectionTitleCls}>Billing Address</h3>
                      <div className="mb-4">
                        <label className={labelCls}>Street Address {formData.customer_type === "Trade" && <span className="text-red-500">*</span>}</label>
                        <input
                          type="text"
                          value={formData.billing_address}
                          onChange={(e) => setFormData(prev => ({ ...prev, billing_address: e.target.value }))}
                          placeholder="Enter your street address"
                          className={inputCls}
                          required={formData.customer_type === "Trade"}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className={labelCls}>City {formData.customer_type === "Trade" && <span className="text-red-500">*</span>}</label>
                          <input
                            type="text"
                            value={formData.billing_city}
                            onChange={(e) => setFormData(prev => ({ ...prev, billing_city: e.target.value }))}
                            placeholder="City"
                            className={inputCls}
                            required={formData.customer_type === "Trade"}
                          />
                        </div>

                        <div>
                          <label className={labelCls}>Province {formData.customer_type === "Trade" && <span className="text-red-500">*</span>}</label>
                          <select
                            value={formData.billing_province}
                            onChange={(e) => setFormData(prev => ({ ...prev, billing_province: e.target.value }))}
                            className={inputCls}
                            required={formData.customer_type === "Trade"}
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
                          <label className={labelCls}>Postal Code {formData.customer_type === "Trade" && <span className="text-red-500">*</span>}</label>
                          <input
                            type="text"
                            value={formData.billing_postal_code}
                            onChange={(e) => setFormData(prev => ({ ...prev, billing_postal_code: e.target.value }))}
                            placeholder="Postal Code"
                            className={inputCls}
                            required={formData.customer_type === "Trade"}
                          />
                        </div>
                      </div>
                    </div>

                    <div className={dividerCls}></div>

                    {/* Delivery Address */}
                    <div>
                      <h3 className={sectionTitleCls}>Delivery Address</h3>
                      <div className="mb-4">
                        <label className={labelCls}>Street Address</label>
                        <input
                          type="text"
                          value={formData.delivery_address}
                          onChange={(e) => setFormData(prev => ({ ...prev, delivery_address: e.target.value }))}
                          placeholder="Enter your delivery address"
                          className={inputCls}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className={labelCls}>City</label>
                          <input
                            type="text"
                            value={formData.delivery_city}
                            onChange={(e) => setFormData(prev => ({ ...prev, delivery_city: e.target.value }))}
                            placeholder="City"
                            className={inputCls}
                          />
                        </div>

                        <div>
                          <label className={labelCls}>Province</label>
                          <select
                            value={formData.delivery_province}
                            onChange={(e) => setFormData(prev => ({ ...prev, delivery_province: e.target.value }))}
                            className={inputCls}
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
                          <label className={labelCls}>Postal Code</label>
                          <input
                            type="text"
                            value={formData.delivery_postal_code}
                            onChange={(e) => setFormData(prev => ({ ...prev, delivery_postal_code: e.target.value }))}
                            placeholder="Postal Code"
                            className={inputCls}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Trade Section */}
                    {formData.customer_type === "Trade" && (
                      <>
                        <div className={dividerCls}></div>

                        <div>
                          <h3 className={sectionTitleCls}>Business Details</h3>
                          <div className="mb-4">
                            <label className={labelCls}>Company Name <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              value={formData.company_name}
                              onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                              placeholder="Enter company name"
                              className={inputCls}
                              required
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                            <div>
                              <label className={labelCls}>VAT Number <span className="text-black/40 dark:text-[rgba(240,242,237,.4)]">(Optional)</span></label>
                              <input
                                type="text"
                                value={formData.vat_number}
                                onChange={(e) => setFormData(prev => ({ ...prev, vat_number: e.target.value }))}
                                placeholder="VAT Number"
                                className={inputCls}
                              />
                            </div>

                            <div>
                              <label className={labelCls}>Company Registration <span className="text-red-500">*</span></label>
                              <input
                                type="text"
                                value={formData.company_registration}
                                onChange={(e) => setFormData(prev => ({ ...prev, company_registration: e.target.value }))}
                                placeholder="Registration Number"
                                className={inputCls}
                                required
                              />
                            </div>

                            <div>
                              <label className={labelCls}>Business Type <span className="text-red-500">*</span></label>
                              <select
                                value={formData.business_type}
                                onChange={(e) => setFormData(prev => ({ ...prev, business_type: e.target.value }))}
                                className={inputCls}
                                required
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
                            <label className={labelCls}>Trade Documents <span className="text-black/40 dark:text-[rgba(240,242,237,.4)]">(Optional)</span></label>

                            {existingTradeDocsUrl && !formData.trade_docs && (
                              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-500/[.08] rounded-lg border border-blue-200 dark:border-blue-500/20">
                                <p className="text-[.8rem] text-blue-800 dark:text-blue-400">
                                  <span className="font-semibold">Current file:</span> {existingTradeDocsUrl.split('/').pop()}
                                </p>
                                <a
                                  href={existingTradeDocsUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[.75rem] text-blue-600 dark:text-blue-400 hover:underline mt-1 inline-block"
                                >
                                  View file
                                </a>
                              </div>
                            )}

                            <input
                              type="file"
                              onChange={(e) => setFormData(prev => ({ ...prev, trade_docs: e.target.files?.[0] || null }))}
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              className={inputCls}
                            />
                            <p className="text-[.7rem] text-black/50 dark:text-[rgba(240,242,237,.5)] mt-1">PDF, DOC, DOCX, JPG, PNG {existingTradeDocsUrl && '(Upload to replace)'}</p>
                            {formData.trade_docs && (
                              <p className="text-[.8rem] text-lime-brand mt-1">New file selected: {formData.trade_docs.name}</p>
                            )}
                          </div>
                        </div>

                        <div className={dividerCls}></div>

                        <div>
                          <h3 className={sectionTitleCls}>Procurement & Preferences</h3>
                          <div className="mb-4">
                            <label className={labelCls}>PO Number <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              value={formData.po_number}
                              onChange={(e) => setFormData(prev => ({ ...prev, po_number: e.target.value }))}
                              placeholder="Enter PO number"
                              className={inputCls}
                              required
                            />
                          </div>

                          <div className="mb-4">
                            <label className={labelCls}>Procurement Contact <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              value={formData.procurement_contact}
                              onChange={(e) => setFormData(prev => ({ ...prev, procurement_contact: e.target.value }))}
                              placeholder="Enter procurement contact"
                              className={inputCls}
                              required
                            />
                          </div>

                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              id="monthly_statement"
                              checked={formData.monthly_statement_preference}
                              onChange={(e) => setFormData(prev => ({ ...prev, monthly_statement_preference: e.target.checked }))}
                              className="w-4 h-4 rounded accent-lime-brand cursor-pointer"
                            />
                            <label htmlFor="monthly_statement" className="text-[.8rem] text-black/60 dark:text-[rgba(240,242,237,.6)] cursor-pointer">
                              I prefer monthly statement by email
                            </label>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Action Buttons */}
                    <div className={`flex gap-3 pt-4 ${dividerCls}`}>
                      <button
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="flex-1 py-3 px-4 bg-gradient-to-br from-green-brand to-lime-brand text-dark-surface font-semibold text-[.9rem] rounded-lg cursor-pointer transition-all duration-200 hover:shadow-[0_0_16px_rgba(168,214,62,.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isSaving ? (
                          <>
                            <Loader size={16} className="animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </button>
                      <button
                        onClick={() => setIsEditingProfile(false)}
                        className="flex-1 py-3 px-4 bg-black/[.06] dark:bg-white/[.05] text-black/70 dark:text-[rgba(240,242,237,.7)] font-semibold text-[.9rem] rounded-lg cursor-pointer transition-all duration-200 hover:bg-black/[.1] dark:hover:bg-white/[.08]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h3 className={sectionTitleCls}>Personal Details</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <p className="text-[.75rem] text-black/50 dark:text-[rgba(240,242,237,.5)] font-medium mb-1">First Name</p>
                          <p className="text-[.9rem] text-black/80 dark:text-[rgba(240,242,237,.8)]">{formData.first_name || "—"}</p>
                        </div>
                        <div>
                          <p className="text-[.75rem] text-black/50 dark:text-[rgba(240,242,237,.5)] font-medium mb-1">Last Name</p>
                          <p className="text-[.9rem] text-black/80 dark:text-[rgba(240,242,237,.8)]">{formData.last_name || "—"}</p>
                        </div>
                        <div>
                          <p className="text-[.75rem] text-black/50 dark:text-[rgba(240,242,237,.5)] font-medium mb-1">Email Address</p>
                          <p className="text-[.9rem] text-black/80 dark:text-[rgba(240,242,237,.8)]">{userEmail || "—"}</p>
                        </div>
                        <div>
                          <p className="text-[.75rem] text-black/50 dark:text-[rgba(240,242,237,.5)] font-medium mb-1">Phone Number</p>
                          <p className="text-[.9rem] text-black/80 dark:text-[rgba(240,242,237,.8)]">{formData.phone || "—"}</p>
                        </div>
                        <div>
                          <p className="text-[.75rem] text-black/50 dark:text-[rgba(240,242,237,.5)] font-medium mb-1">Customer Type</p>
                          <p className="text-[.9rem] text-black/80 dark:text-[rgba(240,242,237,.8)]">{formData.customer_type || "—"}</p>
                        </div>
                      </div>
                    </div>

                    <div className={dividerCls}></div>

                    <div>
                      <h3 className={sectionTitleCls}>Billing Address</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <p className="text-[.75rem] text-black/50 dark:text-[rgba(240,242,237,.5)] font-medium mb-1">Street Address</p>
                          <p className="text-[.9rem] text-black/80 dark:text-[rgba(240,242,237,.8)]">{formData.billing_address || "—"}</p>
                        </div>
                        <div>
                          <p className="text-[.75rem] text-black/50 dark:text-[rgba(240,242,237,.5)] font-medium mb-1">City</p>
                          <p className="text-[.9rem] text-black/80 dark:text-[rgba(240,242,237,.8)]">{formData.billing_city || "—"}</p>
                        </div>
                        <div>
                          <p className="text-[.75rem] text-black/50 dark:text-[rgba(240,242,237,.5)] font-medium mb-1">Province</p>
                          <p className="text-[.9rem] text-black/80 dark:text-[rgba(240,242,237,.8)]">{formData.billing_province || "—"}</p>
                        </div>
                        <div>
                          <p className="text-[.75rem] text-black/50 dark:text-[rgba(240,242,237,.5)] font-medium mb-1">Postal Code</p>
                          <p className="text-[.9rem] text-black/80 dark:text-[rgba(240,242,237,.8)]">{formData.billing_postal_code || "—"}</p>
                        </div>
                      </div>
                    </div>

                    <div className={dividerCls}></div>

                    <div>
                      <h3 className={sectionTitleCls}>Delivery Address</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <p className="text-[.75rem] text-black/50 dark:text-[rgba(240,242,237,.5)] font-medium mb-1">Street Address</p>
                          <p className="text-[.9rem] text-black/80 dark:text-[rgba(240,242,237,.8)]">{formData.delivery_address || "—"}</p>
                        </div>
                        <div>
                          <p className="text-[.75rem] text-black/50 dark:text-[rgba(240,242,237,.5)] font-medium mb-1">City</p>
                          <p className="text-[.9rem] text-black/80 dark:text-[rgba(240,242,237,.8)]">{formData.delivery_city || "—"}</p>
                        </div>
                        <div>
                          <p className="text-[.75rem] text-black/50 dark:text-[rgba(240,242,237,.5)] font-medium mb-1">Province</p>
                          <p className="text-[.9rem] text-black/80 dark:text-[rgba(240,242,237,.8)]">{formData.delivery_province || "—"}</p>
                        </div>
                        <div>
                          <p className="text-[.75rem] text-black/50 dark:text-[rgba(240,242,237,.5)] font-medium mb-1">Postal Code</p>
                          <p className="text-[.9rem] text-black/80 dark:text-[rgba(240,242,237,.8)]">{formData.delivery_postal_code || "—"}</p>
                        </div>
                      </div>
                    </div>

                    {formData.customer_type === "Trade" && (
                      <>
                        <div className={dividerCls}></div>

                        <div>
                          <h3 className={sectionTitleCls}>Business Details</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                              <p className="text-[.75rem] text-black/50 dark:text-[rgba(240,242,237,.5)] font-medium mb-1">Company Name</p>
                              <p className="text-[.9rem] text-black/80 dark:text-[rgba(240,242,237,.8)]">{formData.company_name || "—"}</p>
                            </div>
                            <div>
                              <p className="text-[.75rem] text-black/50 dark:text-[rgba(240,242,237,.5)] font-medium mb-1">VAT Number</p>
                              <p className="text-[.9rem] text-black/80 dark:text-[rgba(240,242,237,.8)]">{formData.vat_number || "—"}</p>
                            </div>
                            <div>
                              <p className="text-[.75rem] text-black/50 dark:text-[rgba(240,242,237,.5)] font-medium mb-1">Company Registration</p>
                              <p className="text-[.9rem] text-black/80 dark:text-[rgba(240,242,237,.8)]">{formData.company_registration || "—"}</p>
                            </div>
                            <div>
                              <p className="text-[.75rem] text-black/50 dark:text-[rgba(240,242,237,.5)] font-medium mb-1">Business Type</p>
                              <p className="text-[.9rem] text-black/80 dark:text-[rgba(240,242,237,.8)]">{formData.business_type || "—"}</p>
                            </div>
                            <div>
                              <p className="text-[.75rem] text-black/50 dark:text-[rgba(240,242,237,.5)] font-medium mb-1">Trade Documents</p>
                              {existingTradeDocsUrl ? (
                                <a
                                  href={existingTradeDocsUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-lime-brand hover:text-lime-brand/80 underline text-[.9rem]"
                                >
                                  View Document
                                </a>
                              ) : (
                                <p className="text-[.9rem] text-black/50 dark:text-[rgba(240,242,237,.5)] italic">(No document)</p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className={dividerCls}></div>

                        <div>
                          <h3 className={sectionTitleCls}>Procurement & Preferences</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                              <p className="text-[.75rem] text-black/50 dark:text-[rgba(240,242,237,.5)] font-medium mb-1">PO Number</p>
                              <p className="text-[.9rem] text-black/80 dark:text-[rgba(240,242,237,.8)]">{formData.po_number || "—"}</p>
                            </div>
                            <div>
                              <p className="text-[.75rem] text-black/50 dark:text-[rgba(240,242,237,.5)] font-medium mb-1">Procurement Contact</p>
                              <p className="text-[.9rem] text-black/80 dark:text-[rgba(240,242,237,.8)]">{formData.procurement_contact || "—"}</p>
                            </div>
                            <div>
                              <p className="text-[.75rem] text-black/50 dark:text-[rgba(240,242,237,.5)] font-medium mb-1">Monthly Statement</p>
                              <p className="text-[.9rem] text-black/80 dark:text-[rgba(240,242,237,.8)]">{formData.monthly_statement_preference ? "Yes" : "No"}</p>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="w-full py-3 px-4 bg-gradient-to-br from-green-brand to-lime-brand text-dark-surface font-semibold text-[.9rem] rounded-lg cursor-pointer transition-all duration-200 hover:shadow-[0_0_16px_rgba(168,214,62,.4)] flex items-center justify-center gap-2 mt-6"
                    >
                      <Edit3 size={16} />
                      Edit Profile
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-6 bg-white dark:bg-black/[.02] rounded-lg border border-black/[.08] dark:border-white/[.06]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[.75rem] text-black/50 dark:text-[rgba(240,242,237,.5)] font-medium mb-1">Total Orders</p>
                    <p className="text-2xl font-bold text-black/80 dark:text-[rgba(240,242,237,.8)]">{stats.total_orders}</p>
                  </div>
                  <ShoppingBag size={28} className="text-blue-500/20" />
                </div>
              </div>

              <div className="p-6 bg-white dark:bg-black/[.02] rounded-lg border border-black/[.08] dark:border-white/[.06]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[.75rem] text-black/50 dark:text-[rgba(240,242,237,.5)] font-medium mb-1">Wishlist Items</p>
                    <p className="text-2xl font-bold text-black/80 dark:text-[rgba(240,242,237,.8)]">{stats.wishlist_items}</p>
                  </div>
                  <Heart size={28} className="text-red-500/20" />
                </div>
              </div>

              <div className="p-6 bg-white dark:bg-black/[.02] rounded-lg border border-black/[.08] dark:border-white/[.06]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[.75rem] text-black/50 dark:text-[rgba(240,242,237,.5)] font-medium mb-1">Total Spent</p>
                    <p className="text-2xl font-bold text-black/80 dark:text-[rgba(240,242,237,.8)]">R {stats.total_spent.toFixed(2)}</p>
                  </div>
                  <DollarSign size={28} className="text-lime-brand/20" />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Actions */}
          <div className="space-y-3">
            <button
              onClick={() => navigate("/orders")}
              className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-black/[.02] border border-black/[.08] dark:border-white/[.06] rounded-lg hover:border-lime-brand/30 dark:hover:border-lime-brand/20 transition-all duration-200 group"
            >
              <div className="flex items-center gap-3">
                <ShoppingBag size={18} className="text-lime-brand" />
                <span className="text-[.85rem] font-medium text-black/70 dark:text-[rgba(240,242,237,.7)]">View Orders</span>
              </div>
              <ArrowRight size={16} className="text-black/40 dark:text-[rgba(240,242,237,.4)] group-hover:text-lime-brand transition-colors" />
            </button>

            <button
              onClick={() => navigate("/wishlist")}
              className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-black/[.02] border border-black/[.08] dark:border-white/[.06] rounded-lg hover:border-lime-brand/30 dark:hover:border-lime-brand/20 transition-all duration-200 group"
            >
              <div className="flex items-center gap-3">
                <Heart size={18} className="text-lime-brand" />
                <span className="text-[.85rem] font-medium text-black/70 dark:text-[rgba(240,242,237,.7)]">View Wishlist</span>
              </div>
              <ArrowRight size={16} className="text-black/40 dark:text-[rgba(240,242,237,.4)] group-hover:text-lime-brand transition-colors" />
            </button>

            <button
              onClick={() => navigate("/change-password")}
              className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-black/[.02] border border-black/[.08] dark:border-white/[.06] rounded-lg hover:border-lime-brand/30 dark:hover:border-lime-brand/20 transition-all duration-200 group"
            >
              <div className="flex items-center gap-3">
                <Lock size={18} className="text-lime-brand" />
                <span className="text-[.85rem] font-medium text-black/70 dark:text-[rgba(240,242,237,.7)]">Change Password</span>
              </div>
              <ArrowRight size={16} className="text-black/40 dark:text-[rgba(240,242,237,.4)] group-hover:text-lime-brand transition-colors" />
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between px-4 py-3 bg-red-50 dark:bg-red-500/[.08] border border-red-200 dark:border-red-500/20 rounded-lg hover:border-red-300 dark:hover:border-red-500/30 transition-all duration-200 group"
            >
              <div className="flex items-center gap-3">
                <LogOut size={18} className="text-red-600" />
                <span className="text-[.85rem] font-medium text-red-600">Logout</span>
              </div>
              <ArrowRight size={16} className="text-red-400 group-hover:text-red-600 transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
