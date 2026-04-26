import { useQuery, useMutation } from "@tanstack/react-query";
import { X, ShoppingCart, Trash2, Plus, Minus, Loader } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiGet, apiPatch, apiDelete } from "@/lib/api";

interface CartItemData {
  id: number;
  product: {
    id: number;
    name: string;
    price: string;
    image: string;
  };
  quantity: number;
  subtotal: number;
}

interface CartData {
  id: number;
  items: CartItemData[];
  total_items: number;
  total_price: number;
}

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// Helper to get full image URL
const getImageUrl = (imagePath: string) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  const baseUrl = import.meta.env.VITE_BASE_URL || 'http://127.0.0.1:8000';
  return `${baseUrl}${imagePath}`;
};

export function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Fetch cart data
  const { data: cart, isLoading, refetch } = useQuery<CartData>({
    queryKey: ['cart'],
    queryFn: async () => {
      if (!isAuthenticated) {
        throw new Error('Not authenticated');
      }
      return apiGet<CartData>('/cart/');
    },
    enabled: isOpen && isAuthenticated,
  });

  // Update quantity mutation
  const updateMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: number; quantity: number }) => {
      return apiPatch(`/cart/items/${itemId}/update/`, { quantity });
    },
    onSuccess: () => {
      refetch();
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    },
  });

  // Remove item mutation
  const removeMutation = useMutation({
    mutationFn: async (itemId: number) => {
      return apiDelete(`/cart/items/${itemId}/remove/`);
    },
    onSuccess: () => {
      refetch();
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    },
  });

  const items = cart?.items || [];
  const totalPrice = cart?.total_price || 0;
  const subtotal = totalPrice;
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const handleUpdateQuantity = (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeMutation.mutate(itemId);
      return;
    }
    updateMutation.mutate({ itemId, quantity });
  };

  const handleRemoveItem = (itemId: number) => {
    removeMutation.mutate(itemId);
  };

  if (!isAuthenticated) {
    return (
      <>
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 transition-opacity dark:bg-black/60"
            onClick={onClose}
          />
        )}
        <div
          className={`fixed right-0 top-0 h-screen w-full md:w-96 bg-white dark:bg-dark-surface shadow-2xl transform transition-transform duration-300 z-50 flex flex-col ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between p-6 border-b border-black/[.08] dark:border-white/[.06]">
            <h2 className="text-lg font-bebas tracking-[.08em] text-black/85 dark:text-[#f0f2ed] flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              SHOPPING CART
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-black/[.05] dark:hover:bg-white/[.08] rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-black/60 dark:text-[rgba(240,242,237,.6)]" />
            </button>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <ShoppingCart className="w-12 h-12 text-black/20 dark:text-white/[.1] mb-4" />
            <h3 className="font-semibold text-black/85 dark:text-[#f0f2ed] mb-2">Please Log In</h3>
            <p className="text-sm text-black/60 dark:text-[rgba(240,242,237,.6)] mb-6">
              You need to be logged in to view your cart
            </p>
            <button
              onClick={() => {
                navigate('/login');
                onClose();
              }}
              className="bg-gradient-to-br from-green-brand to-lime-brand text-white dark:text-dark-surface font-semibold py-3 px-6 rounded-lg w-full transition-all duration-200 hover:shadow-[0_0_16px_rgba(168,214,62,.4)]"
            >
              Log In
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 dark:bg-black/60 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 h-screen w-full md:w-96 bg-white dark:bg-dark-surface shadow-2xl transform transition-transform duration-300 z-50 flex flex-col font-outfit ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-black/[.08] dark:border-white/[.06]">
          <h2 className="text-lg font-bebas tracking-[.08em] text-black/85 dark:text-[#f0f2ed] flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            CART
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-black/[.05] dark:hover:bg-white/[.08] rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-black/60 dark:text-[rgba(240,242,237,.6)]" />
          </button>
        </div>

        {/* Items Container */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader className="w-6 h-6 text-green-deep dark:text-lime-brand animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <ShoppingCart className="w-12 h-12 text-black/20 dark:text-white/[.1] mb-4" />
              <h3 className="font-semibold text-black/85 dark:text-[#f0f2ed] mb-2">Cart is Empty</h3>
              <p className="text-sm text-black/60 dark:text-[rgba(240,242,237,.6)] mb-6">
                Add items to get started with shopping
              </p>
              <Link to="/products" onClick={onClose}>
                <button className="bg-gradient-to-br from-green-brand to-lime-brand text-white dark:text-dark-surface font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:shadow-[0_0_16px_rgba(168,214,62,.4)]">
                  Continue Shopping
                </button>
              </Link>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-2 bg-white dark:bg-black/[.02] rounded-lg p-2 border border-black/[.08] dark:border-white/[.06] hover:border-black/[.12] dark:hover:border-white/[.1] transition-colors"
                >
                  {/* Image */}
                  <img
                    src={getImageUrl(item.product.image)}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded bg-white dark:bg-black/[.05]"
                  />

                  {/* Content */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="font-semibold text-black/85 dark:text-[#f0f2ed] text-xs line-clamp-2">
                        {item.product.name}
                      </h4>
                      <p className="text-sm font-bold text-black/85 dark:text-[#f0f2ed] mt-0.5">
                        ${(parseFloat(item.product.price)).toFixed(2)}
                        <span className="font-normal text-black/60 dark:text-[rgba(240,242,237,.6)]">{" "} x {item.quantity} = {" "}</span>
                        <span className="text-green-deep dark:text-lime-brand">${(parseFloat(item.product.price)*item.quantity).toFixed(2)}</span>
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1 bg-white dark:bg-black/[.05] rounded border border-black/[.1] dark:border-white/[.08] w-fit">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={updateMutation.isPending}
                        className="p-0.5 hover:bg-black/[.05] dark:hover:bg-white/[.08] rounded transition-colors disabled:opacity-50"
                        title="Decrease quantity"
                      >
                        <Minus className="w-3 h-3 text-black/60 dark:text-[rgba(240,242,237,.6)]" />
                      </button>
                      <span className="w-6 text-center font-semibold text-xs text-black/85 dark:text-[#f0f2ed]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        disabled={updateMutation.isPending}
                        className="p-0.5 hover:bg-black/[.05] dark:hover:bg-white/[.08] rounded transition-colors disabled:opacity-50"
                        title="Increase quantity"
                      >
                        <Plus className="w-3 h-3 text-black/60 dark:text-[rgba(240,242,237,.6)]" />
                      </button>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={removeMutation.isPending}
                    className="text-black/30 dark:text-white/[.2] hover:text-red-500 dark:hover:text-red-400 transition-colors disabled:opacity-50 flex-shrink-0"
                    title="Remove from cart"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {!isLoading && items.length > 0 && (
          <div className="border-t border-black/[.08] dark:border-white/[.06] p-4 space-y-3 bg-white dark:bg-black/[.02]">
            {/* Totals */}
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-black/60 dark:text-[rgba(240,242,237,.6)]">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-black/60 dark:text-[rgba(240,242,237,.6)]">
                <span>Tax (10%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-black/85 dark:text-[#f0f2ed] pt-1 border-t border-black/[.08] dark:border-white/[.06]">
                <span>Total</span>
                <span className="text-green-deep dark:text-lime-brand">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  navigate("/checkout");
                  onClose();
                }}
                className="w-full bg-gradient-to-br from-green-brand to-lime-brand text-white dark:text-dark-surface font-semibold py-3 rounded-lg transition-all duration-200 hover:shadow-[0_0_16px_rgba(168,214,62,.4)] text-sm"
              >
                Checkout
              </button>
              <button
                onClick={onClose}
                className="w-full border border-black/[.1] dark:border-white/[.08] text-black/85 dark:text-[#f0f2ed] font-semibold py-3 rounded-lg transition-colors hover:bg-black/[.05] dark:hover:bg-white/[.08] text-sm"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
