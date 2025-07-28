import { cn } from "@/utils/cn.utils";
import { Button } from "../ui/button";

interface Props {
  children: React.ReactNode;
  onClick?: () => void;
  onClickTwo?: () => void;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
}

const GlowingPinkButton: React.FC<Props> = ({
  children,
  onClick,
  onClickTwo,
  disabled = false,
  className = "",
  type = "button",
}) => {
  const handleClick = () => {
    if (onClick) onClick();
    if (onClickTwo) onClickTwo();
  };

  return (
    <div className="group relative inline-flex overflow-hidden rounded-full p-[4px]">
      <Button
        onClick={handleClick}
        disabled={disabled}
        type={type}
        className={cn(
          // Main pink gradient + hover
          "rounded-full bg-gradient-to-br from-[#99315e] via-[#c93f7b] to-[#8c2954] text-sm text-white outline outline-[#dd4386]/60 hover:from-[#d84182] hover:via-[#8c2954] hover:to-[#dd4386] hover:outline-2 group-hover:bg-gradient-to-br",
          className,
        )}
      >
        {children}
      </Button>
      {!disabled && (
        <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-full group-hover:animate-snakeBorderPink1s" />
      )}
    </div>
  );
};

export default GlowingPinkButton;
