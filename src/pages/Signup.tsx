import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, Loader } from "lucide-react";
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

  const inputCls = "w-full px-4 py-3 text-[.85rem] bg-white dark:bg-black/[.05] border border-black/[.1] dark:border-white/[.08] rounded-lg text-black/80 dark:text-[rgba(240,242,237,.8)] placeholder-black/40 dark:placeholder-[rgba(240,242,237,.4)] focus:outline-none focus:border-lime-brand/30 focus:bg-lime-brand/[.05] dark:focus:bg-lime-brand/[.05] transition-all duration-150";
  const labelCls = "block text-[.8rem] font-medium text-black/70 dark:text-[rgba(240,242,237,.7)] mb-2";
  const sectionTitleCls = "text-[.9rem] font-semibold text-black/80 dark:text-[rgba(240,242,237,.8)] mb-4";
  const dividerCls = "border-t border-black/[.08] dark:border-white/[.06]";

  return (
    <div className="font-outfit bg-white dark:bg-dark-surface min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Header */}
      <div className="mb-8 text-center max-w-md">
        <h1 className="font-bebas text-[2.5rem] tracking-[.08em] text-black/85 dark:text-[#f0f2ed] mb-2">
          Create Account
        </h1>
        <p className="text-[.9rem] text-black/55 dark:text-[rgba(240,242,237,.55)]">
          Join us for premium electrical supplies
        </p>
      </div>

      {/* Form Card */}
      <div className="w-full max-w-2xl">
        <div className="bg-white dark:bg-black/[.02] rounded-xl border border-black/[.08] dark:border-white/[.06] overflow-hidden">
          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">

            {/* Customer Type Selection */}
            <div>
              <label className={labelCls}>Customer Type <span className="text-red-500">*</span></label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="customerType"
                    value="Retail"
                    checked={formData.customerType === "Retail"}
                    onChange={handleChange}
                    className="w-4 h-4 accent-lime-brand cursor-pointer"
                  />
                  <span className="text-[.85rem] text-black/70 dark:text-[rgba(240,242,237,.7)]">Retail</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="customerType"
                    value="Trade"
                    checked={formData.customerType === "Trade"}
                    onChange={handleChange}
                    className="w-4 h-4 accent-lime-brand cursor-pointer"
                  />
                  <span className="text-[.85rem] text-black/70 dark:text-[rgba(240,242,237,.7)]">Trade (Business)</span>
                </label>
              </div>
            </div>

            <div className={dividerCls}></div>

            {/* Personal Details */}
            <div>
              <h3 className={sectionTitleCls}>Personal Details</h3>

              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className={labelCls}>First Name <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40 dark:text-[rgba(240,242,237,.4)]" />
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
                  <label className={labelCls}>Last Name <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40 dark:text-[rgba(240,242,237,.4)]" />
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
                <label className={labelCls}>Email Address <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40 dark:text-[rgba(240,242,237,.4)]" />
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
                <label className={labelCls}>Phone Number <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40 dark:text-[rgba(240,242,237,.4)]" />
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
                    <label className={labelCls}>Company Name <span className="text-red-500">*</span></label>
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
                    <label className={labelCls}>VAT Number <span className="text-black/40 dark:text-[rgba(240,242,237,.4)]">(Optional)</span></label>
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
                    <label className={labelCls}>Company Registration (CIPC) <span className="text-red-500">*</span></label>
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
                    <label className={labelCls}>Business Type <span className="text-red-500">*</span></label>
                    <select
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleChange}
                      className={inputCls}
                      required
                    >
                      <option value="">Select a business type</option>
                      <option value="electrician">Electrician</option>
                      <option value="contractor">Contractor</option>
                      <option value="reseller">Reseller</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelCls}>Upload Trade Documents <span className="text-black/40 dark:text-[rgba(240,242,237,.4)]">(Optional)</span></label>
                    <input
                      type="file"
                      name="tradeDocs"
                      onChange={handleFileChange}
                      className={inputCls}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                    <p className="text-[.7rem] text-black/50 dark:text-[rgba(240,242,237,.5)] mt-1">Accepted: PDF, DOC, DOCX, JPG, PNG</p>
                  </div>
                </div>

                <div className={dividerCls}></div>

                {/* Procurement & Preferences */}
                <div>
                  <h3 className={sectionTitleCls}>Procurement & Preferences</h3>

                  <div className="mb-4">
                    <label className={labelCls}>PO Number <span className="text-red-500">*</span></label>
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
                    <label className={labelCls}>Procurement Contact <span className="text-red-500">*</span></label>
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
                      className="w-4 h-4 rounded accent-lime-brand cursor-pointer"
                    />
                    <label htmlFor="monthlyStatement" className="text-[.8rem] text-black/60 dark:text-[rgba(240,242,237,.6)] cursor-pointer">
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
                <label className={labelCls}>Address {formData.customerType === "Trade" && <span className="text-red-500">*</span>}</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40 dark:text-[rgba(240,242,237,.4)]" />
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
                  <label className={labelCls}>City {formData.customerType === "Trade" && <span className="text-red-500">*</span>}</label>
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
                  <label className={labelCls}>Province {formData.customerType === "Trade" && <span className="text-red-500">*</span>}</label>
                  <select
                    name="billingProvince"
                    value={formData.billingProvince}
                    onChange={handleChange}
                    className={inputCls}
                    required={formData.customerType === "Trade"}
                  >
                    <option value="">Select a province</option>
                    <option value="Eastern Cape">Eastern Cape</option>
                    <option value="Free State">Free State</option>
                    <option value="Gauteng">Gauteng</option>
                    <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                    <option value="Limpopo">Limpopo</option>
                    <option value="Mpumalanga">Mpumalanga</option>
                    <option value="Northern Cape">Northern Cape</option>
                    <option value="North West">North West</option>
                    <option value="Western Cape">Western Cape</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Postal Code {formData.customerType === "Trade" && <span className="text-red-500">*</span>}</label>
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
                  className="w-4 h-4 rounded accent-lime-brand cursor-pointer"
                />
                <label htmlFor="sameAsDelivery" className="text-[.8rem] text-black/60 dark:text-[rgba(240,242,237,.6)] cursor-pointer">
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
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40 dark:text-[rgba(240,242,237,.4)]" />
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
                        <option value="">Select a province</option>
                        <option value="Eastern Cape">Eastern Cape</option>
                        <option value="Free State">Free State</option>
                        <option value="Gauteng">Gauteng</option>
                        <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                        <option value="Limpopo">Limpopo</option>
                        <option value="Mpumalanga">Mpumalanga</option>
                        <option value="Northern Cape">Northern Cape</option>
                        <option value="North West">North West</option>
                        <option value="Western Cape">Western Cape</option>
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
                <label className={labelCls}>Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40 dark:text-[rgba(240,242,237,.4)]" />
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 dark:text-[rgba(240,242,237,.4)] hover:text-black/60 dark:hover:text-[rgba(240,242,237,.6)] transition-colors duration-150"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className={labelCls}>Confirm Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40 dark:text-[rgba(240,242,237,.4)]" />
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 dark:text-[rgba(240,242,237,.4)] hover:text-black/60 dark:hover:text-[rgba(240,242,237,.6)] transition-colors duration-150"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-lg bg-gradient-to-br from-green-brand to-lime-brand text-dark-surface font-semibold text-[.9rem] cursor-pointer transition-all duration-200 hover:shadow-[0_0_16px_rgba(168,214,62,.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
            >
              {isLoading ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Sign Up'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="px-8 py-5 bg-black/[.02] dark:bg-white/[.02] border-t border-black/[.08] dark:border-white/[.06] text-center">
            <p className="text-[.8rem] text-black/60 dark:text-[rgba(240,242,237,.6)]">
              Already have an account?{" "}
              <Link to="/login" className="text-lime-brand hover:text-lime-brand/80 font-semibold transition-colors duration-150">
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
