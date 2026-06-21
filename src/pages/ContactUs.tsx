import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, FileText, Receipt, Building2, Loader, Send, MessageSquare, Clock } from "lucide-react";

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

  const inputCls = "w-full px-[.9rem] py-[.8rem] text-[.85rem] bg-white dark:bg-[#141914] border border-[rgba(22,25,26,.1)] dark:border-white/10 rounded-[10px] text-[#16191a] dark:text-[#f1f3ea] placeholder-[rgba(22,25,26,.42)] dark:placeholder-[rgba(241,243,234,.42)] outline-none focus:border-[rgba(57,151,70,.4)] transition-colors";
  const labelCls = "block text-[.8rem] font-medium mb-2 text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)]";
  const errorCls = "text-red-600 dark:text-red-400 text-[.8rem] mt-1";

  return (
    <div className="font-outfit bg-[#f6f5f0] dark:bg-[#0a0c0a] min-h-screen flex flex-col">
      {/* Page header */}
      <section className="px-4 sm:px-8 pt-12 pb-8">
        <div className="max-w-[1280px] mx-auto">
          <div className="inline-flex items-center gap-2 text-[.68rem] font-bold tracking-[.2em] uppercase text-[#2f8b3d] dark:text-[#a8d63e] mb-[.8rem] before:content-[''] before:w-6 before:h-0.5 before:bg-[#2f8b3d] dark:before:bg-[#a8d63e] before:rounded-sm before:shrink-0">
            Get in touch
          </div>
          <h1 className="font-bebas text-[clamp(2.6rem,6vw,4.4rem)] leading-none tracking-[.01em] text-[#16191a] dark:text-[#f1f3ea] mb-3">
            Let's talk
          </h1>
          <p className="text-[.95rem] max-sm:text-[.88rem] leading-[1.8] max-w-2xl text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)]">
            Have a question or feedback? We'd love to hear from you. Get in touch with our team at Lumo Electrical and we'll respond as soon as possible.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="flex-1 pb-16 px-4 sm:px-8">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid md:grid-cols-3 gap-6">

            {/* LEFT: Contact info cards */}
            <div className="md:col-span-1 flex flex-col gap-4">
              <div className="bg-white dark:bg-[#141914] border border-[rgba(22,25,26,.1)] dark:border-white/10 rounded-[24px] p-7">
                <h2 className="font-bebas text-[1.7rem] tracking-[.04em] text-[#16191a] dark:text-[#f1f3ea] mb-1">Contact details</h2>
                <p className="text-[.8rem] mb-6 text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)]">
                  Reach us directly using the details below.
                </p>

                <div className="space-y-3">
                  {contactDetails?.address && (
                    <div className="flex items-start gap-3 bg-[#f7f6f1] dark:bg-[#171c16] border border-[rgba(22,25,26,.07)] dark:border-white/[.06] rounded-[14px] p-4">
                      <div className="bg-gradient-to-r from-[#399746] to-[#a8d63e] rounded-[10px] p-2.5 text-white dark:text-[#0a0c0a] flex-shrink-0">
                        <MapPin className="w-[18px] h-[18px]" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-[.7rem] font-bold tracking-[.12em] uppercase text-[rgba(22,25,26,.5)] dark:text-[rgba(241,243,234,.5)] mb-1">Address</h3>
                        <p className="text-[.85rem] leading-relaxed text-[#16191a] dark:text-[#f1f3ea] whitespace-pre-wrap break-words">
                          {contactDetails.address}
                        </p>
                      </div>
                    </div>
                  )}

                  {contactDetails?.phone && (
                    <div className="flex items-start gap-3 bg-[#f7f6f1] dark:bg-[#171c16] border border-[rgba(22,25,26,.07)] dark:border-white/[.06] rounded-[14px] p-4">
                      <div className="bg-gradient-to-r from-[#399746] to-[#a8d63e] rounded-[10px] p-2.5 text-white dark:text-[#0a0c0a] flex-shrink-0">
                        <Phone className="w-[18px] h-[18px]" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-[.7rem] font-bold tracking-[.12em] uppercase text-[rgba(22,25,26,.5)] dark:text-[rgba(241,243,234,.5)] mb-1">Phone</h3>
                        <p className="text-[.85rem] text-[#16191a] dark:text-[#f1f3ea] break-words">{contactDetails.phone}</p>
                      </div>
                    </div>
                  )}

                  {contactDetails?.email && (
                    <div className="flex items-start gap-3 bg-[#f7f6f1] dark:bg-[#171c16] border border-[rgba(22,25,26,.07)] dark:border-white/[.06] rounded-[14px] p-4">
                      <div className="bg-gradient-to-r from-[#399746] to-[#a8d63e] rounded-[10px] p-2.5 text-white dark:text-[#0a0c0a] flex-shrink-0">
                        <Mail className="w-[18px] h-[18px]" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-[.7rem] font-bold tracking-[.12em] uppercase text-[rgba(22,25,26,.5)] dark:text-[rgba(241,243,234,.5)] mb-1">Email</h3>
                        <p className="text-[.85rem] text-[#16191a] dark:text-[#f1f3ea] break-words">{contactDetails.email}</p>
                      </div>
                    </div>
                  )}

                  {contactDetails?.vat_number && (
                    <div className="flex items-start gap-3 bg-[#f7f6f1] dark:bg-[#171c16] border border-[rgba(22,25,26,.07)] dark:border-white/[.06] rounded-[14px] p-4">
                      <div className="bg-gradient-to-r from-[#399746] to-[#a8d63e] rounded-[10px] p-2.5 text-white dark:text-[#0a0c0a] flex-shrink-0">
                        <Receipt className="w-[18px] h-[18px]" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-[.7rem] font-bold tracking-[.12em] uppercase text-[rgba(22,25,26,.5)] dark:text-[rgba(241,243,234,.5)] mb-1">VAT Number</h3>
                        <p className="text-[.85rem] text-[#16191a] dark:text-[#f1f3ea] break-words">{contactDetails.vat_number}</p>
                      </div>
                    </div>
                  )}

                  {contactDetails?.registered_number && (
                    <div className="flex items-start gap-3 bg-[#f7f6f1] dark:bg-[#171c16] border border-[rgba(22,25,26,.07)] dark:border-white/[.06] rounded-[14px] p-4">
                      <div className="bg-gradient-to-r from-[#399746] to-[#a8d63e] rounded-[10px] p-2.5 text-white dark:text-[#0a0c0a] flex-shrink-0">
                        <Building2 className="w-[18px] h-[18px]" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-[.7rem] font-bold tracking-[.12em] uppercase text-[rgba(22,25,26,.5)] dark:text-[rgba(241,243,234,.5)] mb-1">Registered Number</h3>
                        <p className="text-[.85rem] text-[#16191a] dark:text-[#f1f3ea] break-words">{contactDetails.registered_number}</p>
                      </div>
                    </div>
                  )}

                  {!isLoadingDetails && !contactDetails && (
                    <p className="text-[.85rem] text-[rgba(22,25,26,.5)] dark:text-[rgba(241,243,234,.5)]">No contact details available</p>
                  )}
                </div>
              </div>

              {/* Hours card */}
              <div className="bg-[#f7f6f1] dark:bg-[#171c16] border border-[rgba(22,25,26,.07)] dark:border-white/[.06] rounded-[14px] p-5 flex items-start gap-3">
                <div className="bg-gradient-to-r from-[#399746] to-[#a8d63e] rounded-[10px] p-2.5 text-white dark:text-[#0a0c0a] flex-shrink-0">
                  <Clock className="w-[18px] h-[18px]" />
                </div>
                <div>
                  <h3 className="text-[.7rem] font-bold tracking-[.12em] uppercase text-[rgba(22,25,26,.5)] dark:text-[rgba(241,243,234,.5)] mb-1">Business Hours</h3>
                  <p className="text-[.85rem] text-[#16191a] dark:text-[#f1f3ea]">Mon – Fri, 8:00 – 17:00</p>
                </div>
              </div>
            </div>

            {/* RIGHT: Contact form tile */}
            <div className="md:col-span-2 bg-white dark:bg-[#141914] border border-[rgba(22,25,26,.1)] dark:border-white/10 rounded-[24px] p-8 sm:p-9">
              <div className="flex items-center gap-3 mb-1">
                <div className="bg-gradient-to-r from-[#399746] to-[#a8d63e] rounded-[10px] p-2 text-white dark:text-[#0a0c0a]">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h2 className="font-bebas text-[1.9rem] tracking-[.04em] text-[#16191a] dark:text-[#f1f3ea]">Send us a message</h2>
              </div>
              <p className="text-[.85rem] mb-7 text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)]">
                Fill in the form and our team will get back to you shortly.
              </p>

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

                <div className="grid sm:grid-cols-2 gap-5">
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
                    className={`${inputCls} resize-y`}
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
                  <div className="flex items-center gap-3 bg-[#f7f6f1] dark:bg-[#171c16] border border-[rgba(22,25,26,.07)] dark:border-white/[.06] rounded-[14px] px-4 py-3">
                    <FileText className="w-5 h-5 flex-shrink-0 text-[rgba(22,25,26,.42)] dark:text-[rgba(241,243,234,.42)]" />
                    <input
                      id="file"
                      name="file"
                      type="file"
                      onChange={handleFileChange}
                      className="flex-1 min-w-0 text-[.85rem] text-[rgba(22,25,26,.7)] dark:text-[rgba(241,243,234,.7)] file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-[.78rem] file:font-medium file:bg-[#2f8b3d]/10 dark:file:bg-[#a8d63e]/15 file:text-[#2f8b3d] dark:file:text-[#a8d63e] file:cursor-pointer cursor-pointer"
                    />
                  </div>
                  <p className="text-[.75rem] mt-1.5 text-[rgba(22,25,26,.5)] dark:text-[rgba(241,243,234,.5)]">Optional - Max file size: 5MB</p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || isLoadingProfile}
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 font-semibold rounded-full px-6 py-[.8rem] bg-gradient-to-r from-[#399746] to-[#a8d63e] text-white dark:text-[#0a0c0a] text-[.9rem] transition-all duration-200 hover:shadow-[0_0_16px_rgba(168,214,62,.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-[18px] h-[18px]" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
