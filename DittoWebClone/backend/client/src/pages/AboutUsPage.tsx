import Container from "@/components/ui/container";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import CallButton from "@/components/shared/CallButton";
import { RelaiLogo } from "@/assets/svg/logo";
import { useEffect } from "react";

export default function AboutUsPage() {
  // Set page title and meta description when component mounts
  useEffect(() => {
    document.title = "About Relai | Your Smart Real Estate Partner in Hyderabad";
    
    // Set meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Learn about Relai\'s mission to simplify real estate in Hyderabad. Meet our expert team and see how we bring trust, tech, and transparency to property buying.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Learn about Relai\'s mission to simplify real estate in Hyderabad. Meet our expert team and see how we bring trust, tech, and transparency to property buying.';
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
    <div className="pt-24">
      {/* Hero Section */}
      <section className="py-12 md:py-20 bg-[#F8F8F8]">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">About Relai</h1>
            <p className="text-xl text-gray-600 mb-8">
              Our vision is to revolutionize property buying, making it seamless and personalized, ensuring everyone finds their ideal home with confidence and ease.
            </p>
            <div className="flex flex-wrap justify-center gap-6 mt-10">
              <img src="/rera-logo.png" alt="RERA Certification" className="h-28 w-auto" />
              <img src="/iso-logo.png" alt="ISO Certification" className="h-28 w-auto" />
            </div>
          </div>
        </Container>
      </section>

      {/* Our Story */}
      <section className="py-16 md:py-24">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Mission</h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                To be the leading force in transforming property transactions, making them seamless, 
                transparent, and tailored for every individual.
              </p>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                We are committed to revolutionizing the real estate experience by combining deep market expertise
                with innovative technology, ensuring our clients make confident decisions with complete peace of mind.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Every recommendation we make is guided by a sincere dedication to your unique needs, 
                because we believe finding your perfect home should be a journey of excitement, not stress.
              </p>
            </div>
            <div className="flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="absolute -top-6 -left-6 w-24 h-24 bg-[#1752FF] rounded-full opacity-20"></div>
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#F5F5DC] rounded-full"></div>
                <div className="flex justify-center items-center h-full">
                  <RelaiLogo />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-[#F8F8F8]">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Values</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              At Relai, our core values guide everything we do, from how we interact with clients to how we approach the real estate market.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white border-none shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="bg-[#1752FF] w-12 h-12 rounded-full flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className=""><path d="M18 7.16a2.5 2.5 0 0 0-4.32-1.73l-1.18 1.18"/><path d="M13.5 5.43A2.5 2.5 0 0 0 9.18 6l9.83 9.83a2.5 2.5 0 0 0 .57-4.32"/><path d="M15.59 18.59A2.52 2.52 0 0 1 13 16.5h-2"/><path d="M12 16.5V10"/><path d="m7 11.5 5 5"/><path d="m12.03 7.97-5.5 5.5"/><path d="M15.5 11a2.5 2.5 0 0 0-5 0v.5"/></svg>
                </div>
                <h3 className="text-xl font-semibold mb-4">Transparency</h3>
                <p className="text-gray-600">
                  We believe in complete transparency throughout the real estate process. No hidden fees, no surprises—just clear, honest guidance.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-none shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="bg-[#1752FF] w-12 h-12 rounded-full flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className=""><path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z"/><path d="M15 3v6h6"/><path d="M10 16s.8 1 2 1c1.3 0 2-1 2-1"/><path d="M8 13h0"/><path d="M16 13h0"/></svg>
                </div>
                <h3 className="text-xl font-semibold mb-4">Client-First Approach</h3>
                <p className="text-gray-600">
                  Your needs and goals are our priority. We tailor our services to your specific requirements, ensuring a personalized experience.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-none shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="bg-[#1752FF] w-12 h-12 rounded-full flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className=""><path d="M19 4A4 4 0 0 0 15 8H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-1.5"/><path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M8 16v2a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2"/></svg>
                </div>
                <h3 className="text-xl font-semibold mb-4">Expertise</h3>
                <p className="text-gray-600">
                  Our team, recognized among the top real estate agents in Hyderabad, brings deep market knowledge to ensure you receive expert advice tailored to your needs.
                </p>
              </CardContent>
            </Card>
          </div>
        </Container>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-[#2C2C2E] text-white">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Your Real Estate Journey?</h2>
            <p className="text-xl mb-8">
              Our team of experts is ready to guide you through every step of buying or selling property in Hyderabad.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <CallButton className="px-8 py-3" />
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}