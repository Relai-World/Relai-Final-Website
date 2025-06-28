import { useEffect } from "react";
import Container from "@/components/ui/container";

export default function TermsPage() {
  // Set page title and meta description when component mounts
  useEffect(() => {
    document.title = "Terms & Conditions | Relai Real Estate Platform";
    
    // Set meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Read the terms and conditions governing your use of Relai\'s website, services, and tools for buying real estate in Hyderabad.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Read the terms and conditions governing your use of Relai\'s website, services, and tools for buying real estate in Hyderabad.';
      document.getElementsByTagName('head')[0].appendChild(meta);
    }
    
    // Restore title when component unmounts
    return () => {
      document.title = "Genuine, Smarter, and End to End Real Estate Services in Hyderabad";
      // Restore original meta description
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', 'Discover smarter real estate with Relai. Buy RERA verified properties with expert real estate guidance—all in one place');
      }
    };
  }, []);
  return (
    <div className="pt-24 pb-16">
      <Container>
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-sm">
          <h1 className="text-3xl font-bold mb-6 text-gray-900">Terms and Conditions</h1>
          <p className="text-sm text-gray-500 mb-6">Effective Date: April 17, 2025</p>
          
          <div className="text-gray-700 max-w-none">
            <p className="mb-4 leading-relaxed">
              Welcome to Relai. These Terms and Conditions ("Terms") govern your access to and use of the Relai website, calls, mobile applications, and services (collectively referred to as the "Platform") operated by Relai Real Estate Private Limited ("Relai", "we", "our", or "us").
            </p>
            <p className="mb-4 leading-relaxed">
              By using our Platform, you ("user", "buyer", "you") agree to be bound by these Terms. If you do not agree, please we request you to not use the Platform.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">1. Platform Overview</h2>
            <p className="mb-4 leading-relaxed">
              Relai is a tech-enabled, unbiased property advisory platform helping buyers discover RERA-registered residential properties in Hyderabad. We use a proprietary matching system and human advisors to help you shortlist projects and schedule site visits. We do not sell properties directly; we connect you to builders and developers.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">2. Eligibility</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You must be at least 18 years old and capable of entering into a legally binding agreement.</li>
              <li>NRIs and foreign nationals are eligible subject to compliance with Indian property laws.</li>
            </ul>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">3. Services Offered</h2>
            <p className="mb-4 leading-relaxed">Relai provides the following services:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Property recommendation based on buyer profile</li>
              <li>Dedicated advisory support for shortlisting properties</li>
              <li>Site visit planning and assistance</li>
              <li>End-to-end customer experience tracking</li>
              <li>Loan and legal assistance via third-party partners</li>
              <li>Price-match guarantee and buyer benefits up to ₹1.5 lakh (Are conditional and vary based on project and builder partnership)</li>
            </ul>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">4. No Brokerage or Listing Services</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Relai does not charge any fee to buyers.</li>
              <li>Relai earns revenue through a commission from builders when a buyer purchases a property referred by us.</li>
              <li>We do not operate as a broker, real estate agent, or listing portal.</li>
            </ul>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">5. Buyer Obligations</h2>
            <p className="mb-4 leading-relaxed">You agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate and complete information.</li>
              <li>Use the Platform only for lawful purposes.</li>
              <li>Refrain from misusing advisory time or sharing false intent to purchase.</li>
            </ul>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">6. RERA Compliance</h2>
            <p className="mb-4 leading-relaxed">
              All projects recommended by Relai are verified to be RERA-registered. However, buyers are encouraged to verify builder credentials, RERA filings, and project details independently.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">7. Pricing and Offers</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Relai guarantees price parity with builders (no markup).</li>
              <li>Buyer benefits (like cashback, vouchers, or services worth up to ₹1.5 lakh) are conditional and vary based on project and builder partnership.</li>
              <li>Relai reserves the right to modify or withdraw benefits at any time.</li>
            </ul>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">8. Third-Party Services</h2>
            <p className="mb-4 leading-relaxed">Relai may refer or connect you with third-party partners for:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Loan facilitation</li>
              <li>Legal and documentation support</li>
              <li>Interior design or moving services</li>
            </ul>
            <p className="mb-4 leading-relaxed">
              We are not responsible for services provided by third parties. You must independently evaluate and enter into agreements with them.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">9. Site Visits</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Relai offers site visit coordination with trained field executives.</li>
              <li>Buyers are responsible for their own safety during visits.</li>
              <li>Relai is not liable for any accident, injury, or loss during a site visit.</li>
            </ul>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">10. Limitations of Liability</h2>
            <p className="mb-4 leading-relaxed">Relai is not liable for:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Builder non-performance, delays, or disputes</li>
              <li>Errors in project information provided by builders</li>
              <li>Any financial or legal decisions made by the buyer</li>
            </ul>
            <p className="mb-4 leading-relaxed">
              Our liability is limited to the services directly provided by Relai and is capped at ₹10,000.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">11. User Data and Privacy</h2>
            <p className="mb-4 leading-relaxed">
              Please refer to our <a href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</a> for how we collect, store, and use your personal information.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">12. Intellectual Property</h2>
            <p className="mb-4 leading-relaxed">
              All content, design, algorithms, and branding on the Platform are owned by Relai and protected under applicable laws. Unauthorized use is strictly prohibited.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">13. Termination</h2>
            <p className="mb-4 leading-relaxed">Relai reserves the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Suspend or terminate services to any user who violates these Terms</li>
              <li>Modify or discontinue parts of the Platform at its sole discretion</li>
            </ul>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">14. Amendments</h2>
            <p className="mb-4 leading-relaxed">
              We may update these Terms from time to time. Continued use of the Platform after changes implies acceptance.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">15. Governing Law</h2>
            <p className="mb-4 leading-relaxed">
              These Terms shall be governed by and interpreted in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Rangareddy, Telangana.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">16. Contact Us</h2>
            <p className="mb-4 leading-relaxed">For any queries or concerns regarding these Terms, please contact:</p>
            <p className="mb-4 leading-relaxed">
              Relai<br />
              Email: <a href="mailto:connect@Relai.world" className="text-blue-600 hover:underline">connect@Relai.world</a>
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}