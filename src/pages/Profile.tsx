import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, ShoppingBag, Package, ArrowRight, Calendar, MapPin, DollarSign, Palette, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useOrders } from "@/hooks/useOrders";
import { useCustomDesigns, useDeleteDesign } from "@/hooks/useCustomize";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: orders = [], isLoading, error } = useOrders();
  const { data: designs = [], isLoading: designsLoading } = useCustomDesigns();
  const { mutateAsync: deleteDesign } = useDeleteDesign();
  const { toast } = useToast();
  const [tab, setTab] = useState<"profile" | "orders" | "designs">("profile");

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You've been successfully signed out.",
      });
      navigate("/login");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDesign = async (designId: string) => {
    try {
      await deleteDesign(designId);
      toast({
        title: "Deleted",
        description: "Design has been deleted.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete design",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="section-container py-20 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <ShoppingBag className="w-20 h-20 mx-auto mb-6 text-muted-foreground" />
            <h1 className="text-3xl font-display font-bold mb-4">Not Logged In</h1>
            <p className="text-muted-foreground mb-8">Please log in to view your profile</p>
            <Button variant="hero" size="xl" onClick={() => navigate("/login")}>
              Log In
            </Button>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="section-container py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-2">My Account</h1>
          <p className="text-muted-foreground">Welcome back, {user.user_metadata?.name || user.email}</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <Card className="p-6">
              <div className="space-y-4">
                <button
                  onClick={() => setTab("profile")}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${
                    tab === "profile"
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  Profile Information
                </button>
                <button
                  onClick={() => setTab("orders")}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${
                    tab === "orders"
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  Order History
                </button>
                <button
                  onClick={() => setTab("designs")}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    tab === "designs"
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <Palette className="w-4 h-4" />
                  Saved Designs
                </button>
                <hr className="my-4" />
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-3 rounded-lg font-medium text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            {tab === "profile" && (
              <div className="space-y-6">
                <Card className="p-8">
                  <h2 className="text-2xl font-display font-bold mb-6">Account Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-semibold text-muted-foreground">Full Name</label>
                      <p className="text-lg font-medium mt-1">{user.user_metadata?.name || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-muted-foreground">Email</label>
                      <p className="text-lg font-medium mt-1">{user.email}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-8 border-mint/20 bg-mint/5">
                  <h3 className="text-lg font-display font-bold mb-2 text-mint">Account Created</h3>
                  <p className="text-muted-foreground">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                  </p>
                </Card>
              </div>
            )}

            {tab === "orders" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-display font-bold">Order History</h2>

                {isLoading && (
                  <Card className="p-12 text-center text-muted-foreground">
                    Loading orders...
                  </Card>
                )}

                {error && (
                  <Card className="p-12 text-center text-destructive">
                    Failed to load orders
                  </Card>
                )}

                {orders.length === 0 && !isLoading && (
                  <Card className="p-12 text-center">
                    <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No Orders Yet</h3>
                    <p className="text-muted-foreground mb-6">
                      You haven't placed any orders yet. Start shopping now!
                    </p>
                    <Button variant="hero" onClick={() => navigate("/shop")}>
                      Browse Products
                    </Button>
                  </Card>
                )}

                {orders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-6 hover:shadow-lg transition-shadow">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                        <div className="flex-1">
                          <h3 className="text-lg font-display font-bold">Order #{order.order_number}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                            <Calendar className="w-4 h-4" />
                            {new Date(order.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 mt-4 md:mt-0">
                          <Badge
                            className={`${
                              order.status === "delivered"
                                ? "bg-mint text-foreground"
                                : order.status === "processing"
                                ? "bg-coral text-white"
                                : order.status === "shipped"
                                ? "bg-sky text-foreground"
                                : "bg-muted text-foreground"
                            }`}
                          >
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                          <Badge variant="outline" className="bg-primary/10">
                            ₹{order.total.toFixed(2)}
                          </Badge>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="space-y-3 mb-6 pb-6 border-b">
                        {order.order_items?.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <div>
                              <p className="font-medium">{item.products?.name || "Product"}</p>
                              <p className="text-xs text-muted-foreground">
                                {item.color} • Size {item.size} • Qty {item.quantity}
                              </p>
                            </div>
                            <p className="font-semibold">₹{item.price.toFixed(2)}</p>
                          </div>
                        ))}
                      </div>

                      {/* Order Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div>
                          <p className="text-xs text-muted-foreground font-semibold">Subtotal</p>
                          <p className="font-bold mt-1">₹{order.subtotal.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Shipping</p>
                          <p className="font-bold mt-1">₹{order.shipping_cost.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Tax</p>
                          <p className="font-bold mt-1">₹{order.tax.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Total</p>
                          <p className="font-bold text-lg text-primary mt-1">₹{order.total.toFixed(2)}</p>
                        </div>
                      </div>

                      {/* Shipping Address */}
                      {order.shipping_address && (
                        <div className="flex items-start gap-3 text-sm bg-muted/50 p-4 rounded-lg">
                          <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                          <div>
                            <p className="font-semibold mb-1">Shipping Address</p>
                            <p className="text-muted-foreground">
                              {order.shipping_address.firstName && order.shipping_address.lastName && (
                                <>{order.shipping_address.firstName} {order.shipping_address.lastName}<br /></>
                              )}
                              {(order.shipping_address.address || order.shipping_address.street || "N/A")}
                              {order.shipping_address.apartment && `, ${order.shipping_address.apartment}`}
                              <br />
                              {order.shipping_address.city && `${order.shipping_address.city}`}
                              {order.shipping_address.state && `, ${order.shipping_address.state}`}
                              {order.shipping_address.zip && ` ${order.shipping_address.zip}`}
                              <br />
                              {order.shipping_address.country}
                              {order.shipping_address.phone && (
                                <><br />Phone: {order.shipping_address.phone}</>
                              )}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Action */}
                      <div className="mt-6">
                        <Button
                          variant="outline"
                          className="w-full md:w-auto"
                          onClick={() => navigate(`/orders/${order.id}`)}
                        >
                          View Details
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}

            {tab === "designs" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-display font-bold">Saved Designs</h2>

                {designsLoading && (
                  <Card className="p-12 text-center text-muted-foreground">
                    Loading designs...
                  </Card>
                )}

                {designs.length === 0 && !designsLoading && (
                  <Card className="p-12 text-center">
                    <Palette className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No Designs Yet</h3>
                    <p className="text-muted-foreground mb-6">
                      You haven't saved any custom designs yet. Create one now!
                    </p>
                    <Button variant="hero" onClick={() => navigate("/customize")}>
                      Create Design
                    </Button>
                  </Card>
                )}

                {designs.map((design, index) => (
                  <motion.div
                    key={design.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-6 hover:shadow-lg transition-shadow">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* Design Preview */}
                        <div className="md:col-span-1">
                          {design.image_url && (
                            <img
                              src={design.image_url}
                              alt="Design preview"
                              className="w-full h-48 object-cover rounded-lg"
                            />
                          )}
                        </div>

                        {/* Design Details */}
                        <div className="md:col-span-3">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-display font-bold capitalize">
                                {design.tshirt_type} - {design.tshirt_color}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                                <Calendar className="w-4 h-4" />
                                {new Date(design.created_at).toLocaleDateString()}
                              </div>
                            </div>
                            <Badge
                              className={`${
                                design.status === "completed"
                                  ? "bg-mint text-foreground"
                                  : "bg-muted text-foreground"
                              }`}
                            >
                              {design.status.charAt(0).toUpperCase() + design.status.slice(1)}
                            </Badge>
                          </div>

                          {/* Design Specs */}
                          <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                              <p className="text-xs text-muted-foreground font-semibold">Size</p>
                              <p className="font-bold mt-1">{design.size}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground font-semibold">
                                Print Location
                              </p>
                              <p className="font-bold mt-1 capitalize">{design.print_location}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground font-semibold">Quantity</p>
                              <p className="font-bold mt-1">{design.quantity}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground font-semibold">Scale</p>
                              <p className="font-bold mt-1">{(design.image_scale * 100).toFixed(0)}%</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground font-semibold">Price</p>
                              <p className="font-bold mt-1">₹{design.price ? design.price.toFixed(2) : '--'}</p>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-3">
                            <Button
                              variant="hero"
                              onClick={() => {
                                // Store design data and navigate to checkout
                                localStorage.setItem('designToBuy', JSON.stringify(design));
                                navigate("/checkout");
                              }}
                            >
                              Buy Now
                              <DollarSign className="w-4 h-4 ml-2" />
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => navigate(`/customize/${design.id}`)}
                            >
                              Edit Design
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                            <Button
                              variant="outline"
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => {
                                if (confirm("Delete this design?")) {
                                  handleDeleteDesign(design.id);
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
