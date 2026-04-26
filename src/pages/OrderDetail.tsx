import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Package, ArrowLeft, CheckCircle, Truck, ShoppingBag, MapPin, Phone, Mail, Loader } from "lucide-react";
import { apiGet } from "@/lib/api";
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
}

export default function OrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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


  const getStatusIcon = (status: string) => {
    switch (status) {
      case "order_placed":
        return <ShoppingBag className="w-5 h-5" />;
      case "out_for_delivery":
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
      case "out_for_delivery":
        return "Out for Delivery";
      case "delivered":
        return "Delivered";
      default:
        return "Unknown Status";
    }
  };

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
          <Loader className="w-8 h-8 text-lime-brand animate-spin mb-3" />
          <p className="text-[.9rem] text-black/60 dark:text-[rgba(240,242,237,.6)]">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="font-outfit bg-white dark:bg-dark-surface min-h-screen">
        <div className="max-w-[1280px] mx-auto px-4 py-12">
          <div className="bg-white dark:bg-black/[.02] rounded-xl border border-black/[.08] dark:border-white/[.06] p-10 text-center">
            <Package className="w-16 h-16 text-black/30 dark:text-white/[.2] mx-auto mb-4" />
            <h3 className="font-bebas text-2xl tracking-[.08em] text-black/85 dark:text-[#f0f2ed] mb-2">Order Not Found</h3>
            <p className="text-black/60 dark:text-[rgba(240,242,237,.6)] mb-6">We couldn't find the order you're looking for.</p>
            <Link to="/orders">
              <button className="bg-gradient-to-br from-green-brand to-lime-brand text-white dark:text-dark-surface font-semibold px-6 py-3 rounded-lg transition-all duration-200 hover:shadow-[0_0_16px_rgba(168,214,62,.4)] inline-flex items-center gap-2">
                Back to Orders
                <ArrowLeft className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="font-outfit bg-white dark:bg-dark-surface w-full flex flex-col">
      {/* Header Section with Background Image */}
      <section className="relative bg-cover bg-center bg-no-repeat before:absolute before:inset-0 before:bg-lime-brand/[.02]">
        <img
          src="https://images.pexels.com/photos/5957/gift-brown-shopping-market.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover animate-[zoomOut_14s_ease-out_forwards]"
        />
        {/* Light mode overlay */}
        <div className="absolute inset-0 dark:hidden"
          style={{ background: 'linear-gradient(to right, rgba(20,28,20,.85) 0%, rgba(20,28,20,.55) 55%, rgba(20,28,20,.3) 100%), linear-gradient(to top, rgba(20,28,20,.7) 0%, transparent 50%)' }}
        />
        {/* Dark mode overlay */}
        <div className="absolute inset-0 hidden dark:block"
          style={{ background: 'linear-gradient(to right, rgba(4,8,4,.92) 0%, rgba(4,8,4,.6) 55%, rgba(4,8,4,.25) 100%), linear-gradient(to top, rgba(4,8,4,.8) 0%, transparent 50%)' }}
        />

        {/* Header Content */}
        <div className="relative z-10 px-8 py-12 max-sm:px-4 max-sm:py-8">
          <div className="max-w-[1280px] mx-auto">
            <button
              onClick={() => navigate('/orders')}
              className="flex items-center gap-2 text-[rgba(240,242,237,.8)] hover:text-lime-brand transition-colors mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Orders</span>
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-lime-brand/20 rounded-lg p-2">
                <Package className="w-8 h-8 text-lime-brand" />
              </div>
              <h1 className="font-bebas text-[clamp(2rem,5vw,3rem)] tracking-[.08em] text-[#f0f2ed] max-sm:text-[2rem]">Order #{order.id}</h1>
            </div>
            <p className="text-[.95rem] max-sm:text-[.85rem] leading-[1.8] text-[rgba(240,242,237,.7)] max-w-2xl">
              Detailed order information and tracking details
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="flex-1 py-8 px-4 w-full">
        <div className="max-w-[1280px] mx-auto space-y-6">
          {/* Status Card */}
          <div className="bg-white dark:bg-black/[.02] rounded-lg border border-black/[.08] dark:border-white/[.06] overflow-hidden">
            <div className="px-6 py-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-[.8rem] text-black/60 dark:text-[rgba(240,242,237,.6)] font-medium mb-2">Order Status</p>
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-[.85rem] border ${
                      order.status === 'delivered'
                        ? 'bg-green-brand/[.1] dark:bg-green-brand/[.15] text-green-700 dark:text-green-300 border-green-brand/20'
                        : order.status === 'out_for_delivery'
                        ? 'bg-orange-500/[.1] dark:bg-orange-500/[.15] text-orange-700 dark:text-orange-300 border-orange-500/20'
                        : 'bg-blue-500/[.1] dark:bg-blue-500/[.15] text-blue-700 dark:text-blue-300 border-blue-500/20'
                    }`}>
                      {getStatusIcon(order.status)}
                      {getStatusDisplay(order.status)}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[.75rem] font-medium border ${order.paid ? 'bg-green-brand/[.1] dark:bg-green-brand/[.15] text-green-700 dark:text-green-300 border-green-brand/20' : 'bg-orange-500/[.1] dark:bg-orange-500/[.15] text-orange-700 dark:text-orange-300 border-orange-500/20'}`}>
                      {order.paid ? '✓ Paid' : 'Pending Payment'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[.8rem] text-black/60 dark:text-[rgba(240,242,237,.6)] font-medium mb-1">Order Date</p>
                  <p className="font-semibold text-black/85 dark:text-[#f0f2ed]">{formatDate(order.created_at)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Subtotal */}
            <div className="bg-blue-500/[.05] dark:bg-blue-500/[.08] rounded-lg border border-blue-500/[.1] dark:border-blue-500/[.15] p-4 hover:shadow-lg transition-all">
              <p className="text-[.75rem] text-black/60 dark:text-[rgba(240,242,237,.6)] font-medium mb-2">Subtotal</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-2">${order.subtotal}</p>
              <div className="w-full h-px bg-gradient-to-r from-blue-400 to-cyan-400" />
            </div>

            {/* Tax */}
            <div className="bg-orange-500/[.05] dark:bg-orange-500/[.08] rounded-lg border border-orange-500/[.1] dark:border-orange-500/[.15] p-4 hover:shadow-lg transition-all">
              <p className="text-[.75rem] text-black/60 dark:text-[rgba(240,242,237,.6)] font-medium mb-2">Tax</p>
              <p className="text-2xl font-bold text-orange-700 dark:text-orange-300 mb-2">${order.tax}</p>
              <div className="w-full h-px bg-gradient-to-r from-orange-400 to-red-400" />
            </div>

            {/* Shipping */}
            <div className="bg-purple-500/[.05] dark:bg-purple-500/[.08] rounded-lg border border-purple-500/[.1] dark:border-purple-500/[.15] p-4 hover:shadow-lg transition-all">
              <p className="text-[.75rem] text-black/60 dark:text-[rgba(240,242,237,.6)] font-medium mb-2">Shipping</p>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-300 mb-2">${order.shipping}</p>
              <div className="w-full h-px bg-gradient-to-r from-purple-400 to-pink-400" />
            </div>

            {/* Total */}
            <div className="bg-green-brand/[.05] dark:bg-green-brand/[.08] rounded-lg border border-green-brand/[.1] dark:border-green-brand/[.15] p-4 hover:shadow-lg transition-all">
              <p className="text-[.75rem] text-black/60 dark:text-[rgba(240,242,237,.6)] font-medium mb-2">Total Amount</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300 mb-2">${order.total}</p>
              <div className="w-full h-px bg-gradient-to-r from-green-brand to-lime-brand" />
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white dark:bg-black/[.02] rounded-lg border border-black/[.08] dark:border-white/[.06] overflow-hidden">
            <div className="px-6 py-5 border-b border-black/[.08] dark:border-white/[.06] bg-black/[.02] dark:bg-white/[.02]">
              <h2 className="font-semibold text-black/85 dark:text-[#f0f2ed] flex items-center gap-2 text-[.95rem]">
                <ShoppingBag className="w-5 h-5 text-green-deep dark:text-lime-brand" />
                Order Items ({order.items_count})
              </h2>
            </div>
            <div className="divide-y divide-black/[.08] dark:divide-white/[.06]">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="px-6 py-5 hover:bg-black/[.02] dark:hover:bg-white/[.02] transition-colors"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    {/* Product Image */}
                    <div className="md:col-span-1 rounded-lg overflow-hidden">
                      <Link to={`/product-details/${item.product_id}`}>
                        {item.product_image ? (
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            className="w-full h-24 object-cover rounded-lg border border-black/[.08] dark:border-white/[.06] hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-24 bg-black/[.05] dark:bg-white/[.05] rounded-lg flex items-center justify-center border border-black/[.08] dark:border-white/[.06]">
                            <Package className="w-8 h-8 text-black/30 dark:text-white/[.2]" />
                          </div>
                        )}
                      </Link>
                    </div>

                    {/* Product Info */}
                    <div className="md:col-span-1">
                      <Link to={`/product-details/${item.product_id}`}>
                        <h3 className="font-semibold text-black/85 dark:text-[#f0f2ed] text-[.9rem] mb-1 hover:text-green-deep dark:hover:text-lime-brand transition-colors">{item.product_name}</h3>
                      </Link>
                      <p className="text-[.75rem] text-black/50 dark:text-[rgba(240,242,237,.5)]">Product ID: #{item.product_id}</p>
                    </div>

                    {/* Quantity and Price */}
                    <div className="flex items-center justify-between md:justify-start gap-6">
                      <div>
                        <p className="text-[.75rem] text-black/60 dark:text-[rgba(240,242,237,.6)] font-medium mb-1">Unit Price</p>
                        <p className="font-semibold text-black/85 dark:text-[#f0f2ed]">${item.product_price}</p>
                      </div>
                      <div>
                        <p className="text-[.75rem] text-black/60 dark:text-[rgba(240,242,237,.6)] font-medium mb-1">Qty</p>
                        <p className="font-semibold text-black/85 dark:text-[#f0f2ed] text-lg">{item.quantity}</p>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="bg-blue-500/[.05] dark:bg-blue-500/[.08] rounded-lg p-4 border border-blue-500/[.1] dark:border-blue-500/[.15]">
                      <p className="text-[.75rem] text-black/60 dark:text-[rgba(240,242,237,.6)] font-medium mb-1">Subtotal</p>
                      <p className="text-xl font-bold text-blue-700 dark:text-blue-300">${(item.product_price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping & Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Delivery Address */}
            <div className="bg-white dark:bg-black/[.02] rounded-lg border border-black/[.08] dark:border-white/[.06] p-6 hover:shadow-lg transition-all">
              <h3 className="font-semibold text-black/85 dark:text-[#f0f2ed] mb-4 flex items-center gap-2 text-[.95rem]">
                <MapPin className="w-5 h-5 text-green-deep dark:text-lime-brand" />
                Delivery Address
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-[.75rem] text-black/60 dark:text-[rgba(240,242,237,.6)] font-medium mb-1">Full Name</p>
                  <p className="font-semibold text-black/85 dark:text-[#f0f2ed]">{order.first_name} {order.last_name}</p>
                </div>
                <div>
                  <p className="text-[.75rem] text-black/60 dark:text-[rgba(240,242,237,.6)] font-medium mb-1">Street Address</p>
                  <p className="font-semibold text-black/85 dark:text-[#f0f2ed]">{order.delivery_address}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[.75rem] text-black/60 dark:text-[rgba(240,242,237,.6)] font-medium mb-1">City</p>
                    <p className="font-semibold text-black/85 dark:text-[#f0f2ed]">{order.delivery_city}</p>
                  </div>
                  <div>
                    <p className="text-[.75rem] text-black/60 dark:text-[rgba(240,242,237,.6)] font-medium mb-1">Province</p>
                    <p className="font-semibold text-black/85 dark:text-[#f0f2ed]">{order.delivery_province}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[.75rem] text-black/60 dark:text-[rgba(240,242,237,.6)] font-medium mb-1">Postal Code</p>
                  <p className="font-semibold text-black/85 dark:text-[#f0f2ed]">{order.delivery_postal_code}</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white dark:bg-black/[.02] rounded-lg border border-black/[.08] dark:border-white/[.06] p-6 hover:shadow-lg transition-all">
              <h3 className="font-semibold text-black/85 dark:text-[#f0f2ed] mb-4 flex items-center gap-2 text-[.95rem]">
                <Mail className="w-5 h-5 text-green-deep dark:text-lime-brand" />
                Contact Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-blue-500/[.05] dark:bg-blue-500/[.08] rounded-lg border border-blue-500/[.1] dark:border-blue-500/[.15]">
                  <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <div>
                    <p className="text-[.75rem] text-black/60 dark:text-[rgba(240,242,237,.6)] font-medium">Email</p>
                    <p className="font-semibold text-black/85 dark:text-[#f0f2ed]">{order.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-brand/[.05] dark:bg-green-brand/[.08] rounded-lg border border-green-brand/[.1] dark:border-green-brand/[.15]">
                  <Phone className="w-5 h-5 text-green-700 dark:text-green-400 flex-shrink-0" />
                  <div>
                    <p className="text-[.75rem] text-black/60 dark:text-[rgba(240,242,237,.6)] font-medium">Phone</p>
                    <p className="font-semibold text-black/85 dark:text-[#f0f2ed]">{order.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          {order.comment && (
            <div className="bg-white dark:bg-black/[.02] rounded-lg border border-black/[.08] dark:border-white/[.06] p-6 hover:shadow-lg transition-all">
              <h3 className="font-semibold text-black/85 dark:text-[#f0f2ed] mb-3 text-[.95rem]">Order Notes</h3>
              <p className="text-black/70 dark:text-[rgba(240,242,237,.7)] whitespace-pre-wrap">{order.comment}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Link to="/orders" className="flex-1">
              <button className="w-full border border-green-deep/20 dark:border-lime-brand/20 text-green-deep dark:text-lime-brand bg-white dark:bg-black/[.02] hover:bg-green-deep/[.08] dark:hover:bg-lime-brand/[.08] transition-all rounded-lg font-semibold py-3 flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Orders
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
