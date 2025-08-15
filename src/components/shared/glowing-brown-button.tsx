import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import { Button } from "../ui/button";

interface Props {
  children: React.ReactNode;
  onClick?: () => void;
  onClickTwo?: () => void;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
  theme?: string;
  form?: string;
}

const GlowingBrownButton: React.FC<Props> = ({
  children,
  onClick,
  onClickTwo,
  disabled = false,
  className = "",
  type = "button",
  theme,
  form,
}) => {
  const handleClick = () => {
    if (onClick) onClick();
    if (onClickTwo) onClickTwo();
  };

  return (
    <div className="group relative inline-flex overflow-hidden rounded-full p-[2px]">
      {/* Base outer border UNDER the animation to add contrast */}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 rounded-full",
          {
            // Slightly darker, theme-aware base ring color
            "bg-[#817773]": theme === Theme.LIGHT, // warm brown-grey
            "bg-[#302b29]": !theme || theme === Theme.DARK, // deep coffee tone
          }
        )}
      />

      {/* The actual button (top-most) */}
      <Button
        onClick={handleClick}
        disabled={disabled}
        type={type}
        form={form}
        className={cn(
          "relative z-20 w-full rounded-full py-3 font-bold transition duration-300",
          {
            "bg-gradient-to-br from-[#f3cdbd] via-[#d3a18c] to-[#bcaca5] text-zinc-700 hover:bg-gradient-to-br hover:from-[#b79789] hover:via-[#ddbeb1] hover:to-[#92817a] hover:text-zinc-50 hover:outline-gray-200":
              theme === Theme.LIGHT,
            "bg-gradient-to-br from-[#bda69c] via-[#72645f] to-[#bda69c] text-zinc-100 hover:bg-gradient-to-br hover:from-[#ff6913]/50 hover:via-white/20 hover:to-[#ff6913]/60 hover:text-gray-600 hover:outline-gray-700":
              !theme || theme === Theme.DARK,
          },
          className
        )}
      >
        {children}
      </Button>

      {/* Animated border layer ABOVE the base border but BELOW the button */}
      {!disabled && (
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 z-10 rounded-full",
            {
              "group-hover:animate-snakeBorderHoverLight": theme === Theme.LIGHT,
              "group-hover:animate-snakeBorderHoverDark": !theme || theme === Theme.DARK,
            }
          )}
        />
      )}
    </div>
  );
};

export default GlowingBrownButton;