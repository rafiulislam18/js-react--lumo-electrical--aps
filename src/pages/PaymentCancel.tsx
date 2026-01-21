import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { XCircle, ShoppingCart, Home, AlertCircle } from "lucide-react";

export default function PaymentCancel() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Cancel Container */}
        <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-8 md:p-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Cancel Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-orange-400 rounded-full blur-xl opacity-30 animate-pulse" />
              <div className="relative bg-gradient-to-r from-red-400 to-orange-400 rounded-full p-4">
                <XCircle className="w-16 h-16 text-white" strokeWidth={1.5} />
              </div>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-3">
            Payment Cancelled
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Your payment has been cancelled. Your order was not completed.
          </p>

          {/* Order Info Card */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-red-200 rounded-xl p-6 md:p-8 mb-8">
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="font-semibold text-red-600">✗ Payment Cancelled</span>
              </div>
              <div className="flex justify-between">
                <span>Cart Status:</span>
                <span className="font-semibold text-gray-900">Still Available</span>
              </div>
            </div>
          </div>

          {/* Information Box */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8 text-left">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-lg">⚠️</span> What Happened?
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Your payment was cancelled during the checkout process</li>
              <li>• Your order was not created and no payment was processed</li>
              <li>• Your items are still saved in your cart</li>
              <li>• You can try again or continue shopping whenever you're ready</li>
            </ul>
          </div>

          {/* Reasons & Next Steps */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
              <h4 className="font-semibold text-gray-900 mb-3">Why This Happened?</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• You cancelled the payment</li>
                <li>• Payment provider issue</li>
                <li>• Connection timeout</li>
              </ul>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
              <h4 className="font-semibold text-gray-900 mb-3">What to Do?</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Review your cart items</li>
                <li>• Check payment details</li>
                <li>• Try again with different method</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate("/checkout")}
              className="bg-primary-gradient hover:opacity-90 text-white font-semibold py-3 px-8 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Return to Checkout
            </Button>
            <Button
              onClick={() => navigate("/products")}
              variant="outline"
              className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 px-8 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Continue Shopping
            </Button>
          </div>

          {/* Contact Info */}
          <div className="mt-10 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-4">
              Experiencing payment issues? Contact our support team
            </p>
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

        {/* Help Text */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>💡 Your cart has been saved. No charges were made to your payment method.</p>
        </div>
      </div>
    </div>
  );
}
