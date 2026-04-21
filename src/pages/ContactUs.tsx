import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, FileText, Receipt, Building2, Loader } from "lucide-react";

interface ContactFormData {
  contactReason: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  file: File | null;
}

interface FormErrors {
  contactReason?: string;
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
}

interface UserProfile {
  first_name: string;
  last_name: string;
  email: string;
  customer_profile: {
    phone: string;
  };
}

interface ContactDetailsData {
  id: number;
  address: string | null;
  phone: string | null;
  email: string | null;
  vat_number: string | null;
  registered_number: string | null;
}

export default function ContactUs() {
  const [formData, setFormData] = useState<ContactFormData>({
    contactReason: "",
    name: "",
    email: "",
    phone: "",
    message: "",
    file: null,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [contactDetails, setContactDetails] = useState<ContactDetailsData | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);
  const { toast } = useToast();

  // Fetch user profile on component mount
  useEffect(() => {
    const refreshAccessToken = async (): Promise<boolean> => {
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) return false;

        const response = await fetch(`${import.meta.env.VITE_API_URL}/users/token/refresh/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh: refreshToken }),
        });

        if (!response.ok) {
          return false;
        }

        const data = await response.json();
        localStorage.setItem('access_token', data.access);
        return true;
      } catch (error) {
        console.error('Token refresh failed:', error);
        return false;
      }
    };

    const fetchUserProfile = async () => {
      try {
        let token = localStorage.getItem('access_token');
        let response = await fetch(`${import.meta.env.VITE_API_URL}/users/profile/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        
        // If token expired (401), try to refresh once
        if (response.status === 401) {
          const refreshed = await refreshAccessToken();
          if (refreshed) {
            token = localStorage.getItem('access_token');
            response = await fetch(`${import.meta.env.VITE_API_URL}/users/profile/`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
            });
          }
        }

        if (response.ok) {
          const profile = await response.json();
          const fullName = `${profile.first_name} ${profile.last_name}`.trim();
          setFormData((prev) => ({
            ...prev,
            name: fullName,
            email: profile.email,
            phone: profile.customer_profile?.phone || '',
          }));
        }
      } catch (error) {
        // User might not be authenticated, which is fine
        // Just keep the form empty for non-authenticated users
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Fetch contact details from API
  useEffect(() => {
    const fetchContactDetails = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/core/contact-details/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const details = await response.json();
          setContactDetails(details);
        }
      } catch (error) {
        // Handle error silently
        console.error('Failed to fetch contact details:', error);
      } finally {
        setIsLoadingDetails(false);
      }
    };

    fetchContactDetails();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.contactReason) {
      newErrors.contactReason = "Please select a contact reason";
    }
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }
    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({
      ...prev,
      file,
    }));
  };

  const submitContactForm = async () => {
    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    const submitFormData = new FormData();
    submitFormData.append("contact_reason", formData.contactReason);
    submitFormData.append("name", formData.name);
    submitFormData.append("email", formData.email);
    submitFormData.append("phone", formData.phone);
    submitFormData.append("message", formData.message);

    if (formData.file) {
      submitFormData.append("file_attachment", formData.file);
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/message/`, {
        method: 'POST',
        body: submitFormData,
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      toast({
        title: "Success",
        description: "Your message has been sent successfully. We'll get back to you soon!",
        className: "bg-green-600 text-white border-green-700",
        duration: 5000,
      });
      setFormData({
        contactReason: "",
        name: "",
        email: "",
        phone: "",
        message: "",
        file: null,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactReasons = [
    "Existing Order & Delivery Enquiries",
    "Product Enquiries",
    "Sales Enquiries",
    "Other",
  ];

  const inputCls = "w-full px-4 py-3 text-[.85rem] bg-white dark:bg-black/[.05] border border-black/[.1] dark:border-white/[.08] rounded-lg text-black/80 dark:text-[rgba(240,242,237,.8)] placeholder-black/40 dark:placeholder-[rgba(240,242,237,.4)] focus:outline-none focus:border-lime-brand/30 focus:bg-lime-brand/[.05] transition-all duration-150";
  const labelCls = "block text-[.8rem] font-medium text-black/70 dark:text-[rgba(240,242,237,.7)] mb-2";
  const errorCls = "text-red-600 dark:text-red-400 text-[.8rem] mt-1";

  return (
    <div className="font-outfit bg-white dark:bg-dark-surface min-h-screen">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-green-brand to-lime-brand text-dark-surface py-12 px-4">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Mail className="w-8 h-8" />
            <h1 className="font-bebas text-[2.5rem] tracking-[.08em]">Contact Us</h1>
          </div>
          <p className="text-[.95rem] opacity-90 max-w-2xl">Have a question or feedback? We'd love to hear from you. Get in touch with our team.</p>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-12 px-4">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Contact Form */}
            <div className="md:col-span-2 bg-white dark:bg-black/[.02] rounded-lg border border-black/[.08] dark:border-white/[.06] p-8">
              <h2 className="font-bebas text-2xl tracking-[.08em] text-black/85 dark:text-[#f0f2ed] mb-6">Send us a Message</h2>

              <form onSubmit={(e) => {
                e.preventDefault();
                setIsSubmitting(true);
                submitContactForm();
              }} className="space-y-5">
                {/* Contact Reason */}
                <div>
                  <label htmlFor="contactReason" className={labelCls}>
                    Contact Reason <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="contactReason"
                    name="contactReason"
                    value={formData.contactReason}
                    onChange={handleInputChange}
                    className={`${inputCls} appearance-none cursor-pointer`}
                  >
                    <option value="" disabled>
                      Select a contact reason
                    </option>
                    {contactReasons.map((reason) => (
                      <option key={reason} value={reason}>
                        {reason}
                      </option>
                    ))}
                  </select>
                  {errors.contactReason && (
                    <p className={errorCls}>{errors.contactReason}</p>
                  )}
                </div>

                {/* Name */}
                <div>
                  <label htmlFor="name" className={labelCls}>
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={inputCls}
                  />
                  {errors.name && (
                    <p className={errorCls}>{errors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className={labelCls}>
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={inputCls}
                  />
                  {errors.email && (
                    <p className={errorCls}>{errors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className={labelCls}>
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+27 123 456 7890"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={inputCls}
                  />
                  {errors.phone && (
                    <p className={errorCls}>{errors.phone}</p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className={labelCls}>
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    placeholder="Tell us how we can help..."
                    rows={5}
                    value={formData.message}
                    onChange={handleInputChange}
                    className={inputCls}
                  />
                  {errors.message && (
                    <p className={errorCls}>{errors.message}</p>
                  )}
                </div>

                {/* File Attachment */}
                <div>
                  <label htmlFor="file" className={labelCls}>
                    File Attachment
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      id="file"
                      name="file"
                      type="file"
                      onChange={handleFileChange}
                      className="flex-1 text-[.85rem]"
                    />
                    <FileText className="w-5 h-5 text-black/40 dark:text-[rgba(240,242,237,.4)]" />
                  </div>
                  <p className="text-[.75rem] text-black/50 dark:text-[rgba(240,242,237,.5)] mt-1">Optional - Max file size: 5MB</p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || isLoadingProfile}
                  className="w-full bg-gradient-to-br from-green-brand to-lime-brand text-dark-surface font-semibold py-3 rounded-lg transition-all duration-200 hover:shadow-[0_0_16px_rgba(168,214,62,.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </form>
            </div>

            {/* Contact Details */}
            <div className="bg-white dark:bg-black/[.02] rounded-lg border border-black/[.08] dark:border-white/[.06] p-8">
              <h2 className="font-bebas text-2xl tracking-[.08em] text-black/85 dark:text-[#f0f2ed] mb-6">Contact Details</h2>

              <div className="space-y-6">
                {contactDetails?.address && (
                  <div className="flex items-start gap-4">
                    <div className="bg-gradient-to-br from-green-brand to-lime-brand rounded-lg p-3 text-dark-surface flex-shrink-0">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-black/85 dark:text-[#f0f2ed] mb-2">Address</h3>
                      <p className="text-black/60 dark:text-[rgba(240,242,237,.6)] text-[.85rem] leading-relaxed whitespace-pre-wrap">
                        {contactDetails.address}
                      </p>
                    </div>
                  </div>
                )}

                {contactDetails?.phone && (
                  <div className="flex items-start gap-4">
                    <div className="bg-gradient-to-br from-green-brand to-lime-brand rounded-lg p-3 text-dark-surface flex-shrink-0">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-black/85 dark:text-[#f0f2ed] mb-2">Phone</h3>
                      <p className="text-black/60 dark:text-[rgba(240,242,237,.6)] text-[.85rem]">{contactDetails.phone}</p>
                    </div>
                  </div>
                )}

                {contactDetails?.vat_number && (
                  <div className="flex items-start gap-4">
                    <div className="bg-gradient-to-br from-green-brand to-lime-brand rounded-lg p-3 text-dark-surface flex-shrink-0">
                      <Receipt className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-black/85 dark:text-[#f0f2ed] mb-2">VAT Number</h3>
                      <p className="text-black/60 dark:text-[rgba(240,242,237,.6)] text-[.85rem]">{contactDetails.vat_number}</p>
                    </div>
                  </div>
                )}

                {contactDetails?.registered_number && (
                  <div className="flex items-start gap-4">
                    <div className="bg-gradient-to-br from-green-brand to-lime-brand rounded-lg p-3 text-dark-surface flex-shrink-0">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-black/85 dark:text-[#f0f2ed] mb-2">Registered Number</h3>
                      <p className="text-black/60 dark:text-[rgba(240,242,237,.6)] text-[.85rem]">{contactDetails.registered_number}</p>
                    </div>
                  </div>
                )}

                {contactDetails?.email && (
                  <div className="flex items-start gap-4">
                    <div className="bg-gradient-to-br from-green-brand to-lime-brand rounded-lg p-3 text-dark-surface flex-shrink-0">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-black/85 dark:text-[#f0f2ed] mb-2">Email</h3>
                      <p className="text-black/60 dark:text-[rgba(240,242,237,.6)] text-[.85rem]">{contactDetails.email}</p>
                    </div>
                  </div>
                )}

                {!isLoadingDetails && !contactDetails && (
                  <p className="text-black/50 dark:text-[rgba(240,242,237,.5)] text-[.85rem]">No contact details available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
