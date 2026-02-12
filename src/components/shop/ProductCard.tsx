import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAddToCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    images?: Array<{ image_url: string; color?: string }>;
    category: string;
    collection: string;
    colors: string[];
    sizes: string[];
    fit: string;
    isNew?: boolean;
    isBestseller?: boolean;
  };
  selectedColor?: string;
}

export const ProductCard = ({ product, selectedColor }: ProductCardProps) => {
  // DEBUG: Log product prop
  console.log("ProductCard product:", product);

  const { mutateAsync: addToCart, isPending } = useAddToCart();
  const { toast } = useToast();
  // Show all images for the product, regardless of color
  const displayImages = product.images && product.images.length > 0
    ? product.images.map(img => img.image_url)
    : ['/placeholder-product.svg'];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const hasMultipleImages = displayImages.length > 1 && displayImages[0] !== '/placeholder-product.svg';

  // Auto-slide every 5 seconds
  const autoSlideRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (!hasMultipleImages) return;
    autoSlideRef.current = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
    }, 5000);
    return () => {
      if (autoSlideRef.current) clearInterval(autoSlideRef.current);
    };
  }, [displayImages.length, hasMultipleImages]);

  const currentImage = displayImages[currentImageIndex];

  const handleAdd = async () => {
    const selected_size = product.sizes[0];
    const selected_color = selectedColor || product.colors[0];
    if (!selected_size || !selected_color) return;
    try {
      await addToCart({
        product_id: product.id,
        quantity: 1,
        selected_size,
        selected_color,
      });
      toast({
        title: "Added to cart!",
        description: `${product.name} has been added to your cart.`,
      });
    } catch (error: any) {
      if (error?.message === "AUTH_REQUIRED") return;
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to add to cart",
        variant: "destructive",
      });
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast({
      title: "Added to wishlist!",
      description: `${product.name} has been added to your wishlist.`,
    });
  };
  
  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === 0 ? displayImages.length - 1 : prev - 1
    );
    if (autoSlideRef.current) {
      clearInterval(autoSlideRef.current);
      autoSlideRef.current = null;
    }
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === displayImages.length - 1 ? 0 : prev + 1
    );
    if (autoSlideRef.current) {
      clearInterval(autoSlideRef.current);
      autoSlideRef.current = null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <Link to={`/product/${product.id}${selectedColor ? `?color=${encodeURIComponent(selectedColor)}` : ''}`}>
        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-muted mb-4 product-image-zoom">
          <img
            src={currentImage}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
          
          {/* Image carousel navigation & indicators */}
          {hasMultipleImages && (
            <>
              <Button
                size="icon"
                variant="secondary"
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full shadow-md bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handlePrevImage}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full shadow-md bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleNextImage}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>

              {/* Instagram-style image count (top right) */}
              <div className="absolute top-2 right-3 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full z-10 select-none">
                {`${currentImageIndex + 1}/${displayImages.length}`}
              </div>

              {/* Dots (max 4, sliding window) */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {(() => {
                  const maxDots = 4;
                  const total = displayImages.length;
                  let start = 0;
                  if (total > maxDots) {
                    if (currentImageIndex < 2) {
                      start = 0;
                    } else if (currentImageIndex > total - 3) {
                      start = total - maxDots;
                    } else {
                      start = currentImageIndex - 1;
                    }
                  }
                  const dots = [];
                  for (let i = 0; i < Math.min(total, maxDots); i++) {
                    const imgIdx = start + i;
                    if (imgIdx >= total) break;
                    dots.push(
                      <div
                        key={imgIdx}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          imgIdx === currentImageIndex
                            ? 'bg-white w-4'
                            : 'bg-white/50'
                        }`}
                      />
                    );
                  }
                  return dots;
                })()}
              </div>
            </>
          )}
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.isNew && (
              <Badge className="bg-blue-50 text-blue-700 border border-blue-200 shadow-sm font-medium text-xs px-3 py-0.5 uppercase tracking-wide rounded-sm">
                New
              </Badge>
            )}
            {product.isBestseller && (
              <Badge className="bg-amber-50 text-amber-700 border border-amber-200 shadow-sm font-medium text-xs px-3 py-0.5 uppercase tracking-wide rounded-sm">
                Bestseller
              </Badge>
            )}
            {product.originalPrice && (
              <Badge className="bg-red-50 text-red-700 border border-red-200 shadow-sm font-medium text-xs px-3 py-0.5 uppercase tracking-wide rounded-sm">
                Sale
              </Badge>
            )}
          </div>
          
          {/* Quick actions */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="icon"
              variant="secondary"
              className="w-10 h-10 rounded-full shadow-soft bg-background/90 backdrop-blur-sm hover:bg-coral hover:text-white transition-colors"
              onClick={handleWishlist}
            >
              <Heart className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Add to cart overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <Button
              variant="hero"
              className="w-full"
              disabled={isPending || product.sizes.length === 0 || product.colors.length === 0}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleAdd();
              }}
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              {isPending ? "Adding..." : "Add to Cart"}
            </Button>
          </div>
        </div>
      </Link>
      
      <div className="space-y-1">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground">{product.fit}</p>
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-lg">
            ₹{product.price.toFixed(2)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              ₹{product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>
        
        {/* Color options preview */}
        <div className="flex gap-1 pt-2">
          {product.colors.slice(0, 4).map((color) => (
            <div
              key={color}
              className="w-4 h-4 rounded-full border border-border"
              style={{
                backgroundColor:
                  color === "white" ? "#fff" :
                  color === "black" ? "#1a1a1a" :
                  color === "gray" ? "#6B7280" :
                  color === "navy" ? "#1e3a5f" :
                  color === "sage" ? "#9DC183" :
                  color === "lavender" ? "#E6E6FA" :
                  color === "coral" ? "#FF7F50" :
                  color === "cream" ? "#FFFDD0" :
                  color === "pink" ? "#FFB6C1" :
                  color === "sky" ? "#87CEEB" :
                  color === "olive" ? "#808000" :
                  color === "charcoal" ? "#36454F" :
                  "#ccc"
              }}
              title={color}
            />
          ))}
          {product.colors.length > 4 && (
            <span className="text-xs text-muted-foreground">+{product.colors.length - 4}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
