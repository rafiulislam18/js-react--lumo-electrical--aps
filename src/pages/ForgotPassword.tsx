import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, AlertCircle, CheckCircle, Loader, Lock, KeyRound, ArrowLeft, ShieldCheck } from "lucide-react";
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

  const fieldCls = "w-full px-[.9rem] py-[.8rem] text-[.85rem] bg-white dark:bg-[#141914] border border-[rgba(22,25,26,.1)] dark:border-white/10 rounded-[10px] text-[#16191a] dark:text-[#f1f3ea] placeholder-[rgba(22,25,26,.42)] dark:placeholder-[rgba(241,243,234,.42)] outline-none focus:border-[rgba(57,151,70,.4)] transition-colors";

  const eyebrowText =
    step === "email" ? "Account recovery" : step === "verification" ? "Verify it's you" : "Almost there";
  const headingText =
    step === "email" ? "Reset Password" : step === "verification" ? "Enter Code" : "New Password";
  const subText =
    step === "email"
      ? "We'll help you get back into your account"
      : step === "verification"
      ? "Check your inbox for the 6-digit code"
      : "Choose a strong new password";

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
              <div className="font-bebas leading-[.95] text-white text-[2.8rem]">Forgot it?<br />No problem.</div>
              <p className="text-[.9rem] leading-relaxed mt-3 text-white/85">
                Resetting your password takes less than a minute. We'll verify it's really you, then get you back to shopping.
              </p>
            </div>
            <div className="relative flex flex-col gap-2.5 text-[.82rem] text-white/90">
              <span className="flex items-center gap-2"><Mail className="w-4 h-4" /> Enter your email</span>
              <span className="flex items-center gap-2"><KeyRound className="w-4 h-4" /> Verify the 6-digit code</span>
              <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Set a new password</span>
            </div>
          </div>

          {/* Form */}
          <div className="p-8 sm:p-9">
            <div className="inline-flex items-center gap-2 text-[.68rem] font-bold tracking-[.2em] uppercase text-[#2f8b3d] dark:text-[#a8d63e] mb-3 before:content-[''] before:w-6 before:h-0.5 before:bg-[#2f8b3d] dark:before:bg-[#a8d63e] before:rounded-sm before:shrink-0">
              {eyebrowText}
            </div>
            <h1 className="font-bebas text-[2.2rem] leading-none mb-1.5 text-[#16191a] dark:text-[#f1f3ea]">{headingText}</h1>
            <p className="text-[.88rem] mb-7 text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)]">{subText}</p>

            {/* Form */}
            <form onSubmit={step === "email" ? handleEmailSubmit : step === "verification" ? handleVerificationSubmit : handleResetSubmit} className="space-y-5">

              {/* Error Alert */}
              {error && (
                <div className="bg-[#d94646]/[.08] border border-[#d94646]/30 rounded-[10px] p-3.5 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-[#d94646] flex-shrink-0 mt-0.5" />
                  <p className="text-[#d94646] text-[.85rem]">{error}</p>
                </div>
              )}

              {/* Success Alert */}
              {resendSuccess && (
                <div className="bg-[#2f8b3d]/[.08] border border-[#2f8b3d]/30 rounded-[10px] p-3.5 flex gap-3">
                  <CheckCircle className="w-5 h-5 text-[#2f8b3d] dark:text-[#a8d63e] flex-shrink-0 mt-0.5" />
                  <p className="text-[#2f8b3d] dark:text-[#a8d63e] text-[.85rem]">Verification code sent to your email!</p>
                </div>
              )}

              {/* Step 1: Email */}
              {step === "email" && (
                <>
                  <p className="text-[.85rem] text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)]">
                    Enter your email address and we'll send you a verification code to reset your password.
                  </p>

                  <div>
                    <label className="block text-[.8rem] font-medium mb-2 text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)]">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-[18px] h-[18px] absolute left-3 top-1/2 -translate-y-1/2 text-[rgba(22,25,26,.42)] dark:text-[rgba(241,243,234,.42)]" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          setEmail(e.target.value);
                          setError("");
                        }}
                        placeholder="your@email.com"
                        className={`pl-10 ${fieldCls}`}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !email}
                    className="w-full mt-1 inline-flex items-center justify-center gap-2 font-semibold rounded-full px-6 py-[.8rem] bg-gradient-to-r from-[#399746] to-[#a8d63e] text-white dark:text-[#0a0c0a] text-[.9rem] transition-all duration-200 hover:shadow-[0_0_16px_rgba(168,214,62,.4)] disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <p className="text-[.85rem] text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)] mb-1">
                      We've sent a 6-digit verification code to:
                    </p>
                    <p className="text-[.85rem] font-semibold text-[#16191a] dark:text-[#f1f3ea]">{email}</p>
                  </div>

                  <div>
                    <label className="block text-[.8rem] font-medium mb-2 text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)]">
                      Verification Code <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <KeyRound className="w-[18px] h-[18px] absolute left-3 top-1/2 -translate-y-1/2 text-[rgba(22,25,26,.42)] dark:text-[rgba(241,243,234,.42)]" />
                      <input
                        type="text"
                        value={code}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                          setError("");
                        }}
                        placeholder="000000"
                        maxLength={6}
                        className={`pl-10 text-center tracking-[.5em] font-mono text-lg ${fieldCls}`}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || code.length !== 6}
                    className="w-full mt-1 inline-flex items-center justify-center gap-2 font-semibold rounded-full px-6 py-[.8rem] bg-gradient-to-r from-[#399746] to-[#a8d63e] text-white dark:text-[#0a0c0a] text-[.9rem] transition-all duration-200 hover:shadow-[0_0_16px_rgba(168,214,62,.4)] disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="w-full text-[.8rem] font-medium text-[#2f8b3d] dark:text-[#a8d63e] hover:opacity-80 py-1 transition-opacity"
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
                    className="w-full inline-flex items-center justify-center gap-2 text-[.8rem] text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)] hover:text-[#2f8b3d] dark:hover:text-[#a8d63e] transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Try another email
                  </button>
                </>
              )}

              {/* Step 3: Reset Password */}
              {step === "reset" && (
                <>
                  <p className="text-[.85rem] text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)]">
                    Enter your new password below. Make sure it's at least 8 characters.
                  </p>

                  <div>
                    <label className="block text-[.8rem] font-medium mb-2 text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)]">
                      New Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-[18px] h-[18px] absolute left-3 top-1/2 -translate-y-1/2 text-[rgba(22,25,26,.42)] dark:text-[rgba(241,243,234,.42)]" />
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          setNewPassword(e.target.value);
                          setError("");
                        }}
                        placeholder="••••••••"
                        className={`pl-10 ${fieldCls}`}
                        required
                      />
                    </div>
                    <p className="text-[.75rem] text-[rgba(22,25,26,.5)] dark:text-[rgba(241,243,234,.5)] mt-1.5">At least 8 characters</p>
                  </div>

                  <div>
                    <label className="block text-[.8rem] font-medium mb-2 text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)]">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-[18px] h-[18px] absolute left-3 top-1/2 -translate-y-1/2 text-[rgba(22,25,26,.42)] dark:text-[rgba(241,243,234,.42)]" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          setConfirmPassword(e.target.value);
                          setError("");
                        }}
                        placeholder="••••••••"
                        className={`pl-10 ${fieldCls}`}
                        required
                      />
                    </div>

                    {/* Password Match Validation */}
                    {newPassword && confirmPassword && (
                      <div className={`mt-2 flex items-center gap-2 text-[.8rem] ${newPassword === confirmPassword ? 'text-[#2f8b3d] dark:text-[#a8d63e]' : 'text-[#d94646]'}`}>
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
                    className="w-full mt-1 inline-flex items-center justify-center gap-2 font-semibold rounded-full px-6 py-[.8rem] bg-gradient-to-r from-[#399746] to-[#a8d63e] text-white dark:text-[#0a0c0a] text-[.9rem] transition-all duration-200 hover:shadow-[0_0_16px_rgba(168,214,62,.4)] disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="text-center text-[.8rem] mt-6 pt-5 border-t border-[rgba(22,25,26,.07)] dark:border-white/[.07] text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)]">
              Remember your password?{" "}
              <Link to="/login" className="inline-flex items-center gap-1 font-semibold text-[#2f8b3d] dark:text-[#a8d63e] hover:opacity-80 transition-opacity align-middle">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
