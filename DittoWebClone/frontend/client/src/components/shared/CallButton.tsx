import { Phone } from "lucide-react";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { memo } from "react";

interface CallButtonProps extends ButtonProps {
  wrapperClassName?: string;
  onContactClick?: () => void;
  showAdvisoryForm?: boolean;
}

const CallButton = memo(function CallButton({ 
  className, 
  wrapperClassName, 
  onContactClick, 
  showAdvisoryForm = true, 
  ...props 
}: CallButtonProps) {
  const handleClick = () => {
    if (onContactClick) {
      onContactClick();
    } else {
      window.open("https://wa.me/918881088890?text=Hi, I'd like to start my advisory process for property consultation.", "_blank");
    }
  };

  return (
    <Button 
      {...props} 
      onClick={handleClick}
      className={cn("flex items-center justify-center bg-[#1752FF] hover:bg-[#103cc9] rounded-full", className)}
    >
      <Phone className="h-5 w-5 mr-2" />
      Start your advisory process
    </Button>
  );
});

export default CallButton;