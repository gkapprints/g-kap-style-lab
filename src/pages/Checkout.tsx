import { useState, useEffect } from "react";
// @ts-ignore
import Razorpay from "razorpay";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CreditCard,
  Truck,
  ChevronRight,
  Check,
  MapPin,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layout } from "@/components/layout/Layout";
import { useDeleteDesign } from "@/hooks/useCustomize";
import { useCreateOrder } from "@/hooks/useOrders";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/contexts/AuthContext";
import { useClearCart } from "@/hooks/useCart";
import { useAddresses } from "@/hooks/useAddresses";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "../config/supabase";

interface CustomDesign {
  price: number;
  id: string;
  image_url: string;
  tshirt_type: string;
  tshirt_color: string;
  size: string;
  quantity: number;
  print_location: string;
  image_scale: number;
}

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { mutate: clearCart } = useClearCart();
  const [step, setStep] = useState<"shipping" | "payment" | "confirmation">(
    "shipping",
  );
  // Addresses
  const { data: addresses = [] } = useAddresses();
  const savedAddresses = addresses;
  const [orderId, setOrderId] = useState<string | null>(null);
  // Only standard shipping is available now
  // No shipping method selection needed
  const [buyingFor, setBuyingFor] = useState<"me" | "someone">("me");
  const [selectedAddressId, setSelectedAddressId] = useState<string>("new");
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [designToBuy, setDesignToBuy] = useState<CustomDesign | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { mutateAsync: deleteDesign } = useDeleteDesign();
  const { mutateAsync: createOrder } = useCreateOrder();
  const { data: cartItems = [] } = useCart();


  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    streetAddress: "",
    apartment: "",
    city: "",
    state: "",
    zip: "",
    country: "India",
    tag: "home" as "home" | "office" | "other",
    // Card fields removed; handled by Razorpay
  });

  useEffect(() => {
    const stored = localStorage.getItem("designToBuy");
    if (stored) {
      setDesignToBuy(JSON.parse(stored));
    }

    // Auto-fill user details if buying for me
    if (buyingFor === "me" && user) {
      setFormData((prev) => ({
        ...prev,
        firstName: user.user_metadata?.name?.split(" ")[0] || "",
        lastName: user.user_metadata?.name?.split(" ").slice(1).join(" ") || "",
        email: user.email || "",
      }));
    } else if (buyingFor === "someone") {
      // Clear all fields when switching to someone else
      setFormData((prev) => ({
        ...prev,
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        streetAddress: "",
        apartment: "",
        city: "",
        state: "",
        zip: "",
        country: "",
      }));
    }
  }, [buyingFor, user]);

  // Update address when selection changes
  useEffect(() => {
    if (selectedAddressId !== "new" && savedAddresses.length > 0) {
      const selectedAddr = savedAddresses.find(
        (a) => a.id === selectedAddressId,
      );
      if (selectedAddr) {
        setFormData((prev) => ({
          ...prev,
          streetAddress: selectedAddr.street_address,
          apartment: selectedAddr.home_address,
          city: selectedAddr.city,
          state: selectedAddr.state,
          zip: selectedAddr.pincode,
          country: selectedAddr.country,
          phone: selectedAddr.phone,
        }));
        setShowNewAddressForm(false);
      }
    } else if (selectedAddressId === "new") {
      setShowNewAddressForm(true);
    }
  }, [selectedAddressId, savedAddresses]);

  const handleLocateMe = async () => {
    setIsLocating(true);
    try {
      const position = await new Promise<GeolocationCoordinates>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (success) => resolve(success.coords),
            (error) => reject(error),
            { enableHighAccuracy: true, timeout: 10000 },
          );
        },
      );

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.latitude}&lon=${position.longitude}&addressdetails=1`,
        { headers: { "User-Agent": "G-KAP-Store" } },
      );
      const data = await response.json();

      if (data && data.address) {
        const addr = data.address;
        setFormData((prev) => ({
          ...prev,
          city: addr.city || addr.town || addr.village || prev.city,
          state: addr.state || prev.state,
          country: addr.country || prev.country,
          zip: addr.postcode || prev.zip,
        }));
        toast({
          title: "Location detected!",
          description: `${addr.city || addr.town}, ${addr.state}`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Could not detect location. Please enter manually.",
        variant: "destructive",
      });
    } finally {
      setIsLocating(false);
    }
  };
  useEffect(() => {
    const stored = localStorage.getItem("designToBuy");
    if (stored) {
      setDesignToBuy(JSON.parse(stored));
    }

    // Cleanup: clear designToBuy when leaving the page
    return () => {
      localStorage.removeItem("designToBuy");
      setDesignToBuy(null);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // Validation function
  const validateShippingForm = () => {
    const required = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "streetAddress",
      "apartment",
      "city",
      "state",
      "zip",
      "country",
    ];

    for (const field of required) {
      if (
        !formData[field as keyof typeof formData] ||
        formData[field as keyof typeof formData].toString().trim() === ""
      ) {
        return false;
      }
    }

    return true;
  };

  const handleContinueToPayment = () => {
    if (!validateShippingForm()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields before continuing.",
        variant: "destructive",
      });
      return;
    }
    setStep("payment");
  };

  // Normalize cart items to get price from products relationship
  const normalizedCartItems = cartItems.map((item) => {
    const p = item.products;
    return {
      id: item.id,
      product_id: item.product_id,
      name: p?.name ?? "Item",
      price: p?.price ?? 0,
      selected_size: item.selected_size,
      selected_color: item.selected_color,
      quantity: item.quantity,
      image: p?.image_url ?? "",
    };
  });

  // Price for custom design
  const designPrice = designToBuy?.price ?? 49.99;
  const subtotal = designToBuy
    ? designPrice * (designToBuy.quantity || 1)
    : normalizedCartItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0,
      );

  const shippingCost = 100;
  const total = subtotal + shippingCost;

  // Razorpay payment integration
  const handleConfirmation = async () => {
    setIsProcessing(true);

    try {
      // 1️⃣ Load Razorpay script
      if (!(window as any).Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve();
          script.onerror = () => reject();
          document.body.appendChild(script);
        });
      }

      // 2️⃣ Create Razorpay order (BACKEND)
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/payments/razorpay/order`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ total }),
        },
      );

      if (!res.ok) throw new Error("Failed to create Razorpay order");

      const razorpayOrder = await res.json();

      // 3️⃣ Razorpay checkout options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: "INR",
        order_id: razorpayOrder.id,
        name: "G-KAP Store",
        description: "T-shirt Order",

        handler: async function (response: any) {
          try {
            // 4️⃣ VERIFY PAYMENT
            const verifyRes = await fetch(
              `${import.meta.env.VITE_API_URL}/payments/razorpay/verify`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              },
            );

            if (!verifyRes.ok) throw new Error("Payment verification failed");

            // 5️⃣ CREATE ORDER IN DATABASE
            const orderData = {
              items: designToBuy
                ? [
                    {
                      product_id: null,
                      quantity: designToBuy.quantity,
                      size: designToBuy.size,
                      color: designToBuy.tshirt_color,
                      price: designPrice,
                      design_id: designToBuy.id,
                      design_image_url: designToBuy.image_url,
                    },
                  ]
                : normalizedCartItems.map((item) => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    size: item.selected_size,
                    color: item.selected_color,
                    price: item.price,
                  })),

              shipping_address: {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                address: formData.streetAddress,
                apartment: formData.apartment,
                city: formData.city,
                state: formData.state,
                zip: formData.zip,
                country: formData.country,
              },

              shipping_method: "Standard Shipping",
              payment_method: "razorpay",
              subtotal,
              shipping_cost: shippingCost,
              tax: 0,
              total,

              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
            };

            const createdOrder = await createOrder(orderData);
            setOrderId(createdOrder.id);
            // Clear cart after successful order
            clearCart();

            // 🔥 STEP 5: SEND EMAILS (ADMIN + USER)
            const {
              data: { session },
            } = await supabase.auth.getSession();

            if (!session?.access_token) {
              throw new Error("User not authenticated");
            }
            const res = await fetch(
              `${import.meta.env.VITE_API_URL}/orders/${createdOrder.id}/payment-success`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${session.access_token}`,
                },
              },
            );
            if (!res.ok) {
              const text = await res.text();
              throw new Error(`Payment-success failed: ${text}`);
            }

            toast({
              title: "Order Placed!",
              description: "Payment successful 🎉 Confirmation email sent.",
            });

            setStep("confirmation");
          } catch (err: any) {
            toast({
              title: "Order Error",
              description: err.message || "Failed to place order",
              variant: "destructive",
            });
          } finally {
            setIsProcessing(false);
          }
        },

        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone,
        },

        theme: { color: "#00b894" },

        modal: {
          ondismiss: () => setIsProcessing(false),
        },
      };

      // 6️⃣ Open Razorpay
      // @ts-ignore
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error: any) {
      setIsProcessing(false);
      toast({
        title: "Payment Error",
        description: error.message || "Payment failed",
        variant: "destructive",
      });
    }
  };

  if (step === "confirmation") {
    return (
      <Layout>
        <div className="section-container py-20 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto"
          >
            <div className="w-20 h-20 rounded-full bg-mint-light flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-mint" />
            </div>
            <h1 className="text-3xl font-display font-bold mb-4">
              Order Confirmed!
            </h1>
            <p className="text-muted-foreground mb-2">
              Thank you for your order. We've sent a confirmation email to your
              inbox.
            </p>
            <p className="font-semibold mb-8">
              {orderId ? `Order #GK-${orderId}` : "Order placed!"}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={designToBuy ? "/profile" : "/shop"}>
                <Button variant="hero">
                  {designToBuy ? "Back to Profile" : "Continue Shopping"}
                </Button>
              </Link>
              <Button variant="outline">Track Order</Button>
            </div>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="section-container py-8 md:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-8">
          <Link
            to={designToBuy ? "/profile" : "/cart"}
            className="text-muted-foreground hover:text-primary flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            {designToBuy ? "Back to Profile" : "Back to Cart"}
          </Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-display font-bold mb-8">
          Checkout
        </h1>

        {/* Progress Steps */}
        <div className="flex items-center gap-4 mb-8">
          <div
            className={`flex items-center gap-2 ${step === "shipping" ? "text-primary" : "text-muted-foreground"}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step === "shipping"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              1
            </div>
            <span className="hidden sm:inline font-medium">Shipping</span>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
          <div
            className={`flex items-center gap-2 ${step === "payment" ? "text-primary" : "text-muted-foreground"}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step === "payment"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              2
            </div>
            <span className="hidden sm:inline font-medium">Payment</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            {step === "shipping" && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="bg-card rounded-2xl p-6 shadow-soft">
                  <h2 className="font-display font-bold text-xl mb-6">
                    <Truck className="w-5 h-5 inline mr-2" />
                    Shipping Information
                  </h2>

                  {/* Buying For Choice */}
                  <div className="mb-6">
                    <Label className="mb-3 block">
                      Who are you buying for?
                    </Label>
                    <RadioGroup
                      value={buyingFor}
                      onValueChange={(value: "me" | "someone") =>
                        setBuyingFor(value)
                      }
                      className="grid grid-cols-2 gap-3"
                    >
                      <label
                        className={`flex items-center justify-center p-4 rounded-xl border cursor-pointer transition-colors ${
                          buyingFor === "me"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <RadioGroupItem
                          value="me"
                          id="for-me"
                          className="mr-2"
                        />
                        <span className="font-medium">For Me</span>
                      </label>
                      <label
                        className={`flex items-center justify-center p-4 rounded-xl border cursor-pointer transition-colors ${
                          buyingFor === "someone"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <RadioGroupItem
                          value="someone"
                          id="for-someone"
                          className="mr-2"
                        />
                        <span className="font-medium">For Someone Else</span>
                      </label>
                    </RadioGroup>
                  </div>

                  {buyingFor === "me" ? (
                    /* Buying for Me */
                    <>
                      <div className="grid sm:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName-me">First Name</Label>
                          <Input
                            id="firstName-me"
                            value={formData.firstName}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                firstName: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName-me">Last Name</Label>
                          <Input
                            id="lastName-me"
                            value={formData.lastName}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                lastName: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <Label htmlFor="email-me">Email</Label>
                          <Input
                            id="email-me"
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                email: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <Label htmlFor="phone-me">Phone</Label>
                          <Input
                            id="phone-me"
                            type="tel"
                            placeholder="+91 9876543210"
                            value={formData.phone}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                phone: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>

                      {/* Address Selection */}
                      <div className="space-y-2 mb-4">
                        <Label htmlFor="address-select">Select Address</Label>
                        <Select
                          value={selectedAddressId}
                          onValueChange={setSelectedAddressId}
                        >
                          <SelectTrigger id="address-select">
                            <SelectValue placeholder="Choose an address" />
                          </SelectTrigger>
                          <SelectContent>
                            {savedAddresses.length === 0 ? (
                              <SelectItem value="new">
                                No saved addresses - Add new
                              </SelectItem>
                            ) : (
                              <>
                                {savedAddresses.map((addr) => (
                                  <SelectItem key={addr.id} value={addr.id}>
                                    {addr.tag === "other"
                                      ? addr.custom_tag
                                      : addr.tag.charAt(0).toUpperCase() +
                                        addr.tag.slice(1)}{" "}
                                    - {addr.street_address}, {addr.city}
                                  </SelectItem>
                                ))}
                                <SelectItem value="new">
                                  + Add New Address
                                </SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* New Address Form (inline) */}
                      {showNewAddressForm && (
                        <div className="grid sm:grid-cols-2 gap-4 p-4 border rounded-xl bg-muted/30">
                          <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="street">Street Address</Label>
                            <Input
                              id="street"
                              placeholder="123 Main Street"
                              value={formData.streetAddress}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  streetAddress: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="apartment">
                              Apartment/House Number
                            </Label>
                            <Input
                              id="apartment"
                              placeholder="Apt 4B"
                              value={formData.apartment}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  apartment: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="city-new">City</Label>
                            <Input
                              id="city-new"
                              placeholder="Mumbai"
                              value={formData.city}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  city: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="state-new">State</Label>
                            <Input
                              id="state-new"
                              placeholder="Maharashtra"
                              value={formData.state}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  state: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="country-new">Country</Label>
                            <Input
                              id="country-new"
                              placeholder="India"
                              value={formData.country}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  country: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="zip-new">Pincode</Label>
                            <Input
                              id="zip-new"
                              placeholder="400001"
                              value={formData.zip}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  zip: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="tag">Address Tag</Label>
                            <Select
                              value={formData.tag}
                              onValueChange={(
                                value: "home" | "office" | "other",
                              ) =>
                                setFormData((prev) => ({ ...prev, tag: value }))
                              }
                            >
                              <SelectTrigger id="tag">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="home">Home</SelectItem>
                                <SelectItem value="office">Office</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="sm:col-span-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleLocateMe}
                              disabled={isLocating}
                              className="w-full"
                            >
                              {isLocating ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Locating...
                                </>
                              ) : (
                                <>
                                  <MapPin className="w-4 h-4 mr-2" />
                                  Locate Me
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    /* Buying for Someone Else */
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          placeholder="John"
                          value={formData.firstName}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          placeholder="Doe"
                          value={formData.lastName}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+91 9876543210"
                          value={formData.phone}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="streetAddress">Street Address</Label>
                        <Input
                          id="streetAddress"
                          placeholder="123 Main Street"
                          value={formData.streetAddress}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              streetAddress: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="apartment">
                          Apartment/House Number
                        </Label>
                        <Input
                          id="apartment"
                          placeholder="Apt 4B"
                          value={formData.apartment}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              apartment: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          placeholder="Mumbai"
                          value={formData.city}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              city: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          placeholder="Maharashtra"
                          value={formData.state}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              state: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zip">Pincode</Label>
                        <Input
                          id="zip"
                          placeholder="400001"
                          value={formData.zip}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              zip: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          placeholder="India"
                          value={formData.country}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              country: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-card rounded-2xl p-6 shadow-soft">
                  <h2 className="font-display font-bold text-xl mb-6">
                    Shipping Method
                  </h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-xl border border-primary bg-primary/5">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">Standard Shipping</p>
                          <p className="text-sm text-muted-foreground">
                            5-7 business days
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold">₹100</span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="hero"
                  size="xl"
                  className="w-full"
                  onClick={handleContinueToPayment}
                >
                  Continue to Payment
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            )}

            {step === "payment" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="bg-card rounded-2xl p-6 shadow-soft text-center">
                  <h2 className="font-display font-bold text-xl mb-6">
                    <CreditCard className="w-5 h-5 inline mr-2" />
                    Pay Securely with Card or UPI
                  </h2>
                  <p className="mb-4 text-muted-foreground">
                    Click below to pay with Card, UPI, or Netbanking using
                    Razorpay's secure checkout.
                  </p>
                  <Button
                    variant="hero"
                    size="xl"
                    className="w-full"
                    onClick={handleConfirmation}
                    disabled={isProcessing}
                  >
                    {isProcessing
                      ? "Processing..."
                      : `Pay Now - ₹${total.toFixed(2)}`}
                  </Button>
                  <div className="mt-6 p-4 bg-muted rounded-xl">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="text-lg">🔒</span>
                      Payments are processed securely by Razorpay
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setStep("shipping")}
                    disabled={isProcessing}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl p-6 shadow-soft sticky top-24">
              <h2 className="font-display font-bold text-xl mb-6">
                Order Summary
              </h2>

              {designToBuy ? (
                <>
                  {/* Custom Design Summary */}
                  <div className="space-y-4 mb-6">
                    <div className="flex gap-3">
                      {designToBuy.image_url && (
                        <img
                          src={designToBuy.image_url}
                          alt="Custom design"
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <Badge className="mb-2 bg-mint text-foreground">
                          Custom Design
                        </Badge>
                        <p className="font-medium text-sm capitalize">
                          {designToBuy.tshirt_type} - {designToBuy.tshirt_color}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Size: {designToBuy.size} • Qty: {designToBuy.quantity}
                        </p>
                        <p className="text-sm font-semibold mt-2">
                          ₹{designPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4 mb-6">
                  {normalizedCartItems.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Size: {item.selected_size} • Color:{" "}
                          {item.selected_color}
                        </p>
                        <p className="text-sm font-semibold">
                          ₹{(item.price * item.quantity).toFixed(2)}
                          {item.quantity > 1 && ` (${item.quantity}x)`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Separator className="my-4" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>₹{shippingCost.toFixed(2)}</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between items-center">
                <span className="font-display font-bold text-lg">Total</span>
                <span className="font-display font-bold text-xl">
                  ₹{total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
