import { Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface DishCardProps {
  dish: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    image_url: string | null;
    is_available: boolean;
  };
  onAddToCart: (dish: DishCardProps['dish'], quantity: number) => void;
}

const DishCard = ({ dish, onAddToCart }: DishCardProps) => {
  const [quantity, setQuantity] = useState(0);

  const increase = () => {
    const newQty = quantity + 1;
    setQuantity(newQty);
    onAddToCart(dish, newQty);
  };

  const decrease = () => {
    if (quantity === 0) return;
    const newQty = quantity - 1;
    setQuantity(newQty);
    onAddToCart(dish, newQty);
  };

  return (
    <div className="card-food group">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        {dish.image_url ? (
          <img
            src={dish.image_url}
            alt={dish.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <span className="text-4xl">🍽️</span>
          </div>
        )}

        {!dish.is_available && (
          <div className="absolute inset-0 bg-charcoal/70 flex items-center justify-center">
            <span className="text-cream font-semibold bg-destructive px-4 py-1 rounded-full text-sm">
              Not Available
            </span>
          </div>
        )}

        {/* Price */}
        <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full font-bold text-sm shadow-lg">
          ₹{dish.price}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-display text-xl font-semibold text-card-foreground mb-2 line-clamp-1">
          {dish.name}
        </h3>

        {dish.description && (
          <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
            {dish.description}
          </p>
        )}

        {/* Quantity Controls */}
        {dish.is_available && (
          <div className="flex items-center justify-center gap-3">
            <Button
              size="icon"
              variant="outline"
              className="rounded-full"
              onClick={decrease}
              disabled={quantity === 0}
            >
              <Minus className="w-4 h-4" />
            </Button>

            <span className="text-lg font-semibold w-6 text-center">
              {quantity}
            </span>

            <Button
              size="icon"
              className="rounded-full bg-primary text-primary-foreground"
              onClick={increase}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DishCard;
