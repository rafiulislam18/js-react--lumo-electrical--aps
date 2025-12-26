import { Button } from "@/components/ui/button";
import { Package, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const sampleOrders = [
  {
    id: "ORD-001",
    date: "2024-01-15",
    total: 245.99,
    status: "Delivered",
    items: 3,
    statusColor: "bg-green-100 text-green-800"
  },
  {
    id: "ORD-002",
    date: "2024-01-12",
    total: 89.50,
    status: "Processing",
    items: 1,
    statusColor: "bg-blue-100 text-blue-800"
  },
  {
    id: "ORD-003",
    date: "2024-01-08",
    total: 156.75,
    status: "Shipped",
    items: 2,
    statusColor: "bg-orange-100 text-orange-800"
  }
];

export default function Orders() {
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
          {sampleOrders.length > 0 ? (
            <div className="space-y-4">
              {sampleOrders.map((order, index) => (
                <div
                  key={order.id}
                  className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg transition-shadow hover:border-green-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{order.id}</h3>
                      <p className="text-sm text-gray-500">{order.date}</p>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${order.statusColor}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-100">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Items</p>
                      <p className="text-lg font-bold text-gray-900">{order.items}</p>
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
              <Link to="/products">
                <Button className="bg-gradient-to-r from-green-500 to-lime-400 border-0 text-white font-semibold hover:opacity-90">
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
