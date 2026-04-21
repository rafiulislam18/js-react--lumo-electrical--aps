import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, AlertCircle, CheckCircle, Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000/api';

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

  const inputCls = "w-full px-4 py-3 text-[.85rem] bg-white dark:bg-black/[.05] border border-black/[.1] dark:border-white/[.08] rounded-lg text-black/80 dark:text-[rgba(240,242,237,.8)] placeholder-black/40 dark:placeholder-[rgba(240,242,237,.4)] focus:outline-none focus:border-lime-brand/30 focus:bg-lime-brand/[.05] transition-all duration-150";

  return (
    <div className="font-outfit bg-white dark:bg-dark-surface min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="font-bebas text-[2.5rem] tracking-[.08em] text-black/85 dark:text-[#f0f2ed] mb-2">
          Reset Password
        </h1>
        <p className="text-[.9rem] text-black/55 dark:text-[rgba(240,242,237,.55)]">
          We'll help you get back into your account
        </p>
      </div>

      {/* Form Card */}
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-black/[.02] rounded-xl border border-black/[.08] dark:border-white/[.06] overflow-hidden">
          {/* Form */}
          <form onSubmit={step === "email" ? handleEmailSubmit : step === "verification" ? handleVerificationSubmit : handleResetSubmit} className="p-8 space-y-5">

            {/* Error Alert */}
            {error && (
              <div className="bg-red-50 dark:bg-red-950/[.2] border border-red-200 dark:border-red-900/[.3] rounded-lg p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 dark:text-red-300 text-[.85rem]">{error}</p>
              </div>
            )}

            {/* Success Alert */}
            {resendSuccess && (
              <div className="bg-green-50 dark:bg-green-950/[.2] border border-green-200 dark:border-green-900/[.3] rounded-lg p-4 flex gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-green-700 dark:text-green-300 text-[.85rem]">Verification code sent to your email!</p>
              </div>
            )}

            {/* Step 1: Email */}
            {step === "email" && (
              <>
                <div>
                  <p className="text-[.85rem] text-black/60 dark:text-[rgba(240,242,237,.6)] mb-4">
                    Enter your email address and we'll send you a verification code to reset your password.
                  </p>
                </div>

                <div>
                  <label className="block text-[.8rem] font-medium text-black/70 dark:text-[rgba(240,242,237,.7)] mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40 dark:text-[rgba(240,242,237,.4)]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      placeholder="your@email.com"
                      className={`pl-10 ${inputCls}`}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full py-3 rounded-lg bg-gradient-to-br from-green-brand to-lime-brand text-dark-surface font-semibold text-[.9rem] cursor-pointer transition-all duration-200 hover:shadow-[0_0_16px_rgba(168,214,62,.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
                >
                  {isLoading ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      Sending Code...
                    </>
                  ) : (
                    'Send Verification Code'
                  )}
                </button>
              </>
            )}

            {/* Step 2: Verification Code */}
            {step === "verification" && (
              <>
                <div>
                  <p className="text-[.85rem] text-black/60 dark:text-[rgba(240,242,237,.6)] mb-2">
                    We've sent a 6-digit verification code to:
                  </p>
                  <p className="text-[.85rem] font-semibold text-black/80 dark:text-[rgba(240,242,237,.8)] mb-4">{email}</p>
                </div>

                <div>
                  <label className="block text-[.8rem] font-medium text-black/70 dark:text-[rgba(240,242,237,.7)] mb-2">
                    Verification Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                      setError("");
                    }}
                    placeholder="000000"
                    maxLength={6}
                    className={`text-center tracking-widest font-mono text-lg ${inputCls}`}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || code.length !== 6}
                  className="w-full py-3 rounded-lg bg-gradient-to-br from-green-brand to-lime-brand text-dark-surface font-semibold text-[.9rem] cursor-pointer transition-all duration-200 hover:shadow-[0_0_16px_rgba(168,214,62,.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
                >
                  {isLoading ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify Code'
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleResendCode}
                  className="w-full text-[.8rem] text-lime-brand hover:text-lime-brand/80 font-medium py-2 transition-colors duration-150"
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
                  className="w-full text-[.8rem] text-black/60 dark:text-[rgba(240,242,237,.6)] hover:text-lime-brand dark:hover:text-lime-brand transition-colors duration-150"
                >
                  Try another email
                </button>
              </>
            )}

            {/* Step 3: Reset Password */}
            {step === "reset" && (
              <>
                <div>
                  <p className="text-[.85rem] text-black/60 dark:text-[rgba(240,242,237,.6)] mb-4">
                    Enter your new password below. Make sure it's at least 8 characters.
                  </p>
                </div>

                <div>
                  <label className="block text-[.8rem] font-medium text-black/70 dark:text-[rgba(240,242,237,.7)] mb-2">
                    New Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setNewPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="••••••••"
                    className={inputCls}
                    required
                  />
                  <p className="text-[.75rem] text-black/50 dark:text-[rgba(240,242,237,.5)] mt-1">At least 8 characters</p>
                </div>

                <div>
                  <label className="block text-[.8rem] font-medium text-black/70 dark:text-[rgba(240,242,237,.7)] mb-2">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setConfirmPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="••••••••"
                    className={inputCls}
                    required
                  />

                  {/* Password Match Validation */}
                  {newPassword && confirmPassword && (
                    <div className={`mt-2 flex items-center gap-2 text-[.8rem] ${newPassword === confirmPassword ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {newPassword === confirmPassword ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span>Passwords match</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4" />
                          <span>Passwords do not match</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                  className="w-full py-3 rounded-lg bg-gradient-to-br from-green-brand to-lime-brand text-dark-surface font-semibold text-[.9rem] cursor-pointer transition-all duration-200 hover:shadow-[0_0_16px_rgba(168,214,62,.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
                >
                  {isLoading ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </>
            )}
          </form>

          {/* Footer */}
          <div className="px-8 py-5 bg-black/[.02] dark:bg-white/[.02] border-t border-black/[.08] dark:border-white/[.06] text-center">
            <p className="text-[.8rem] text-black/60 dark:text-[rgba(240,242,237,.6)]">
              Remember your password?{" "}
              <button onClick={() => navigate("/login")} className="text-lime-brand hover:text-lime-brand/80 font-semibold transition-colors duration-150">
                Log In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
