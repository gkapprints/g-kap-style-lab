import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Filter, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Layout } from "@/components/layout/Layout";
import { ProductCard } from "@/components/shop/ProductCard";
import { sortOptions } from "@/data/products";
import { useProducts } from "@/hooks/useProducts";
import { useSearchParams } from "react-router-dom";
import api from "@/config/api";

const Shop = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCollection, setSelectedCollection] = useState("all");
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("popular");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Dynamic filter options from backend
  const [categories, setCategories] = useState<string[]>([]);
  const [collections, setCollections] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);

  const { data: apiProducts = [], isLoading, error } = useProducts();

  // Fetch filter options
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const response = await api.get('/products/filters');
        setCategories(response.data.categories || []);
        setCollections(response.data.collections || []);
        setColors(response.data.colors || []);
        setSizes(response.data.sizes || []);
      } catch (err) {
        console.error('Failed to fetch filters:', err);
      }
    };
    fetchFilters();
  }, []);

  // Normalize API products to the existing card shape
  const products = useMemo(() => {
    return apiProducts.map((p) => ({
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
  }, [apiProducts]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((p) => 
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.collection.toLowerCase().includes(query) ||
        p.colors.some(c => c.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Collection filter
    if (selectedCollection !== "all") {
      result = result.filter((p) => p.collection === selectedCollection);
    }

    // Color filter
    if (selectedColors.length > 0) {
      result = result.filter((p) =>
        p.colors.some((c) => selectedColors.includes(c))
      );
    }

    // Size filter
    if (selectedSizes.length > 0) {
      result = result.filter((p) =>
        p.sizes.some((s) => selectedSizes.includes(s))
      );
    }

    // Sorting
    switch (sortBy) {
      case "newest":
        result = result.filter((p) => p.isNew).concat(result.filter((p) => !p.isNew));
        break;
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      default:
        result = result.filter((p) => p.isBestseller).concat(result.filter((p) => !p.isBestseller));
    }

    // Expand products by color - create a card for each color variant
    // If you want to expand products by color, you need to extend the type
    // Otherwise, just return result as is
    return result;
  }, [products, selectedCategory, selectedCollection, selectedColors, selectedSizes, sortBy, searchQuery]);

  const toggleColor = (colorId: string) => {
    setSelectedColors((prev) =>
      prev.includes(colorId)
        ? prev.filter((c) => c !== colorId)
        : [...prev, colorId]
    );
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedCollection("all");
    setSelectedColors([]);
    setSelectedSizes([]);
  };

  const activeFiltersCount =
    (selectedCategory !== "all" ? 1 : 0) +
    (selectedCollection !== "all" ? 1 : 0) +
    selectedColors.length +
    selectedSizes.length;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h4 className="font-display font-semibold mb-3">Category</h4>
        <div className="space-y-2">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
              selectedCategory === "all"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            }`}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`block w-full text-left px-3 py-2 rounded-lg transition-colors capitalize ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Collections */}
      <div>
        <h4 className="font-display font-semibold mb-3">Collection</h4>
        <div className="space-y-2">
          <button
            onClick={() => setSelectedCollection("all")}
            className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
              selectedCollection === "all"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            }`}
          >
            All Collections
          </button>
          {collections.map((col) => (
            <button
              key={col}
              onClick={() => setSelectedCollection(col)}
              className={`block w-full text-left px-3 py-2 rounded-lg transition-colors capitalize ${
                selectedCollection === col
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              {col}
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div>
        <h4 className="font-display font-semibold mb-3">Color</h4>
        <div className="space-y-2">
          {colors.map((color) => (
            <label
              key={color}
              className="flex items-center gap-2 cursor-pointer hover:bg-muted p-2 rounded-lg transition-colors"
            >
              <Checkbox
                checked={selectedColors.includes(color)}
                onCheckedChange={() => toggleColor(color)}
              />
              <span className="capitalize">{color}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Sizes */}
      <div>
        <h4 className="font-display font-semibold mb-3">Size</h4>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                selectedSizes.includes(size)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:border-primary"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {activeFiltersCount > 0 && (
        <Button variant="outline" className="w-full" onClick={clearFilters}>
          Clear All Filters ({activeFiltersCount})
        </Button>
      )}
    </div>
  );

  return (
    <Layout>
      {/* Hero Banner */}
      <section className="bg-gradient-mesh py-16 md:py-24">
        <div className="section-container text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4"
          >
            Shop <span className="text-gradient-primary">Collection</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Premium custom-printed T-shirts designed for creators, dreamers, and doers
          </motion.p>
        </div>
      </section>

      <section className="py-12">
        <div className="section-container">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Desktop Sidebar Filters */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display font-bold text-lg">Filters</h3>
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-primary hover:underline"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <FilterContent />
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-[20px]">
                    search
                  </span>
                  <Input
                    type="text"
                    placeholder="Search products by name, category, collection, or color..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-10 h-12 text-base"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Toolbar */}
              <div className="flex items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-2">
                  {/* Mobile Filter Button */}
                  <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="lg:hidden">
                        <Filter className="w-4 h-4 mr-2" />
                        Filters
                        {activeFiltersCount > 0 && (
                          <span className="ml-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                            {activeFiltersCount}
                          </span>
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80 overflow-y-auto">
                      <SheetHeader>
                        <SheetTitle>Filters</SheetTitle>
                      </SheetHeader>
                      <div className="mt-6">
                        <FilterContent />
                      </div>
                    </SheetContent>
                  </Sheet>

                  <p className="text-sm text-muted-foreground">
                    {isLoading ? "Loading products..." : `${filteredProducts.length} products`}
                  </p>
                </div>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Active Filters Tags */}
              {activeFiltersCount > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedCategory !== "all" && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setSelectedCategory("all")}
                      className="gap-1 capitalize"
                    >
                      {selectedCategory}
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                  {selectedCollection !== "all" && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setSelectedCollection("all")}
                      className="gap-1 capitalize"
                    >
                      {selectedCollection}
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                  {selectedColors.map((color) => (
                    <Button
                      key={color}
                      variant="secondary"
                      size="sm"
                      onClick={() => toggleColor(color)}
                      className="gap-1 capitalize"
                    >
                      {color}
                      <X className="w-3 h-3" />
                    </Button>
                  ))}
                  {selectedSizes.map((size) => (
                    <Button
                      key={size}
                      variant="secondary"
                      size="sm"
                      onClick={() => toggleSize(size)}
                      className="gap-1"
                    >
                      Size {size}
                      <X className="w-3 h-3" />
                    </Button>
                  ))}
                </div>
              )}

              {/* Products Grid */}
              {isLoading ? (
                <div className="text-center py-16 text-muted-foreground">Loading products...</div>
              ) : error ? (
                <div className="text-center py-16 text-destructive">
                  Failed to load products. Please check the backend.
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-lg text-muted-foreground mb-4">
                    No products match your filters
                  </p>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Shop;
