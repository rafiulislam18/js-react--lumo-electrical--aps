import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle } from "lucide-react";
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full overflow-hidden animate-in fade-in zoom-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-lime-400 px-6 py-8 text-white text-center">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold">Verify Your Email</h2>
          <p className="text-green-50 text-sm mt-2">
            We sent a verification code to<br />
            <span className="font-semibold">{email}</span>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleVerify} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {resendSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-green-700 text-sm">Verification code sent to your email!</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verification Code
            </label>
            <Input
              type="text"
              value={verificationCode}
              onChange={(e) => {
                setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                setError("");
              }}
              placeholder="000000"
              className="text-center tracking-widest font-mono text-lg h-11 rounded-lg border-gray-200"
              maxLength={6}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the 6-digit code from your email
            </p>
          </div>

          <Button
            type="submit"
            disabled={isLoading || verificationCode.length !== 6}
            className="w-full bg-primary-gradient border-0 text-white font-semibold h-11 rounded-lg hover:opacity-90 transition-smooth"
          >
            {isLoading ? "Verifying..." : "Verify Email"}
          </Button>

          <button
            type="button"
            onClick={handleResend}
            disabled={isResending || resendCooldown > 0}
            className="w-full text-sm text-green-600 hover:text-green-700 font-medium py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResending ? "Sending..." : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Didn't receive the code? Resend"}
          </button>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <button
            onClick={onCancel}
            className="w-full text-sm text-gray-600 hover:text-gray-700 font-medium py-2"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
