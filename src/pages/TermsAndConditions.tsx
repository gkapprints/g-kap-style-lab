import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";

const TermsAndConditions = () => (
  <Layout>
    <section className="bg-gradient-mesh py-20">
      <div className="section-container text-center">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-display font-bold mb-6">
          Terms and Conditions <span className="text-gradient-primary">for G-KAP</span>
        </motion.h1>
      </div>
    </section>
    <section className="py-20">
      <div className="section-container max-w-3xl mx-auto">
        <ol className="list-decimal list-inside text-left text-lg text-muted-foreground space-y-6">
          <li>
            <strong>Acceptance of Terms</strong><br />
            By accessing or using the G-KAP website and placing an order, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please do not use our services.
          </li>
          <li>
            <strong>Orders and Pricing</strong><br />
            <u>Order Confirmation:</u> All orders are subject to acceptance and availability. Once you place an order, you will receive an acknowledgment email. This does not constitute acceptance of your order.<br />
            <u>Pricing:</u> All prices are subject to change without notice. We strive to maintain accurate pricing, but in the event of an error, we reserve the right to cancel or adjust your order.
          </li>
          <li>
            <strong>Custom Printing Policy</strong><br />
            <u>Content Rights:</u> By uploading a design or image to G-KAP, you warrant that you possess the necessary rights (copyright/trademark) for the design. You agree that G-KAP is not responsible for any copyright infringement resulting from your submitted artwork.<br />
            <u>Print Accuracy:</u> We make every effort to display colors accurately. However, due to variations in monitor settings and the nature of DTF/screen printing, the final product color may vary slightly from what you see on your screen.
          </li>
          <li>
            <strong>Shipping and Delivery</strong><br />
            <u>Delivery Estimates:</u> We aim to process and ship orders within 7 business days. These are estimates, not guarantees.<br />
            <u>Risk of Loss:</u> The risk of loss and title for all items purchased from G-KAP pass to you upon our delivery to the shipping carrier.
          </li>
          <li>
            <strong>Returns and Refunds</strong><br />
            <u>Custom Items:</u> Because our products are custom-printed, we cannot accept returns for change of mind.<br />
            <u>Defective Products:</u> If your item arrives damaged or with a print defect, please contact us within 3 days of delivery with photographic evidence. We will review your claim and, if approved, offer a replacement or a refund.
          </li>
          <li>
            <strong>User Conduct</strong><br />
            You agree not to use our website to:
            <ul className="list-disc list-inside ml-6">
              <li>Post or upload illegal, offensive, or infringing material.</li>
              <li>Attempt to gain unauthorized access to our systems.</li>
              <li>Interfere with the user experience of others.</li>
            </ul>
          </li>
          <li>
            <strong>Limitation of Liability</strong><br />
            G-KAP shall not be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use our products or services. Our total liability shall not exceed the price you paid for the product in question.
          </li>
          <li>
            <strong>Contact Information</strong><br />
            For any questions regarding these terms, please contact us at:<br />
            <b>Email:</b> <a href="mailto:gkapprints@gmail.com" className="text-coral">gkapprints@gmail.com</a><br />
            <b>Phone:</b> <a href="tel:7287980727" className="text-coral">7287980727</a>
          </li>
        </ol>
      </div>
    </section>
  </Layout>
);

export default TermsAndConditions;
