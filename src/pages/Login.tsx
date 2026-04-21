import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, Loader } from "lucide-react";
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
    <div className="font-outfit bg-white dark:bg-dark-surface min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Logo/Header */}
      <div className="mb-12 text-center">
        <h1 className="font-bebas text-[2.5rem] tracking-[.08em] text-black/85 dark:text-[#f0f2ed] mb-2">
          Welcome Back
        </h1>
        <p className="text-[.9rem] text-black/55 dark:text-[rgba(240,242,237,.55)]">
          Sign in to your account
        </p>
      </div>

      {/* Form Card */}
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-black/[.02] rounded-xl border border-black/[.08] dark:border-white/[.06] overflow-hidden">
          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-5">

            {/* Email */}
            <div>
              <label className="block text-[.8rem] font-medium text-black/70 dark:text-[rgba(240,242,237,.7)] mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40 dark:text-[rgba(240,242,237,.4)]" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-3 text-[.85rem] bg-white dark:bg-black/[.05] border border-black/[.1] dark:border-white/[.08] rounded-lg text-black/80 dark:text-[rgba(240,242,237,.8)] placeholder-black/40 dark:placeholder-[rgba(240,242,237,.4)] focus:outline-none focus:border-lime-brand/30 focus:bg-lime-brand/[.05] dark:focus:bg-lime-brand/[.05] transition-all duration-150"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[.8rem] font-medium text-black/70 dark:text-[rgba(240,242,237,.7)]">
                  Password <span className="text-red-500">*</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[.75rem] text-lime-brand hover:text-lime-brand/80 font-medium transition-colors duration-150"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40 dark:text-[rgba(240,242,237,.4)]" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 text-[.85rem] bg-white dark:bg-black/[.05] border border-black/[.1] dark:border-white/[.08] rounded-lg text-black/80 dark:text-[rgba(240,242,237,.8)] placeholder-black/40 dark:placeholder-[rgba(240,242,237,.4)] focus:outline-none focus:border-lime-brand/30 focus:bg-lime-brand/[.05] dark:focus:bg-lime-brand/[.05] transition-all duration-150"
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

            {/* Remember Me */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded accent-lime-brand cursor-pointer"
              />
              <label htmlFor="remember" className="text-[.8rem] text-black/60 dark:text-[rgba(240,242,237,.6)] cursor-pointer">
                Remember me
              </label>
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
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="px-8 py-5 bg-black/[.02] dark:bg-white/[.02] border-t border-black/[.08] dark:border-white/[.06] text-center">
            <p className="text-[.8rem] text-black/60 dark:text-[rgba(240,242,237,.6)]">
              Don't have an account?{" "}
              <Link to="/signup" className="text-lime-brand hover:text-lime-brand/80 font-semibold transition-colors duration-150">
                Sign Up
              </Link>
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-8 flex items-center gap-4">
          <div className="flex-1 h-px bg-black/[.08] dark:bg-white/[.06]" />
          <span className="text-[.75rem] text-black/40 dark:text-[rgba(240,242,237,.4)]">OR</span>
          <div className="flex-1 h-px bg-black/[.08] dark:bg-white/[.06]" />
        </div>

        {/* Back Home */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[.8rem] text-black/60 dark:text-[rgba(240,242,237,.6)] hover:text-lime-brand dark:hover:text-lime-brand transition-colors duration-150 font-medium"
          >
            ← Continue as Guest
          </Link>
        </div>
      </div>
    </div>
  );
}
