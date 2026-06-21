import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, Loader, Package, Heart, ShoppingCart, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();
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

    try {
      const response = await fetch(`${API_URL}/users/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.email,
          password: formData.password
        })
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        console.error('Failed to parse response:', e);
        throw new Error('Invalid response from server');
      }

      console.log('Login Response:', { status: response.status, data });

      if (!response.ok) {
        let errorMessage = 'Login failed. Please try again.';

        if (data?.detail) {
          errorMessage = String(data.detail);
        } else if (data?.error) {
          errorMessage = String(data.error);
        } else if (data?.errors && typeof data.errors === 'object') {
          const errorMessages: string[] = [];
          for (const [field, messages] of Object.entries(data.errors)) {
            if (Array.isArray(messages)) {
              errorMessages.push(...messages.map(m => String(m)));
            } else if (typeof messages === 'string') {
              errorMessages.push(messages);
            }
          }
          if (errorMessages.length > 0) {
            errorMessage = errorMessages.join(' | ');
          }
        }

        console.error('Login error:', { status: response.status, errorMessage, data });

        toast({
          variant: "destructive",
          title: "Login Error",
          description: errorMessage,
        });
        setIsLoading(false);
        return;
      }

      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      localStorage.setItem('user', JSON.stringify(data.user));

      login(data.user, data.access, data.refresh);

      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('rememberEmail', formData.email);
      }

      toast({
        title: "Success",
        description: "You have been logged in successfully!",
        className: "bg-green-600 text-white border-green-700",
      });

      setIsLoading(false);
      navigate("/");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      console.error('Login error:', err);

      toast({
        variant: "destructive",
        title: "Network Error",
        description: errorMessage || "Please check your connection and try again.",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="font-outfit bg-[#f6f5f0] dark:bg-[#0a0c0a] min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[860px]">
        <div className="bg-white dark:bg-[#141914] border border-[rgba(22,25,26,.1)] dark:border-white/10 rounded-[24px] overflow-hidden grid md:grid-cols-2">

          {/* Brand panel */}
          <div
            className="relative hidden md:flex flex-col justify-between p-9 overflow-hidden"
            style={{ background: 'linear-gradient(150deg,#399746,#a8d63e)' }}
          >
            <div className="self-start inline-flex rounded-xl px-3.5 py-2.5 relative">
              {/* <img src="/images/logo-light.png" alt="Lumo Electrical" className="h-8" /> */}
            </div>
            <div className="relative">
              <div className="font-bebas leading-[.95] text-white text-[2.8rem]">Welcome back.</div>
              <p className="text-[.9rem] leading-relaxed mt-3 text-white/85">
                You'll need an account to place orders, check out and track deliveries. Sign in to pick up where you left off.
              </p>
            </div>
            <div className="relative flex flex-col gap-2.5 text-[.82rem] text-white/90">
              <span className="flex items-center gap-2"><Heart className="w-4 h-4" /> Save items to your wishlist</span>
              <span className="flex items-center gap-2"><Package className="w-4 h-4" /> Place &amp; manage your orders</span>
              <span className="flex items-center gap-2"><ShoppingCart className="w-4 h-4" /> Cart, questions, reviews &amp; much more</span>
            </div>
          </div>

          {/* Form */}
          <div className="p-8 sm:p-9">
            <div className="inline-flex items-center gap-2 text-[.68rem] font-bold tracking-[.2em] uppercase text-[#2f8b3d] dark:text-[#a8d63e] mb-3 before:content-[''] before:w-6 before:h-0.5 before:bg-[#2f8b3d] dark:before:bg-[#a8d63e] before:rounded-sm before:shrink-0">
              Welcome back
            </div>
            <h1 className="font-bebas text-[2.2rem] leading-none mb-1.5 text-[#16191a] dark:text-[#f1f3ea]">Sign In</h1>
            <p className="text-[.88rem] mb-7 text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)]">Sign in to your account</p>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email */}
              <div>
                <label className="block text-[.8rem] font-medium mb-2 text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)]">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-[18px] h-[18px] absolute left-3 top-1/2 -translate-y-1/2 text-[rgba(22,25,26,.42)] dark:text-[rgba(241,243,234,.42)]" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className="w-full pl-10 pr-[.9rem] py-[.8rem] text-[.85rem] bg-white dark:bg-[#141914] border border-[rgba(22,25,26,.1)] dark:border-white/10 rounded-[10px] text-[#16191a] dark:text-[#f1f3ea] placeholder-[rgba(22,25,26,.42)] dark:placeholder-[rgba(241,243,234,.42)] outline-none focus:border-[rgba(57,151,70,.4)] transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[.8rem] font-medium text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)]">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[.75rem] font-medium text-[#2f8b3d] dark:text-[#a8d63e] hover:opacity-80 transition-opacity"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-[18px] h-[18px] absolute left-3 top-1/2 -translate-y-1/2 text-[rgba(22,25,26,.42)] dark:text-[rgba(241,243,234,.42)]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-[.8rem] text-[.85rem] bg-white dark:bg-[#141914] border border-[rgba(22,25,26,.1)] dark:border-white/10 rounded-[10px] text-[#16191a] dark:text-[#f1f3ea] placeholder-[rgba(22,25,26,.42)] dark:placeholder-[rgba(241,243,234,.42)] outline-none focus:border-[rgba(57,151,70,.4)] transition-colors"
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

              {/* Remember Me */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#3aaa49] cursor-pointer"
                />
                <span className="text-[.8rem] text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)]">
                  Remember me
                </span>
              </label>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-6 inline-flex items-center justify-center gap-2 font-semibold rounded-full px-6 py-[.8rem] bg-gradient-to-r from-[#399746] to-[#a8d63e] text-white dark:text-[#0a0c0a] text-[.9rem] transition-all duration-200 hover:shadow-[0_0_16px_rgba(168,214,62,.4)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Sign up */}
            <div className="text-center text-[.8rem] mt-6 pt-5 border-t border-[rgba(22,25,26,.07)] dark:border-white/[.07] text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)]">
              Don't have an account?{" "}
              <Link to="/signup" className="font-semibold text-[#2f8b3d] dark:text-[#a8d63e] hover:opacity-80 transition-opacity">
                Sign Up
              </Link>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 my-5">
              <div className="flex-1 h-px bg-[rgba(22,25,26,.07)] dark:bg-white/[.07]" />
              <span className="text-[.74rem] text-[rgba(22,25,26,.42)] dark:text-[rgba(241,243,234,.42)]">OR</span>
              <div className="flex-1 h-px bg-[rgba(22,25,26,.07)] dark:bg-white/[.07]" />
            </div>

            {/* Continue as Guest */}
            <div className="text-center">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-[.8rem] font-medium text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)] hover:text-[#2f8b3d] dark:hover:text-[#a8d63e] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Continue as Guest
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
