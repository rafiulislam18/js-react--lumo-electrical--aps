import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, Loader, UserPlus } from "lucide-react";
import EmailVerificationModal from "@/components/EmailVerificationModal";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000/api';

export default function Signup() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [formData, setFormData] = useState({
    customerType: "Retail",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    vatNumber: "",
    companyRegistration: "",
    businessType: "",
    tradeDocs: null as File | null,
    poNumber: "",
    procurementContact: "",
    monthlyStatementPreference: false,
    billingAddress: "",
    billingCity: "",
    billingProvince: "",
    billingPostalCode: "",
    sameAsDelivery: true,
    deliveryAddress: "",
    deliveryCity: "",
    deliveryProvince: "",
    deliveryPostalCode: "",
    agreeTerms: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      tradeDocs: file
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Passwords do not match!",
      });
      return;
    }

    setIsLoading(true);

    const formDataToSend = new FormData();

    formDataToSend.append('first_name', formData.firstName);
    formDataToSend.append('last_name', formData.lastName);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('phone', formData.phone);
    formDataToSend.append('password', formData.password);
    formDataToSend.append('confirm_password', formData.confirmPassword);

    formDataToSend.append('customer_type', formData.customerType);

    if (formData.customerType === "Trade") {
      formDataToSend.append('billing_address', formData.billingAddress);
      formDataToSend.append('billing_city', formData.billingCity);
      formDataToSend.append('billing_province', formData.billingProvince);
      formDataToSend.append('billing_postal_code', formData.billingPostalCode);
    } else {
      if (formData.billingAddress) {
        formDataToSend.append('billing_address', formData.billingAddress);
        formDataToSend.append('billing_city', formData.billingCity);
        formDataToSend.append('billing_province', formData.billingProvince);
        formDataToSend.append('billing_postal_code', formData.billingPostalCode);
      }
    }

    formDataToSend.append('same_as_billing', String(formData.sameAsDelivery));
    if (!formData.sameAsDelivery) {
      formDataToSend.append('delivery_address', formData.deliveryAddress);
      formDataToSend.append('delivery_city', formData.deliveryCity);
      formDataToSend.append('delivery_province', formData.deliveryProvince);
      formDataToSend.append('delivery_postal_code', formData.deliveryPostalCode);
    }

    if (formData.customerType === "Trade") {
      formDataToSend.append('company_name', formData.companyName);
      formDataToSend.append('vat_number', formData.vatNumber);
      formDataToSend.append('company_registration', formData.companyRegistration);
      formDataToSend.append('business_type', formData.businessType);

      if (formData.tradeDocs) {
        formDataToSend.append('trade_docs', formData.tradeDocs);
      }

      formDataToSend.append('po_number', formData.poNumber);
      formDataToSend.append('procurement_contact', formData.procurementContact);
      formDataToSend.append('monthly_statement_preference', formData.monthlyStatementPreference ? 'true' : 'false');
    } else {
      formDataToSend.append('monthly_statement_preference', formData.monthlyStatementPreference ? 'true' : 'false');
    }

    try {
      const response = await fetch(`${API_URL}/users/register/`, {
        method: 'POST',
        body: formDataToSend
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        console.error('Failed to parse response:', e);
        throw new Error('Invalid response from server');
      }

      console.log('Backend Response:', { status: response.status, data });

      if (!response.ok) {
        let errorMessage = 'Registration failed. Please check your information.';

        if (data?.errors && typeof data.errors === 'object') {
          const errorMessages: string[] = [];
          for (const messages of Object.values(data.errors)) {
            if (Array.isArray(messages)) {
              errorMessages.push(...messages.map(m => String(m)));
            } else if (typeof messages === 'string') {
              errorMessages.push(messages);
            } else if (messages && typeof messages === 'object') {
              const msg = String(Object.values(messages)[0]);
              if (msg) errorMessages.push(msg);
            }
          }
          if (errorMessages.length > 0) {
            errorMessage = errorMessages.join(' | ');
          }
        }

        if (data?.detail && errorMessage === 'Registration failed. Please check your information.') {
          errorMessage = String(data.detail);
        }

        if (data?.non_field_errors && Array.isArray(data.non_field_errors)) {
          const nonFieldErrors = data.non_field_errors.map((e: any) => String(e)).join(' | ');
          if (nonFieldErrors) {
            errorMessage = nonFieldErrors;
          }
        }

        console.error('Error details:', {
          status: response.status,
          errorMessage,
          fullData: data
        });

        toast({
          variant: "destructive",
          title: "Registration Error",
          description: errorMessage,
        });
        setIsLoading(false);
        return;
      }

      setVerificationEmail(formData.email);
      setShowVerification(true);
      toast({
        title: "Verify Your Email",
        description: "Please verify your email to complete your registration.",
        className: "bg-green-600 text-white border-green-700",
      });
      setIsLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      console.error('Registration error:', err);

      toast({
        variant: "destructive",
        title: "Network Error",
        description: errorMessage || "Please check your connection and try again.",
      });
      setIsLoading(false);
    }
  };

  const handleVerificationSuccess = (tokens?: { access: string; refresh: string; user: any }) => {
    setShowVerification(false);

    if (tokens) {
      login(tokens.user, tokens.access, tokens.refresh);
      navigate("/");
    } else {
      navigate("/");
    }
  };

  const handleVerificationCancel = () => {
    setShowVerification(false);
  };

  const inputCls = "w-full px-[.9rem] py-[.8rem] text-[.85rem] bg-white dark:bg-[#141914] border border-[rgba(22,25,26,.1)] dark:border-white/10 rounded-[10px] text-[#16191a] dark:text-[#f1f3ea] placeholder-[rgba(22,25,26,.42)] dark:placeholder-[rgba(241,243,234,.42)] outline-none focus:border-[rgba(57,151,70,.4)] transition-colors";
  const labelCls = "block text-[.8rem] font-medium text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)] mb-2";
  const sectionTitleCls = "font-semibold text-[.92rem] text-[#16191a] dark:text-[#f1f3ea] mb-4";
  const dividerCls = "border-t border-[rgba(22,25,26,.07)] dark:border-white/[.07]";
  const optionCls = "bg-white dark:bg-[#141914] text-[#16191a] dark:text-[#f1f3ea]"

  return (
    <div className="font-outfit bg-[#f6f5f0] dark:bg-[#0a0c0a] min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Header */}
      <div className="w-full max-w-[640px] text-center mb-7">
        {/* <img src="/images/logo.png" alt="Lumo Electrical" className="h-9 mx-auto mb-5 block dark:hidden" />
        <img src="/images/logo-light.png" alt="Lumo Electrical" className="h-9 mx-auto mb-5 hidden dark:block" /> */}
        <div className="flex justify-center mb-3">
          <div className="inline-flex items-center gap-2 text-[.68rem] font-bold tracking-[.2em] uppercase text-[#2f8b3d] dark:text-[#a8d63e] before:content-[''] before:w-6 before:h-0.5 before:bg-[#2f8b3d] dark:before:bg-[#a8d63e] before:rounded-sm before:shrink-0">
            Join Lumo
          </div>
        </div>
        <h1 className="font-bebas text-[2.6rem] leading-none text-[#16191a] dark:text-[#f1f3ea]">
          Create Account
        </h1>
        <p className="text-[.9rem] mt-1.5 text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)]">
          Join us for premium electrical supplies
        </p>
      </div>

      {/* Form Card */}
      <div className="w-full max-w-[640px]">
        <div className="bg-white dark:bg-[#141914] border border-[rgba(22,25,26,.1)] dark:border-white/10 rounded-[24px] overflow-hidden">
          {/* Form */}
          <form onSubmit={handleSubmit} className="p-7 sm:p-8 space-y-6">

            {/* Customer Type Selection */}
            <div>
              <label className={labelCls}>Customer Type <span className="text-[#d94646]">*</span></label>
              <div className="flex rounded-full p-0.5 w-fit bg-[#f3f1ea] dark:bg-[#10150f] border border-[rgba(22,25,26,.1)] dark:border-white/10">
                <button
                  type="button"
                  onClick={() => handleChange({ target: { name: "customerType", value: "Retail", type: "radio" } } as unknown as React.ChangeEvent<HTMLInputElement>)}
                  className={`px-4 py-1.5 rounded-full text-[.8rem] font-semibold transition-colors ${
                    formData.customerType === "Retail"
                      ? "bg-white dark:bg-[#141914] text-[#2f8b3d] dark:text-[#a8d63e] shadow-[0_1px_3px_rgba(0,0,0,.08)]"
                      : "bg-transparent text-[rgba(22,25,26,.42)] dark:text-[rgba(241,243,234,.42)]"
                  }`}
                >
                  Retail
                </button>
                <button
                  type="button"
                  onClick={() => handleChange({ target: { name: "customerType", value: "Trade", type: "radio" } } as unknown as React.ChangeEvent<HTMLInputElement>)}
                  className={`px-4 py-1.5 rounded-full text-[.8rem] font-semibold transition-colors ${
                    formData.customerType === "Trade"
                      ? "bg-white dark:bg-[#141914] text-[#2f8b3d] dark:text-[#a8d63e] shadow-[0_1px_3px_rgba(0,0,0,.08)]"
                      : "bg-transparent text-[rgba(22,25,26,.42)] dark:text-[rgba(241,243,234,.42)]"
                  }`}
                >
                  Trade (Business)
                </button>
              </div>
            </div>

            <div className={dividerCls}></div>

            {/* Personal Details */}
            <div>
              <h3 className={sectionTitleCls}>Personal Details</h3>

              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className={labelCls}>First Name <span className="text-[#d94646]">*</span></label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[rgba(22,25,26,.42)] dark:text-[rgba(241,243,234,.42)]" />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="John"
                      className={`pl-10 ${inputCls}`}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Last Name <span className="text-[#d94646]">*</span></label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[rgba(22,25,26,.42)] dark:text-[rgba(241,243,234,.42)]" />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Doe"
                      className={`pl-10 ${inputCls}`}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="mb-4">
                <label className={labelCls}>Email Address <span className="text-[#d94646]">*</span></label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[rgba(22,25,26,.42)] dark:text-[rgba(241,243,234,.42)]" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className={`pl-10 ${inputCls}`}
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className={labelCls}>Phone Number <span className="text-[#d94646]">*</span></label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[rgba(22,25,26,.42)] dark:text-[rgba(241,243,234,.42)]" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+27 71 234 5678"
                    className={`pl-10 ${inputCls}`}
                    required
                  />
                </div>
              </div>
            </div>

            <div className={dividerCls}></div>

            {/* Business Details - Trade Only */}
            {formData.customerType === "Trade" && (
              <>
                <div>
                  <h3 className={sectionTitleCls}>Business Details</h3>

                  <div className="mb-4">
                    <label className={labelCls}>Company Name <span className="text-[#d94646]">*</span></label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      placeholder="Your Company Ltd"
                      className={inputCls}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className={labelCls}>VAT Number <span className="font-normal text-[rgba(22,25,26,.42)] dark:text-[rgba(241,243,234,.42)]">(Optional)</span></label>
                    <input
                      type="text"
                      name="vatNumber"
                      value={formData.vatNumber}
                      onChange={handleChange}
                      placeholder="e.g., 4123456789"
                      className={inputCls}
                    />
                  </div>

                  <div className="mb-4">
                    <label className={labelCls}>Company Registration (CIPC) <span className="text-[#d94646]">*</span></label>
                    <input
                      type="text"
                      name="companyRegistration"
                      value={formData.companyRegistration}
                      onChange={handleChange}
                      placeholder="e.g., 2023/123456"
                      className={inputCls}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className={labelCls}>Business Type <span className="text-[#d94646]">*</span></label>
                    <select
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleChange}
                      className={inputCls}
                      required
                    >
                      <option value="" className={`${optionCls} text-black/40 dark:text-white/30`}>Select a business type</option>
                      <option value="electrician" className={optionCls}>Electrician</option>
                      <option value="contractor" className={optionCls}>Contractor</option>
                      <option value="reseller" className={optionCls}>Reseller</option>
                      <option value="other" className={optionCls}>Other</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelCls}>Upload Trade Documents <span className="font-normal text-[rgba(22,25,26,.42)] dark:text-[rgba(241,243,234,.42)]">(Optional)</span></label>
                    <label className="cursor-pointer bg-[#f7f6f1] dark:bg-[#171c16] border border-[rgba(22,25,26,.07)] dark:border-white/[.06] rounded-[14px] p-3.5 flex items-center justify-between gap-3">
                      <span className="text-[.85rem] truncate text-[rgba(22,25,26,.42)] dark:text-[rgba(241,243,234,.42)]">
                        {formData.tradeDocs ? formData.tradeDocs.name : "No file chosen"}
                      </span>
                      <span className="shrink-0 inline-flex items-center justify-center rounded-full border border-[rgba(22,25,26,.14)] dark:border-white/15 py-1.5 px-3 text-[.78rem] font-semibold text-[#16191a] dark:text-[#f1f3ea]">
                        Choose file
                      </span>
                      <input
                        type="file"
                        name="tradeDocs"
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      />
                    </label>
                    <p className="text-[.7rem] text-[rgba(22,25,26,.42)] dark:text-[rgba(241,243,234,.42)] mt-1.5">Accepted: PDF, DOC, DOCX, JPG, PNG</p>
                  </div>
                </div>

                <div className={dividerCls}></div>

                {/* Procurement & Preferences */}
                <div>
                  <h3 className={sectionTitleCls}>Procurement & Preferences</h3>

                  <div className="mb-4">
                    <label className={labelCls}>PO Number <span className="text-[#d94646]">*</span></label>
                    <input
                      type="text"
                      name="poNumber"
                      value={formData.poNumber}
                      onChange={handleChange}
                      placeholder="e.g., PO-2026-001"
                      className={inputCls}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className={labelCls}>Procurement Contact <span className="text-[#d94646]">*</span></label>
                    <input
                      type="text"
                      name="procurementContact"
                      value={formData.procurementContact}
                      onChange={handleChange}
                      placeholder="Contact person name or title"
                      className={inputCls}
                      required
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="monthlyStatement"
                      name="monthlyStatementPreference"
                      checked={formData.monthlyStatementPreference}
                      onChange={handleChange}
                      className="w-4 h-4 rounded accent-[#3aaa49] cursor-pointer"
                    />
                    <label htmlFor="monthlyStatement" className="text-[.8rem] text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)] cursor-pointer">
                      Request monthly statement
                    </label>
                  </div>
                </div>

                <div className={dividerCls}></div>
              </>
            )}

            {/* Billing Address */}
            <div>
              <h3 className={sectionTitleCls}>Billing Address</h3>

              <div className="mb-4">
                <label className={labelCls}>Address {formData.customerType === "Trade" && <span className="text-[#d94646]">*</span>}</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[rgba(22,25,26,.42)] dark:text-[rgba(241,243,234,.42)]" />
                  <input
                    type="text"
                    name="billingAddress"
                    value={formData.billingAddress}
                    onChange={handleChange}
                    placeholder="123 Main Street"
                    className={`pl-10 ${inputCls}`}
                    required={formData.customerType === "Trade"}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className={labelCls}>City {formData.customerType === "Trade" && <span className="text-[#d94646]">*</span>}</label>
                  <input
                    type="text"
                    name="billingCity"
                    value={formData.billingCity}
                    onChange={handleChange}
                    placeholder="Cape Town"
                    className={inputCls}
                    required={formData.customerType === "Trade"}
                  />
                </div>
                <div>
                  <label className={labelCls}>Province {formData.customerType === "Trade" && <span className="text-[#d94646]">*</span>}</label>
                  <select
                    name="billingProvince"
                    value={formData.billingProvince}
                    onChange={handleChange}
                    className={inputCls}
                    required={formData.customerType === "Trade"}
                  >
                    <option value="" className={`${optionCls} text-black/40 dark:text-white/30`}>Select a province</option>
                    <option value="Eastern Cape" className={optionCls}>Eastern Cape</option>
                    <option value="Free State" className={optionCls}>Free State</option>
                    <option value="Gauteng" className={optionCls}>Gauteng</option>
                    <option value="KwaZulu-Natal" className={optionCls}>KwaZulu-Natal</option>
                    <option value="Limpopo" className={optionCls}>Limpopo</option>
                    <option value="Mpumalanga" className={optionCls}>Mpumalanga</option>
                    <option value="Northern Cape" className={optionCls}>Northern Cape</option>
                    <option value="North West" className={optionCls}>North West</option>
                    <option value="Western Cape" className={optionCls}>Western Cape</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Postal Code {formData.customerType === "Trade" && <span className="text-[#d94646]">*</span>}</label>
                  <input
                    type="text"
                    name="billingPostalCode"
                    value={formData.billingPostalCode}
                    onChange={handleChange}
                    placeholder="8000"
                    className={inputCls}
                    required={formData.customerType === "Trade"}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="sameAsDelivery"
                  name="sameAsDelivery"
                  checked={formData.sameAsDelivery}
                  onChange={handleChange}
                  className="w-4 h-4 rounded accent-[#3aaa49] cursor-pointer"
                />
                <label htmlFor="sameAsDelivery" className="text-[.8rem] text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)] cursor-pointer">
                  Delivery address is the same as billing address
                </label>
              </div>
            </div>

            {/* Delivery Address - Conditional */}
            {!formData.sameAsDelivery && (
              <>
                <div className={dividerCls}></div>

                <div>
                  <h3 className={sectionTitleCls}>Delivery Address</h3>

                  <div className="mb-4">
                    <label className={labelCls}>Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[rgba(22,25,26,.42)] dark:text-[rgba(241,243,234,.42)]" />
                      <input
                        type="text"
                        name="deliveryAddress"
                        value={formData.deliveryAddress}
                        onChange={handleChange}
                        placeholder="456 Delivery Street"
                        className={`pl-10 ${inputCls}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className={labelCls}>City</label>
                      <input
                        type="text"
                        name="deliveryCity"
                        value={formData.deliveryCity}
                        onChange={handleChange}
                        placeholder="Johannesburg"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Province</label>
                      <select
                        name="deliveryProvince"
                        value={formData.deliveryProvince}
                        onChange={handleChange}
                        className={inputCls}
                      >
                        <option value="" className={`${optionCls} text-black/40 dark:text-white/30`}>Select a province</option>
                        <option value="Eastern Cape" className={optionCls}>Eastern Cape</option>
                        <option value="Free State" className={optionCls}>Free State</option>
                        <option value="Gauteng" className={optionCls}>Gauteng</option>
                        <option value="KwaZulu-Natal" className={optionCls}>KwaZulu-Natal</option>
                        <option value="Limpopo" className={optionCls}>Limpopo</option>
                        <option value="Mpumalanga" className={optionCls}>Mpumalanga</option>
                        <option value="Northern Cape" className={optionCls}>Northern Cape</option>
                        <option value="North West" className={optionCls}>North West</option>
                        <option value="Western Cape" className={optionCls}>Western Cape</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Postal Code</label>
                      <input
                        type="text"
                        name="deliveryPostalCode"
                        value={formData.deliveryPostalCode}
                        onChange={handleChange}
                        placeholder="8000"
                        className={inputCls}
                      />
                    </div>
                  </div>
                </div>

                <div className={dividerCls}></div>
              </>
            )}

            {/* Security */}
            <div>
              <h3 className={sectionTitleCls}>Security</h3>

              <div className="mb-4">
                <label className={labelCls}>Password <span className="text-[#d94646]">*</span></label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[rgba(22,25,26,.42)] dark:text-[rgba(241,243,234,.42)]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`pl-10 pr-10 ${inputCls}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgba(22,25,26,.42)] dark:text-[rgba(241,243,234,.42)] hover:text-[rgba(22,25,26,.7)] dark:hover:text-[rgba(241,243,234,.7)] transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-[18px] h-[18px]" />
                    ) : (
                      <Eye className="w-[18px] h-[18px]" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className={labelCls}>Confirm Password <span className="text-[#d94646]">*</span></label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[rgba(22,25,26,.42)] dark:text-[rgba(241,243,234,.42)]" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`pl-10 pr-10 ${inputCls}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgba(22,25,26,.42)] dark:text-[rgba(241,243,234,.42)] hover:text-[rgba(22,25,26,.7)] dark:hover:text-[rgba(241,243,234,.7)] transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-[18px] h-[18px]" />
                    ) : (
                      <Eye className="w-[18px] h-[18px]" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 font-semibold rounded-full px-6 py-[.8rem] bg-gradient-to-r from-[#399746] to-[#a8d63e] text-white dark:text-[#0a0c0a] text-[.9rem] transition-all duration-200 hover:shadow-[0_0_16px_rgba(168,214,62,.4)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" /> Sign Up
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="px-8 py-5 bg-[#f3f1ea] dark:bg-[#10150f] border-t border-[rgba(22,25,26,.07)] dark:border-white/[.07] text-center">
            <p className="text-[.8rem] text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)]">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-[#2f8b3d] dark:text-[#a8d63e] hover:opacity-80 transition-opacity">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Email Verification Modal */}
      {showVerification && (
        <EmailVerificationModal
          email={verificationEmail}
          tokenType="registration"
          onSuccess={handleVerificationSuccess}
          onCancel={handleVerificationCancel}
        />
      )}
    </div>
  );
}
