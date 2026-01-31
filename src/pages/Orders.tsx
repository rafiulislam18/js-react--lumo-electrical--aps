import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Package, ArrowRight } from "lucide-react";
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
      setOrders(data);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load orders. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Processing":
        return "bg-blue-100 text-blue-800";
      case "Shipped":
        return "bg-orange-100 text-orange-800";
      case "Pending Payment":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50/30 flex flex-col font-sans">
      <section className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-600 mt-2">Track and manage your orders</p>
          </div>

          {/* Orders List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg transition-shadow hover:border-green-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Order #{order.id}</h3>
                      <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-100">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Items</p>
                      <p className="text-lg font-bold text-gray-900">{order.items_count}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total</p>
                      <p className="text-lg font-bold text-green-600">${order.total.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <Button
                        variant="outline"
                        className="border-gray-200 text-gray-700 hover:bg-green-50 hover:border-green-400 hover:text-green-700"
                      >
                        View Details
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 p-16 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Orders Yet</h3>
              <p className="text-gray-500 mb-6">You haven't placed any orders yet. Start shopping!</p>
              <Link to="/products/featured-products">
                <Button className="bg-primary-gradient border-0 text-white hover:opacity-90 transition-smooth">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
