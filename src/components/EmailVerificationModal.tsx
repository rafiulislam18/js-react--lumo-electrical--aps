import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle, Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface EmailVerificationModalProps {
  email: string;
  tokenType: 'registration' | 'change_password';
  onSuccess: (tokens?: { access: string; refresh: string; user: any }) => void;
  onCancel: () => void;
}

export default function EmailVerificationModal({
  email,
  tokenType,
  onSuccess,
  onCancel
}: EmailVerificationModalProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setTimeout(() => {
      setResendCooldown(resendCooldown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/users/verify-email/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          code: verificationCode,
          token_type: tokenType
        })
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error('Invalid response from server');
      }

      console.log('Verify Email Response:', { status: response.status, data });

      if (!response.ok) {
        const errorMessage = data?.detail || data?.error || 'Verification failed. Please try again.';
        console.error('Verification error:', { status: response.status, errorMessage, data });
        setError(errorMessage);
        setIsLoading(false);
        return;
      }

      // For registration, we get tokens back
      if (tokenType === 'registration' && data?.access) {
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        toast({
          title: "Email Verified!",
          description: "Your account has been successfully created.",
          className: "bg-green-600 text-white border-green-700",
        });
        
        setIsLoading(false);
        onSuccess(data);
      } else {
        // For change_password, pass back the verification code
        toast({
          title: "Email Verified!",
          description: "You can now change your password.",
          className: "bg-green-600 text-white border-green-700",
        });
        setIsLoading(false);
        onSuccess({ verificationCode });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error. Please check your connection.';
      console.error('Verification error:', err);
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setResendSuccess(false);
    setIsResending(true);

    try {
      const response = await fetch(`${API_URL}/users/resend-verification-code/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          token_type: tokenType
        })
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error('Invalid response from server');
      }

      console.log('Resend Code Response:', { status: response.status, data });

      if (!response.ok) {
        const errorMessage = data?.detail || data?.error || 'Failed to resend code. Please try again.';
        console.error('Resend error:', { status: response.status, errorMessage, data });
        setError(errorMessage);
        setIsResending(false);
        return;
      }

      setResendSuccess(true);
      setVerificationCode("");
      setIsResending(false);
      setResendCooldown(60); // Start 60-second cooldown
      
      // Hide success message after 3 seconds
      setTimeout(() => setResendSuccess(false), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error. Please check your connection.';
      console.error('Resend error:', err);
      setError(errorMessage);
      setIsResending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/60 flex items-center justify-center z-50 p-4 font-outfit">
      <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-lg max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-brand to-lime-brand px-6 py-8 text-white dark:text-dark-surface text-center">
          <div className="w-12 h-12 bg-dark-surface/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bebas tracking-[.08em]">VERIFY YOUR EMAIL</h2>
          <p className="text-white/80 dark:text-dark-surface/80 text-sm mt-2">
            We sent a verification code to<br />
            <span className="font-semibold">{email}</span>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleVerify} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/[.05] dark:bg-red-500/[.1] border border-red-500/30 dark:border-red-500/40 rounded-lg p-3 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {resendSuccess && (
            <div className="bg-green-500/[.05] dark:bg-green-500/[.1] border border-green-500/30 dark:border-green-500/40 rounded-lg p-3 flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-green-600 dark:text-green-400 text-sm">Verification code sent to your email!</p>
            </div>
          )}

          <div>
            <label className="block text-[.8rem] font-medium text-black/70 dark:text-[rgba(240,242,237,.7)] mb-2">
              Verification Code
            </label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                setError("");
              }}
              placeholder="000000"
              className="w-full px-4 py-3 text-center tracking-widest font-mono text-lg bg-white dark:bg-black/[.05] border border-black/[.1] dark:border-white/[.08] rounded-lg focus:border-lime-brand/30 focus:bg-lime-brand/[.05] text-black/85 dark:text-[#f0f2ed] placeholder-black/30 dark:placeholder-white/[.2]"
              maxLength={6}
              required
            />
            <p className="text-xs text-black/60 dark:text-[rgba(240,242,237,.6)] mt-1">
              Enter the 6-digit code from your email
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || verificationCode.length !== 6}
            className="w-full bg-gradient-to-br from-green-brand to-lime-brand text-white dark:text-dark-surface font-semibold py-3 rounded-lg transition-all duration-200 hover:shadow-[0_0_16px_rgba(168,214,62,.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify Email"
            )}
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={isResending || resendCooldown > 0}
            className="w-full text-sm text-green-deep dark:text-lime-brand hover:text-green-deep/80 dark:hover:text-lime-brand/80 font-medium py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResending ? "Sending..." : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Didn't receive the code? Resend"}
          </button>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-white dark:bg-black/[.02] border-t border-black/[.08] dark:border-white/[.06]">
          <button
            onClick={onCancel}
            className="w-full text-sm text-black/60 dark:text-[rgba(240,242,237,.6)] hover:text-black/85 dark:hover:text-[#f0f2ed] font-medium py-2 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
