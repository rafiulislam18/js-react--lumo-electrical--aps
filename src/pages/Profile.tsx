import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Mail, Phone, MapPin, LogOut, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "+27 71 234 5678",
    address: "123 Main Street, Cape Town, 8000"
  });

  const [editData, setEditData] = useState(user);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(prev => ({ ...prev, ...parsedUser }));
      setEditData(prev => ({ ...prev, ...parsedUser }));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setUser(editData);
      localStorage.setItem("user", JSON.stringify(editData));
      setIsEditing(false);
      setIsSaving(false);
      alert("Profile updated successfully!");
    }, 1000);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50/30 flex flex-col font-sans">
      <Navbar />

      <section className="flex-1 py-20 px-4">
        <div className="container mx-auto max-w-2xl">
          {/* Header */}
          <div className="mb-8 animate-in fade-in slide-in-from-top-10 duration-700">
            <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">
              My Account
            </h1>
            <p className="text-gray-500">Manage your profile and preferences</p>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-700">
            {/* Header Bar */}
            <div className="bg-gradient-to-r from-green-500 to-lime-400 h-32" />

            {/* Content */}
            <div className="px-8 py-8">
              {/* Avatar and Basic Info */}
              <div className="flex items-start gap-6 mb-8 pb-8 border-b border-gray-100">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-lime-300 flex items-center justify-center -mt-12 border-4 border-white shadow-lg">
                  <User className="w-12 h-12 text-white" />
                </div>
                <div className="flex-1 pt-4">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {user.firstName} {user.lastName}
                  </h2>
                  <p className="text-gray-500 mb-4">{user.email}</p>
                  <div className="flex gap-3">
                    {!isEditing ? (
                      <>
                        <Button
                          onClick={() => setIsEditing(true)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          Edit Profile
                        </Button>
                        <Button
                          onClick={handleLogout}
                          variant="outline"
                          className="border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Logout
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          onClick={handleSave}
                          disabled={isSaving}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                        <Button
                          onClick={() => {
                            setIsEditing(false);
                            setEditData(user);
                          }}
                          variant="outline"
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* First Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    {isEditing ? (
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <Input
                          type="text"
                          name="firstName"
                          value={editData.firstName}
                          onChange={handleChange}
                          className="pl-10 h-11 rounded-lg border-gray-200"
                        />
                      </div>
                    ) : (
                      <p className="text-gray-900 font-medium">{user.firstName}</p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    {isEditing ? (
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <Input
                          type="text"
                          name="lastName"
                          value={editData.lastName}
                          onChange={handleChange}
                          className="pl-10 h-11 rounded-lg border-gray-200"
                        />
                      </div>
                    ) : (
                      <p className="text-gray-900 font-medium">{user.lastName}</p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <Input
                        type="email"
                        name="email"
                        value={editData.email}
                        onChange={handleChange}
                        className="pl-10 h-11 rounded-lg border-gray-200"
                      />
                    </div>
                  ) : (
                    <p className="text-gray-900 font-medium">{user.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <Input
                        type="tel"
                        name="phone"
                        value={editData.phone}
                        onChange={handleChange}
                        className="pl-10 h-11 rounded-lg border-gray-200"
                      />
                    </div>
                  ) : (
                    <p className="text-gray-900 font-medium">{user.phone}</p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <Input
                        type="text"
                        name="address"
                        value={editData.address}
                        onChange={handleChange}
                        className="pl-10 h-11 rounded-lg border-gray-200"
                      />
                    </div>
                  ) : (
                    <p className="text-gray-900 font-medium">{user.address}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 animate-in fade-in" style={{animationDelay: '0.2s'}}>
            <div className="bg-white rounded-xl border border-gray-100 p-6 text-center hover:shadow-lg transition-shadow">
              <p className="text-3xl font-bold text-green-600 mb-2">0</p>
              <p className="text-gray-600">Total Orders</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-6 text-center hover:shadow-lg transition-shadow">
              <p className="text-3xl font-bold text-blue-600 mb-2">0</p>
              <p className="text-gray-600">Wishlist Items</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-6 text-center hover:shadow-lg transition-shadow">
              <p className="text-3xl font-bold text-purple-600 mb-2">$0</p>
              <p className="text-gray-600">Total Spent</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
