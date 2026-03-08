import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";

const ReturnsAndRefundPolicy = () => (
  <Layout>
    <section className="bg-gradient-mesh py-20">
      <div className="section-container text-center">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-display font-bold mb-6">
          Returns and Refunds Policy <span className="text-gradient-primary">for G-KAP</span>
        </motion.h1>
        <p className="text-sm text-muted-foreground mt-2">Last Updated: March 9, 2026</p>
      </div>
    </section>
    <section className="py-20">
      <div className="section-container max-w-3xl mx-auto">
        <ol className="list-decimal list-inside text-left text-lg text-muted-foreground space-y-6">
          <li>
            <strong>Custom Printed Goods (Non-Returnable)</strong><br />
            Due to the personalized nature of our products, G-KAP does not accept returns or exchanges for "Change of Mind" or incorrect size selection. <br />
            <em>We strongly encourage all customers to refer to our Size Chart before placing an order.</em><br />
            Once a custom design is printed, it cannot be restocked or resold.
          </li>
          <li>
            <strong>Eligibility for Returns (Defective or Wrong Items)</strong><br />
            We will offer a full refund or a free replacement if the product you received:<br />
            <ul className="list-disc list-inside ml-6">
              <li>Has a manufacturing defect (e.g., holes, stitching issues).</li>
              <li>Arrived damaged during transit.</li>
              <li>Has a significant printing error that differs from the design approved on the website.</li>
              <li>Is the wrong size, color, or style compared to what was ordered.</li>
            </ul>
          </li>
          <li>
            <strong>Return Window</strong><br />
            Claims for damaged or defective items must be initiated within 7 days of the delivery date. After 7 days, G-KAP cannot be held responsible for the condition of the items.
          </li>
          <li>
            <strong>How to Initiate a Return</strong><br />
            To report an issue, please follow these steps:<br />
            <ul className="list-disc list-inside ml-6">
              <li>Contact Us: Email <a href="mailto:gkapprints@gmail.com" className="text-coral">gkapprints@gmail.com</a> or message us on WhatsApp with your Order Number.</li>
              <li>Provide Evidence: Attach clear photos of the defect or the incorrect item received.</li>
              <li>Review: Our team will review your claim within 48 hours.</li>
            </ul>
          </li>
          <li>
            <strong>Refund Process</strong><br />
            Once your return request is approved:<br />
            <ul className="list-disc list-inside ml-6">
              <li>Replacement: We will ship a new item to you at no additional cost. This is our standard resolution.</li>
              <li>Refund: If a replacement is not possible, a refund will be issued to your original payment method within 5-7 business days.</li>
              <li>Shipping Costs: G-KAP will cover the return shipping costs only if the return is due to our error (defective or wrong item).</li>
            </ul>
          </li>
          <li>
            <strong>Cancellations</strong><br />
            Orders can only be cancelled within 2 hours of placement. Once an order moves into the "Production" or "Printing" stage, it can no longer be cancelled or refunded.
          </li>
        </ol>
      </div>
    </section>
  </Layout>
);

export default ReturnsAndRefundPolicy;
