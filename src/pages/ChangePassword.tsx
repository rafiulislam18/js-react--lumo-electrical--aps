import { useState, useEffect } from "react";
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import EmailVerificationModal from "@/components/EmailVerificationModal";

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000/api';

export default function ChangePassword() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<'request' | 'verify' | 'change'>('request');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  // Check if user is authenticated
  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      navigate('/login');
    }
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords(prev => ({
      ...prev,
      [name]: value
    }));
    setError("");
  };

  // Step 1: Request verification code
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        setError('You must be logged in to change your password');
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/users/change-password/request/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          current_password: passwords.current
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || data.current_password?.[0] || 'Failed to request verification code');
        setIsLoading(false);
        return;
      }

      // Success - show verification modal
      toast({
        title: "Code Sent",
        description: `Verification code sent to your email`,
        className: "bg-blue-600 text-white border-blue-700",
      });
      setShowVerificationModal(true);
      setIsLoading(false);
    } catch (err) {
      setError('Network error. Please check your connection.');
      setIsLoading(false);
      console.error('Request code error:', err);
    }
  };

  // Step 2: Verify code and change password
  const handleChangePassword = async (code?: string) => {
    const verificationCodeToUse = code || verificationCode;
    
    if (passwords.new !== passwords.confirm) {
      setError("New passwords do not match");
      return;
    }

    if (passwords.new.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        setError('You must be logged in to change your password');
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/users/change-password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          verification_code: verificationCodeToUse,
          current_password: passwords.current,
          new_password: passwords.new,
          confirm_password: passwords.confirm
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || 'Failed to change password');
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      toast({
        title: "Success",
        description: "Password changed successfully!",
        className: "bg-green-600 text-white border-green-700",
      });
      setTimeout(() => navigate("/profile"), 1500);
    } catch (err) {
      setError('Network error. Please check your connection.');
      setIsLoading(false);
      console.error('Change password error:', err);
    }
  };

  const handleVerificationSuccess = (data?: any) => {
    setShowVerificationModal(false);
    // Get verification code from modal response and pass it directly to handleChangePassword
    if (data?.verificationCode) {
      handleChangePassword(data.verificationCode);
    }
  };

  const inputCls = "w-full pl-10 pr-10 py-3 text-[.85rem] bg-white dark:bg-black/[.05] border border-black/[.1] dark:border-white/[.08] rounded-lg text-black/80 dark:text-[rgba(240,242,237,.8)] placeholder-black/40 dark:placeholder-[rgba(240,242,237,.4)] focus:outline-none focus:border-lime-brand/30 focus:bg-lime-brand/[.05] transition-all duration-150";

  return (
    <div className="font-outfit bg-white dark:bg-dark-surface min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="font-bebas text-[2.5rem] tracking-[.08em] text-black/85 dark:text-[#f0f2ed] mb-2">
          Change Password
        </h1>
        <p className="text-[.9rem] text-black/55 dark:text-[rgba(240,242,237,.55)]">
          Update your account password securely
        </p>
      </div>

      {/* Form Card */}
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-black/[.02] rounded-xl border border-black/[.08] dark:border-white/[.06] overflow-hidden">
          {/* Form */}
          <form onSubmit={handleRequestCode} className="p-8 space-y-5">

            {/* Error Alert */}
            {error && (
              <div className="bg-red-50 dark:bg-red-950/[.2] border border-red-200 dark:border-red-900/[.3] rounded-lg p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 dark:text-red-300 text-[.85rem]">{error}</p>
              </div>
            )}

            {/* Current Password */}
            <div>
              <label className="block text-[.8rem] font-medium text-black/70 dark:text-[rgba(240,242,237,.7)] mb-2">
                Current Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40 dark:text-[rgba(240,242,237,.4)]" />
                <input
                  type={showPasswords.current ? "text" : "password"}
                  name="current"
                  value={passwords.current}
                  onChange={handleChange}
                  placeholder="Enter your current password"
                  className={inputCls}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 dark:text-[rgba(240,242,237,.4)] hover:text-black/60 dark:hover:text-[rgba(240,242,237,.6)] transition-colors duration-150"
                >
                  {showPasswords.current ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-[.8rem] font-medium text-black/70 dark:text-[rgba(240,242,237,.7)] mb-2">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40 dark:text-[rgba(240,242,237,.4)]" />
                <input
                  type={showPasswords.new ? "text" : "password"}
                  name="new"
                  value={passwords.new}
                  onChange={handleChange}
                  placeholder="Enter your new password"
                  className={inputCls}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 dark:text-[rgba(240,242,237,.4)] hover:text-black/60 dark:hover:text-[rgba(240,242,237,.6)] transition-colors duration-150"
                >
                  {showPasswords.new ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-[.75rem] text-black/50 dark:text-[rgba(240,242,237,.5)] mt-1">At least 8 characters</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[.8rem] font-medium text-black/70 dark:text-[rgba(240,242,237,.7)] mb-2">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40 dark:text-[rgba(240,242,237,.4)]" />
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  name="confirm"
                  value={passwords.confirm}
                  onChange={handleChange}
                  placeholder="Confirm your new password"
                  className={inputCls}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 dark:text-[rgba(240,242,237,.4)] hover:text-black/60 dark:hover:text-[rgba(240,242,237,.6)] transition-colors duration-150"
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Password Match Validation */}
              {passwords.new && passwords.confirm && (
                <div className={`mt-2 flex items-center gap-2 text-[.8rem] ${passwords.new === passwords.confirm ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {passwords.new === passwords.confirm ? (
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !passwords.current || !passwords.new || !passwords.confirm || passwords.new !== passwords.confirm}
              className="w-full py-3 rounded-lg bg-gradient-to-br from-green-brand to-lime-brand text-white dark:text-dark-surface font-semibold text-[.9rem] cursor-pointer transition-all duration-200 hover:shadow-[0_0_16px_rgba(168,214,62,.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
            >
              {isLoading ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Verifying...
                </>
              ) : (
                'Send Verification Code'
              )}
            </button>

            {/* Info Message */}
            <div className="bg-blue-50 dark:bg-blue-950/[.2] border border-blue-200 dark:border-blue-900/[.3] rounded-lg p-3">
              <p className="text-[.8rem] text-blue-700 dark:text-blue-300">
                We'll send a verification code to your email for security. You'll need it to complete the password change.
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Email Verification Modal */}
      {showVerificationModal && (
        <EmailVerificationModal
          email={(() => {
            try {
              const user = JSON.parse(localStorage.getItem('user') || '{}');
              return user.email || 'your email';
            } catch {
              return 'your email';
            }
          })()}
          tokenType="change_password"
          onSuccess={handleVerificationSuccess}
          onCancel={() => setShowVerificationModal(false)}
        />
      )}
    </div>
  );
}
