import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, Package, ArrowRight } from "lucide-react";

export default function PaymentSuccess() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-lime-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Success Container */}
        <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-8 md:p-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary-gradient rounded-full blur-xl opacity-30 animate-pulse" />
              <div className="relative bg-primary-gradient rounded-full p-4">
                <CheckCircle className="w-16 h-16 text-white" strokeWidth={1.5} />
              </div>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-3">
            Payment Successful!
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Your order has been placed and payment has been received successfully.
          </p>

          {/* Order Info Card */}
          <div className="bg-gradient-to-br from-green-50 to-lime-50 border border-green-200 rounded-xl p-6 md:p-8 mb-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Package className="w-6 h-6 text-green-600" />
              <span className="text-gray-600 font-medium">Order Number</span>
            </div>
            <p className="text-3xl md:text-4xl font-bold text-green-600 font-display mb-4">
              #{orderId}
            </p>
            <div className="space-y-3 text-sm text-gray-600 border-t border-green-200 pt-6">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="font-semibold text-green-600">✓ Payment Received</span>
              </div>
              <div className="flex justify-between">
                <span>Next Step:</span>
                <span className="font-semibold text-gray-900">Order Processing</span>
              </div>
            </div>
          </div>

          {/* Information Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-lg">ℹ️</span> What's Next?
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex gap-3">
                <span className="text-green-600 font-bold">1.</span>
                <span>You'll receive a confirmation email shortly with your order details</span>
              </li>
              <li className="flex gap-3">
                <span className="text-green-600 font-bold">2.</span>
                <span>Our team will process your order and prepare it for shipment</span>
              </li>
              <li className="flex gap-3">
                <span className="text-green-600 font-bold">3.</span>
                <span>You can track your order status in your account dashboard</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate(`/orders`)}
              className="bg-primary-gradient hover:opacity-90 text-white font-semibold py-3 px-8 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <Package className="w-5 h-5" />
              View Orders
            </Button>
            <Button
              onClick={() => navigate("/products")}
              variant="outline"
              className="border-2 border-green-200 text-green-600 hover:bg-green-50 font-semibold py-3 px-8 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              Continue Shopping
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Contact Info */}
          <div className="mt-10 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-4">Have questions about your order?</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
              <a href="mailto:support@lumoelectrical.co.za" className="text-green-600 font-semibold hover:underline">
                📧 support@lumoelectrical.co.za
              </a>
              <span className="text-gray-400 hidden sm:inline">•</span>
              <a href="tel:+27666666666" className="text-green-600 font-semibold hover:underline">
                📞 +27 66 666 6666
              </a>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>✓ Secure payment • ✓ Order confirmation sent • ✓ 30-day returns available</p>
        </div>
      </div>
    </div>
  );
}
