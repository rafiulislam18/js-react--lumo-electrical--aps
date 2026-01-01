import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import EmailVerificationModal from "@/components/EmailVerificationModal";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

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

  return (
    <div className="min-h-screen bg-gray-50/30 flex flex-col font-sans">
      <section className="flex-1 py-20 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-lime-400 px-8 py-12 text-white">
              <h1 className="text-3xl font-display font-bold mb-2">Change Password</h1>
              <p className="text-green-50">Update your account password securely</p>
            </div>

            {/* Form */}
            <form onSubmit={handleRequestCode} className="p-8 space-y-6">
              {/* Error Alert */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    type={showPasswords.current ? "text" : "password"}
                    name="current"
                    value={passwords.current}
                    onChange={handleChange}
                    placeholder="Enter your current password"
                    className="pl-10 pr-10 h-11 rounded-lg border-gray-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    type={showPasswords.new ? "text" : "password"}
                    name="new"
                    value={passwords.new}
                    onChange={handleChange}
                    placeholder="Enter your new password"
                    className="pl-10 pr-10 h-11 rounded-lg border-gray-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.new ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">At least 8 characters</p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    type={showPasswords.confirm ? "text" : "password"}
                    name="confirm"
                    value={passwords.confirm}
                    onChange={handleChange}
                    placeholder="Confirm your new password"
                    className="pl-10 pr-10 h-11 rounded-lg border-gray-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isLoading || !passwords.current || !passwords.new || !passwords.confirm}
                  className="flex-1 bg-gradient-to-r from-green-500 to-lime-400 text-white font-semibold hover:opacity-90 border-0"
                >
                  {isLoading ? "Verifying..." : "Send Verification Code"}
                </Button>
              </div>

              {/* Info */}
              <p className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
                We'll send a verification code to your email for security. You'll need it to complete the password change.
              </p>
            </form>
          </div>
        </div>
      </section>

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
