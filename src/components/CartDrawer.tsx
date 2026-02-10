import { X, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: Record<string, { dish: any; quantity: number }>;
  setCart: React.Dispatch<
    React.SetStateAction<Record<string, { dish: any; quantity: number }>>
  >;
}

const CartDrawer = ({ isOpen, onClose, cart, setCart }: CartDrawerProps) => {
  const cartItems = Object.values(cart);

  const updateQuantity = (dishId: string, amount: number) => {
    setCart((prev) => {
      const updated = { ...prev };

      if (!updated[dishId]) return prev;

      updated[dishId].quantity += amount;

      if (updated[dishId].quantity <= 0) {
        delete updated[dishId];
      }

      localStorage.setItem('cart', JSON.stringify(updated));
      return updated;
    });
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.dish.price * item.quantity,
    0
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div
        className="flex-1 bg-black/40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="w-80 bg-white h-full shadow-xl p-4 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Your Cart</h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {cartItems.length === 0 ? (
          <p className="text-gray-500">Cart is empty</p>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto">
              {cartItems.map((item) => (
                <div
                  key={item.dish.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold">{item.dish.name}</p>
                    <p className="text-sm text-gray-500">
                      ₹{item.dish.price}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateQuantity(item.dish.id, -1)
                      }
                      className="p-1 border rounded"
                    >
                      <Minus size={16} />
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      onClick={() =>
                        updateQuantity(item.dish.id, 1)
                      }
                      className="p-1 border rounded"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between font-bold text-lg mb-3">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
              <Button
                className="w-full"
                onClick={() => alert('Order placed')}
              >
                Place Order
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
