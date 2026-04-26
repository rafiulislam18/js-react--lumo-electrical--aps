import { useState, useEffect } from "react";
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
    <div className="font-outfit bg-white dark:bg-dark-surface min-h-screen flex flex-col">
      {/* Header Section with Background Image */}
      <section className="relative bg-cover bg-center bg-no-repeat before:absolute before:inset-0 before:bg-lime-brand/[.02]">
        <img
          src="https://images.pexels.com/photos/34594827/pexels-photo-34594827.jpeg"
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
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-lime-brand/20 rounded-lg p-2">
                <ShoppingBag className="w-8 h-8 text-lime-brand" />
              </div>
              <h1 className="font-bebas text-[clamp(2rem,5vw,3rem)] tracking-[.08em] text-[#f0f2ed] max-sm:text-[2rem]">My Orders</h1>
            </div>
            <p className="text-[.95rem] max-sm:text-[.85rem] leading-[1.8] text-[rgba(240,242,237,.7)] max-w-2xl">
              Track and manage all your orders. View status, details, and delivery updates at a glance.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="flex-1 py-12 px-4">
        <div className="max-w-[1280px] mx-auto">
          {/* Orders List */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative w-12 h-12 mb-3 rounded-full border-2 border-lime-brand border-t-green-brand animate-spin" />
              <p className="text-[.9rem] text-black/60 dark:text-[rgba(240,242,237,.6)]">Loading your orders...</p>
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-xl font-bold text-black/85 dark:text-[#f0f2ed]">All Orders ({orders.length})</h2>
                <div className="flex-1 h-px bg-lime-brand/30" />
              </div>

              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white dark:bg-black/[.02] rounded-lg border border-black/[.08] dark:border-white/[.06] overflow-hidden transition-all duration-300 hover:border-lime-brand/25 dark:hover:border-lime-brand/20 hover:shadow-[0_8px_32px_rgba(168,214,62,.12)]"
                >
                  {/* Order Header */}
                  <div className="px-4 py-4 border-b border-black/[.08] dark:border-white/[.06]">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-gradient-to-br from-green-brand to-lime-brand rounded-lg p-2 text-white dark:text-dark-surface flex-shrink-0">
                          <ShoppingBag className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-[.95rem] font-semibold text-black/85 dark:text-[#f0f2ed]">Order #{order.id}</h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-[.8rem] text-black/60 dark:text-[rgba(240,242,237,.6)]">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{formatDate(order.created_at)}</span>
                            </div>
                            <span className="px-2 py-0.5 bg-black/[.05] dark:bg-white/[.05] rounded-full text-[.75rem] font-medium text-black/70 dark:text-[rgba(240,242,237,.7)]">
                              {order.paid ? "✓ Paid" : "Pending"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[.8rem] font-semibold whitespace-nowrap flex-shrink-0 ${
                        order.status === 'delivered'
                          ? 'bg-green-brand/[.1] dark:bg-green-brand/[.15] text-green-700 dark:text-green-300 border border-green-brand/20'
                          : order.status === 'out_for_delivery'
                          ? 'bg-orange-500/[.1] dark:bg-orange-500/[.15] text-orange-700 dark:text-orange-300 border border-orange-500/20'
                          : 'bg-blue-500/[.1] dark:bg-blue-500/[.15] text-blue-700 dark:text-blue-300 border border-blue-500/20'
                      }`}>
                        {getStatusIcon(order.status)}
                        {getStatusDisplay(order.status)}
                      </div>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="px-4 py-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                      {/* Items Count */}
                      <div className="bg-blue-500/[.05] dark:bg-blue-500/[.08] rounded-lg p-3 border border-blue-500/[.1] dark:border-blue-500/[.15]">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[.75rem] text-black/60 dark:text-[rgba(240,242,237,.6)] font-medium">Items Ordered</p>
                            <p className="text-lg font-bold text-blue-700 dark:text-blue-300 mt-1">{order.items_count}</p>
                          </div>
                          <Package className="w-6 h-6 text-blue-500/30" />
                        </div>
                      </div>

                      {/* Total Amount */}
                      <div className="bg-green-brand/[.05] dark:bg-green-brand/[.08] rounded-lg p-3 border border-green-brand/[.1] dark:border-green-brand/[.15]">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[.75rem] text-black/60 dark:text-[rgba(240,242,237,.6)] font-medium">Order Total</p>
                            <p className="text-lg font-bold text-green-700 dark:text-green-300 mt-1">${typeof order.total === 'number' ? order.total.toFixed(2) : parseFloat(order.total as any).toFixed(2)}</p>
                          </div>
                          <DollarSign className="w-6 h-6 text-green-brand/30" />
                        </div>
                      </div>

                      {/* Status Info */}
                      <div className="bg-purple-500/[.05] dark:bg-purple-500/[.08] rounded-lg p-3 border border-purple-500/[.1] dark:border-purple-500/[.15]">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[.75rem] text-black/60 dark:text-[rgba(240,242,237,.6)] font-medium">Status</p>
                            <p className="text-[.8rem] font-bold text-purple-700 dark:text-purple-300 mt-1">{getStatusDisplay(order.status)}</p>
                          </div>
                          <Truck className="w-6 h-6 text-purple-500/30" />
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex justify-end pt-3 border-t border-black/[.08] dark:border-white/[.06]">
                      <Link to={`/order/${order.id}`}>
                        <button className="bg-gradient-to-br from-green-brand to-lime-brand text-white dark:text-dark-surface font-semibold text-[.85rem] px-3 py-2 rounded-lg transition-all duration-200 hover:shadow-[0_0_16px_rgba(168,214,62,.4)] flex items-center gap-1.5">
                          View Details
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-black/[.02] rounded-xl border border-black/[.08] dark:border-white/[.06] p-12 text-center">
              <div className="mb-6 flex justify-center">
                <div className="bg-black/[.05] dark:bg-white/[.05] rounded-full p-5">
                  <Package className="w-16 h-16 text-black/30 dark:text-white/[.2]" />
                </div>
              </div>
              <h3 className="font-bebas text-2xl tracking-[.08em] text-black/85 dark:text-[#f0f2ed] mb-2">No Orders Yet</h3>
              <p className="text-[.9rem] text-black/60 dark:text-[rgba(240,242,237,.6)] mb-8 max-w-md mx-auto">Start your shopping journey and discover our amazing products. Your orders will appear here.</p>
              <Link to="/products">
                <button className="bg-gradient-to-br from-green-brand to-lime-brand text-white dark:text-dark-surface font-semibold text-[.9rem] px-6 py-3 rounded-lg transition-all duration-200 hover:shadow-[0_0_16px_rgba(168,214,62,.4)] inline-flex items-center gap-2">
                  Start Shopping
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
