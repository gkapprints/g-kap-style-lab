import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Upload, RotateCcw, Trash2, ShoppingBag, Sparkles, Check, Download } from "lucide-react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layout } from "@/components/layout/Layout";
import { useUploadDesign } from "@/hooks/useCustomize";
import { useTshirtTypes, useTshirtColors } from "@/hooks/useTshirtOptions";
import { useToast } from "@/hooks/use-toast";
import { ThreeShirtViewer } from "@/components/customizer/ThreeShirtViewer";
import api from "@/config/api";

const sizes = ["S", "M", "L", "XL"];

const printLocations = [
  { id: "front", name: "Front" },
  { id: "back", name: "Back" },
];

const Customize = () => {
  const { designId } = useParams<{ designId?: string }>();
  const { data: tshirtTypes = [], isLoading: loadingTypes } = useTshirtTypes();
  const { data: tshirtColors = [], isLoading: loadingColors } = useTshirtColors();
  
  const [selectedType, setSelectedType] = useState<any>(null);
  const [selectedColor, setSelectedColor] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [printLocation, setPrintLocation] = useState("front");
  const [quantity, setQuantity] = useState(1);
  const [isLoadingDesign, setIsLoadingDesign] = useState(!!designId);
  const [sideImages, setSideImages] = useState({ front: "", back: "", left: "", right: "" });
  const [showReferenceTemplate, setShowReferenceTemplate] = useState(false);
  const [composedTexture, setComposedTexture] = useState<string | null>(null);

  const { mutateAsync: uploadDesign, isPending: isUploading } = useUploadDesign();
  const { toast } = useToast();

  // Load design if editing
  useEffect(() => {
    if (designId) {
      setIsLoadingDesign(true);
      api
        .get(`/customize/design/${designId}`)
        .then((res) => {
          const design = res.data;
          setSelectedSize(design.size || "");
          setPrintLocation(design.print_location || "front");
          setQuantity(design.quantity || 1);
          
          // Find and set type/color from database values
          if (design.tshirt_type && tshirtTypes.length > 0) {
            const type = tshirtTypes.find((t) => t.type_id === design.tshirt_type);
            if (type) setSelectedType(type);
          }
          if (design.tshirt_color && tshirtColors.length > 0) {
            const color = tshirtColors.find((c) => c.color_id === design.tshirt_color);
            if (color) setSelectedColor(color);
          }
          
          setIsLoadingDesign(false);
        })
        .catch((err) => {
          console.error("Failed to load design:", err);
          toast({
            title: "Error",
            description: "Failed to load design",
            variant: "destructive",
          });
          setIsLoadingDesign(false);
        });
    }
  }, [designId, tshirtTypes, tshirtColors, toast]);

  // Set defaults when data loads
  useEffect(() => {
    if (!selectedType && tshirtTypes.length > 0) {
      setSelectedType(tshirtTypes[0]);
    }
  }, [selectedType, tshirtTypes]);

  useEffect(() => {
    if (!selectedColor && tshirtColors.length > 0) {
      setSelectedColor(tshirtColors[0]);
    }
  }, [selectedColor, tshirtColors]);

  // Generate composite texture with support for reference template
  useEffect(() => {
    const hasImages = !!(sideImages.front || sideImages.back || sideImages.left || sideImages.right);
    
    if (!hasImages) {
      setComposedTexture(null);
      return;
    }

    try {
      const baseColor = selectedColor?.hex_code || "#f5f5f5";
      const canvas = document.createElement("canvas");
      canvas.width = 2048;
      canvas.height = 2048;
      const ctx = canvas.getContext("2d");
      
      if (!ctx) return;

      // Fill with base color
      ctx.fillStyle = baseColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Load reference template if needed
      if (showReferenceTemplate) {
        const refImg = new Image();
        refImg.onload = () => {
          ctx.save();
          ctx.globalAlpha = 0.35;
          ctx.drawImage(refImg, 0, 0, canvas.width, canvas.height);
          ctx.restore();
          drawImages();
        };
        refImg.onerror = () => drawImages();
        refImg.src = "/models/Template.png";
      } else {
        drawImages();
      }

      function drawImages() {
        // Zones for image placement - coordinates from user testing
        const zones = {
          front: { x: canvas.width * 0.095, y: canvas.height * 0.18, width: canvas.width * 0.35, height: canvas.height * 0.40 },
          back: { x: canvas.width * 0.58, y: canvas.height * 0.18, width: canvas.width * 0.35, height: canvas.height * 0.40 },
          left: { x: canvas.width * 0.10, y: canvas.height * 0.76, width: canvas.width * 0.17, height: canvas.height * 0.10 },
          right: { x: canvas.width * 0.59, y: canvas.height * 0.76, width: canvas.width * 0.17, height: canvas.height * 0.10 },
        };

        let imagesLoaded = 0;
        const totalImages = Object.values(sideImages).filter(v => v).length;

        const drawImage = (src: string, zone: any) => {
          const img = new Image();
          img.onload = () => {
            try {
              // Maintain aspect ratio - scale to fit zone
              const aspect = img.width / img.height;
              let w = zone.width;
              let h = w / aspect;
              if (h > zone.height) {
                h = zone.height;
                w = h * aspect;
              }
              const dx = zone.x + (zone.width - w) / 2;
              const dy = zone.y + (zone.height - h) / 2;
              ctx.drawImage(img, dx, dy, w, h);
            } catch (e) {
              console.warn("Draw error:", e);
            }
            imagesLoaded++;
            if (imagesLoaded === totalImages) {
              setComposedTexture(canvas.toDataURL("image/png"));
            }
          };
          img.onerror = () => {
            imagesLoaded++;
            if (imagesLoaded === totalImages) {
              setComposedTexture(canvas.toDataURL("image/png"));
            }
          };
          img.src = src;
        };

        if (sideImages.front) drawImage(sideImages.front, zones.front);
        if (sideImages.back) drawImage(sideImages.back, zones.back);
        if (sideImages.left) drawImage(sideImages.left, zones.left);
        if (sideImages.right) drawImage(sideImages.right, zones.right);
      }

    } catch (error) {
      console.error("Texture error:", error);
      setComposedTexture(null);
    }
  }, [sideImages, selectedColor?.hex_code, showReferenceTemplate]);

  const fileInputsRef = useRef<Record<string, HTMLInputElement | null>>({
    front: null,
    back: null,
    left: null,
    right: null,
  });

  const handleSideUpload = useCallback((side: "front" | "back" | "left" | "right") => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          setSideImages((prev) => ({
            ...prev,
            [side]: dataUrl,
          }));
        };
        reader.readAsDataURL(file);
      }
    };
  }, []);

  const clearSide = (side: "front" | "back" | "left" | "right") => {
    setSideImages((prev) => ({
      ...prev,
      [side]: "",
    }));
    if (fileInputsRef.current[side]) {
      fileInputsRef.current[side]!.value = "";
    }
  };

  const clearAllImages = () => {
    setSideImages({ front: "", back: "", left: "", right: "" });
    Object.values(fileInputsRef.current).forEach((input) => {
      if (input) input.value = "";
    });
  };

  const downloadCompositeTexture = () => {
    if (!composedTexture) {
      toast({
        title: "Error",
        description: "No composite texture to download. Please upload at least one image.",
        variant: "destructive",
      });
      return;
    }

    const link = document.createElement("a");
    link.href = composedTexture;
    link.download = "shirt-texture-composite.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Downloaded!",
      description: "Composite texture saved to your downloads folder.",
    });
  };

  const hasAnySideImage = !!(sideImages.front || sideImages.back || sideImages.left || sideImages.right);

  const dataUrlToFile = (dataUrl: string, filename: string) => {
    const [meta, content] = dataUrl.split(",");
    const mimeMatch = meta.match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : "image/png";
    const binary = atob(content);
    const len = binary.length;
    const u8 = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      u8[i] = binary.charCodeAt(i);
    }
    return new File([u8], filename, { type: mime });
  };

  const printPrice = hasAnySideImage ? 10 : 0;
  const totalPrice = selectedType ? (selectedType.price + printPrice) * quantity : 0;

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-mesh py-12 md:py-16">
        <div className="section-container text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lavender-light text-lavender-foreground text-sm font-medium mb-4"
          >
            <Sparkles className="w-4 h-4" />
            <span>Design Your Own</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-display font-bold mb-4"
          >
            Customize Your <span className="text-gradient-primary">T-Shirt</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground max-w-2xl mx-auto"
          >
            Perfect for creators, startups, college events, merch drops, and gifts.
            Upload your logo and see it come to life.
          </motion.p>
        </div>
      </section>

      <section className="py-12">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Preview Panel */}
            <div className="space-y-6">
              <div className="sticky top-24">
                <ThreeShirtViewer
                  colorHex={selectedColor?.hex_code}
                  textureUrl={composedTexture}
                  sideImages={sideImages}
                  showReferenceTemplate={showReferenceTemplate}
                  printLocation={printLocation as "front" | "back"}
                />
              </div>
            </div>

            {/* Customization Options */}
            <div className="space-y-8">
              {/* Upload Section */}
              <div className="bg-card rounded-2xl p-6 shadow-soft space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-bold text-lg">Upload Your Design</h3>
                    <p className="text-sm text-muted-foreground">Upload up to four images: front, back, left sleeve, right sleeve.</p>
                  </div>
                  {hasAnySideImage && (
                    <Button variant="ghost" size="sm" onClick={clearAllImages}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear all
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: "front", label: "Front" },
                    { key: "back", label: "Back" },
                    { key: "left", label: "Left Sleeve" },
                    { key: "right", label: "Right Sleeve" },
                  ].map((slot) => {
                    const value = sideImages[slot.key as keyof typeof sideImages];
                    return (
                      <div
                        key={slot.key}
                        onClick={() => fileInputsRef.current[slot.key as keyof typeof fileInputsRef.current]?.click()}
                        className="border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors relative"
                      >
                        <p className="font-semibold mb-2">{slot.label}</p>
                        {value ? (
                          <div className="relative w-full aspect-[4/5] rounded-lg overflow-hidden bg-background">
                            <img src={value} alt={`${slot.label} upload`} className="w-full h-full object-contain" />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => { e.stopPropagation(); clearSide(slot.key as any); }}
                              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70"
                            >
                              <Trash2 className="w-4 h-4 text-white" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                            <Upload className="w-8 h-8 mb-2" />
                            <span className="text-sm">Upload {slot.label}</span>
                          </div>
                        )}
                        <input
                          ref={(el) => (fileInputsRef.current[slot.key as keyof typeof fileInputsRef.current] = el)}
                          type="file"
                          accept="image/*"
                          onChange={handleSideUpload(slot.key as any)}
                          className="hidden"
                        />
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-wrap gap-3 items-center">
                  {hasAnySideImage && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadCompositeTexture}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Texture
                    </Button>
                  )}
                  {!hasAnySideImage && (
                    <span className="text-sm text-muted-foreground">Upload at least one image to personalize the shirt.</span>
                  )}
                </div>
              </div>

              {/* T-shirt Type */}
              <div className="bg-card rounded-2xl p-6 shadow-soft">
                <h3 className="font-display font-bold text-lg mb-4">T-Shirt Type</h3>
                <div className="grid grid-cols-2 gap-3">
                  {tshirtTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        selectedType?.id === type.id
                          ? "border-primary bg-primary/5 ring-2 ring-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{type.name}</span>
                        {selectedType?.id === type.id && (
                          <Check className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">₹{type.price.toFixed(2)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div className="bg-card rounded-2xl p-6 shadow-soft">
                <h3 className="font-display font-bold text-lg mb-4">
                  Color: <span className="font-normal">{selectedColor?.name || "Select a color"}</span>
                </h3>
                <div className="flex flex-wrap gap-3">
                  {tshirtColors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setSelectedColor(color)}
                      className={`w-12 h-12 rounded-full border-2 transition-all ${
                        selectedColor?.id === color.id
                          ? "border-primary ring-2 ring-primary ring-offset-2"
                          : "border-border hover:border-primary/50"
                      }`}
                      style={{ backgroundColor: color.hex_code }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div className="bg-card rounded-2xl p-6 shadow-soft">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-bold text-lg">Size</h3>
                  <a href="/size-guide" className="text-sm text-primary hover:underline">
                    Size Guide
                  </a>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-5 py-3 rounded-lg border font-medium transition-colors ${
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

              {/* Quantity and Add to Cart */}
              <div className="bg-card rounded-2xl p-6 shadow-soft">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-display font-bold text-lg">Quantity</h3>
                    <p className="text-sm text-muted-foreground">Bulk orders get discounts!</p>
                  </div>
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 hover:bg-muted transition-colors"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 font-semibold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-4 py-2 hover:bg-muted transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Price Summary */}
                <div className="space-y-2 mb-6 pb-6 border-b">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{selectedType?.name || "Select a type"}</span>
                    <span>{selectedType ? `₹${selectedType.price.toFixed(2)}` : "--"}</span>
                  </div>
                  {hasAnySideImage && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Custom Print</span>
                      <span>+₹10.00</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Quantity</span>
                    <span>×{quantity}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <span className="font-display font-bold text-xl">Total</span>
                  <span className="font-display font-bold text-2xl text-gradient-primary">
                    ₹{totalPrice.toFixed(2)}
                  </span>
                </div>

                <Button
                  variant="hero"
                  size="xl"
                  className="w-full"
                  disabled={!selectedSize || !selectedType || !selectedColor || isUploading}
                  onClick={async () => {
                    if (!selectedSize) {
                      toast({
                        title: "Error",
                        description: "Please select a size",
                        variant: "destructive",
                      });
                      return;
                    }

                    if (!selectedType || !selectedColor) {
                      toast({
                        title: "Error",
                        description: "Please choose a t-shirt type and color",
                        variant: "destructive",
                      });
                      return;
                    }

                    try {

                      // Create FormData for file upload
                      const formData = new FormData();

                      // Add designId if editing
                      if (designId) {
                        formData.append("designId", designId);
                      }

                      formData.append("tshirt_type", selectedType.type_id);
                      formData.append("tshirt_color", selectedColor.color_id);
                      formData.append("size", selectedSize);
                      formData.append("print_location", printLocation);
                      formData.append("quantity", quantity.toString());
                      formData.append("price", totalPrice.toString());

                      // Helper to convert dataURL to File
                      const dataUrlToFile = (dataUrl: string, filename: string) => {
                        const [meta, content] = dataUrl.split(",");
                        const mimeMatch = meta.match(/:(.*?);/);
                        const mime = mimeMatch ? mimeMatch[1] : "image/png";
                        const binary = atob(content);
                        const len = binary.length;
                        const u8 = new Uint8Array(len);
                        for (let i = 0; i < len; i++) {
                          u8[i] = binary.charCodeAt(i);
                        }
                        return new File([u8], filename, { type: mime });
                      };

                      // Attach original images for each side if present
                      ["front", "back", "left", "right"].forEach((side) => {
                        const imgData = sideImages[side as keyof typeof sideImages];
                        if (imgData) {
                          formData.append(`original_${side}`, dataUrlToFile(imgData, `original-${side}.png`));
                        }
                      });

                      // If composited texture exists, convert to file and upload
                      if (composedTexture && hasAnySideImage) {
                        formData.append(
                          "image",
                          dataUrlToFile(composedTexture, "custom-design.png")
                        );
                      }

                      // Upload the custom design - this saves it to the database
                      const design = await uploadDesign(formData);

                      toast({
                        title: "Design saved!",
                        description: `Your custom ${selectedType.name} design has been saved. You can purchase it from your profile.`,
                      });

                      // Reset the form after a short delay
                      setTimeout(() => {
                        clearAllImages();
                        setSelectedSize("");
                        setQuantity(1);
                      }, 500);
                    } catch (error: any) {
                      toast({
                        title: "Error",
                        description: error.response?.data?.error || "Failed to save design",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  {isUploading ? "Saving..." : "Save Design"}
                </Button>

                {!selectedSize && (
                  <p className="text-sm text-destructive mt-2 text-center">
                    Please select a size
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Customize;
