import { Router, Response } from "express";
import { supabase } from "../config/supabase";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { sendOrderEmails } from "../utils/sendOrderEmails";

const router = Router();

/* =====================================================
   GET USER ORDERS
===================================================== */
router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          *,
          products (*)
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) return res.status(400).json({ error: error.message });

    res.json(data);
  } catch {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

/* =====================================================
   CREATE ORDER
===================================================== */
router.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const {
      items,
      shipping_address,
      shipping_method,
      payment_method,
      subtotal,
      shipping_cost,
      tax,
      total,
    } = req.body;

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          user_id: userId,
          shipping_address,
          shipping_method,
          payment_method,
          subtotal,
          shipping_cost,
          tax,
          total,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (orderError) {
      return res.status(400).json({ error: orderError.message });
    }


    // Support custom design orders
    const orderItems = items.map((item: any) => {
      // If this is a custom design order, include design_id and image_url
      if (item.design_id) {
        return {
          order_id: order.id,
          product_id: null,
          quantity: Number(item.quantity),
          size: item.size,
          color: item.color,
          price: Number(item.price),
          design_id: item.design_id,
          design_image_url: item.design_image_url, // will be undefined if not present
        };
      }
      // Normal product order
      return {
        order_id: order.id,
        product_id: item.product_id ?? null,
        quantity: Number(item.quantity),
        size: item.size,
        color: item.color,
        price: Number(item.price),
      };
    });

    await supabase.from("order_items").insert(orderItems);

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: "Failed to create order" });
  }
});

/* =====================================================
   PAYMENT SUCCESS (SEND EMAILS)
===================================================== */
router.post(
  "/:id/payment-success",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      console.log("🔥 PAYMENT SUCCESS API HIT:", id);

      const { data: order, error } = await supabase
        .from("orders")
        .update({ status: "paid" })
        .eq("id", id)
        .select(`
          *,
          order_items (
            *,
            products (*)
          )
        `)
        .single();

      if (error || !order) {
        console.error("❌ ORDER NOT FOUND:", error);
        return res.status(404).json({ error: "Order not found" });
      }

      // ✅ Extract user email from shipping_address
      const userEmail = order.shipping_address?.email;

      if (!userEmail) {
        return res.status(400).json({ error: "User email missing" });
      }

      await sendOrderEmails({
        ...order,
        userEmail,
      });

      res.json({ message: "Payment successful. Emails sent." });
    } catch (err) {
      console.error("❌ PAYMENT SUCCESS ERROR:", err);
      res.status(500).json({ error: "Payment success failed" });
    }
  }
);
export default router;
