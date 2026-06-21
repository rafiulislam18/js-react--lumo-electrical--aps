import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Package, ArrowLeft, CheckCircle, Truck, ShoppingBag, MapPin, Phone, Mail, Loader, MessageSquare, Send } from "lucide-react";
import { apiGet, apiPatch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  product_image: string | null;
  product_price: number;
  quantity: number;
}

interface OrderDetail {
  id: number;
  status: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  delivery_address: string;
  delivery_city: string;
  delivery_province: string;
  delivery_postal_code: string;
  comment: string | null;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  paid: boolean;
  payfast_payment_id: string | null;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  items_count: number;
  delivery_feedback: string | null;
}

export default function OrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackText, setFeedbackText] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const fetchOrderDetails = async () => {
    try {
      setIsLoading(true);
      const data = await apiGet(`/orders/${orderId}/`) as OrderDetail;
      setOrder(data);
    } catch (err) {
      console.error("Error fetching order details:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load order details. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      navigate('/login');
      return;
    }
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId, navigate, toast]);


  const handleFeedbackSubmit = async () => {
    if (!feedbackText.trim()) return;
    setSubmittingFeedback(true);
    try {
      await apiPatch(`/orders/${orderId}/feedback/`, { delivery_feedback: feedbackText });
      setOrder(prev => prev ? { ...prev, delivery_feedback: feedbackText } : prev);
      setFeedbackText('');
      toast({ title: "Thank you!", description: "Your feedback has been submitted." });
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to submit feedback. Please try again." });
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "order_placed":
        return <ShoppingBag className="w-5 h-5" />;
      case "assigned_courier":
        return <Truck className="w-5 h-5" />;
      case "delivered":
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "order_placed":
        return "Order Placed";
      case "assigned_courier":
        return "Courier Assigned";
      case "delivered":
        return "Delivered";
      default:
        return "Unknown Status";
    }
  };

  const getStatusPillClass = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-[rgba(57,151,70,.09)] dark:bg-[rgba(168,214,62,.1)] text-[#2f8b3d] dark:text-[#a8d63e]";
      case "assigned_courier":
        return "bg-[rgba(168,214,62,.14)] text-[#399746] dark:text-[#a8d63e]";
      default:
        return "bg-[rgba(22,25,26,.06)] dark:bg-white/[.07] text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)]";
    }
  };

  const pillBase =
    "inline-flex items-center gap-1.5 text-[.72rem] font-bold rounded-full px-[.7rem] py-[.34rem]";

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="font-outfit bg-white dark:bg-dark-surface min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="relative w-12 h-12 mb-3 rounded-full border-2 border-[#a8d63e] border-t-[#2f8b3d] animate-spin" />
          <p className="text-[.9rem] text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)]">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="font-outfit bg-[#f6f5f0]/[.86] dark:bg-dark-surface min-h-screen">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-14">
          <div className="bg-white dark:bg-[#141914] border border-[rgba(22,25,26,.1)] dark:border-white/10 rounded-[24px] p-12 text-center">
            <div className="mb-6 flex justify-center">
              <div className="bg-[#f7f6f1] dark:bg-white/[.06] rounded-full p-5">
                <Package className="w-16 h-16 text-[rgba(22,25,26,.25)] dark:text-white/[.2]" />
              </div>
            </div>
            <h3 className="font-bebas text-2xl tracking-[.08em] text-[#16191a] dark:text-[#f0f2ed] mb-2">Order Not Found</h3>
            <p className="text-[.9rem] text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)] mb-8 max-w-md mx-auto">We couldn't find the order you're looking for.</p>
            <Link to="/orders">
              <button className="inline-flex items-center gap-2 bg-gradient-to-r from-[#399746] to-[#a8d63e] text-white dark:text-[#0a0c0a] font-bold text-[.9rem] px-6 py-3 rounded-full transition-transform duration-200 hover:-translate-y-0.5">
                <ArrowLeft className="w-4 h-4" />
                Back to Orders
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="font-outfit bg-[#f6f5f0]/[.86] dark:bg-dark-surface min-h-screen flex flex-col">
      <section className="flex-1 py-14 px-4 sm:px-8 w-full">
        <div className="max-w-[1280px] mx-auto">
          {/* Back to Orders */}
          <button
            onClick={() => navigate('/orders')}
            className="flex items-center gap-2 text-[.85rem] font-medium mb-6 text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)] hover:text-[#2f8b3d] dark:hover:text-[#a8d63e] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </button>

          {/* Header block */}
          <div className="mb-9">
            <div className="inline-flex items-center gap-2 text-[.68rem] font-bold tracking-[.2em] uppercase text-[#2f8b3d] dark:text-[#a8d63e] mb-3 before:content-[''] before:w-[1.4rem] before:h-0.5 before:bg-[#2f8b3d] dark:before:bg-[#a8d63e] before:rounded-sm before:shrink-0">
              Order tracking
            </div>
            <h1 className="font-bebas leading-[.9] text-[clamp(2.2rem,5.5vw,3.6rem)] text-[#16191a] dark:text-[#f0f2ed]">Order #{order.id}</h1>
            <p className="mt-3 text-[.95rem] text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)]">
              Detailed order information and tracking details
            </p>
          </div>

          {/* Status tile */}
          <div className="bg-white dark:bg-[#141914] border border-[rgba(22,25,26,.1)] dark:border-white/10 rounded-[24px] p-6 mb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-[.78rem] font-medium mb-2 text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)]">Order Status</p>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`${pillBase} ${getStatusPillClass(order.status)}`}>
                  {getStatusIcon(order.status)}
                  {getStatusDisplay(order.status)}
                </span>
                <span className={`${pillBase} ${order.paid
                  ? "bg-[rgba(57,151,70,.09)] dark:bg-[rgba(168,214,62,.1)] text-[#2f8b3d] dark:text-[#a8d63e]"
                  : "bg-[rgba(22,25,26,.06)] dark:bg-white/[.07] text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)]"}`}>
                  {order.paid ? '✓ Paid' : 'Pending Payment'}
                </span>
              </div>
            </div>
            <div className="md:text-right">
              <p className="text-[.78rem] font-medium mb-1 text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)]">Order Date</p>
              <p className="font-semibold text-[#16191a] dark:text-[#f0f2ed]">{formatDate(order.created_at)}</p>
            </div>
          </div>

          {/* Summary grid — Total carries the single brand accent */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-5">
            {/* Subtotal */}
            <div className="bg-[#f7f6f1] dark:bg-[#171c16] border border-[rgba(22,25,26,.07)] dark:border-white/[.06] rounded-[14px] p-4">
              <p className="text-[.74rem] font-medium mb-1.5 text-[rgba(22,25,26,.45)] dark:text-[rgba(241,243,234,.4)]">Subtotal</p>
              <p className="text-[1.4rem] font-bold text-[#16191a] dark:text-[#f0f2ed]">${order.subtotal}</p>
            </div>
            {/* Tax */}
            <div className="bg-[#f7f6f1] dark:bg-[#171c16] border border-[rgba(22,25,26,.07)] dark:border-white/[.06] rounded-[14px] p-4">
              <p className="text-[.74rem] font-medium mb-1.5 text-[rgba(22,25,26,.45)] dark:text-[rgba(241,243,234,.4)]">Tax</p>
              <p className="text-[1.4rem] font-bold text-[#16191a] dark:text-[#f0f2ed]">${order.tax}</p>
            </div>
            {/* Shipping */}
            <div className="bg-[#f7f6f1] dark:bg-[#171c16] border border-[rgba(22,25,26,.07)] dark:border-white/[.06] rounded-[14px] p-4">
              <p className="text-[.74rem] font-medium mb-1.5 text-[rgba(22,25,26,.45)] dark:text-[rgba(241,243,234,.4)]">Shipping</p>
              <p className="text-[1.4rem] font-bold text-[#16191a] dark:text-[#f0f2ed]">${order.shipping}</p>
            </div>
            {/* Total */}
            <div className="bg-white dark:bg-[#141914] border border-[rgba(57,151,70,.3)] rounded-[14px] p-4">
              <p className="text-[.74rem] font-medium mb-1.5 text-[rgba(22,25,26,.45)] dark:text-[rgba(241,243,234,.4)]">Total Amount</p>
              <p className="text-[1.4rem] font-bold text-[#2f8b3d] dark:text-[#a8d63e]">${order.total}</p>
              <div className="mt-2 h-0.5 rounded bg-gradient-to-r from-[#399746] to-[#a8d63e]" />
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white dark:bg-[#141914] border border-[rgba(22,25,26,.1)] dark:border-white/10 rounded-[24px] overflow-hidden mb-5">
            <div className="px-6 py-4 flex items-center gap-2 font-semibold text-[#16191a] dark:text-[#f0f2ed] border-b border-[rgba(22,25,26,.07)] dark:border-white/[.06] bg-[#f3f1ea] dark:bg-[#10150f]">
              <ShoppingBag className="w-5 h-5 text-[#2f8b3d] dark:text-[#a8d63e]" />
              Order Items ({order.items_count})
            </div>
            <div>
              {order.items.map((item, idx) => (
                <div
                  key={item.id}
                  className={`px-6 py-5 ${idx ? 'border-t border-[rgba(22,25,26,.07)] dark:border-white/[.06]' : ''}`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-[88px_1fr_auto_auto] gap-4 md:items-center">
                    {/* Product Image */}
                    <Link to={`/product-details/${item.product_id}`} className="block w-[88px] h-[72px] rounded-[14px] overflow-hidden bg-[#f7f6f1] dark:bg-[#171c16]">
                      {item.product_image ? (
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-7 h-7 text-[rgba(22,25,26,.25)] dark:text-white/[.2]" />
                        </div>
                      )}
                    </Link>

                    {/* Product Info */}
                    <div>
                      <Link to={`/product-details/${item.product_id}`}>
                        <div className="font-semibold text-[.92rem] text-[#16191a] dark:text-[#f0f2ed] hover:text-[#2f8b3d] dark:hover:text-[#a8d63e] transition-colors">{item.product_name}</div>
                      </Link>
                      <div className="text-[.74rem] mt-0.5 text-[rgba(22,25,26,.45)] dark:text-[rgba(241,243,234,.4)]">Product ID: #{item.product_id}</div>
                    </div>

                    {/* Unit Price & Qty */}
                    <div className="flex gap-8 md:gap-10">
                      <div>
                        <div className="text-[.72rem] font-medium mb-0.5 text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)]">Unit Price</div>
                        <div className="font-semibold text-[.9rem] text-[#16191a] dark:text-[#f0f2ed]">${item.product_price}</div>
                      </div>
                      <div>
                        <div className="text-[.72rem] font-medium mb-0.5 text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)]">Qty</div>
                        <div className="font-semibold text-[.9rem] text-[#16191a] dark:text-[#f0f2ed]">{item.quantity}</div>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="bg-[#f7f6f1] dark:bg-[#171c16] border border-[rgba(22,25,26,.07)] dark:border-white/[.06] rounded-[14px] px-4 py-2.5 md:text-right">
                      <div className="text-[.72rem] font-medium text-[rgba(22,25,26,.45)] dark:text-[rgba(241,243,234,.4)]">Subtotal</div>
                      <div className="text-[1.05rem] font-bold text-[#2f8b3d] dark:text-[#a8d63e]">${(item.product_price * item.quantity).toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Address + Contact */}
          <div className="grid md:grid-cols-2 gap-4 mb-5">
            {/* Delivery Address */}
            <div className="bg-white dark:bg-[#141914] border border-[rgba(22,25,26,.1)] dark:border-white/10 rounded-[24px] p-6">
              <div className="font-semibold flex items-center gap-2 mb-4 text-[#16191a] dark:text-[#f0f2ed]">
                <MapPin className="w-5 h-5 text-[#2f8b3d] dark:text-[#a8d63e]" />
                Delivery Address
              </div>
              <div className="space-y-3 text-[.9rem]">
                <div>
                  <div className="text-[.72rem] font-medium mb-0.5 text-[rgba(22,25,26,.45)] dark:text-[rgba(241,243,234,.4)]">Full Name</div>
                  <div className="font-semibold text-[#16191a] dark:text-[#f0f2ed]">{order.first_name} {order.last_name}</div>
                </div>
                <div>
                  <div className="text-[.72rem] font-medium mb-0.5 text-[rgba(22,25,26,.45)] dark:text-[rgba(241,243,234,.4)]">Street Address</div>
                  <div className="font-semibold text-[#16191a] dark:text-[#f0f2ed]">{order.delivery_address}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[.72rem] font-medium mb-0.5 text-[rgba(22,25,26,.45)] dark:text-[rgba(241,243,234,.4)]">City</div>
                    <div className="font-semibold text-[#16191a] dark:text-[#f0f2ed]">{order.delivery_city}</div>
                  </div>
                  <div>
                    <div className="text-[.72rem] font-medium mb-0.5 text-[rgba(22,25,26,.45)] dark:text-[rgba(241,243,234,.4)]">Province</div>
                    <div className="font-semibold text-[#16191a] dark:text-[#f0f2ed]">{order.delivery_province}</div>
                  </div>
                </div>
                <div>
                  <div className="text-[.72rem] font-medium mb-0.5 text-[rgba(22,25,26,.45)] dark:text-[rgba(241,243,234,.4)]">Postal Code</div>
                  <div className="font-semibold text-[#16191a] dark:text-[#f0f2ed]">{order.delivery_postal_code}</div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white dark:bg-[#141914] border border-[rgba(22,25,26,.1)] dark:border-white/10 rounded-[24px] p-6">
              <div className="font-semibold flex items-center gap-2 mb-4 text-[#16191a] dark:text-[#f0f2ed]">
                <Mail className="w-5 h-5 text-[#2f8b3d] dark:text-[#a8d63e]" />
                Contact Information
              </div>
              <div className="space-y-3">
                <div className="bg-[#f7f6f1] dark:bg-[#171c16] border border-[rgba(22,25,26,.07)] dark:border-white/[.06] rounded-[14px] p-3.5 flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[#2f8b3d] dark:text-[#a8d63e] shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[.72rem] font-medium text-[rgba(22,25,26,.45)] dark:text-[rgba(241,243,234,.4)]">Email</div>
                    <div className="font-semibold text-[.9rem] text-[#16191a] dark:text-[#f0f2ed] break-all">{order.email}</div>
                  </div>
                </div>
                <div className="bg-[#f7f6f1] dark:bg-[#171c16] border border-[rgba(22,25,26,.07)] dark:border-white/[.06] rounded-[14px] p-3.5 flex items-center gap-3">
                  <Phone className="w-4 h-4 text-[#2f8b3d] dark:text-[#a8d63e] shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[.72rem] font-medium text-[rgba(22,25,26,.45)] dark:text-[rgba(241,243,234,.4)]">Phone</div>
                    <div className="font-semibold text-[.9rem] text-[#16191a] dark:text-[#f0f2ed]">{order.phone}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Notes */}
          {order.comment && (
            <div className="bg-white dark:bg-[#141914] border border-[rgba(22,25,26,.1)] dark:border-white/10 rounded-[24px] p-6 mb-5">
              <div className="font-semibold mb-2 text-[#16191a] dark:text-[#f0f2ed]">Order Notes</div>
              <p className="text-[.9rem] text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)] whitespace-pre-wrap">{order.comment}</p>
            </div>
          )}

          {/* Delivery Feedback — only shown when delivered */}
          {order.status === 'delivered' && (
            <div className="bg-white dark:bg-[#141914] border border-[rgba(22,25,26,.1)] dark:border-white/10 rounded-[24px] p-6 mb-5">
              <div className="font-semibold flex items-center gap-2 mb-1 text-[#16191a] dark:text-[#f0f2ed]">
                <MessageSquare className="w-5 h-5 text-[#2f8b3d] dark:text-[#a8d63e]" />
                Delivery Feedback
              </div>
              <p className="text-[.8rem] mb-4 text-[rgba(22,25,26,.45)] dark:text-[rgba(241,243,234,.4)]">
                How was your delivery experience?
              </p>

              {order.delivery_feedback ? (
                <div className="bg-[rgba(57,151,70,.09)] dark:bg-[rgba(168,214,62,.1)] border border-[rgba(57,151,70,.18)] rounded-[14px] p-4">
                  <div className="text-[.72rem] font-medium mb-1 text-[rgba(22,25,26,.45)] dark:text-[rgba(241,243,234,.4)]">Your feedback</div>
                  <p className="text-[.9rem] text-[#16191a] dark:text-[#f0f2ed] whitespace-pre-wrap">{order.delivery_feedback}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <textarea
                    value={feedbackText}
                    onChange={e => setFeedbackText(e.target.value)}
                    placeholder="Share your experience with this delivery..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-[14px] border border-[rgba(22,25,26,.1)] dark:border-white/10 bg-[#f7f6f1] dark:bg-[#171c16] text-[#16191a] dark:text-[#f0f2ed] placeholder:text-[rgba(22,25,26,.35)] dark:placeholder:text-white/[.25] text-[.9rem] focus:outline-none focus:ring-2 focus:ring-[#a8d63e]/40 resize-none transition-all"
                  />
                  <button
                    onClick={handleFeedbackSubmit}
                    disabled={submittingFeedback || !feedbackText.trim()}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-[#399746] to-[#a8d63e] text-white dark:text-[#0a0c0a] font-bold text-[.9rem] px-6 py-2.5 rounded-full transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    {submittingFeedback
                      ? <><Loader className="w-4 h-4 animate-spin" />Submitting...</>
                      : <><Send className="w-4 h-4" />Submit Feedback</>
                    }
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Back to Orders (bottom) */}
          <Link to="/orders" className="inline-flex items-center gap-2 border border-[rgba(57,151,70,.25)] dark:border-[rgba(168,214,62,.25)] text-[#2f8b3d] dark:text-[#a8d63e] bg-white dark:bg-[#141914] hover:bg-[rgba(57,151,70,.07)] dark:hover:bg-[rgba(168,214,62,.08)] transition-colors rounded-full font-bold text-[.9rem] px-6 py-3">
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Link>
        </div>
      </section>
    </div>
  );
}
