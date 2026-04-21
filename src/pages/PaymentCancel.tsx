import { useNavigate } from "react-router-dom";
import { XCircle, ShoppingCart, Home } from "lucide-react";

export default function PaymentCancel() {
  const navigate = useNavigate();

  return (
    <div className="font-outfit bg-white dark:bg-dark-surface min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Cancel Container */}
        <div className="bg-white dark:bg-black/[.02] rounded-xl border border-black/[.08] dark:border-white/[.06] p-8 text-center">
          {/* Cancel Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500 rounded-full blur-xl opacity-20 animate-pulse" />
              <div className="relative bg-red-500 rounded-full p-4">
                <XCircle className="w-16 h-16 text-white" strokeWidth={1.5} />
              </div>
            </div>
          </div>

          {/* Heading */}
          <h1 className="font-bebas text-[2rem] tracking-[.08em] text-black/85 dark:text-[#f0f2ed] mb-2">
            Payment Cancelled
          </h1>
          <p className="text-[.9rem] text-black/60 dark:text-[rgba(240,242,237,.6)] mb-8">
            Your payment has been cancelled. Your order was not completed.
          </p>

          {/* Order Info Card */}
          <div className="bg-red-500/[.05] dark:bg-red-500/[.08] border border-red-500/[.1] dark:border-red-500/[.15] rounded-lg p-5 mb-6">
            <div className="space-y-2 text-[.85rem] text-black/60 dark:text-[rgba(240,242,237,.6)]">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="font-semibold text-red-600 dark:text-red-400">✗ Payment Cancelled</span>
              </div>
              <div className="flex justify-between">
                <span>Cart Status:</span>
                <span className="font-semibold text-black/80 dark:text-[rgba(240,242,237,.8)]">Still Available</span>
              </div>
            </div>
          </div>

          {/* Information Box */}
          <div className="bg-orange-500/[.05] dark:bg-orange-500/[.08] border border-orange-500/[.1] dark:border-orange-500/[.15] rounded-lg p-5 mb-6 text-left">
            <h3 className="font-semibold text-black/85 dark:text-[#f0f2ed] mb-3 flex items-center gap-2 text-[.9rem]">
              <span>⚠️</span> What Happened?
            </h3>
            <ul className="space-y-1.5 text-[.85rem] text-black/70 dark:text-[rgba(240,242,237,.7)] space-y-2">
              <li>• Your payment was cancelled during the checkout process</li>
              <li>• Your order was not created and no payment was processed</li>
              <li>• Your items are still saved in your cart</li>
              <li>• You can try again or continue shopping whenever you're ready</li>
            </ul>
          </div>

          {/* Reasons & Next Steps */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-black/[.03] dark:bg-white/[.03] border border-black/[.08] dark:border-white/[.06] rounded-lg p-3">
              <h4 className="font-semibold text-black/85 dark:text-[#f0f2ed] mb-2 text-[.8rem]">Why This Happened?</h4>
              <ul className="text-[.75rem] text-black/60 dark:text-[rgba(240,242,237,.6)] space-y-1">
                <li>• You cancelled the payment</li>
                <li>• Payment provider issue</li>
                <li>• Connection timeout</li>
              </ul>
            </div>
            <div className="bg-black/[.03] dark:bg-white/[.03] border border-black/[.08] dark:border-white/[.06] rounded-lg p-3">
              <h4 className="font-semibold text-black/85 dark:text-[#f0f2ed] mb-2 text-[.8rem]">What to Do?</h4>
              <ul className="text-[.75rem] text-black/60 dark:text-[rgba(240,242,237,.6)] space-y-1">
                <li>• Review your cart items</li>
                <li>• Check payment details</li>
                <li>• Try again with different method</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 justify-center mb-6">
            <button
              onClick={() => navigate("/checkout")}
              className="bg-gradient-to-br from-green-brand to-lime-brand text-dark-surface font-semibold py-3 px-6 rounded-lg text-[.9rem] transition-all duration-200 hover:shadow-[0_0_16px_rgba(168,214,62,.4)] flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Return to Checkout
            </button>
            <button
              onClick={() => navigate("/products")}
              className="border border-lime-brand/30 dark:border-lime-brand/20 text-lime-brand dark:text-lime-brand font-semibold py-3 px-6 rounded-lg text-[.9rem] transition-all duration-200 hover:bg-lime-brand/[.05] dark:hover:bg-lime-brand/[.08] flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Continue Shopping
            </button>
          </div>

          {/* Contact Info */}
          <div className="pt-6 border-t border-black/[.08] dark:border-white/[.06]">
            <p className="text-[.8rem] text-black/60 dark:text-[rgba(240,242,237,.6)] mb-3">
              Experiencing payment issues? Contact our support team
            </p>
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

        {/* Help Text */}
        <div className="mt-6 text-center text-black/60 dark:text-[rgba(240,242,237,.6)] text-[.8rem]">
          <p>💡 Your cart has been saved. No charges were made to your payment method.</p>
        </div>
      </div>
    </div>
  );
}
