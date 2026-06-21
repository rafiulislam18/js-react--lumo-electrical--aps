import { useNavigate } from "react-router-dom";
import { XCircle, ShoppingCart, Home, AlertTriangle, Mail, Phone, Lightbulb, X } from "lucide-react";

export default function PaymentCancel() {
  const navigate = useNavigate();

  return (
    <div className="font-outfit bg-[#f6f5f0]/[.86] dark:bg-dark-surface min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[460px]">
        {/* Cancel Container */}
        <div className="bg-white dark:bg-[#141914] border border-[rgba(22,25,26,.1)] dark:border-white/10 rounded-[24px] p-8 text-center">
          {/* Cancel Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-[#d94646] rounded-full blur-xl opacity-20 animate-pulse" />
              <div className="relative bg-[#d94646] rounded-full p-4">
                <XCircle className="w-14 h-14 text-white" strokeWidth={1.5} />
              </div>
            </div>
          </div>

          {/* Heading */}
          <h1 className="font-bebas text-[2rem] leading-none text-[#16191a] dark:text-[#f1f3ea] mb-2">
            Payment Cancelled
          </h1>
          <p className="text-[.9rem] text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)] mb-7">
            Your payment has been cancelled. Your order was not completed.
          </p>

          {/* Status Card */}
          <div className="bg-[rgba(217,70,70,.06)] dark:bg-[rgba(217,70,70,.06)] border border-[rgba(217,70,70,.18)] dark:border-[rgba(217,70,70,.18)] rounded-[14px] p-5 mb-5">
            <div className="space-y-2 text-[.85rem] text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)]">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="font-semibold flex items-center gap-1 text-[#d94646]">
                  <X className="w-3.5 h-3.5" /> Payment Cancelled
                </span>
              </div>
              <div className="flex justify-between">
                <span>Cart Status:</span>
                <span className="font-semibold text-[#16191a] dark:text-[#f1f3ea]">Still Available</span>
              </div>
            </div>
          </div>

          {/* What Happened */}
          <div className="bg-[#f7f6f1] dark:bg-[#171c16] border border-[rgba(22,25,26,.07)] dark:border-white/[.06] rounded-[14px] p-5 mb-5 text-left">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-[.9rem] text-[#16191a] dark:text-[#f1f3ea]">
              <AlertTriangle className="w-[18px] h-[18px] text-[#e08a1e]" /> What Happened?
            </h3>
            <ul className="space-y-2 text-[.85rem] text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)]">
              <li className="flex gap-2.5">
                <span className="text-[rgba(22,25,26,.42)] dark:text-[rgba(241,243,234,.42)]">•</span> Your payment was cancelled during the checkout process
              </li>
              <li className="flex gap-2.5">
                <span className="text-[rgba(22,25,26,.42)] dark:text-[rgba(241,243,234,.42)]">•</span> Your order was not created and no payment was processed
              </li>
              <li className="flex gap-2.5">
                <span className="text-[rgba(22,25,26,.42)] dark:text-[rgba(241,243,234,.42)]">•</span> Your items are still saved in your cart
              </li>
              <li className="flex gap-2.5">
                <span className="text-[rgba(22,25,26,.42)] dark:text-[rgba(241,243,234,.42)]">•</span> You can try again or continue shopping whenever you're ready
              </li>
            </ul>
          </div>

          {/* Reasons & Next Steps */}
          <div className="grid grid-cols-2 gap-3 mb-6 text-left">
            <div className="bg-[#f7f6f1] dark:bg-[#171c16] border border-[rgba(22,25,26,.07)] dark:border-white/[.06] rounded-[14px] p-4">
              <h4 className="font-semibold mb-2 text-[.8rem] text-[#16191a] dark:text-[#f1f3ea]">Why This Happened?</h4>
              <ul className="text-[.75rem] text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)] space-y-1">
                <li>• You cancelled the payment</li>
                <li>• Payment provider issue</li>
                <li>• Connection timeout</li>
              </ul>
            </div>
            <div className="bg-[#f7f6f1] dark:bg-[#171c16] border border-[rgba(22,25,26,.07)] dark:border-white/[.06] rounded-[14px] p-4">
              <h4 className="font-semibold mb-2 text-[.8rem] text-[#16191a] dark:text-[#f1f3ea]">What to Do?</h4>
              <ul className="text-[.75rem] text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)] space-y-1">
                <li>• Review your cart items</li>
                <li>• Check payment details</li>
                <li>• Try again with different method</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 mb-6">
            <button
              onClick={() => navigate("/checkout")}
              className="inline-flex items-center justify-center gap-2 font-semibold rounded-full px-6 py-[.8rem] transition w-full bg-gradient-to-r from-[#399746] to-[#a8d63e] text-white dark:text-[#0a0c0a]"
            >
              <ShoppingCart className="w-5 h-5" />
              Return to Checkout
            </button>
            <button
              onClick={() => navigate("/products")}
              className="inline-flex items-center justify-center gap-2 font-semibold rounded-full px-6 py-[.8rem] transition w-full border border-[rgba(22,25,26,.1)] dark:border-white/10 hover:border-[#2f8b3d] hover:text-[#2f8b3d] text-[#16191a] dark:text-[#f1f3ea]"
            >
              <Home className="w-5 h-5" />
              Continue Shopping
            </button>
          </div>

          {/* Contact Info */}
          <div className="pt-6 border-t border-[rgba(22,25,26,.1)] dark:border-white/10">
            <p className="text-[.8rem] text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)] mb-3">
              Experiencing payment issues? Contact our support team
            </p>
            <div className="flex flex-col gap-2 text-[.8rem]">
              <a
                href="mailto:support@lumoelectrical.co.za"
                className="text-[#2f8b3d] dark:text-[#a8d63e] flex items-center justify-center gap-2 hover:underline"
              >
                <Mail className="w-4 h-4" /> support@lumoelectrical.co.za
              </a>
              <a
                href="tel:+27666666666"
                className="text-[#2f8b3d] dark:text-[#a8d63e] flex items-center justify-center gap-2 hover:underline"
              >
                <Phone className="w-4 h-4" /> +27 66 666 6666
              </a>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-5 flex items-center justify-center gap-1.5 text-[.8rem] text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)]">
          <Lightbulb className="w-4 h-4 text-[#2f8b3d] dark:text-[#a8d63e]" /> Your cart has been saved. No charges were made to your payment method.
        </div>
      </div>
    </div>
  );
}
