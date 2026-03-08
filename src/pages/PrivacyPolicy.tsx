import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";

const PrivacyPolicy = () => (
  <Layout>
    <section className="bg-gradient-mesh py-20">
      <div className="section-container text-center">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-display font-bold mb-6">
          Privacy Policy <span className="text-gradient-primary">for G-KAP</span>
        </motion.h1>
      </div>
    </section>
    <section className="py-20">
      <div className="section-container max-w-3xl mx-auto">
        <ol className="list-decimal list-inside text-left text-lg text-muted-foreground space-y-6">
          <li>
            <strong>Personal Information We Collect</strong><br />
            When you visit the Site, we automatically collect certain information about your device, including information about your web browser, IP address, time zone, and some of the cookies that are installed on your device.<br />
            Additionally, when you make a purchase or attempt to make a purchase through the Site, we collect certain information from you, including:<br />
            <ul className="list-disc list-inside ml-6">
              <li>Identifiers: Name, billing address, shipping address, and email address.</li>
              <li>Payment Information: (Note: We do not store full credit card numbers; these are handled by our secure third-party payment processors).</li>
              <li>Order Specifics: Information regarding the custom designs or T-shirt sizes you order.</li>
            </ul>
          </li>
          <li>
            <strong>How Do We Use Your Personal Information?</strong><br />
            We use the Order Information that we collect generally to fulfill any orders placed through the Site (including processing your payment information, arranging for shipping, and providing you with invoices and/or order confirmations). Additionally, we use this information to:<br />
            <ul className="list-disc list-inside ml-6">
              <li>Communicate with you regarding your custom designs.</li>
              <li>Screen our orders for potential risk or fraud.</li>
              <li>When in line with the preferences you have shared with us, provide you with information or advertising relating to our new T-shirt drops or promotions.</li>
            </ul>
          </li>
          <li>
            <strong>Sharing Your Personal Information</strong><br />
            We share your Personal Information with third parties to help us use your Personal Information, as described above. For example:<br />
            <ul className="list-disc list-inside ml-6">
              <li>Service Providers: We share data with delivery partners to ensure your T-shirts reach your address in Delhi or elsewhere.</li>
              <li>Compliance: Finally, we may also share your Personal Information to comply with applicable laws and regulations or to protect our rights.</li>
            </ul>
          </li>
          <li>
            <strong>Data Retention</strong><br />
            When you place an order through the Site, we will maintain your Order Information for our records unless and until you ask us to delete this information.
          </li>
          <li>
            <strong>Your Rights</strong><br />
            If you are a resident of India, you have the right to access the personal information we hold about you and to ask that your personal information be corrected, updated, or deleted. If you would like to exercise this right, please contact us through the contact information below.
          </li>
          <li>
            <strong>Security</strong><br />
            We take reasonable precautions and follow industry best practices to make sure your personal information is not inappropriately lost, misused, accessed, disclosed, altered, or destroyed.
          </li>
          <li>
            <strong>Changes</strong><br />
            We may update this privacy policy from time to time in order to reflect, for example, changes to our practices or for other operational, legal, or regulatory reasons.
          </li>
          <li>
            <strong>Contact Us</strong><br />
            For more information about our privacy practices, if you have questions, or if you would like to make a complaint, please contact us by e-mail at <a href="mailto:gkapprints@gmail.com" className="text-coral">gkapprints@gmail.com</a>.
          </li>
        </ol>
      </div>
    </section>
  </Layout>
);

export default PrivacyPolicy;
