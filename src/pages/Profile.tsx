import { useState, useEffect } from "react";
import {
  User,
  Mail,
  FileText,
  Truck,
  Briefcase,
  ClipboardList,
  Lock,
  ShoppingBag,
  Heart,
  LogOut,
  Edit3,
  Wallet,
  ArrowRight,
  Loader,
} from "lucide-react";
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

  // ── Design tokens (CSS vars → Tailwind) ──
  const fieldCls =
    "w-full px-[.9rem] py-[.7rem] text-[.85rem] bg-white dark:bg-[#141914] border border-[rgba(22,25,26,.1)] dark:border-white/10 rounded-[10px] text-[#16191a] dark:text-[#f1f3ea] outline-none transition-colors focus:border-[rgba(57,151,70,.4)] focus:bg-[rgba(57,151,70,.09)] dark:focus:bg-[rgba(168,214,62,.1)]";
  const fieldLabelCls =
    "text-[.74rem] font-medium mb-1.5 text-[rgba(22,25,26,.42)] dark:text-[rgba(241,243,234,.42)]";
  const readValueCls = "text-[.9rem] font-medium text-[#16191a] dark:text-[#f1f3ea]";
  const reqStar = <span className="text-[#d94646]"> *</span>;
  const optionalTag = (
    <span className="font-normal text-[rgba(22,25,26,.42)] dark:text-[rgba(241,243,234,.42)]"> (Optional)</span>
  );

  const initials = `${formData.first_name?.[0] || ""}${formData.last_name?.[0] || ""}`.toUpperCase();
  const isTrade = formData.customer_type === "Trade";

  // Section tile wrapper (surface-2 header bar + icon + title)
  const SectionTile = ({
    icon,
    title,
    children,
  }: {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
  }) => (
    <div className="bg-white dark:bg-[#141914] border border-[rgba(22,25,26,.1)] dark:border-white/10 rounded-[24px] overflow-hidden">
      <div className="px-5 sm:px-6 py-4 flex items-center gap-2.5 border-b border-[rgba(22,25,26,.07)] dark:border-white/[.06] bg-[#f3f1ea] dark:bg-[#10150f]">
        <span className="text-[#2f8b3d] dark:text-[#a8d63e]">{icon}</span>
        <h3 className="text-[.98rem] font-semibold text-[#16191a] dark:text-[#f1f3ea]">{title}</h3>
      </div>
      <div className="p-5 sm:p-6 grid sm:grid-cols-2 gap-x-6 gap-y-5">{children}</div>
    </div>
  );

  return (
    <div className="font-outfit bg-[#f6f5f0]/[.86] dark:bg-dark-surface min-h-screen flex flex-col">
      <section className="flex-1 py-14 px-4 sm:px-8">
        <div className="max-w-[1280px] mx-auto">
          {/* Header block */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 text-[.68rem] font-bold tracking-[.2em] uppercase text-[#2f8b3d] dark:text-[#a8d63e] mb-3 before:content-[''] before:w-[1.4rem] before:h-0.5 before:bg-[#2f8b3d] dark:before:bg-[#a8d63e] before:rounded-sm before:shrink-0">
              Your account
            </div>
            <h1 className="font-bebas leading-[.9] text-[clamp(2.4rem,6vw,4rem)] text-[#16191a] dark:text-[#f0f2ed]">My Account</h1>
            <p className="mt-3 text-[.95rem] leading-relaxed max-w-[640px] text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)]">
              Manage your profile, addresses and account settings. Keep your information up to date for a better experience.
            </p>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative w-12 h-12 mb-3 rounded-full border-2 border-[#a8d63e] border-t-[#2f8b3d] animate-spin" />
              <p className="text-[.9rem] text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)]">Loading your profile...</p>
            </div>
          ) : (
            <>
              {/* Identity header tile */}
              <div className="relative overflow-hidden bg-white dark:bg-[#141914] border border-[rgba(22,25,26,.1)] dark:border-white/10 rounded-[24px] mb-6">
                <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#399746] to-[#a8d63e]" />
                <div className="p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center gap-6">
                  <div className="flex items-center gap-5 min-w-0">
                    <div className="w-[68px] h-[68px] rounded-full grid place-items-center shrink-0 font-bebas text-[2rem] bg-gradient-to-br from-[#399746] to-[#a8d63e] text-white dark:text-[#0a0c0a]">
                      {initials || <User className="w-7 h-7" />}
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-bebas text-[2rem] leading-none truncate text-[#16191a] dark:text-[#f0f2ed]">
                        {`${formData.first_name} ${formData.last_name}`.trim() || "—"}
                      </h2>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-[.85rem] text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)]">
                        <span className="flex items-center gap-1.5 truncate">
                          <Mail className="w-3.5 h-3.5 shrink-0" />
                          <span>{userEmail || "—"}</span>
                        </span>
                        <span
                          className={`inline-flex items-center gap-1.5 text-[.72rem] font-bold rounded-full px-[.7rem] py-[.34rem] ${
                            isTrade
                              ? "bg-[rgba(168,214,62,.14)] text-[#399746] dark:text-[#a8d63e]"
                              : "bg-[rgba(57,151,70,.09)] dark:bg-[rgba(168,214,62,.1)] text-[#2f8b3d] dark:text-[#a8d63e]"
                          }`}
                        >
                          {formData.customer_type}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* inline stats */}
                  <div className="grid grid-cols-3 gap-3 lg:ml-auto lg:max-w-[420px] w-full">
                    <div className="bg-[#f7f6f1] dark:bg-[#171c16] border border-[rgba(22,25,26,.07)] dark:border-white/[.06] rounded-[14px] px-3 py-3 text-center sm:text-left">
                      <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-1 text-[rgba(22,25,26,.42)] dark:text-[rgba(241,243,234,.42)]">
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span className="text-[.68rem] font-semibold uppercase tracking-wide">Orders</span>
                      </div>
                      <div className="text-[1.1rem] font-bold leading-none truncate text-[#16191a] dark:text-[#f0f2ed]">{stats.total_orders}</div>
                    </div>
                    <div className="bg-[#f7f6f1] dark:bg-[#171c16] border border-[rgba(22,25,26,.07)] dark:border-white/[.06] rounded-[14px] px-3 py-3 text-center sm:text-left">
                      <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-1 text-[rgba(22,25,26,.42)] dark:text-[rgba(241,243,234,.42)]">
                        <Heart className="w-3.5 h-3.5" />
                        <span className="text-[.68rem] font-semibold uppercase tracking-wide">Wishlist</span>
                      </div>
                      <div className="text-[1.1rem] font-bold leading-none truncate text-[#16191a] dark:text-[#f0f2ed]">{stats.wishlist_items}</div>
                    </div>
                    <div className="bg-[#f7f6f1] dark:bg-[#171c16] border border-[rgba(22,25,26,.07)] dark:border-white/[.06] rounded-[14px] px-3 py-3 text-center sm:text-left">
                      <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-1 text-[rgba(22,25,26,.42)] dark:text-[rgba(241,243,234,.42)]">
                        <Wallet className="w-3.5 h-3.5" />
                        <span className="text-[.68rem] font-semibold uppercase tracking-wide">Spent</span>
                      </div>
                      <div className="text-[1.1rem] font-bold leading-none truncate text-[#16191a] dark:text-[#f0f2ed]">R {stats.total_spent.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2-col layout */}
              <div className="grid lg:grid-cols-[1fr_280px] gap-6 lg:gap-8 items-start">
                {/* LEFT: edit button + sectioned info cards */}
                <div className="space-y-5">
                  {/* Edit action bar */}
                  {!isEditingProfile && (
                    <div className="flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(true)}
                        className="inline-flex items-center gap-2 py-2 px-4 text-[.82rem] font-semibold rounded-full border border-[rgba(22,25,26,.1)] dark:border-white/10 text-[#16191a] dark:text-[#f1f3ea] transition-colors hover:border-[#2f8b3d] hover:text-[#2f8b3d] dark:hover:border-[#a8d63e] dark:hover:text-[#a8d63e]"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>Edit Profile</span>
                      </button>
                    </div>
                  )}

                  {/* Personal Details */}
                  <SectionTile icon={<User className="w-[18px] h-[18px]" />} title="Personal Details">
                    <div>
                      <div className={fieldLabelCls}>First Name{isEditingProfile && reqStar}</div>
                      {isEditingProfile ? (
                        <input
                          type="text"
                          value={formData.first_name}
                          onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                          placeholder="Enter your first name"
                          className={fieldCls}
                        />
                      ) : (
                        <div className={readValueCls}>{formData.first_name || "—"}</div>
                      )}
                    </div>
                    <div>
                      <div className={fieldLabelCls}>Last Name{isEditingProfile && reqStar}</div>
                      {isEditingProfile ? (
                        <input
                          type="text"
                          value={formData.last_name}
                          onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                          placeholder="Enter your last name"
                          className={fieldCls}
                        />
                      ) : (
                        <div className={readValueCls}>{formData.last_name || "—"}</div>
                      )}
                    </div>
                    <div className="sm:col-span-2">
                      <div className={fieldLabelCls}>
                        Email Address
                        {isEditingProfile && (
                          <span className="font-normal text-[rgba(22,25,26,.42)] dark:text-[rgba(241,243,234,.42)]"> (can't be changed)</span>
                        )}
                      </div>
                      {isEditingProfile ? (
                        <input
                          type="email"
                          value={userEmail}
                          disabled
                          className={`${fieldCls} opacity-60 cursor-not-allowed`}
                        />
                      ) : (
                        <div className={readValueCls}>{userEmail || "—"}</div>
                      )}
                    </div>
                    <div>
                      <div className={fieldLabelCls}>Phone Number{isEditingProfile && reqStar}</div>
                      {isEditingProfile ? (
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="Enter your phone number"
                          className={fieldCls}
                        />
                      ) : (
                        <div className={readValueCls}>{formData.phone || "—"}</div>
                      )}
                    </div>
                    <div>
                      <div className={fieldLabelCls}>Customer Type</div>
                      {isEditingProfile ? (
                        <select
                          value={formData.customer_type}
                          onChange={(e) => setFormData(prev => ({ ...prev, customer_type: e.target.value }))}
                          className={fieldCls}
                        >
                          <option value="Retail">Retail</option>
                          <option value="Trade">Trade</option>
                        </select>
                      ) : (
                        <div className={readValueCls}>{formData.customer_type || "—"}</div>
                      )}
                    </div>
                  </SectionTile>

                  {/* Billing Address */}
                  <SectionTile icon={<FileText className="w-[18px] h-[18px]" />} title="Billing Address">
                    <div className="sm:col-span-2">
                      <div className={fieldLabelCls}>Street Address{isEditingProfile && isTrade && reqStar}</div>
                      {isEditingProfile ? (
                        <input
                          type="text"
                          value={formData.billing_address}
                          onChange={(e) => setFormData(prev => ({ ...prev, billing_address: e.target.value }))}
                          placeholder="Enter your street address"
                          className={fieldCls}
                          required={formData.customer_type === "Trade"}
                        />
                      ) : (
                        <div className={readValueCls}>{formData.billing_address || "—"}</div>
                      )}
                    </div>
                    <div>
                      <div className={fieldLabelCls}>City{isEditingProfile && isTrade && reqStar}</div>
                      {isEditingProfile ? (
                        <input
                          type="text"
                          value={formData.billing_city}
                          onChange={(e) => setFormData(prev => ({ ...prev, billing_city: e.target.value }))}
                          placeholder="City"
                          className={fieldCls}
                          required={formData.customer_type === "Trade"}
                        />
                      ) : (
                        <div className={readValueCls}>{formData.billing_city || "—"}</div>
                      )}
                    </div>
                    <div>
                      <div className={fieldLabelCls}>Province{isEditingProfile && isTrade && reqStar}</div>
                      {isEditingProfile ? (
                        <select
                          value={formData.billing_province}
                          onChange={(e) => setFormData(prev => ({ ...prev, billing_province: e.target.value }))}
                          className={fieldCls}
                          required={formData.customer_type === "Trade"}
                        >
                          <option value="">Select Province</option>
                          {PROVINCES.map((province) => (
                            <option key={province} value={province}>
                              {province}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className={readValueCls}>{formData.billing_province || "—"}</div>
                      )}
                    </div>
                    <div>
                      <div className={fieldLabelCls}>Postal Code{isEditingProfile && isTrade && reqStar}</div>
                      {isEditingProfile ? (
                        <input
                          type="text"
                          value={formData.billing_postal_code}
                          onChange={(e) => setFormData(prev => ({ ...prev, billing_postal_code: e.target.value }))}
                          placeholder="Postal Code"
                          className={fieldCls}
                          required={formData.customer_type === "Trade"}
                        />
                      ) : (
                        <div className={readValueCls}>{formData.billing_postal_code || "—"}</div>
                      )}
                    </div>
                  </SectionTile>

                  {/* Delivery Address */}
                  <SectionTile icon={<Truck className="w-[18px] h-[18px]" />} title="Delivery Address">
                    <div className="sm:col-span-2">
                      <div className={fieldLabelCls}>Street Address</div>
                      {isEditingProfile ? (
                        <input
                          type="text"
                          value={formData.delivery_address}
                          onChange={(e) => setFormData(prev => ({ ...prev, delivery_address: e.target.value }))}
                          placeholder="Enter your delivery address"
                          className={fieldCls}
                        />
                      ) : (
                        <div className={readValueCls}>{formData.delivery_address || "—"}</div>
                      )}
                    </div>
                    <div>
                      <div className={fieldLabelCls}>City</div>
                      {isEditingProfile ? (
                        <input
                          type="text"
                          value={formData.delivery_city}
                          onChange={(e) => setFormData(prev => ({ ...prev, delivery_city: e.target.value }))}
                          placeholder="City"
                          className={fieldCls}
                        />
                      ) : (
                        <div className={readValueCls}>{formData.delivery_city || "—"}</div>
                      )}
                    </div>
                    <div>
                      <div className={fieldLabelCls}>Province</div>
                      {isEditingProfile ? (
                        <select
                          value={formData.delivery_province}
                          onChange={(e) => setFormData(prev => ({ ...prev, delivery_province: e.target.value }))}
                          className={fieldCls}
                        >
                          <option value="">Select Province</option>
                          {PROVINCES.map((province) => (
                            <option key={province} value={province}>
                              {province}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className={readValueCls}>{formData.delivery_province || "—"}</div>
                      )}
                    </div>
                    <div>
                      <div className={fieldLabelCls}>Postal Code</div>
                      {isEditingProfile ? (
                        <input
                          type="text"
                          value={formData.delivery_postal_code}
                          onChange={(e) => setFormData(prev => ({ ...prev, delivery_postal_code: e.target.value }))}
                          placeholder="Postal Code"
                          className={fieldCls}
                        />
                      ) : (
                        <div className={readValueCls}>{formData.delivery_postal_code || "—"}</div>
                      )}
                    </div>
                  </SectionTile>

                  {/* Trade-only sections */}
                  {isTrade && (
                    <>
                      {/* Business Details */}
                      <SectionTile icon={<Briefcase className="w-[18px] h-[18px]" />} title="Business Details">
                        <div className="sm:col-span-2">
                          <div className={fieldLabelCls}>Company Name{isEditingProfile && reqStar}</div>
                          {isEditingProfile ? (
                            <input
                              type="text"
                              value={formData.company_name}
                              onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                              placeholder="Enter company name"
                              className={fieldCls}
                              required
                            />
                          ) : (
                            <div className={readValueCls}>{formData.company_name || "—"}</div>
                          )}
                        </div>
                        <div>
                          <div className={fieldLabelCls}>VAT Number{isEditingProfile && optionalTag}</div>
                          {isEditingProfile ? (
                            <input
                              type="text"
                              value={formData.vat_number}
                              onChange={(e) => setFormData(prev => ({ ...prev, vat_number: e.target.value }))}
                              placeholder="VAT Number"
                              className={fieldCls}
                            />
                          ) : (
                            <div className={readValueCls}>{formData.vat_number || "—"}</div>
                          )}
                        </div>
                        <div>
                          <div className={fieldLabelCls}>Company Registration{isEditingProfile && reqStar}</div>
                          {isEditingProfile ? (
                            <input
                              type="text"
                              value={formData.company_registration}
                              onChange={(e) => setFormData(prev => ({ ...prev, company_registration: e.target.value }))}
                              placeholder="Registration Number"
                              className={fieldCls}
                              required
                            />
                          ) : (
                            <div className={readValueCls}>{formData.company_registration || "—"}</div>
                          )}
                        </div>
                        <div>
                          <div className={fieldLabelCls}>Business Type{isEditingProfile && reqStar}</div>
                          {isEditingProfile ? (
                            <select
                              value={formData.business_type}
                              onChange={(e) => setFormData(prev => ({ ...prev, business_type: e.target.value }))}
                              className={fieldCls}
                              required
                            >
                              <option value="">Select Business Type</option>
                              {BUSINESS_TYPES.map((type) => (
                                <option key={type.value} value={type.value}>
                                  {type.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div className={readValueCls}>{formData.business_type || "—"}</div>
                          )}
                        </div>
                        <div className="sm:col-span-2">
                          <div className={fieldLabelCls}>Trade Documents{isEditingProfile && optionalTag}</div>
                          {isEditingProfile ? (
                            <>
                              {existingTradeDocsUrl && !formData.trade_docs && (
                                <div className="mb-3 p-3 rounded-[14px] bg-[rgba(57,151,70,.06)] dark:bg-[#171c16] border border-[rgba(57,151,70,.18)] dark:border-white/[.06]">
                                  <p className="text-[.8rem] text-[#16191a] dark:text-[#f1f3ea]">
                                    <span className="font-semibold">Current file:</span> {existingTradeDocsUrl.split('/').pop()}
                                  </p>
                                  <a
                                    href={existingTradeDocsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[.75rem] text-[#2f8b3d] dark:text-[#a8d63e] hover:underline mt-1 inline-block"
                                  >
                                    View file
                                  </a>
                                </div>
                              )}

                              <input
                                type="file"
                                onChange={(e) => setFormData(prev => ({ ...prev, trade_docs: e.target.files?.[0] || null }))}
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                className={`${fieldCls} file:mr-3 file:rounded-full file:border-0 file:bg-[rgba(57,151,70,.09)] dark:file:bg-[rgba(168,214,62,.1)] file:px-3 file:py-1 file:text-[.78rem] file:font-semibold file:text-[#2f8b3d] dark:file:text-[#a8d63e]`}
                              />
                              <p className="text-[.7rem] text-[rgba(22,25,26,.42)] dark:text-[rgba(241,243,234,.42)] mt-1.5">PDF, DOC, DOCX, JPG, PNG {existingTradeDocsUrl && '(Upload to replace)'}</p>
                              {formData.trade_docs && (
                                <p className="text-[.8rem] text-[#2f8b3d] dark:text-[#a8d63e] mt-1">New file selected: {formData.trade_docs.name}</p>
                              )}
                            </>
                          ) : existingTradeDocsUrl ? (
                            <a
                              href={existingTradeDocsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[.9rem] font-medium text-[#2f8b3d] dark:text-[#a8d63e] underline hover:opacity-80"
                            >
                              View Document
                            </a>
                          ) : (
                            <div className="text-[.9rem] italic text-[rgba(22,25,26,.42)] dark:text-[rgba(241,243,234,.42)]">(No document)</div>
                          )}
                        </div>
                      </SectionTile>

                      {/* Procurement & Preferences */}
                      <SectionTile icon={<ClipboardList className="w-[18px] h-[18px]" />} title="Procurement & Preferences">
                        <div>
                          <div className={fieldLabelCls}>PO Number{isEditingProfile && reqStar}</div>
                          {isEditingProfile ? (
                            <input
                              type="text"
                              value={formData.po_number}
                              onChange={(e) => setFormData(prev => ({ ...prev, po_number: e.target.value }))}
                              placeholder="Enter PO number"
                              className={fieldCls}
                              required
                            />
                          ) : (
                            <div className={readValueCls}>{formData.po_number || "—"}</div>
                          )}
                        </div>
                        <div>
                          <div className={fieldLabelCls}>Procurement Contact{isEditingProfile && reqStar}</div>
                          {isEditingProfile ? (
                            <input
                              type="text"
                              value={formData.procurement_contact}
                              onChange={(e) => setFormData(prev => ({ ...prev, procurement_contact: e.target.value }))}
                              placeholder="Enter procurement contact"
                              className={fieldCls}
                              required
                            />
                          ) : (
                            <div className={readValueCls}>{formData.procurement_contact || "—"}</div>
                          )}
                        </div>
                        <div className="sm:col-span-2">
                          <div className={fieldLabelCls}>Monthly Statement</div>
                          {isEditingProfile ? (
                            <label className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                id="monthly_statement"
                                checked={formData.monthly_statement_preference}
                                onChange={(e) => setFormData(prev => ({ ...prev, monthly_statement_preference: e.target.checked }))}
                                className="w-[18px] h-[18px] rounded accent-[#2f8b3d] dark:accent-[#a8d63e] cursor-pointer"
                              />
                              <span className="text-[.85rem] text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)]">
                                I prefer monthly statement by email
                              </span>
                            </label>
                          ) : (
                            <div className={readValueCls}>{formData.monthly_statement_preference ? "Yes" : "No"}</div>
                          )}
                        </div>
                      </SectionTile>
                    </>
                  )}

                  {/* Edit-mode action buttons */}
                  {isEditingProfile && (
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="flex-1 inline-flex items-center justify-center gap-2 py-[.8rem] px-6 rounded-full font-semibold text-[.88rem] bg-gradient-to-r from-[#399746] to-[#a8d63e] text-white dark:text-[#0a0c0a] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(57,151,70,.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
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
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="flex-1 inline-flex items-center justify-center gap-2 py-[.8rem] px-6 rounded-full font-semibold text-[.88rem] border border-[rgba(22,25,26,.1)] dark:border-white/10 text-[#16191a] dark:text-[#f1f3ea] transition-colors hover:border-[#2f8b3d] hover:text-[#2f8b3d] dark:hover:border-[#a8d63e] dark:hover:text-[#a8d63e]"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                {/* RIGHT: action rail */}
                <div className="space-y-3 lg:sticky lg:top-[124px]">
                  <button
                    type="button"
                    onClick={() => navigate("/orders")}
                    className="group w-full flex items-center justify-between px-4 py-3.5 text-left bg-white dark:bg-[#141914] border border-[rgba(22,25,26,.1)] dark:border-white/10 rounded-[24px] transition hover:-translate-y-[3px] hover:border-[rgba(57,151,70,.35)] dark:hover:border-[rgba(168,214,62,.3)] hover:shadow-[0_16px_40px_rgba(22,25,26,.08)] dark:hover:shadow-[0_16px_40px_rgba(0,0,0,.5)]"
                  >
                    <span className="flex items-center gap-3">
                      <ShoppingBag className="w-[18px] h-[18px] text-[#2f8b3d] dark:text-[#a8d63e]" />
                      <span className="text-[.88rem] font-medium text-[#16191a] dark:text-[#f1f3ea]">View Orders</span>
                    </span>
                    <ArrowRight className="w-4 h-4 text-[rgba(22,25,26,.42)] dark:text-[rgba(241,243,234,.42)]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/wishlist")}
                    className="group w-full flex items-center justify-between px-4 py-3.5 text-left bg-white dark:bg-[#141914] border border-[rgba(22,25,26,.1)] dark:border-white/10 rounded-[24px] transition hover:-translate-y-[3px] hover:border-[rgba(57,151,70,.35)] dark:hover:border-[rgba(168,214,62,.3)] hover:shadow-[0_16px_40px_rgba(22,25,26,.08)] dark:hover:shadow-[0_16px_40px_rgba(0,0,0,.5)]"
                  >
                    <span className="flex items-center gap-3">
                      <Heart className="w-[18px] h-[18px] text-[#2f8b3d] dark:text-[#a8d63e]" />
                      <span className="text-[.88rem] font-medium text-[#16191a] dark:text-[#f1f3ea]">View Wishlist</span>
                    </span>
                    <ArrowRight className="w-4 h-4 text-[rgba(22,25,26,.42)] dark:text-[rgba(241,243,234,.42)]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/change-password")}
                    className="group w-full flex items-center justify-between px-4 py-3.5 text-left bg-white dark:bg-[#141914] border border-[rgba(22,25,26,.1)] dark:border-white/10 rounded-[24px] transition hover:-translate-y-[3px] hover:border-[rgba(57,151,70,.35)] dark:hover:border-[rgba(168,214,62,.3)] hover:shadow-[0_16px_40px_rgba(22,25,26,.08)] dark:hover:shadow-[0_16px_40px_rgba(0,0,0,.5)]"
                  >
                    <span className="flex items-center gap-3">
                      <Lock className="w-[18px] h-[18px] text-[#2f8b3d] dark:text-[#a8d63e]" />
                      <span className="text-[.88rem] font-medium text-[#16191a] dark:text-[#f1f3ea]">Change Password</span>
                    </span>
                    <ArrowRight className="w-4 h-4 text-[rgba(22,25,26,.42)] dark:text-[rgba(241,243,234,.42)]" />
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center justify-between px-4 py-3.5 text-left rounded-[24px] border border-[rgba(220,70,70,.3)] text-[#d94646] bg-[rgba(220,70,70,.06)] transition hover:-translate-y-0.5"
                  >
                    <span className="flex items-center gap-3">
                      <LogOut className="w-[18px] h-[18px]" />
                      <span className="text-[.88rem] font-medium">Logout</span>
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
