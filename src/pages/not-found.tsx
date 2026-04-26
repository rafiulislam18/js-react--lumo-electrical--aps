import { AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="font-outfit bg-white dark:bg-dark-surface min-h-screen w-full flex items-center justify-center px-4">
      <div className="bg-white dark:bg-black/[.02] rounded-lg border border-black/[.08] dark:border-white/[.06] w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-8 h-8 text-red-500 dark:text-red-400" />
          <h1 className="font-bebas text-[2rem] tracking-[.08em] text-black/85 dark:text-[#f0f2ed]">404</h1>
        </div>

        <p className="text-[.9rem] text-black/60 dark:text-[rgba(240,242,237,.6)] mb-6">
          Page not found. Did you forget to add the page to the router?
        </p>

        <Link to="/">
          <button className="bg-gradient-to-br from-green-brand to-lime-brand text-white dark:text-dark-surface font-semibold py-3 px-6 rounded-lg w-full transition-all duration-200 hover:shadow-[0_0_16px_rgba(168,214,62,.4)]">
            Go to Home
          </button>
        </Link>
      </div>
    </div>
  );
}
