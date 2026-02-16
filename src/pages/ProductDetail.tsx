import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, ShoppingBag, Truck, Shield, RefreshCw, Minus, Plus, Star, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layout } from "@/components/layout/Layout";
import { ProductCard } from "@/components/shop/ProductCard";
import { useProduct, useProducts } from "@/hooks/useProducts";
import { useAddToCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const urlColor = searchParams.get('color');
  const { data: product, isLoading, error } = useProduct(id || "");
  const { data: allProducts = [] } = useProducts();
  const { mutateAsync: addToCart, isPending } = useAddToCart();
  const { toast } = useToast();

  const productData = useMemo(() => {
    if (!product) return null;
    
    // Get primary image from images array, fallback to first image
    const primaryImage = product.images?.find((img: any) => img.is_primary)?.image_url 
      || product.images?.[0]?.image_url 
      || '/placeholder-product.svg';
    
    return {
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.original_price,
      image: primaryImage,
      images: product.images || [],
      category: product.category,
      collection: product.collection,
      colors: product.colors || [],
      sizes: product.sizes || [],
      fit: product.fit,
      isNew: product.is_new,
      isBestseller: product.is_bestseller,
      freeShippingThreshold: product.free_shipping_threshold || 50,
      returnDays: product.return_days || 30,
      description: product.description,
      fabricCare: product.fabric_care,
      shippingInfo: product.shipping_info,
    };
  }, [product]);

  const relatedProducts = useMemo(() => {
    if (!productData) return [];
    return allProducts
      .filter((p) => p.id !== productData.id && p.collection === productData.collection)
      .slice(0, 4)
      .map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        originalPrice: p.original_price,
        image: p.image_url,
        category: p.category,
        collection: p.collection,
        colors: p.colors || [],
        sizes: p.sizes || [],
        fit: p.fit,
        isNew: p.is_new,
        isBestseller: p.is_bestseller,
      }));
  }, [allProducts, productData]);

  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  // Filter images by selected color
  const displayImages = useMemo(() => {
    if (!productData || !productData.images.length) {
      return [{ image_url: '/placeholder-product.svg' }];
    }
    
    // Only show images that match the selected color exactly
    const colorImages = productData.images.filter(
      (img: any) => img.color === selectedColor
    );
    
    // If no images for this color, show placeholder
    return colorImages.length > 0 ? colorImages : [{ image_url: '/placeholder-product.svg' }];
  }, [productData, selectedColor]);

  useEffect(() => {
    if (productData) {
      setSelectedColor(urlColor || productData.colors[0] || "");
      setSelectedSize("");
      setQuantity(1);
      setActiveImage(0);
    }
  }, [productData, urlColor]);

  if (isLoading) {
    return (
      <Layout>
        <div className="section-container py-20 text-center text-muted-foreground">
          Loading product...
        </div>
      </Layout>
    );
  }

  if (error || !productData) {
    return (
      <Layout>
        <div className="section-container py-20 text-center">
          <h1 className="text-2xl font-display font-bold mb-4">Product not found</h1>
          <Link to="/shop">
            <Button variant="hero">Back to Shop</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const getColorHex = (colorName: string) => {
    const colorMap: Record<string, string> = {
      white: "#FFFFFF",
      black: "#1a1a1a",
      gray: "#6B7280",
      grey: "#6B7280",
      navy: "#1e3a5f",
      red: "#EF4444",
      blue: "#3B82F6",
      green: "#10B981",
      yellow: "#F59E0B",
      purple: "#8B5CF6",
      pink: "#EC4899",
      orange: "#F97316",
      brown: "#92400E",
      beige: "#D4C5B9",
      cream: "#FFFDD0",
      olive: "#808000",
      maroon: "#800000",
      lavender: "#E6E6FA",
      sage: "#9DC183",
      sky: "#87CEEB",
      coral: "#FF7F50",
      charcoal: "#36454F",
    };
    return colorMap[colorName.toLowerCase()] || "#ccc";
  };

  return (
    <Layout>
      <div className="section-container py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-8">
          <Link to="/" className="text-muted-foreground hover:text-primary">
            Home
          </Link>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <Link to="/shop" className="text-muted-foreground hover:text-primary">
            Shop
          </Link>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span className="text-foreground">{productData.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-muted"
            >
              <img
                src={displayImages[activeImage]?.image_url || productData.image}
                alt={productData.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
              {productData.isNew && (
                <Badge className="absolute top-4 left-4 bg-coral text-primary-foreground border-0">
                  New Arrival
                </Badge>
              )}
              {productData.isBestseller && (
                <Badge className="absolute top-4 left-4 bg-mint text-foreground border-0">
                  Bestseller
                </Badge>
              )}
            </motion.div>
            
            {/* Thumbnail gallery */}
            <div className="flex gap-3 overflow-x-auto">
              {displayImages.map((img: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`relative aspect-square w-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                    activeImage === i ? "border-primary" : "border-transparent"
                  }`}
                >
                  <img
                    src={img.image_url}
                    alt={`View ${i + 1}`}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <p className="text-muted-foreground mb-1">{productData.fit}</p>
              <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
                {productData.name}
              </h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-5 h-5 fill-sunflower text-sunflower" />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">(48 reviews)</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-3xl font-display font-bold">
                ₹{productData.price.toFixed(2)}
              </span>
              {productData.originalPrice && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    ₹{productData.originalPrice.toFixed(2)}
                  </span>
                  <Badge className="bg-destructive text-destructive-foreground">
                    Save ₹{(productData.originalPrice - productData.price).toFixed(2)}
                  </Badge>
                </>
              )}
            </div>

            {/* Color Selection */}
            <div>
              <p className="font-semibold mb-3">
                Color: <span className="font-normal capitalize">{selectedColor}</span>
              </p>
              <div className="flex gap-2">
                {productData.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      selectedColor === color
                        ? "border-primary ring-2 ring-primary ring-offset-2"
                        : "border-border hover:border-primary/50"
                    }`}
                    style={{ backgroundColor: getColorHex(color) }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold">Size</p>
                <Link to="/size-guide" className="text-sm text-primary hover:underline">
                  Size Guide
                </Link>
              </div>
              <div className="flex flex-wrap gap-2">
                {productData.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-5 py-3 rounded-lg border text-sm font-medium transition-colors ${
                      selectedSize === size
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:border-primary"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <p className="font-semibold mb-3">Quantity</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-muted transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-3 font-semibold min-w-[60px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-muted transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="flex gap-3">
              <Button
                variant="hero"
                size="xl"
                className="flex-1"
                disabled={!selectedSize || isPending}
                onClick={async () => {
                  try {
                    await addToCart({
                      product_id: productData.id,
                      quantity: quantity,
                      selected_size: selectedSize,
                      selected_color: selectedColor,
                    });
                    toast({
                      title: "Added to cart!",
                      description: `${productData.name} x${quantity} has been added to your cart.`,
                    });
                  } catch (error: any) {
                    if (error?.message === "AUTH_REQUIRED") return;
                    toast({
                      title: "Error",
                      description: error.response?.data?.error || "Failed to add to cart",
                      variant: "destructive",
                    });
                  }
                }}
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                {isPending ? "Adding..." : "Add to Cart"}
              </Button>
              <Button variant="outline" size="xl">
                <Heart className="w-5 h-5" />
              </Button>
            </div>

            {!selectedSize && (
              <p className="text-sm text-destructive">Please select a size</p>
            )}

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <Truck className="w-6 h-6 mx-auto mb-1 text-mint" />
                <p className="text-xs text-muted-foreground">
                  Free Shipping ₹{productData.freeShippingThreshold}+
                </p>
              </div>
              <div className="text-center">
                <RefreshCw className="w-6 h-6 mx-auto mb-1 text-coral" />
                <p className="text-xs text-muted-foreground">
                  {productData.returnDays}-Day Returns
                </p>
              </div>
              <div className="text-center">
                <Shield className="w-6 h-6 mx-auto mb-1 text-lavender" />
                <p className="text-xs text-muted-foreground">Quality Guarantee</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0">
              <TabsTrigger
                value="description"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Description
              </TabsTrigger>
              <TabsTrigger
                value="details"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Fabric & Care
              </TabsTrigger>
              <TabsTrigger
                value="shipping"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Shipping
              </TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="pt-6">
              <div className="prose max-w-none">
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {productData.description || 
                    `The ${productData.name} is crafted for those who want to make a statement. Featuring premium DTG (Direct-to-Garment) printing technology, every detail of the design comes through with vibrant, long-lasting colors.`
                  }
                </p>
              </div>
            </TabsContent>
            <TabsContent value="details" className="pt-6">
              <div className="prose max-w-none text-muted-foreground whitespace-pre-wrap">
                {productData.fabricCare || (
                  <>
                    <h4 className="text-foreground font-semibold">Fabric Composition</h4>
                    <p>100% Organic Ring-Spun Cotton, 180 GSM</p>
                    
                    <h4 className="text-foreground font-semibold mt-4">Care Instructions</h4>
                    <ul className="space-y-1">
                      <li>• Machine wash cold, inside out</li>
                      <li>• Tumble dry low or hang dry</li>
                      <li>• Do not bleach</li>
                      <li>• Iron on reverse if needed</li>
                      <li>• Do not dry clean</li>
                    </ul>
                  </>
                )}
              </div>
            </TabsContent>
            <TabsContent value="shipping" className="pt-6">
              <div className="prose max-w-none text-muted-foreground whitespace-pre-wrap">
                {productData.shippingInfo || (
                  <>
                    <h4 className="text-foreground font-semibold">Delivery Time</h4>
                    <p>Standard shipping: 5-7 business days</p>
                    <p>Express shipping: 2-3 business days</p>
                    
                    <h4 className="text-foreground font-semibold mt-4">Free Shipping</h4>
                    <p>Orders over ₹{productData.freeShippingThreshold} qualify for free standard shipping.</p>
                    
                    <h4 className="text-foreground font-semibold mt-4">Returns</h4>
                    <p>{productData.returnDays}-day hassle-free returns. See our return policy for details.</p>
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-display font-bold">You May Also Like</h2>
              <Link to="/shop">
                <Button variant="ghost">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetail;
