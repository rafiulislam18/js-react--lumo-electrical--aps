import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Lock, ShoppingBag, Heart, LogOut, Edit3, DollarSign, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPut } from "@/lib/api";

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
}

interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  customer_profile: CustomerProfile;
}

interface FormData {
  first_name: string;
  last_name: string;
  phone: string;
  billing_address: string;
  billing_city: string;
  billing_province: string;
  billing_postal_code: string;
  delivery_address: string;
  delivery_city: string;
  delivery_province: string;
  delivery_postal_code: string;
  company_name: string;
  customer_type: string;
}

export default function Profile() {
  const navigate = useNavigate();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [formData, setFormData] = useState<FormData>({
    first_name: "",
    last_name: "",
    phone: "",
    billing_address: "",
    billing_city: "",
    billing_province: "",
    billing_postal_code: "",
    delivery_address: "",
    delivery_city: "",
    delivery_province: "",
    delivery_postal_code: "",
    company_name: "",
    customer_type: "Retail",
  });

  // Fetch user profile on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const profile: UserProfile = await apiGet("/users/profile/");
      
      setUserEmail(profile.email);
      setFormData({
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.customer_profile.phone || "",
        billing_address: profile.customer_profile.billing_address || "",
        billing_city: profile.customer_profile.billing_city || "",
        billing_province: profile.customer_profile.billing_province || "",
        billing_postal_code: profile.customer_profile.billing_postal_code || "",
        delivery_address: profile.customer_profile.delivery_address || "",
        delivery_city: profile.customer_profile.delivery_city || "",
        delivery_province: profile.customer_profile.delivery_province || "",
        delivery_postal_code: profile.customer_profile.delivery_postal_code || "",
        company_name: profile.customer_profile.company_name || "",
        customer_type: profile.customer_profile.customer_type || "Retail",
      });
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile. Please try again.");
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
      setError(null);
      
      const updateData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        customer_profile: {
          phone: formData.phone,
          billing_address: formData.billing_address,
          billing_city: formData.billing_city,
          billing_province: formData.billing_province,
          billing_postal_code: formData.billing_postal_code,
          delivery_address: formData.delivery_address,
          delivery_city: formData.delivery_city,
          delivery_province: formData.delivery_province,
          delivery_postal_code: formData.delivery_postal_code,
          company_name: formData.company_name,
          customer_type: formData.customer_type,
        },
      };

      await apiPut("/users/profile/update/", updateData);
      setIsEditingProfile(false);
      // Refresh profile data after successful save
      await fetchUserProfile();
    } catch (err) {
      console.error("Error saving profile:", err);
      setError("Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  const stats = [
    { label: "Total Orders", value: "12", icon: ShoppingBag, color: "text-blue-600" },
    { label: "Wishlist Items", value: "24", icon: Heart, color: "text-red-500" },
    { label: "Total Spent", value: "$2,345.50", icon: DollarSign, color: "text-green-600" }
  ];

  const actionButtons = [
    { label: "View Orders", icon: ShoppingBag, onClick: () => navigate("/orders") },
    { label: "View Wishlist", icon: Heart, onClick: () => navigate("/wishlist") },
    { label: "Change Password", icon: Lock, onClick: () => navigate("/change-password") }
  ];

  return (
    <div className="min-h-screen bg-gray-50/30 flex flex-col font-sans">
      <section className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900">My Account</h1>
            <p className="text-gray-600 mt-2">Manage your profile and account settings</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Right Content - Main Profile Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Information Card */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-500 to-lime-400 px-4 sm:px-6 md:px-8 py-6 sm:py-8 text-white flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                      <User className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                      <span>Personal Information</span>
                    </h2>
                    <p className="text-green-50 mt-1 text-sm sm:text-base">Update your profile details</p>
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
                <div className="p-4 sm:p-6 md:p-8">
                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                      {error}
                    </div>
                  )}

                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                    </div>
                  ) : isEditingProfile ? (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-900">Personal Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            First Name
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
                            Last Name
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
                          Phone Number
                        </label>
                        <Input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="Enter your phone number"
                          className="h-11 rounded-lg border-gray-200"
                        />
                      </div>

                      <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Address</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                              Street Address
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
                                City
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
                                Province
                              </label>
                              <Input
                                type="text"
                                value={formData.billing_province}
                                onChange={(e) => setFormData(prev => ({ ...prev, billing_province: e.target.value }))}
                                placeholder="Province"
                                className="h-11 rounded-lg border-gray-200"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Postal Code
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
                              <Input
                                type="text"
                                value={formData.delivery_province}
                                onChange={(e) => setFormData(prev => ({ ...prev, delivery_province: e.target.value }))}
                                placeholder="Province"
                                className="h-11 rounded-lg border-gray-200"
                              />
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

                      <div className="flex gap-3 pt-4">
                        <Button
                          onClick={handleSaveProfile}
                          disabled={isSaving}
                          className="flex-1 h-11 bg-gradient-to-r from-green-500 to-lime-400 text-white font-semibold hover:opacity-90 disabled:opacity-50"
                        >
                          {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                        <Button
                          onClick={() => setIsEditingProfile(false)}
                          variant="outline"
                          className="flex-1 h-11"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-900">Personal Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-1">First Name</p>
                          <p className="text-gray-900">{formData.first_name}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-1">Last Name</p>
                          <p className="text-gray-900">{formData.last_name}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-1">Email Address</p>
                          <p className="text-gray-900">{userEmail}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-1">Phone Number</p>
                          <p className="text-gray-900">{formData.phone}</p>
                        </div>
                      </div>

                      {(formData.billing_address || formData.billing_city) && (
                        <div className="border-t pt-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Address</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {formData.billing_address && (
                              <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Street Address</p>
                                <p className="text-gray-900">{formData.billing_address}</p>
                              </div>
                            )}
                            {formData.billing_city && (
                              <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">City</p>
                                <p className="text-gray-900">{formData.billing_city}</p>
                              </div>
                            )}
                            {formData.billing_province && (
                              <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Province</p>
                                <p className="text-gray-900">{formData.billing_province}</p>
                              </div>
                            )}
                            {formData.billing_postal_code && (
                              <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Postal Code</p>
                                <p className="text-gray-900">{formData.billing_postal_code}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {(formData.delivery_address || formData.delivery_city) && (
                        <div className="border-t pt-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Address</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {formData.delivery_address && (
                              <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Street Address</p>
                                <p className="text-gray-900">{formData.delivery_address}</p>
                              </div>
                            )}
                            {formData.delivery_city && (
                              <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">City</p>
                                <p className="text-gray-900">{formData.delivery_city}</p>
                              </div>
                            )}
                            {formData.delivery_province && (
                              <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Province</p>
                                <p className="text-gray-900">{formData.delivery_province}</p>
                              </div>
                            )}
                            {formData.delivery_postal_code && (
                              <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Postal Code</p>
                                <p className="text-gray-900">{formData.delivery_postal_code}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <Button
                        onClick={() => setIsEditingProfile(true)}
                        className="w-full h-11 bg-green-600 text-white font-semibold hover:bg-green-700"
                      >
                        Edit Profile
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-4">
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow text-center">
                      <div className={`${stat.color} mb-2 flex justify-center`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 font-medium mb-1">{stat.label}</p>
                      <p className="text-lg sm:text-xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Left Sidebar - Action Buttons */}
            <div className="lg:col-span-1 space-y-3">
              {actionButtons.map((btn) => {
                const Icon = btn.icon;
                return (
                  <button
                    key={btn.label}
                    onClick={btn.onClick}
                    className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-green-400 hover:bg-green-50/30 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-gray-600 group-hover:text-green-600" />
                      <span className="font-medium text-gray-700 group-hover:text-gray-900">{btn.label}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-green-600" />
                  </button>
                );
              })}

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-between px-4 py-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-left group mt-4"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="w-5 h-5 text-red-600 group-hover:text-red-700" />
                  <span className="font-medium text-red-600 group-hover:text-red-700">Logout</span>
                </div>
                <ArrowRight className="w-4 h-4 text-red-400 group-hover:text-red-600" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
