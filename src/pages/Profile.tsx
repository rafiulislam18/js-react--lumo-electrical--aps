import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Lock, ShoppingBag, Heart, LogOut, Edit3, DollarSign, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [formData, setFormData] = useState({
    name: "John Doe",
    email: "john@example.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main Street, City, State 12345"
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = () => {
    console.log("Profile saved:", formData);
    setIsEditingProfile(false);
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
                <div className="bg-gradient-to-r from-green-500 to-lime-400 px-8 py-8 text-white flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <User className="w-6 h-6" />
                      Personal Information
                    </h2>
                    <p className="text-green-50 mt-1">Update your profile details</p>
                  </div>
                  {!isEditingProfile && (
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-5 h-5 text-white" />
                    </button>
                  )}
                </div>

                {/* Content */}
                <div className="p-8">
                  {isEditingProfile ? (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Full Name
                        </label>
                        <Input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Enter your full name"
                          className="h-11 rounded-lg border-gray-200"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Email Address
                        </label>
                        <Input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Enter your email"
                          className="h-11 rounded-lg border-gray-200"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Phone Number
                        </label>
                        <Input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="Enter your phone number"
                          className="h-11 rounded-lg border-gray-200"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Address
                        </label>
                        <Input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          placeholder="Enter your address"
                          className="h-11 rounded-lg border-gray-200"
                        />
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button
                          onClick={handleSaveProfile}
                          className="flex-1 h-11 bg-gradient-to-r from-green-500 to-lime-400 text-white font-semibold hover:opacity-90"
                        >
                          Save Changes
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-1">Full Name</p>
                          <p className="text-lg font-semibold text-gray-900">{formData.name}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-1">Email Address</p>
                          <p className="text-lg font-semibold text-gray-900">{formData.email}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-1">Phone Number</p>
                          <p className="text-lg font-semibold text-gray-900">{formData.phone}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-1">Address</p>
                          <p className="text-lg font-semibold text-gray-900">{formData.address}</p>
                        </div>
                      </div>
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
              <div className="grid grid-cols-3 gap-4">
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow text-center">
                      <div className={`${stat.color} mb-2 flex justify-center`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <p className="text-xs text-gray-600 font-medium mb-1">{stat.label}</p>
                      <p className="text-xl font-bold text-gray-900">{stat.value}</p>
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
