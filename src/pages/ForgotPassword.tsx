import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<"email" | "verification" | "reset">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/users/forgot-password/request/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || 'Failed to send verification code');
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      toast({
        title: "Code Sent",
        description: "Verification code sent to your email. It will expire in 15 minutes.",
        className: "bg-blue-600 text-white border-blue-700",
      });
      setStep("verification");
    } catch (err) {
      setError('Network error. Please check your connection.');
      setIsLoading(false);
      console.error('Request code error:', err);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!code || code.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/users/forgot-password/verify/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          code: code
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || 'Invalid verification code');
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      toast({
        title: "Code Verified",
        description: "You can now reset your password.",
        className: "bg-blue-600 text-white border-blue-700",
      });
      setStep("reset");
    } catch (err) {
      setError('Network error. Please check your connection.');
      setIsLoading(false);
      console.error('Verify code error:', err);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/users/forgot-password/reset/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          code: code,
          new_password: newPassword,
          confirm_password: confirmPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || 'Failed to reset password');
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      toast({
        title: "Success",
        description: "Password reset successful! Please log in with your new password.",
        className: "bg-green-600 text-white border-green-700",
      });
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError('Network error. Please check your connection.');
      setIsLoading(false);
      console.error('Reset password error:', err);
    }
  };

  const handleResendCode = async () => {
    setError("");
    setResendSuccess(false);

    try {
      const response = await fetch(`${API_URL}/users/forgot-password/request/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || 'Failed to resend code');
        return;
      }

      setResendSuccess(true);
      setCode("");
      // Hide success message after 3 seconds
      setTimeout(() => setResendSuccess(false), 3000);
    } catch (err) {
      setError('Network error. Please check your connection.');
      console.error('Resend code error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/30 flex flex-col font-sans">
      <section className="flex-1 py-20 px-4">
        <div className="container mx-auto max-w-md">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-700">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-lime-400 px-8 py-12 text-white text-center">
              <h1 className="text-3xl font-display font-bold mb-2">Reset Password</h1>
              <p className="text-green-50">We'll help you get back into your account</p>
            </div>

            {/* Form Content */}
            <div className="p-8">
              {/* Error Alert */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3 mb-6">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Success Alert */}
              {resendSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3 mb-6">
                  <Mail className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-green-700 text-sm">Verification code sent to your email!</p>
                </div>
              )}

              {/* Step 1: Email */}
              {step === "email" && (
                <form onSubmit={handleEmailSubmit} className="space-y-5">
                  <div>
                    <p className="text-sm text-gray-600 mb-4">
                      Enter your email address and we'll send you a verification code to reset your password.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError("");
                        }}
                        placeholder="your@email.com"
                        className="pl-10 h-11 rounded-lg border-gray-200"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || !email}
                    className="w-full bg-primary-gradient border-0 text-white font-semibold h-11 rounded-lg hover:opacity-90 transition-smooth"
                  >
                    {isLoading ? "Sending Code..." : "Send Verification Code"}
                  </Button>
                </form>
              )}

              {/* Step 2: Verification Code */}
              {step === "verification" && (
                <form onSubmit={handleVerificationSubmit} className="space-y-5">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      We've sent a 6-digit verification code to:
                    </p>
                    <p className="text-sm font-semibold text-gray-900 mb-4">{email}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Verification Code <span className="text-red-600">*</span>
                    </label>
                    <Input
                      type="text"
                      value={code}
                      onChange={(e) => {
                        setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                        setError("");
                      }}
                      placeholder="000000"
                      className="h-11 rounded-lg border-gray-200 text-center tracking-widest font-mono text-lg"
                      maxLength={6}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || code.length !== 6}
                    className="w-full bg-primary-gradient border-0 text-white font-semibold h-11 rounded-lg hover:opacity-90 transition-smooth"
                  >
                    {isLoading ? "Verifying..." : "Verify Code"}
                  </Button>

                  <button
                    type="button"
                    onClick={handleResendCode}
                    className="w-full text-sm text-green-600 hover:text-green-700 font-medium py-2"
                  >
                    Didn't receive the code? Resend
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep("email");
                      setError("");
                      setCode("");
                    }}
                    className="w-full text-sm text-gray-600 hover:text-gray-700"
                  >
                    Try another email
                  </button>
                </form>
              )}

              {/* Step 3: Reset Password */}
              {step === "reset" && (
                <form onSubmit={handleResetSubmit} className="space-y-5">
                  <div>
                    <p className="text-sm text-gray-600 mb-4">
                      Enter your new password below. Make sure it's at least 8 characters.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password <span className="text-red-600">*</span>
                    </label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setError("");
                      }}
                      placeholder="••••••••"
                      className="h-11 rounded-lg border-gray-200"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">At least 8 characters</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password <span className="text-red-600">*</span>
                    </label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setError("");
                      }}
                      placeholder="••••••••"
                      className="h-11 rounded-lg border-gray-200"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || !newPassword || !confirmPassword}
                    className="w-full bg-primary-gradient border-0 text-white font-semibold h-11 rounded-lg hover:opacity-90 transition-smooth"
                  >
                    {isLoading ? "Resetting..." : "Reset Password"}
                  </Button>
                </form>
              )}
            </div>

            <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 text-center">
              <p className="text-gray-600 text-sm">
                Remember your password?{" "}
                <button onClick={() => navigate("/login")} className="text-green-600 hover:text-green-700 font-semibold">
                  Log In
                </button>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
