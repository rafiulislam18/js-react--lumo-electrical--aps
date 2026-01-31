import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Package, ArrowRight, CheckCircle, Truck, ShoppingBag, Calendar, DollarSign } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { apiGet } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Order {
  id: number;
  created_at: string;
  total: number;
  paid: boolean;
  items_count: number;
  status: string;
}

export default function Orders() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      navigate('/login');
      return;
    }
    fetchUserOrders();
  }, [navigate]);

  const fetchUserOrders = async () => {
    try {
      setIsLoading(true);
      const data = await apiGet("/orders/list/");
      console.log("Orders data received:", data);
      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        console.error("Invalid data format. Expected array but got:", typeof data);
        setOrders([]);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load orders. Please try again.",
      });
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

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
        return <ShoppingBag className="w-4 h-4" />;
      case "out_for_delivery":
        return <Truck className="w-4 h-4" />;
      case "delivered":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#399746] to-[#A6CD3D] text-white py-8 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingBag className="w-7 h-7" />
            <h1 className="text-3xl md:text-4xl font-bold">My Orders</h1>
          </div>
          <p className="text-green-50 text-sm md:text-base max-w-2xl">Track and manage all your orders. View status, details, and delivery updates.</p>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-5xl">
          {/* Orders List */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative w-12 h-12 mb-3">
                <div className="absolute inset-0 bg-gradient-to-r from-[#399746] to-[#A6CD3D] rounded-full animate-spin" style={{mask: 'radial-gradient(circle, transparent 30%, black 70%)'}}></div>
              </div>
              <p className="text-gray-600 text-sm">Loading your orders...</p>
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">All Orders ({orders.length})</h2>
                <div className="h-1 flex-1 ml-4 bg-gradient-to-r from-[#399746] to-[#A6CD3D] rounded-full"></div>
              </div>

              {orders.map((order, index) => (
                <div
                  key={order.id}
                  className={`group bg-white rounded-xl border-2 transition-all duration-300 hover:shadow-lg hover:border-[#399746] overflow-hidden ${getStatusColor(order.status)}`}
                  style={{animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`}}
                >
                  {/* Order Header */}
                  <div className="px-3 py-2.5 border-b border-gray-100">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <div className="bg-gradient-to-br from-[#399746] to-[#A6CD3D] rounded p-1.5 text-white flex-shrink-0">
                          <ShoppingBag className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-gray-900">Order #{order.id}</h3>
                          <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(order.created_at)}</span>
                            </div>
                            <span className="inline-block px-2 py-0.5 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
                              {order.paid ? "✓ Paid" : "Pending"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${getStatusBadgeColor(order.status)} whitespace-nowrap flex-shrink-0`}>
                        {getStatusIcon(order.status)}
                        {getStatusDisplay(order.status)}
                      </div>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="px-3 py-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2.5">
                      {/* Items Count */}
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded p-2 border border-blue-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-600 font-medium">Items Ordered</p>
                            <p className="text-lg font-bold text-blue-700 mt-0.5">{order.items_count}</p>
                          </div>
                          <Package className="w-6 h-6 text-blue-200" />
                        </div>
                      </div>

                      {/* Total Amount */}
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded p-2 border border-green-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-600 font-medium">Order Total</p>
                            <p className="text-lg font-bold text-green-700 mt-0.5">${parseFloat(order.total).toFixed(2)}</p>
                          </div>
                          <DollarSign className="w-6 h-6 text-green-200" />
                        </div>
                      </div>

                      {/* Status Info */}
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded p-2 border border-purple-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-600 font-medium">Status</p>
                            <p className="text-xs font-bold text-purple-700 mt-0.5">{getStatusDisplay(order.status)}</p>
                          </div>
                          <Truck className="w-6 h-6 text-purple-200" />
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex justify-end pt-2 border-t border-gray-100">
                      <Button className="bg-gradient-to-r from-[#399746] to-[#A6CD3D] text-white border-0 hover:shadow-md transition-all duration-300 group/btn text-xs px-2.5 py-1.5">
                        View Details
                        <ArrowRight className="w-3 h-3 ml-1 group-hover/btn:translate-x-0.5 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-10 text-center">
              <div className="mb-4 flex justify-center">
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full p-5">
                  <Package className="w-16 h-16 text-gray-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Orders Yet</h3>
              <p className="text-gray-500 mb-6 text-sm max-w-md mx-auto">Start your shopping journey and discover our amazing products. Your orders will appear here.</p>
              <Link to="/products/featured-products">
                <Button className="bg-gradient-to-r from-[#399746] to-[#A6CD3D] border-0 text-white px-6 py-3 hover:shadow-md transition-all duration-300 text-sm">
                  Start Shopping
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          )}
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
