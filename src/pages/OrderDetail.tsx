import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Package, ArrowLeft, CheckCircle, Truck, ShoppingBag, MapPin, Phone, Mail } from "lucide-react";
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "order_placed":
        return "bg-blue-50 border-blue-200";
      case "out_for_delivery":
        return "bg-orange-50 border-orange-200";
      case "delivered":
        return "bg-green-50 border-green-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "order_placed":
        return "bg-blue-100 text-blue-700 border border-blue-300";
      case "out_for_delivery":
        return "bg-orange-100 text-orange-700 border border-orange-300";
      case "delivered":
        return "bg-green-100 text-green-700 border border-green-300";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-300";
    }
  };

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="relative w-12 h-12 mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-[#399746] to-[#A6CD3D] rounded-full animate-spin" style={{ mask: 'radial-gradient(circle, transparent 30%, black 70%)' }}></div>
          </div>
          <p className="text-gray-600 text-sm">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="container mx-auto max-w-5xl px-4 py-12">
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-10 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h3>
            <p className="text-gray-500 mb-6">We couldn't find the order you're looking for.</p>
            <Link to="/orders">
              <Button className="bg-gradient-to-r from-[#399746] to-[#A6CD3D] border-0 text-white px-6 py-3 hover:shadow-md transition-all duration-300">
                Back to Orders
                <ArrowLeft className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50 w-full">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#399746] to-[#A6CD3D] text-white py-8 px-4">
        <div className="container mx-auto max-w-5xl">
          <button
            onClick={() => navigate('/orders')}
            className="flex items-center gap-2 text-white hover:text-green-50 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Orders</span>
          </button>
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-7 h-7" />
            <h1 className="text-3xl md:text-4xl font-bold">Order #{order.id}</h1>
          </div>
          <p className="text-green-50 text-sm md:text-base">Detailed order information and tracking</p>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-8 px-4 w-full">
        <div className="container mx-auto max-w-5xl space-y-6">
          {/* Status Card */}
          <div className={`bg-white rounded-xl border-2 overflow-hidden ${getStatusColor(order.status)} transition-all`}>
            <div className="px-6 py-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-2">Order Status</p>
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm ${getStatusBadgeColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {getStatusDisplay(order.status)}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.paid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {order.paid ? '✓ Paid' : 'Pending Payment'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 font-medium mb-1">Order Date</p>
                  <p className="font-semibold text-gray-900">{formatDate(order.created_at)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Subtotal */}
            <div className="bg-white rounded-xl border-2 border-gray-100 p-4 hover:shadow-lg transition-all">
              <p className="text-xs text-gray-600 font-medium mb-2">Subtotal</p>
              <p className="text-3xl font-bold text-blue-700 mb-2">${order.subtotal}</p>
              <div className="w-full h-1 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"></div>
            </div>

            {/* Tax */}
            <div className="bg-white rounded-xl border-2 border-gray-100 p-4 hover:shadow-lg transition-all">
              <p className="text-xs text-gray-600 font-medium mb-2">Tax</p>
              <p className="text-3xl font-bold text-orange-700 mb-2">${order.tax}</p>
              <div className="w-full h-1 bg-gradient-to-r from-orange-400 to-red-400 rounded-full"></div>
            </div>

            {/* Shipping */}
            <div className="bg-white rounded-xl border-2 border-gray-100 p-4 hover:shadow-lg transition-all">
              <p className="text-xs text-gray-600 font-medium mb-2">Shipping</p>
              <p className="text-3xl font-bold text-purple-700 mb-2">${order.shipping}</p>
              <div className="w-full h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
            </div>

            {/* Total */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 p-4 hover:shadow-lg transition-all">
              <p className="text-xs text-gray-600 font-medium mb-2">Total Amount</p>
              <p className="text-3xl font-bold text-green-700 mb-2">${order.total}</p>
              <div className="w-full h-1 bg-gradient-to-r from-[#399746] to-[#A6CD3D] rounded-full"></div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-xl border-2 border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-white">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#399746]" />
                Order Items ({order.items_count})
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {order.items.map((item, index) => (
                <div
                  key={item.id}
                  className="px-6 py-5 hover:bg-slate-50 transition-colors"
                  style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both` }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    {/* Product Image */}
                    <div className="md:col-span-1 rounded-lg overflow-hidden">
                      <Link to={`/product-details/${item.product_id}`}>
                        {item.product_image ? (
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            className="w-full h-24 object-cover rounded-lg border border-gray-200 hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                            <Package className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </Link>
                    </div>

                    {/* Product Info */}
                    <div className="md:col-span-1">
                      <Link to={`/product-details/${item.product_id}`}>
                        <h3 className="font-bold text-gray-900 text-sm mb-1 hover:text-green-600 transition-colors">{item.product_name}</h3>
                      </Link>
                      <p className="text-xs text-gray-500">Product ID: #{item.product_id}</p>
                    </div>

                    {/* Quantity and Price */}
                    <div className="flex items-center justify-between md:justify-start gap-6">
                      <div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Unit Price</p>
                        <p className="font-bold text-gray-900">${item.product_price}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Qty</p>
                        <p className="font-bold text-gray-900 text-lg">{item.quantity}</p>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-100">
                      <p className="text-xs text-gray-600 font-medium mb-1">Subtotal</p>
                      <p className="text-2xl font-bold text-blue-700">${(item.product_price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping & Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-xl border-2 border-gray-100 p-6 hover:shadow-lg transition-all">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#399746]" />
                Delivery Address
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600 font-medium mb-1">Full Name</p>
                  <p className="font-semibold text-gray-900">{order.first_name} {order.last_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium mb-1">Street Address</p>
                  <p className="font-semibold text-gray-900">{order.delivery_address}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 font-medium mb-1">City</p>
                    <p className="font-semibold text-gray-900">{order.delivery_city}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium mb-1">Province</p>
                    <p className="font-semibold text-gray-900">{order.delivery_province}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium mb-1">Postal Code</p>
                  <p className="font-semibold text-gray-900">{order.delivery_postal_code}</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-xl border-2 border-gray-100 p-6 hover:shadow-lg transition-all">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#399746]" />
                Contact Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
                  <Mail className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Email</p>
                    <p className="font-semibold text-gray-900">{order.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-100">
                  <Phone className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Phone</p>
                    <p className="font-semibold text-gray-900">{order.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          {order.comment && (
            <div className="bg-white rounded-xl border-2 border-gray-100 p-6 hover:shadow-lg transition-all">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Order Notes</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{order.comment}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Link to="/orders" className="flex-1">
              <Button className="w-full border-2 border-[#399746] text-[#399746] bg-white hover:bg-[#399746] hover:text-white transition-all rounded-lg font-semibold">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Orders
              </Button>
            </Link>
            {/* <Button className="flex-1 bg-gradient-to-r from-[#399746] to-[#A6CD3D] text-white hover:shadow-lg transition-all rounded-lg font-semibold border-0">
              Download Invoice
            </Button> */}
          </div>
        </div>
      </section>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
