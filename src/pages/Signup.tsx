import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export default function Signup() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
    
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (!formData.agreeTerms) {
      alert("Please agree to terms and conditions");
      return;
    }

    setIsLoading(true);
    
    // Build submission object based on customer type
    const submissionData: any = {
      customerType: formData.customerType,
      // Personal Details
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      // Billing Address
      billingAddress: formData.billingAddress,
      billingCity: formData.billingCity,
      billingProvince: formData.billingProvince,
      billingPostalCode: formData.billingPostalCode,
    };

    // Add delivery address only if different from billing
    if (!formData.sameAsDelivery && formData.deliveryAddress) {
      submissionData.deliveryAddress = formData.deliveryAddress;
      submissionData.deliveryCity = formData.deliveryCity;
      submissionData.deliveryProvince = formData.deliveryProvince;
      submissionData.deliveryPostalCode = formData.deliveryPostalCode;
    }

    // Add business details for Trade customers
    if (formData.customerType === "Trade") {
      submissionData.business = {
        companyName: formData.companyName,
        vatNumber: formData.vatNumber,
        companyRegistration: formData.companyRegistration,
        businessType: formData.businessType,
      };
      submissionData.procurement = {
        poNumber: formData.poNumber,
        procurementContact: formData.procurementContact,
        monthlyStatementPreference: formData.monthlyStatementPreference,
      };
    }

    // Simulate API call
    setTimeout(() => {
      localStorage.setItem("user", JSON.stringify(submissionData));
      setIsLoading(false);
      navigate("/");
      alert("Signup successful! Welcome " + formData.firstName);
    }, 1500);
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
                <div className="grid grid-cols-2 gap-4 mb-4">
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
                        className="pl-10 h-11 rounded-lg border-gray-200"
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
                        className="pl-10 h-11 rounded-lg border-gray-200"
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
                      className="pl-10 h-11 rounded-lg border-gray-200"
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
                      className="pl-10 h-11 rounded-lg border-gray-200"
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
                        className="h-11 rounded-lg border-gray-200"
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
                        className="h-11 rounded-lg border-gray-200"
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
                        className="h-11 rounded-lg border-gray-200"
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
                        className="h-11 rounded-lg border-gray-200"
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
                        className="h-11 rounded-lg border-gray-200"
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
                      className="pl-10 h-11 rounded-lg border-gray-200"
                      required={formData.customerType === "Trade"}
                    />
                  </div>
                </div>

                {/* Billing City, Province, Postal Code */}
                <div className="grid grid-cols-3 gap-4 mb-4">
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
                      className="h-11 rounded-lg border-gray-200"
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
                      className="h-11 rounded-lg border-gray-200"
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
                          className="pl-10 h-11 rounded-lg border-gray-200"
                        />
                      </div>
                    </div>

                    {/* Delivery City, Province, Postal Code */}
                    <div className="grid grid-cols-3 gap-4">
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
                          className="h-11 rounded-lg border-gray-200"
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
                          placeholder="2000"
                          className="h-11 rounded-lg border-gray-200"
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
                      className="pl-10 pr-10 h-11 rounded-lg border-gray-200"
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
                      className="pl-10 pr-10 h-11 rounded-lg border-gray-200"
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
    </div>
  );
}
