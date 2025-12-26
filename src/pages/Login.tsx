import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      localStorage.setItem("user", JSON.stringify({
        email: formData.email,
        isLoggedIn: true
      }));
      
      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
      }

      setIsLoading(false);
      navigate("/");
      alert("Login successful! Welcome back!");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50/30 flex flex-col font-sans">
      <section className="flex-1 py-20 px-4">
        <div className="container mx-auto max-w-md">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-700">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-lime-400 px-8 py-12 text-white text-center">
              <h1 className="text-3xl font-display font-bold mb-2">Welcome Back</h1>
              <p className="text-green-50">Sign in to your account</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className="pl-10 h-11 rounded-lg border-gray-200"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-green-600 hover:text-green-700 font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
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

              {/* Remember Me */}
              <div className="flex items-center gap-3">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                  Remember me
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary-gradient border-0 text-white font-semibold h-11 rounded-lg hover:opacity-90 transition-smooth mt-6"
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>

              {/* Divider */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or</span>
                </div>
              </div>

              {/* Social Login */}
              <div className="flex gap-3 justify-center">
                <Button
                  type="button"
                  className="
                    h-12 w-full max-w-md
                    bg-white
                    border border-[#DADCE0]
                    hover:bg-[#F8F9FA]
                    text-[#3C4043]
                    font-medium
                    rounded-md
                    flex items-center justify-center
                    gap-3
                    focus:outline-none
                    focus:ring-2
                    focus:ring-offset-2
                    focus:ring-blue-500
                  "
                >
                  {/* Google G Logo (Official SVG) */}
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 48 48"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.02 1.53 7.41 2.81l5.48-5.48C33.5 3.7 29.12 1.5 24 1.5 14.9 1.5 7.26 6.98 4.31 14.93l6.39 4.96C12.2 14.4 17.6 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.5 24.5c0-1.57-.14-3.07-.4-4.5H24v8.52h12.66c-.55 2.95-2.22 5.45-4.72 7.13l7.22 5.6C43.78 37.2 46.5 31.4 46.5 24.5z"/>
                    <path fill="#FBBC05" d="M10.7 28.89c-.48-1.45-.75-2.99-.75-4.39s.27-2.94.75-4.39l-6.39-4.96C2.91 18.1 2 21.22 2 24.5s.91 6.4 2.31 9.35l6.39-4.96z"/>
                    <path fill="#34A853" d="M24 47.5c6.48 0 11.92-2.13 15.9-5.8l-7.22-5.6c-2.01 1.35-4.58 2.15-8.68 2.15-6.4 0-11.8-4.9-13.3-10.39l-6.39 4.96C7.26 41.02 14.9 47.5 24 47.5z"/>
                  </svg>

                  <span>Continue with Google</span>
                </Button>
              </div>
            </form>

            {/* Footer */}
            <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 text-center">
              <p className="text-gray-600 text-sm">
                Don't have an account?{" "}
                <Link to="/signup" className="text-green-600 hover:text-green-700 font-semibold">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
