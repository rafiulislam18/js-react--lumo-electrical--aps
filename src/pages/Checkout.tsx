import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Truck, CreditCard, Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SOUTH_AFRICAN_PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "Northern Cape",
  "North West",
  "Western Cape",
];

// Free delivery applies to Cape Town (Western Cape) orders with a subtotal of
// at least R1000. Otherwise a flat R50 shipping fee is charged. This must mirror
// the backend `calculate_shipping` logic in apps/orders/views.py.
const FREE_DELIVERY_THRESHOLD = 1000;
const SHIPPING_FEE = 50;

const calculateShipping = (
  subtotal: number,
  city: string,
  province: string
): number => {
  const normalisedCity = (city || "").trim().toLowerCase().replace(/\s+/g, "");
  const normalisedProvince = (province || "").trim().toLowerCase().replace(/\s+/g, "");

  const isCapeTown = normalisedCity === "capetown";
  const isWesternCape = normalisedProvince === "westerncape";

  if (isCapeTown && isWesternCape && subtotal >= FREE_DELIVERY_THRESHOLD) {
    return 0;
  }
  return SHIPPING_FEE;
};

interface CartItem {
  id: string;
  product_name: string;
  price: number;
  image: string;
  quantity: number;
  subtotal: number;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  comment: string;
}

interface CheckoutData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  delivery_address: string;
  delivery_city: string;
  delivery_province: string;
  delivery_postal_code: string;
  cart_items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

export default function Checkout() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "South Africa",
    comment: "",
  });
  const [pricing, setPricing] = useState({
    subtotal: 0,
    tax: 0,
    shipping: 0,
    total: 0,
  });

  useEffect(() => {
    const fetchCheckoutData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          toast({
            title: "Authentication Required",
            description: "Please log in to proceed with checkout.",
            variant: "destructive",
          });
          navigate("/login");
          return;
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/orders/checkout-data/`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch checkout data");
        }

        const data: CheckoutData = await response.json();

        // Convert cart item prices from strings to numbers
        data.cart_items = data.cart_items.map((item) => ({
          ...item,
          price: Number(item.price),
          subtotal: Number(item.subtotal),
        }));

        // Set cart items
        setItems(data.cart_items);

        // Pre-fill form
        setFormData({
          firstName: data.first_name,
          lastName: data.last_name,
          email: data.email,
          phone: data.phone,
          address: data.delivery_address,
          city: data.delivery_city,
          state: data.delivery_province,
          zipCode: data.delivery_postal_code,
          country: "South Africa",
          comment: "",
        });

        // Set pricing
        setPricing({
          subtotal: Number(data.subtotal),
          tax: Number(data.tax),
          shipping: Number(data.shipping),
          total: Number(data.total),
        });
      } catch (error) {
        console.error("Error fetching checkout data:", error);
        toast({
          title: "Error",
          description: "Failed to load checkout data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setInitialLoading(false);
      }
    };

    fetchCheckoutData();
  }, [navigate, toast]);

  // Recompute shipping (and total) whenever the delivery city/province or
  // subtotal change, so the summary reflects what the user actually entered.
  useEffect(() => {
    setPricing((prev) => {
      const shipping = calculateShipping(prev.subtotal, formData.city, formData.state);
      return {
        ...prev,
        shipping,
        total: prev.subtotal + prev.tax + shipping,
      };
    });
  }, [formData.city, formData.state]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.phone ||
      !formData.address ||
      !formData.city ||
      !formData.state ||
      !formData.zipCode
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all shipping details.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please log in to proceed.",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      const orderData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        delivery_address: formData.address,
        delivery_city: formData.city,
        delivery_province: formData.state,
        delivery_postal_code: formData.zipCode,
        comment: formData.comment || "",
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/orders/create/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderData),
        }
      );
      
      if (response.ok) {
        const { url, data, method } = await response.json();

        // Create hidden form and submit to PayFast (redirects user)
        const form = document.createElement('form');
        form.method = method;
        form.action = url;
        form.target = '_self'; // Check if it makes the form submit work properly on mobile

        Object.keys(data).forEach(key => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = data[key];
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create order");
      }
    } catch (error) {
      // console.error("Order creation error:", error);
      toast({
        title: "Order Failed",
        description: error instanceof Error ? error.message : "There was an error processing your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="font-outfit bg-white dark:bg-[#0a0c0a] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 text-[#2f8b3d] dark:text-[#a8d63e] animate-spin mx-auto mb-3" />
          <p className="text-[.9rem] text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)]">Loading checkout data...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="font-outfit bg-white dark:bg-[#0a0c0a] min-h-screen flex items-center justify-center px-4">
        <div className="bg-white dark:bg-[#141914] border border-[rgba(22,25,26,.1)] dark:border-white/10 rounded-[24px] p-10 sm:p-12 text-center max-w-md w-full">
          <h2 className="font-bebas text-[2rem] tracking-[.04em] text-[#16191a] dark:text-[#f1f3ea] mb-2">Your cart is empty</h2>
          <p className="text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)] mb-6 text-[.9rem]">
            Looks like you haven't added anything yet. Browse our range and find what you need.
          </p>
          <button
            onClick={() => navigate("/products")}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#399746] to-[#a8d63e] text-white dark:text-[#0a0c0a] font-semibold py-[.7rem] px-7 rounded-[10px] transition-all duration-200 hover:shadow-[0_0_16px_rgba(168,214,62,.4)]"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const inputCls = "w-full px-[.9rem] py-[.7rem] text-[.85rem] bg-white dark:bg-[#141914] border border-[rgba(22,25,26,.1)] dark:border-white/10 rounded-[10px] text-[#16191a] dark:text-[#f1f3ea] placeholder-[rgba(22,25,26,.42)] dark:placeholder-[rgba(241,243,234,.42)] outline-none focus:border-[rgba(57,151,70,.4)] transition-colors";
  const lockedCls = "w-full px-[.9rem] py-[.7rem] text-[.85rem] bg-[#f7f6f1] dark:bg-[#171c16] border border-[rgba(22,25,26,.1)] dark:border-white/10 rounded-[10px] text-[#16191a] dark:text-[#f1f3ea] opacity-70 cursor-not-allowed flex items-center";
  const labelCls = "block text-[.8rem] font-medium text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)] mb-2";
  const reqCls = "text-[#d94646]";

  return (
    <div className="font-outfit bg-[#f6f5f0]/[.86] dark:bg-[#0a0c0a] min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-10">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 text-[.68rem] font-bold tracking-[.2em] uppercase text-[#2f8b3d] dark:text-[#a8d63e] mb-3 before:content-[''] before:w-6 before:h-0.5 before:bg-[#2f8b3d] dark:before:bg-[#a8d63e] before:rounded-sm before:shrink-0">
            Almost there
          </div>
          <h1 className="font-bebas leading-[.9] tracking-[.04em] text-[#16191a] dark:text-[#f1f3ea] text-[clamp(2.4rem,6vw,4rem)]">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Shipping Information */}
              <div className="bg-white dark:bg-[#141914] border border-[rgba(22,25,26,.1)] dark:border-white/10 rounded-[24px] p-6 sm:p-8">
                <h2 className="text-[1.05rem] font-semibold text-[#16191a] dark:text-[#f1f3ea] mb-6 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-[#2f8b3d] dark:text-[#a8d63e]" />
                  Shipping Information
                </h2>

                <div className="space-y-5">
                  {/* Name Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className={labelCls}>
                        First Name <span className={reqCls}>*</span>
                      </label>
                      <input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="John"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className={labelCls}>
                        Last Name <span className={reqCls}>*</span>
                      </label>
                      <input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Doe"
                        className={inputCls}
                      />
                    </div>
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="email" className={labelCls}>
                        Email <span className={reqCls}>*</span>
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="john@example.com"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className={labelCls}>
                        Phone <span className={reqCls}>*</span>
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+27 123 456 7890"
                        className={inputCls}
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label htmlFor="address" className={labelCls}>
                      Street Address <span className={reqCls}>*</span>
                    </label>
                    <input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="123 Main Street"
                      className={inputCls}
                    />
                  </div>

                  {/* City & State (Province) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="city" className={labelCls}>
                        City <span className={reqCls}>*</span>
                      </label>
                      <input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Cape Town"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label htmlFor="state" className={labelCls}>
                        Province <span className={reqCls}>*</span>
                      </label>
                      <select
                        id="state"
                        value={formData.state}
                        onChange={(e) => handleSelectChange("state", e.target.value)}
                        className={`${inputCls} cursor-pointer`}
                      >
                        <option value="" disabled>Select a province</option>
                        {SOUTH_AFRICAN_PROVINCES.map((province) => (
                          <option key={province} value={province}>
                            {province}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* ZIP & Country */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="zipCode" className={labelCls}>
                        Postal Code <span className={reqCls}>*</span>
                      </label>
                      <input
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        placeholder="8000"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label htmlFor="country" className={labelCls}>
                        Country
                      </label>
                      <div id="country" className={lockedCls}>
                        South Africa
                      </div>
                    </div>
                  </div>

                  {/* Order Comments */}
                  <div>
                    <label htmlFor="comment" className={labelCls}>
                      Comment (Optional)
                    </label>
                    <textarea
                      id="comment"
                      name="comment"
                      value={formData.comment}
                      onChange={(e) => setFormData((prev) => ({ ...prev, comment: e.target.value }))}
                      placeholder="Add any special instructions or comments for your order..."
                      className={`${inputCls} resize-none`}
                      rows={4}
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-[#141914] border border-[rgba(22,25,26,.1)] dark:border-white/10 rounded-[24px] p-6 lg:sticky lg:top-[96px]">
              <h2 className="text-[1.05rem] font-semibold text-[#16191a] dark:text-[#f1f3ea] mb-5">Order Summary</h2>

              {/* Items List */}
              <div className="space-y-3 mb-5 max-h-72 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 pb-3 border-b border-[rgba(22,25,26,.07)] dark:border-white/[.06] last:border-0"
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.product_name}
                        className="w-14 h-14 object-cover rounded-[10px]"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-[.84rem] leading-snug text-[#16191a] dark:text-[#f1f3ea] line-clamp-2">
                        {item.product_name}
                      </h3>
                      <p className="text-[.8rem] mt-1">
                        <span className="font-semibold text-[#16191a] dark:text-[#f1f3ea]">R{item.price}</span>{" "}
                        <span className="text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)]">x {item.quantity}</span> ={" "}
                        <span className="font-semibold text-[#2f8b3d] dark:text-[#a8d63e]">R{item.subtotal.toFixed(2)}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing Summary */}
              <div className="space-y-2 border-t border-[rgba(22,25,26,.07)] dark:border-white/[.06] pt-4 text-[.85rem]">
                <div className="flex justify-between text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)]">
                  <span>Subtotal</span>
                  <span>R{pricing.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)]">
                  <span>Tax (10%)</span>
                  <span>R{pricing.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)]">
                  <span>Shipping</span>
                  <span className={pricing.shipping === 0 ? "text-[#2f8b3d] dark:text-[#a8d63e] font-semibold" : ""}>
                    {pricing.shipping === 0 ? "Free" : `R${pricing.shipping.toFixed(2)}`}
                  </span>
                </div>

                {pricing.shipping === 0 && (
                  <p className="text-[.75rem] text-[#2f8b3d] dark:text-[#a8d63e] font-medium">
                    You've qualified for free shipping!
                  </p>
                )}

                <div className="border-t border-[rgba(22,25,26,.07)] dark:border-white/[.06] pt-3 mt-1 flex justify-between items-center">
                  <span className="font-bold text-[#16191a] dark:text-[#f1f3ea]">Total</span>
                  <span className="font-bold text-[#2f8b3d] dark:text-[#a8d63e] text-[1.15rem]">
                    R{pricing.total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <form onSubmit={handleSubmit} className="mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#399746] to-[#a8d63e] text-white dark:text-[#0a0c0a] font-semibold py-[.8rem] rounded-[10px] transition-all duration-200 hover:shadow-[0_0_16px_rgba(168,214,62,.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Proceed to Payment
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
