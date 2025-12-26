import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"email" | "verification" | "reset">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep("verification");
    }, 1500);
  };

  const handleVerificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length !== 6) {
      alert("Please enter a valid 6-digit code");
      return;
    }
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep("reset");
    }, 1500);
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    
    if (newPassword.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert("Password reset successful! Please log in.");
      navigate("/login");
    }, 1500);
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
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                      Verification Code
                    </label>
                    <Input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
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
                    onClick={() => setStep("email")}
                    className="w-full text-sm text-gray-600 hover:text-primary transition-colors"
                  >
                    Didn't receive the code? Try another email
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
                      New Password
                    </label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-11 rounded-lg border-gray-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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

            {/* Footer */}
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
