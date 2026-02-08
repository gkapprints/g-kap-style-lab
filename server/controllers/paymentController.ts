import { Orders } from "razorpay/dist/types/orders";
import crypto from "crypto";
import { Response, Request } from "express";
import razorpay from "../config/razorpay";

export const createRazorpayOrder = async (req: Request, res: Response) => {
  try {
    const { total } = req.body;

    if (!total) {
      return res.status(400).json({ message: "Total amount required" });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(total * 100), // paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      payment_capture: true,
    });
    res.status(200).json(order);
  } catch (error) {
    console.error("Razorpay error:", error);
    res.status(500).json({ message: "Failed to create Razorpay order" });
  }
};

export const verifyRazorpayPayment = async (req: Request, res: Response) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    } = req.body;

    // 1️⃣ Check required fields
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment details" });
    }

    // 2️⃣ Create expected signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    // 3️⃣ Compare signatures
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    // 4️⃣ Verified successfully
    return res.status(200).json({ verified: true });
  } catch (error) {
    return res.status(500).json({ message: "Verification failed" });
  }
};