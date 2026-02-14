import dns from "dns";
dns.setDefaultResultOrder("ipv4first");
import dotenv from 'dotenv';
dotenv.config({ path: './server/.env' });
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import productsRoutes from './routes/products';
import cartRoutes from './routes/cart';
import ordersRoutes from './routes/orders';
import customizeRoutes from './routes/customize';
import tshirtOptionsRoutes from './routes/tshirt-options';
import addressesRoutes from './routes/addresses';
import paymentRoutes from "./routes/paymentRoutes";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
console.log("KEY:", process.env.RAZORPAY_KEY_ID);
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/customize', customizeRoutes);
app.use('/api/tshirt-options', tshirtOptionsRoutes);
app.use('/api/addresses', addressesRoutes);
app.use("/api/payments", paymentRoutes);
// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'G-KAP API is running' });
});
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
