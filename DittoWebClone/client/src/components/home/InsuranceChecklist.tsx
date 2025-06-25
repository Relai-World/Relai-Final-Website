import Container from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ChecklistImage } from "@/assets/svg/logos";

export default function InsuranceChecklist() {
  return (
    <section className="py-12 md:py-16">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <ChecklistImage />
          </div>
          <div>
            <h2 className="text-2xl md:text-4xl font-bold mb-4">Insurance Checklist</h2>
            <p className="text-gray-600 mb-8">
              We know how difficult it can be to navigate through hundreds of policies. So we've designed this handy checklist to make sure you know exactly what to look for in a good policy
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button className="px-6 py-3">
                Term Insurance Checklist
              </Button>
              <Button className="px-6 py-3">
                Health Insurance Checklist
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
