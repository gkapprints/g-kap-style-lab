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
  const { mutateAsync: addToCart, isPending } = useAddToCart();
  const { toast } = useToast();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Filter images by selectedColor if provided, otherwise use all images
  const colorFilteredImages = selectedColor
    ? product.images?.filter(img => img.color === selectedColor)
    : product.images;
  
  // Only use images if they exist for this color, otherwise show placeholder
  const displayImages = colorFilteredImages && colorFilteredImages.length > 0 
    ? colorFilteredImages.map(img => img.image_url)
    : ['/placeholder-product.svg'];
  
  const currentImage = displayImages[currentImageIndex];
  const hasMultipleImages = displayImages.length > 1 && displayImages[0] !== '/placeholder-product.svg';

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
  };
  
  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === displayImages.length - 1 ? 0 : prev + 1
    );
  };

 return (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="group w-full"
  >
    <Link
      to={`/product/${product.id}${
        selectedColor ? `?color=${encodeURIComponent(selectedColor)}` : ""
      }`}
    >
      {/* ================= IMAGE CONTAINER ================= */}
      <div className="
        relative
        w-full
        aspect-[3/4]
        overflow-hidden
        rounded-xl
        bg-gray-100
      ">
        {/* PRODUCT IMAGE */}
        <img
          src={currentImage}
          alt={product.name}
          className="
            w-full h-full
            object-cover
            object-center
            transition-transform duration-500
            group-hover:scale-105
          "
        />

        {/* IMAGE CAROUSEL */}
        {hasMultipleImages && (
          <>
            <button
              onClick={handlePrevImage}
              className="
                hidden md:flex
                absolute left-2 top-1/2 -translate-y-1/2
                w-8 h-8 items-center justify-center
                rounded-full bg-white/80 backdrop-blur
                shadow
              "
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={handleNextImage}
              className="
                hidden md:flex
                absolute right-2 top-1/2 -translate-y-1/2
                w-8 h-8 items-center justify-center
                rounded-full bg-white/80 backdrop-blur
                shadow
              "
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* BADGES */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isNew && (
            <Badge className="text-xs">NEW</Badge>
          )}
          {product.isBestseller && (
            <Badge className="text-xs">BEST</Badge>
          )}
          {product.originalPrice && (
            <Badge className="text-xs">SALE</Badge>
          )}
        </div>

        {/* WISHLIST */}
        <button
          onClick={handleWishlist}
          className="
            absolute top-2 right-2
            w-9 h-9 rounded-full
            bg-white/90 backdrop-blur
            flex items-center justify-center
            shadow
          "
        >
          <Heart className="w-4 h-4" />
        </button>

        {/* ADD TO CART — mobile always visible */}
        <div className="
          absolute bottom-0 left-0 right-0
          p-2 sm:p-3
          bg-gradient-to-t from-black/60 to-transparent
        ">
          <Button
            className="w-full text-sm"
            disabled={
              isPending ||
              product.sizes.length === 0 ||
              product.colors.length === 0
            }
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleAdd();
            }}
          >
            {isPending ? "Adding..." : "Add to Cart"}
          </Button>
        </div>
      </div>
    </Link>

    {/* ================= PRODUCT INFO ================= */}
    <div className="mt-3 space-y-1">
      <h3 className="text-sm sm:text-base font-semibold line-clamp-1">
        {product.name}
      </h3>

      <p className="text-xs text-gray-500">{product.fit}</p>

      <div className="flex items-center gap-2">
        <span className="font-bold text-base sm:text-lg">
          ₹{product.price.toFixed(2)}
        </span>
        {product.originalPrice && (
          <span className="text-xs line-through text-gray-400">
            ₹{product.originalPrice.toFixed(2)}
          </span>
        )}
      </div>
    </div>
  </motion.div>
);
}
export default ProductCard;