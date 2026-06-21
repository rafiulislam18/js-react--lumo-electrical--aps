import { useParams, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Package,
  ArrowRight,
  Info,
  Mail,
  Phone,
  ShieldCheck,
  MailCheck,
} from "lucide-react";

export default function PaymentSuccess() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  return (
    <div className="font-outfit bg-[#f6f5f0]/[.86] dark:bg-dark-surface min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[460px]">
        {/* Success Container */}
        <div className="bg-white dark:bg-[#141914] border border-[rgba(22,25,26,.1)] dark:border-white/10 rounded-[24px] p-8 text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#399746] to-[#a8d63e] rounded-full blur-xl opacity-25 animate-pulse" />
              <div className="relative bg-gradient-to-br from-[#399746] to-[#a8d63e] rounded-full p-4">
                <CheckCircle className="w-14 h-14 text-white" strokeWidth={1.5} />
              </div>
            </div>
          </div>

          {/* Heading */}
          <h1 className="font-bebas text-[2rem] leading-none text-[#16191a] dark:text-[#f1f3ea] mb-2">
            Payment Successful!
          </h1>
          <p className="text-[.9rem] text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)] mb-7">
            Your order has been placed and payment has been received successfully.
          </p>

          {/* Order Info Card */}
          <div className="bg-[#f7f6f1] dark:bg-[#171c16] border border-[rgba(57,151,70,.18)] rounded-[14px] p-6 mb-5">
            <div className="flex items-center justify-center gap-2 mb-3 text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)]">
              <Package className="w-5 h-5 text-[#2f8b3d] dark:text-[#a8d63e]" />
              <span className="text-[.8rem] font-medium">Order Number</span>
            </div>
            <p className="font-bebas text-[2.2rem] leading-none text-[#2f8b3d] dark:text-[#a8d63e] mb-4">
              #{orderId}
            </p>
            <div className="space-y-2 text-[.85rem] text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)] border-t border-[rgba(57,151,70,.2)] pt-4">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="font-semibold text-[#2f8b3d] dark:text-[#a8d63e] flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Payment Received
                </span>
              </div>
              <div className="flex justify-between">
                <span>Next Step:</span>
                <span className="font-semibold text-[#16191a] dark:text-[#f1f3ea]">Order Processing</span>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className="bg-[#f7f6f1] dark:bg-[#171c16] border border-[rgba(22,25,26,.07)] dark:border-white/[.06] rounded-[14px] p-5 mb-5 text-left">
            <h3 className="font-semibold text-[#16191a] dark:text-[#f1f3ea] mb-3 flex items-center gap-2 text-[.9rem]">
              <Info className="w-[18px] h-[18px] text-[#2f8b3d] dark:text-[#a8d63e]" /> What's Next?
            </h3>
            <ul className="space-y-2.5 text-[.85rem] text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)]">
              <li className="flex gap-3">
                <span className="text-[#2f8b3d] dark:text-[#a8d63e] font-bold shrink-0">1.</span>
                <span>You'll receive a confirmation email shortly with your order details</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#2f8b3d] dark:text-[#a8d63e] font-bold shrink-0">2.</span>
                <span>Our team will process your order and prepare it for shipment</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#2f8b3d] dark:text-[#a8d63e] font-bold shrink-0">3.</span>
                <span>You can track your order status in your account dashboard</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 mb-6">
            <button
              onClick={() => navigate(`/orders`)}
              className="inline-flex items-center justify-center gap-2 font-semibold rounded-full px-6 py-[.8rem] transition w-full bg-gradient-to-r from-[#399746] to-[#a8d63e] text-white dark:text-[#0a0c0a]"
            >
              <Package className="w-5 h-5" />
              View Orders
            </button>
            <button
              onClick={() => navigate("/products")}
              className="inline-flex items-center justify-center gap-2 font-semibold rounded-full px-6 py-[.8rem] transition w-full border border-[rgba(22,25,26,.1)] dark:border-white/10 text-[#16191a] dark:text-[#f1f3ea] hover:border-[#2f8b3d] hover:text-[#2f8b3d]"
            >
              Continue Shopping
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Contact Info */}
          <div className="pt-6 border-t border-[rgba(22,25,26,.1)] dark:border-white/10">
            <p className="text-[.8rem] text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)] mb-3">
              Have questions about your order?
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

        {/* Trust Badges */}
        <div className="mt-5 flex items-center justify-center gap-4 text-[.8rem] text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)]">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#2f8b3d] dark:text-[#a8d63e]" /> Secure payment
          </span>
        </div>
      </div>
    </div>
  );
}
