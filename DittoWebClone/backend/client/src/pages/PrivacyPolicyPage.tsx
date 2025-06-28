import Container from "@/components/ui/container";
import { useEffect } from "react";

export default function PrivacyPolicyPage() {
  // Set page title and meta description when component mounts
  useEffect(() => {
    document.title = "Privacy Policy | How Relai Protects Your Data";

    // Set meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Your privacy matters to us. Learn how Relai collects, uses, and protects your personal information when you use our real estate services.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Your privacy matters to us. Learn how Relai collects, uses, and protects your personal information when you use our real estate services.';
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
          <h1 className="text-3xl font-bold mb-6 text-gray-900">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-6">Effective Date: April 17, 2025</p>
          
          <div className="text-gray-700 max-w-none">
            <p className="mb-4 leading-relaxed">
              At Relai ("we", "our", or "us"), your privacy is of utmost importance. This Privacy Policy outlines how we collect, use, disclose, and safeguard your personal information when you use our services, including through our website, calls, mobile applications, and AI-powered real estate advisory tools (collectively, the "Services").
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">1. Information We Collect</h2>
            
            <h3 className="text-lg font-medium mt-6 mb-3">a. Information You Provide:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Name, email address, phone number, and other contact details</li>
              <li>Property preferences, budget, and location interests</li>
              <li>Documents related to property buying or investment (if voluntarily submitted)</li>
            </ul>
            
            <h3 className="text-lg font-medium mt-6 mb-3">b. Information Collected Automatically:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Device information (e.g., IP address, browser type, device type)</li>
              <li>Usage data (e.g., pages viewed, actions taken, interaction patterns)</li>
              <li>Location data (if permission is granted)</li>
            </ul>
            
            <h3 className="text-lg font-medium mt-6 mb-3">c. Third-Party Data:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Data shared via integrations with social media or authentication platforms</li>
              <li>Property listings and market insights obtained from trusted partners and public real estate registries (e.g., RERA)</li>
            </ul>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To deliver personalized property recommendations using AI tools</li>
              <li>To respond to inquiries and provide customer support</li>
              <li>To improve the performance, functionality, and user experience of our Services</li>
              <li>To communicate updates, promotions, or relevant property insights</li>
              <li>For legal, security, and compliance purposes</li>
            </ul>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">3. How We Share Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>With trusted real estate developers and service partners for fulfilling your property requirements</li>
              <li>With financial institutions (only with consent) for home loan facilitation</li>
              <li>With legal and registration advisors (as part of our end-to-end support, if you opt for it)</li>
              <li>As required by law, regulation, or legal process</li>
            </ul>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">4. Data Security</h2>
            <p className="mb-4 leading-relaxed">
              We implement reasonable technical and organizational measures to protect your information from unauthorized access, disclosure, alteration, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">5. Your Choices and Rights</h2>
            <p className="mb-4 leading-relaxed">
              You can request data deletion or limitation of data processing by contacting us.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">6. Children's Privacy</h2>
            <p className="mb-4 leading-relaxed">
              Our Services are not intended for individuals under the age of 18. We do not knowingly collect personal data from children without parental consent.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">7. Changes to This Policy</h2>
            <p className="mb-4 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of material changes by updating the "Effective Date" at the top of this page or through other appropriate means.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">8. Contact Us</h2>
            <p className="mb-4 leading-relaxed">
              If you have any questions or concerns regarding this Privacy Policy or our data practices, you may contact us at:
            </p>
            <p className="mb-4 leading-relaxed">
              Relai Technologies Private Limited<br />
              Email: <a href="mailto:connect@relai.world" className="text-blue-600 hover:underline">connect@relai.world</a>
            </p>
            
            <p className="mt-8 mb-4 leading-relaxed text-gray-700">
              By using our Services, you agree to the terms of this Privacy Policy.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}