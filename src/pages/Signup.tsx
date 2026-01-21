import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, AlertCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import EmailVerificationModal from "@/components/EmailVerificationModal";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export default function Signup() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [formData, setFormData] = useState({
    // Customer Type
    customerType: "Retail",
    // Personal Details
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    // Business Details (Trade Only)
    companyName: "",
    vatNumber: "",
    companyRegistration: "",
    businessType: "",
    tradeDocs: null as File | null,
    // Procurement & Preferences (Trade Only)
    poNumber: "",
    procurementContact: "",
    monthlyStatementPreference: false,
    // Billing Address
    billingAddress: "",
    billingCity: "",
    billingProvince: "",
    billingPostalCode: "",
    // Delivery Address
    sameAsDelivery: true,
    deliveryAddress: "",
    deliveryCity: "",
    deliveryProvince: "",
    deliveryPostalCode: "",
    // Agreement
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
    setError("");
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Passwords do not match!",
      });
      return;
    }

    if (!formData.agreeTerms) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please agree to terms and conditions",
      });
      return;
    }

    setIsLoading(true);
    
    // Build FormData for multipart submission (includes file upload)
    const formDataToSend = new FormData();
    
    // Personal Details
    formDataToSend.append('first_name', formData.firstName);
    formDataToSend.append('last_name', formData.lastName);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('phone', formData.phone);
    formDataToSend.append('password', formData.password);
    formDataToSend.append('confirm_password', formData.confirmPassword);
    
    // Customer Type
    formDataToSend.append('customer_type', formData.customerType);
    
    // Billing Address (only required for Trade)
    if (formData.customerType === "Trade") {
      formDataToSend.append('billing_address', formData.billingAddress);
      formDataToSend.append('billing_city', formData.billingCity);
      formDataToSend.append('billing_province', formData.billingProvince);
      formDataToSend.append('billing_postal_code', formData.billingPostalCode);
    } else {
      // Optional for Retail
      if (formData.billingAddress) {
        formDataToSend.append('billing_address', formData.billingAddress);
        formDataToSend.append('billing_city', formData.billingCity);
        formDataToSend.append('billing_province', formData.billingProvince);
        formDataToSend.append('billing_postal_code', formData.billingPostalCode);
      }
    }

    // Delivery Address
    formDataToSend.append('same_as_billing', String(formData.sameAsDelivery));
    // Only send delivery address fields if NOT same as billing
    if (!formData.sameAsDelivery) {
      formDataToSend.append('delivery_address', formData.deliveryAddress);
      formDataToSend.append('delivery_city', formData.deliveryCity);
      formDataToSend.append('delivery_province', formData.deliveryProvince);
      formDataToSend.append('delivery_postal_code', formData.deliveryPostalCode);
    }

    // Business Details (Trade Only)
    if (formData.customerType === "Trade") {
      formDataToSend.append('company_name', formData.companyName);
      formDataToSend.append('vat_number', formData.vatNumber);
      formDataToSend.append('company_registration', formData.companyRegistration);
      formDataToSend.append('business_type', formData.businessType);
      
      // Trade Documents (optional)
      if (formData.tradeDocs) {
        formDataToSend.append('trade_docs', formData.tradeDocs);
      }
      
      // Procurement Details
      formDataToSend.append('po_number', formData.poNumber);
      formDataToSend.append('procurement_contact', formData.procurementContact);
      formDataToSend.append('monthly_statement_preference', formData.monthlyStatementPreference ? 'true' : 'false');
    } else {
      // For Retail, still send the preference
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
        // Handle field-specific errors
        let errorMessage = 'Registration failed. Please check your information.';
        
        // Check for errors object (field validation errors)
        if (data?.errors && typeof data.errors === 'object') {
          const errorMessages: string[] = [];
          for (const [field, messages] of Object.entries(data.errors)) {
            if (Array.isArray(messages)) {
              errorMessages.push(...messages.map(m => String(m)));
            } else if (typeof messages === 'string') {
              errorMessages.push(messages);
            } else if (messages && typeof messages === 'object') {
              // Handle nested error objects
              const msg = String(Object.values(messages)[0]);
              if (msg) errorMessages.push(msg);
            }
          }
          if (errorMessages.length > 0) {
            errorMessage = errorMessages.join(' | ');
          }
        }
        
        // Check for detail field (general error message)
        if (data?.detail && errorMessage === 'Registration failed. Please check your information.') {
          errorMessage = String(data.detail);
        }
        
        // Check for non-field errors array
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

      // Success - show verification modal
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
      // Auto-login for registration verification
      login(tokens.user, tokens.access, tokens.refresh);
      navigate("/");
    } else {
      // For other flows, navigate as needed
      navigate("/");
    }
  };

  const handleVerificationCancel = () => {
    setShowVerification(false);
  };

  return (
    <div className="min-h-screen bg-gray-50/30 flex flex-col font-sans">
      <section className="flex-1 py-20 px-4">
        <div className="container mx-auto max-w-md">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-700">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-lime-400 px-8 py-12 text-white text-center">
              <h1 className="text-3xl font-display font-bold mb-2">Create Account</h1>
              <p className="text-green-50">Join us for the best electrical supplies</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Customer Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Customer Type <span className="text-red-600">*</span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="customerType"
                      value="Retail"
                      checked={formData.customerType === "Retail"}
                      onChange={handleChange}
                      className="w-4 h-4 accent-green-600"
                    />
                    <span className="text-sm text-gray-700">Retail</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="customerType"
                      value="Trade"
                      checked={formData.customerType === "Trade"}
                      onChange={handleChange}
                      className="w-4 h-4 accent-green-600"
                    />
                    <span className="text-sm text-gray-700">Trade (Business)</span>
                  </label>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200"></div>

              {/* Personal Details Section */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Personal Details</h3>
                
                {/* Name Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <Input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="John"
                        className="pl-10 h-11 text-sm rounded-lg border-gray-200"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <Input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Doe"
                        className="pl-10 h-11 text-sm rounded-lg border-gray-200"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      className="pl-10 h-11 text-sm rounded-lg border-gray-200"
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+27 71 234 5678"
                      className="pl-10 h-11 text-sm rounded-lg border-gray-200"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200"></div>

              {/* Business Details Section - Trade Only */}
              {formData.customerType === "Trade" && (
                <>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Business Details</h3>
                    
                    {/* Company Name */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Name <span className="text-red-600">*</span>
                      </label>
                      <Input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        placeholder="Your Company Ltd"
                        className="h-11 text-sm rounded-lg border-gray-200"
                        required
                      />
                    </div>

                    {/* VAT Number */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        VAT Number <span className="text-gray-500">(Optional)</span>
                      </label>
                      <Input
                        type="text"
                        name="vatNumber"
                        value={formData.vatNumber}
                        onChange={handleChange}
                        placeholder="e.g., 4123456789"
                        className="h-11 text-sm rounded-lg border-gray-200"
                      />
                    </div>

                    {/* Company Registration Number */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Registration Number (CIPC) <span className="text-red-600">*</span>
                      </label>
                      <Input
                        type="text"
                        name="companyRegistration"
                        value={formData.companyRegistration}
                        onChange={handleChange}
                        placeholder="e.g., 2023/123456"
                        className="h-11 text-sm rounded-lg border-gray-200"
                        required
                      />
                    </div>

                    {/* Business Type */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Type <span className="text-red-600">*</span>
                      </label>
                      <select
                        name="businessType"
                        value={formData.businessType}
                        onChange={handleChange}
                        className="w-full h-11 rounded-lg border border-gray-200 px-3 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      >
                        <option value="">Select a business type</option>
                        <option value="electrician">Electrician</option>
                        <option value="contractor">Contractor</option>
                        <option value="reseller">Reseller</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {/* Upload Trade Docs */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Trade Documents <span className="text-gray-500">(Optional)</span>
                      </label>
                      <input
                        type="file"
                        name="tradeDocs"
                        onChange={handleFileChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      />
                      <p className="text-xs text-gray-500 mt-1">Accepted formats: PDF, DOC, DOCX, JPG, PNG</p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-200"></div>

                  {/* Procurement & Preferences Section */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Procurement & Preferences</h3>
                    
                    {/* PO Number */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        PO Number <span className="text-red-600">*</span>
                      </label>
                      <Input
                        type="text"
                        name="poNumber"
                        value={formData.poNumber}
                        onChange={handleChange}
                        placeholder="e.g., PO-2026-001"
                        className="h-11 text-sm rounded-lg border-gray-200"
                        required
                      />
                    </div>

                    {/* Procurement Contact */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Procurement Contact <span className="text-red-600">*</span>
                      </label>
                      <Input
                        type="text"
                        name="procurementContact"
                        value={formData.procurementContact}
                        onChange={handleChange}
                        placeholder="Contact person name or title"
                        className="h-11 text-sm rounded-lg border-gray-200"
                        required
                      />
                    </div>

                    {/* Monthly Statement Preference */}
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="monthlyStatement"
                        name="monthlyStatementPreference"
                        checked={formData.monthlyStatementPreference}
                        onCheckedChange={(checked) =>
                          setFormData(prev => ({ ...prev, monthlyStatementPreference: checked as boolean }))
                        }
                      />
                      <label htmlFor="monthlyStatement" className="text-sm text-gray-700 cursor-pointer">
                        Request monthly statement
                      </label>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-200"></div>
                </>
              )}

              {/* Billing Address Section */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">
                  Billing Address
                </h3>
                
                {/* Billing Address */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address {formData.customerType === "Trade" && <span className="text-red-600">*</span>}
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input
                      type="text"
                      name="billingAddress"
                      value={formData.billingAddress}
                      onChange={handleChange}
                      placeholder="123 Main Street"
                      className="pl-10 h-11 text-sm rounded-lg border-gray-200"
                      required={formData.customerType === "Trade"}
                    />
                  </div>
                </div>

                {/* Billing City, Province, Postal Code */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City {formData.customerType === "Trade" && <span className="text-red-600">*</span>}
                    </label>
                    <Input
                      type="text"
                      name="billingCity"
                      value={formData.billingCity}
                      onChange={handleChange}
                      placeholder="Cape Town"
                      className="h-11 text-sm rounded-lg border-gray-200"
                      required={formData.customerType === "Trade"}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Province {formData.customerType === "Trade" && <span className="text-red-600">*</span>}
                    </label>
                    <select
                      name="billingProvince"
                      value={formData.billingProvince}
                      onChange={handleChange}
                      className="w-full h-11 rounded-lg border border-gray-200 px-3 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Postal Code {formData.customerType === "Trade" && <span className="text-red-600">*</span>}
                    </label>
                    <Input
                      type="text"
                      name="billingPostalCode"
                      value={formData.billingPostalCode}
                      onChange={handleChange}
                      placeholder="8000"
                      className="h-11 text-sm rounded-lg border-gray-200"
                      required={formData.customerType === "Trade"}
                    />
                  </div>
                </div>

                {/* Same as Delivery Checkbox */}
                <div className="flex items-center gap-3 pt-2">
                  <Checkbox
                    id="sameAsDelivery"
                    name="sameAsDelivery"
                    checked={formData.sameAsDelivery}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({ ...prev, sameAsDelivery: checked as boolean }))
                    }
                  />
                  <label htmlFor="sameAsDelivery" className="text-sm text-gray-700 cursor-pointer">
                    Delivery address is the same as billing address
                  </label>
                </div>
              </div>

              {/* Delivery Address Section - Conditional */}
              {!formData.sameAsDelivery && (
                <>
                  {/* Divider */}
                  <div className="border-t border-gray-200"></div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Delivery Address</h3>
                    
                    {/* Delivery Address */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <Input
                          type="text"
                          name="deliveryAddress"
                          value={formData.deliveryAddress}
                          onChange={handleChange}
                          placeholder="456 Delivery Street"
                          className="pl-10 h-11 text-sm rounded-lg border-gray-200"
                        />
                      </div>
                    </div>

                    {/* Delivery City, Province, Postal Code */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City
                        </label>
                        <Input
                          type="text"
                          name="deliveryCity"
                          value={formData.deliveryCity}
                          onChange={handleChange}
                          placeholder="Johannesburg"
                          className="h-11 text-sm rounded-lg border-gray-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Province
                        </label>
                        <select
                          name="deliveryProvince"
                          value={formData.deliveryProvince}
                          onChange={handleChange}
                          className="w-full h-11 rounded-lg border border-gray-200 px-3 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Postal Code
                        </label>
                        <Input
                          type="text"
                          name="deliveryPostalCode"
                          value={formData.deliveryPostalCode}
                          onChange={handleChange}
                          placeholder="8000"
                          className="h-11 text-sm rounded-lg border-gray-200"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-200"></div>
                </>
              )}

              {/* Password Section */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Security</h3>
                
                {/* Password */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="pl-10 pr-10 h-11 text-sm rounded-lg border-gray-200"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="pl-10 pr-10 h-11 text-sm rounded-lg border-gray-200"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
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

              {/* Divider */}
              <div className="border-t border-gray-200"></div>

              {/* Terms Checkbox */}
              <div className="flex items-center gap-3 pt-2">
                <Checkbox
                  id="terms"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onCheckedChange={(checked) =>
                    setFormData(prev => ({ ...prev, agreeTerms: checked as boolean }))
                  }
                />
                <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
                  I agree to the{" "}
                  <a href="#" className="text-green-600 hover:underline font-medium">
                    Terms & Conditions
                  </a>
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary-gradient border-0 text-white font-semibold h-11 rounded-lg hover:opacity-90 transition-smooth mt-6"
              >
                {isLoading ? "Creating Account..." : "Sign Up"}
              </Button>
            </form>

            <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 text-center">
              <p className="text-gray-600 text-sm">
                Already have an account?{" "}
                <Link to="/login" className="text-green-600 hover:text-green-700 font-semibold">
                  Sign In
                </Link>
              </p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center text-sm text-gray-500 animate-in fade-in" style={{animationDelay: '0.3s'}}>
            <p>By signing up, you agree to our privacy policy and terms of service</p>
          </div>
        </div>
      </section>

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
