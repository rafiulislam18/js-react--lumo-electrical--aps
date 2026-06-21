import { useState, useEffect } from "react";
import { Package, ArrowRight, CheckCircle, Truck, ShoppingBag, Calendar } from "lucide-react";
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
      case "assigned_courier":
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

  return (
    <div className="font-outfit bg-[#f6f5f0]/[.86] dark:bg-dark-surface min-h-screen flex flex-col">
      <section className="flex-1 py-14 px-4 sm:px-8">
        <div className="max-w-[1280px] mx-auto">
          {/* Header block */}
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 text-[.68rem] font-bold tracking-[.2em] uppercase text-[#2f8b3d] dark:text-[#a8d63e] mb-3 before:content-[''] before:w-[1.4rem] before:h-0.5 before:bg-[#2f8b3d] dark:before:bg-[#a8d63e] before:rounded-sm before:shrink-0">
              Your account
            </div>
            <h1 className="font-bebas leading-[.9] text-[clamp(2.4rem,6vw,4rem)] text-[#16191a] dark:text-[#f0f2ed]">My Orders</h1>
            <p className="mt-3 text-[.95rem] leading-relaxed max-w-[640px] text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)]">
              Track and manage all your orders. View status, details and delivery updates at a glance.
            </p>
          </div>

          {/* Orders List */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative w-12 h-12 mb-3 rounded-full border-2 border-[#a8d63e] border-t-[#2f8b3d] animate-spin" />
              <p className="text-[.9rem] text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)]">Loading your orders...</p>
            </div>
          ) : orders.length > 0 ? (
            <>
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-[1.1rem] font-bold text-[#16191a] dark:text-[#f0f2ed]">All Orders ({orders.length})</h2>
                <div className="flex-1 h-px bg-[rgba(22,25,26,.1)] dark:bg-white/10" />
              </div>

              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white dark:bg-[#141914] border border-[rgba(22,25,26,.1)] dark:border-white/10 rounded-[24px] overflow-hidden transition hover:-translate-y-[3px] hover:border-[rgba(57,151,70,.35)] hover:shadow-[0_16px_40px_rgba(22,25,26,.08)] dark:hover:shadow-[0_16px_40px_rgba(0,0,0,.5)]"
                  >
                    {/* Order Header */}
                    <div className="px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-[rgba(22,25,26,.07)] dark:border-white/[.06]">
                      <div className="flex items-start gap-3">
                        <span className="w-10 h-10 rounded-xl grid place-items-center shrink-0 bg-gradient-to-r from-[#399746] to-[#a8d63e] text-white dark:text-[#0a0c0a]">
                          <ShoppingBag className="w-5 h-5" />
                        </span>
                        <div>
                          <div className="font-semibold text-[.96rem] text-[#16191a] dark:text-[#f0f2ed]">Order #{order.id}</div>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-[.8rem] text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)]">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatDate(order.created_at)}
                            </span>
                            <span className={`${pillBase} ${order.paid
                              ? "bg-[rgba(57,151,70,.09)] dark:bg-[rgba(168,214,62,.1)] text-[#2f8b3d] dark:text-[#a8d63e]"
                              : "bg-[rgba(22,25,26,.06)] dark:bg-white/[.07] text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)]"}`}>
                              {order.paid ? "✓ Paid" : "Pending"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className={`${pillBase} self-start whitespace-nowrap ${getStatusPillClass(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {getStatusDisplay(order.status)}
                      </span>
                    </div>

                    {/* Order Details */}
                    <div className="px-5 py-4">
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        {/* Items Count */}
                        <div className="bg-[#f7f6f1] dark:bg-[#171c16] border border-[rgba(22,25,26,.07)] dark:border-white/[.06] rounded-[14px] px-4 py-3">
                          <div className="text-[.72rem] font-medium text-[rgba(22,25,26,.45)] dark:text-[rgba(241,243,234,.4)]">Items Ordered</div>
                          <div className="text-[1.15rem] font-bold mt-0.5 text-[#16191a] dark:text-[#f0f2ed]">{order.items_count}</div>
                        </div>

                        {/* Total Amount */}
                        <div className="bg-[rgba(57,151,70,.06)] dark:bg-[#171c16] border border-[rgba(57,151,70,.16)] dark:border-white/[.06] rounded-[14px] px-4 py-3">
                          <div className="text-[.72rem] font-medium text-[rgba(22,25,26,.45)] dark:text-[rgba(241,243,234,.4)]">Order Total</div>
                          <div className="text-[1.15rem] font-bold mt-0.5 text-[#2f8b3d] dark:text-[#a8d63e]">${typeof order.total === 'number' ? order.total.toFixed(2) : parseFloat(order.total as any).toFixed(2)}</div>
                        </div>

                        {/* Status Info */}
                        <div className="bg-[#f7f6f1] dark:bg-[#171c16] border border-[rgba(22,25,26,.07)] dark:border-white/[.06] rounded-[14px] px-4 py-3">
                          <div className="text-[.72rem] font-medium text-[rgba(22,25,26,.45)] dark:text-[rgba(241,243,234,.4)]">Status</div>
                          <div className="text-[.82rem] font-bold mt-1.5 text-[#16191a] dark:text-[#f0f2ed]">{getStatusDisplay(order.status)}</div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="flex justify-end pt-3 border-t border-[rgba(22,25,26,.07)] dark:border-white/[.06]">
                        <Link to={`/orders/${order.id}`}>
                          <button className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#399746] to-[#a8d63e] text-white dark:text-[#0a0c0a] font-bold text-[.82rem] px-4 py-2.5 rounded-full transition-transform duration-200 hover:-translate-y-0.5">
                            View Details
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="bg-white dark:bg-[#141914] border border-[rgba(22,25,26,.1)] dark:border-white/10 rounded-[24px] p-12 text-center">
              <div className="mb-6 flex justify-center">
                <div className="bg-[#f7f6f1] dark:bg-white/[.06] rounded-full p-5">
                  <Package className="w-16 h-16 text-[rgba(22,25,26,.25)] dark:text-white/[.2]" />
                </div>
              </div>
              <h3 className="font-bebas text-2xl tracking-[.08em] text-[#16191a] dark:text-[#f0f2ed] mb-2">No Orders Yet</h3>
              <p className="text-[.9rem] text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)] mb-8 max-w-md mx-auto">Start your shopping journey and discover our amazing products. Your orders will appear here.</p>
              <Link to="/products">
                <button className="inline-flex items-center gap-2 bg-gradient-to-r from-[#399746] to-[#a8d63e] text-white dark:text-[#0a0c0a] font-bold text-[.9rem] px-6 py-3 rounded-full transition-transform duration-200 hover:-translate-y-0.5">
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
