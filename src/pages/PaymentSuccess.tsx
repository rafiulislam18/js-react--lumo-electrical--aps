import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle, Package, ArrowRight } from "lucide-react";

export default function PaymentSuccess() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  return (
    <div className="font-outfit bg-white dark:bg-dark-surface min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Success Container */}
        <div className="bg-white dark:bg-black/[.02] rounded-xl border border-black/[.08] dark:border-white/[.06] p-8 text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-brand to-lime-brand rounded-full blur-xl opacity-20 animate-pulse" />
              <div className="relative bg-gradient-to-br from-green-brand to-lime-brand rounded-full p-4">
                <CheckCircle className="w-16 h-16 text-dark-surface" strokeWidth={1.5} />
              </div>
            </div>
          </div>

          {/* Heading */}
          <h1 className="font-bebas text-[2rem] tracking-[.08em] text-black/85 dark:text-[#f0f2ed] mb-2">
            Payment Successful!
          </h1>
          <p className="text-[.9rem] text-black/60 dark:text-[rgba(240,242,237,.6)] mb-8">
            Your order has been placed and payment has been received successfully.
          </p>

          {/* Order Info Card */}
          <div className="bg-green-brand/[.05] dark:bg-green-brand/[.08] border border-green-brand/[.1] dark:border-green-brand/[.15] rounded-lg p-6 mb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Package className="w-5 h-5 text-green-700 dark:text-green-300" />
              <span className="text-[.8rem] text-black/60 dark:text-[rgba(240,242,237,.6)] font-medium">Order Number</span>
            </div>
            <p className="font-bebas text-3xl tracking-[.08em] text-green-700 dark:text-green-300 mb-4">
              #{orderId}
            </p>
            <div className="space-y-2 text-[.85rem] text-black/60 dark:text-[rgba(240,242,237,.6)] border-t border-green-brand/[.2] pt-4">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="font-semibold text-green-700 dark:text-green-300">✓ Payment Received</span>
              </div>
              <div className="flex justify-between">
                <span>Next Step:</span>
                <span className="font-semibold text-black/80 dark:text-[rgba(240,242,237,.8)]">Order Processing</span>
              </div>
            </div>
          </div>

          {/* Information Box */}
          <div className="bg-blue-500/[.05] dark:bg-blue-500/[.08] border border-blue-500/[.1] dark:border-blue-500/[.15] rounded-lg p-5 mb-6 text-left">
            <h3 className="font-semibold text-black/85 dark:text-[#f0f2ed] mb-3 flex items-center gap-2 text-[.9rem]">
              <span>ℹ️</span> What's Next?
            </h3>
            <ul className="space-y-2 text-[.85rem] text-black/70 dark:text-[rgba(240,242,237,.7)]">
              <li className="flex gap-3">
                <span className="text-green-700 dark:text-green-300 font-bold flex-shrink-0">1.</span>
                <span>You'll receive a confirmation email shortly with your order details</span>
              </li>
              <li className="flex gap-3">
                <span className="text-green-700 dark:text-green-300 font-bold flex-shrink-0">2.</span>
                <span>Our team will process your order and prepare it for shipment</span>
              </li>
              <li className="flex gap-3">
                <span className="text-green-700 dark:text-green-300 font-bold flex-shrink-0">3.</span>
                <span>You can track your order status in your account dashboard</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 justify-center mb-6">
            <button
              onClick={() => navigate(`/orders`)}
              className="bg-gradient-to-br from-green-brand to-lime-brand text-dark-surface font-semibold py-3 px-6 rounded-lg text-[.9rem] transition-all duration-200 hover:shadow-[0_0_16px_rgba(168,214,62,.4)] flex items-center justify-center gap-2"
            >
              <Package className="w-5 h-5" />
              View Orders
            </button>
            <button
              onClick={() => navigate("/products")}
              className="border border-lime-brand/30 dark:border-lime-brand/20 text-lime-brand dark:text-lime-brand font-semibold py-3 px-6 rounded-lg text-[.9rem] transition-all duration-200 hover:bg-lime-brand/[.05] dark:hover:bg-lime-brand/[.08] flex items-center justify-center gap-2"
            >
              Continue Shopping
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Contact Info */}
          <div className="pt-6 border-t border-black/[.08] dark:border-white/[.06]">
            <p className="text-[.8rem] text-black/60 dark:text-[rgba(240,242,237,.6)] mb-3">Have questions about your order?</p>
            <div className="flex flex-col gap-2 justify-center text-[.8rem]">
              <a href="mailto:support@lumoelectrical.co.za" className="text-lime-brand dark:text-lime-brand hover:underline">
                📧 support@lumoelectrical.co.za
              </a>
              <a href="tel:+27666666666" className="text-lime-brand dark:text-lime-brand hover:underline">
                📞 +27 66 666 6666
              </a>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-6 text-center text-black/60 dark:text-[rgba(240,242,237,.6)] text-[.8rem]">
          <p>✓ Secure payment • ✓ Order confirmation sent</p>
        </div>
      </div>
    </div>
  );
}
