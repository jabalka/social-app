import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import { Button } from "./ui/button";

interface Props {
  children: React.ReactNode;
  onClick?: () => void;
  onClickTwo?: () => void;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
  theme?: string;
}

const GlowingGreyButton: React.FC<Props> = ({
  children,
  onClick,
  onClickTwo,
  disabled = false,
  className = "",
  type = "button",
  theme,
}) => {
  const handleClick = () => {
    if (onClick) onClick();
    if (onClickTwo) onClickTwo();
  };
  return (
    <>
      <div className="group relative inline-flex overflow-hidden rounded-full p-[2px]">
        <Button
          onClick={handleClick}
          disabled={disabled}
          type={type}
          className={cn(
            "rounded-full bg-gradient-to-br from-[#b5b4b4] via-[#6a6967] to-[#b5b4b4] text-sm text-white outline outline-[#3b3b3a]", 
            "hover:from-[#6f6d69] hover:via-[#9c9b9b] hover:to-[#6f6d69] hover:outline-2 group-hover:bg-gradient-to-br",
            className,
          )}
        >
          {children}
        </Button>
        {!disabled && (
          <span
            className={cn(`pointer-events-none absolute inset-[0px] overflow-hidden rounded-full`, {
              "group-hover:animate-snakeBorderHoverLight": theme === Theme.LIGHT,
              "group-hover:animate-snakeBorderHoverDark": !theme || theme === Theme.DARK,
            })}
          />
        )}
      </div>
    </>
  );
};

export default GlowingGreyButton;
