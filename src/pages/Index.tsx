import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Truck, ShieldCheck, MessageCircle } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useProducts";
import { ProductCard } from "@/components/shop/ProductCard";
import CursorGlow from "@/components/ui/CursorGlow";
import Tilt from "react-parallax-tilt";

const Index = () => {
  const { data: products = [] } = useProducts();
  const featured = products.slice(0, 8);
  const navigate = useNavigate();

  return (
    <Layout>
      <div className=" text-black relative z-20">
        <CursorGlow />

        {/* ================= HERO ================= */}
        {/* ================= HERO ================= */}
<section className="relative w-full h-[60vh] sm:h-[70vh] md:h-[85vh] overflow-hidden">

  {/* Background Image */}
  <img
    src="https://images.unsplash.com/photo-1489987707025-afc232f7ea0f"
    alt="Fashion Banner"
    className="
      absolute inset-0
      w-full h-full
      object-cover
      object-center
    "
  />

  {/* Premium dark overlay */}
  <div className="absolute inset-0 bg-black/20" />

  {/* SHOP NOW BUTTON — bottom center */}
  <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
    <button
      onClick={() => navigate("/shop")}
      className="
        bg-white text-black font-semibold
        px-8 sm:px-10 py-3 sm:py-4
        text-sm sm:text-base
        tracking-widest
        hover:bg-black hover:text-white
        transition-all duration-300
        shadow-xl
      "
    >
      SHOP NOW
    </button>
  </div>

</section>
{/* ================= PRODUCTS SECTION ================= */}
<section className="py-20 bg-white">
  <div className="section-container">

    {/* Heading */}
    <div className="flex items-center justify-between mb-12">
      <h2 className="text-3xl md:text-4xl font-bold tracking-wide">
        New Drop
      </h2>

      <Link
        to="/shop"
        className="text-sm font-semibold tracking-wider hover:underline"
      >
        VIEW ALL
      </Link>
    </div>

    {/* Product Grid */}
   <div  onClick={() => navigate("/shop")} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
  {featured.map((product) => (
    <div
      key={product.id}
      className="w-full"
    >
      <Tilt scale={1.02}>
        <ProductCard
          product={{
            ...product,
            image: product.image_url,
          }}
        />
      </Tilt>
    </div>
  ))}
</div>

  </div>
</section>


        {/* ================= WHY BRAND ================= */}
        <section className="bg-white text-black py-28">
          <div className="section-container text-center">
            <h2 className="text-4xl font-bold mb-16 tracking-wide">
              WHY G-KAP
            </h2>

            <div className="grid md:grid-cols-3 gap-12">
              <div>
                <h3 className="text-xl font-semibold mb-3">
                  PREMIUM MATERIALS
                </h3>
                <p className="text-gray-600">
                  Carefully selected fabrics built for comfort and durability.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">
                  BUILT FOR DISCIPLINE
                </h3>
                <p className="text-gray-600">
                  Designed for those who show up every single day.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">
                  MODERN STREET STYLE
                </h3>
                <p className="text-gray-600">
                  Minimal aesthetics inspired by youth culture.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= QUOTE SECTION ================= */}
        <section className="py-32 text-center">
          <h2 className="text-3xl md:text-5xl font-bold max-w-4xl mx-auto tracking-wide">
            Discipline is the difference between dreams and results.
          </h2>
        </section>

        {/* ================= TRUST FEATURES ================= */}
        <section className="bg-white text-black py-16">
          <div className="section-container grid md:grid-cols-3 gap-10 text-center">
            <div>
              <Truck className="mx-auto mb-3" />
              <p className="font-semibold">FAST SHIPPING</p>
            </div>

            <div>
              <ShieldCheck className="mx-auto mb-3" />
              <p className="font-semibold">QUALITY GUARANTEED</p>
            </div>

            <div>
              <MessageCircle className="mx-auto mb-3" />
              <p className="font-semibold">WHATSAPP SUPPORT</p>
            </div>
          </div>
        </section>

      </div>
    </Layout>
  );
};

export default Index;
