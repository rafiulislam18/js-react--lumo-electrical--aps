import { Unplug, Home, Search } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="font-outfit bg-white dark:bg-dark-surface min-h-screen w-full flex items-center justify-center px-4">
      <div className="w-full max-w-[520px] text-center">
        <div className="bg-white dark:bg-[#141914] border border-[rgba(22,25,26,.1)] dark:border-white/10 rounded-[24px] p-9 sm:p-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-7 bg-[rgba(57,151,70,.09)] dark:bg-[rgba(168,214,62,.1)] text-[#2f8b3d] dark:text-[#a8d63e]">
            <Unplug className="w-8 h-8" />
          </div>

          <div className="font-bebas leading-[.85] text-[clamp(4.5rem,16vw,7rem)] bg-gradient-to-br from-[#399746] to-[#a8d63e] bg-clip-text text-transparent">
            404
          </div>

          <h1 className="font-bebas text-[1.9rem] leading-none mt-2 mb-3 text-black/85 dark:text-[#f0f2ed]">
            This circuit's gone dark
          </h1>

          <p className="text-[.92rem] leading-relaxed mb-8 max-w-[380px] mx-auto text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)]">
            The page you're looking for doesn't exist or may have moved. Let's
            get you back to something that's wired up.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 font-semibold rounded-full px-6 py-[.8rem] transition bg-gradient-to-r from-[#399746] to-[#a8d63e] text-white dark:text-[#0a0c0a]"
            >
              <Home className="w-4 h-4" /> Go to Home
            </Link>
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 font-semibold rounded-full px-6 py-[.8rem] transition border border-[rgba(22,25,26,.1)] dark:border-white/10 hover:border-[#2f8b3d] hover:text-[#2f8b3d]"
            >
              <Search className="w-4 h-4" /> Browse Products
            </Link>
          </div>
        </div>

        <p className="text-[.82rem] mt-6 text-[rgba(22,25,26,.42)] dark:text-[rgba(241,243,234,.42)]">
          Need help?{" "}
          <Link
            to="/contact-us"
            className="font-medium text-[#2f8b3d] dark:text-[#a8d63e]"
          >
            Contact support
          </Link>
        </p>
      </div>
    </div>
  );
}
