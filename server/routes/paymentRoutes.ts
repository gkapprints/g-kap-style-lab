import express from "express";
const router = express.Router();
import { createRazorpayOrder } from "../controllers/paymentController";
import { verifyRazorpayPayment } from "../controllers/paymentController";
router.post("/razorpay/verify", verifyRazorpayPayment);
router.post("/razorpay/order", createRazorpayOrder);

export default router;
