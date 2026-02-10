import { Button } from '@/components/ui/button';

interface DishCardProps {
  dish: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    image_url: string | null;
    is_available: boolean;
  };
  onAddToCart: (dish: DishCardProps['dish']) => void;
}

const DishCard = ({ dish, onAddToCart }: DishCardProps) => {
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
        <h3 className="font-display text-xl font-semibold text-card-foreground mb-2">
          {dish.name}
        </h3>

        {dish.description && (
          <p className="text-muted-foreground text-sm mb-4">
            {dish.description}
          </p>
        )}

        <Button
          className="w-full bg-primary text-primary-foreground rounded-xl"
          disabled={!dish.is_available}
          onClick={() => onAddToCart(dish)}
        >
          Add to Cart
        </Button>
      </div>
    </div>
  );
};

export default DishCard;
