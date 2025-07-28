
// import { Theme } from "@/types/theme.enum";
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
}

const GlowingVioletButton: React.FC<Props> = ({
  children,
  onClick,
  onClickTwo,
  disabled = false,
  className = "",
  type = "button",
//   theme,
}) => {
  const handleClick = () => {
    if (onClick) onClick();
    if (onClickTwo) onClickTwo();
  };
  return (
    <>
      <div className="group relative inline-flex overflow-hidden rounded-full p-[4px]">
        <Button
          onClick={handleClick}
          disabled={disabled}
          type={type}
          className={cn(
            "rounded-full bg-gradient-to-br from-[#c879d0] via-[#7c3184] to-[#c879d0] text-sm text-white outline outline-[#9b52a3]/60 transition duration-300 hover:bg-gradient-to-br hover:from-[#9b52a3] hover:via-[#c879d0] hover:to-[#7c3184] hover:outline-2",
            className,
          )}
        >
          {children}
        </Button>
        {!disabled && (
          <span
            className={cn(`pointer-events-none absolute inset-0 overflow-hidden rounded-full group-hover:animate-snakeBorderViolet`, {
            //   "group-hover:animate-snakeBorderGreen1sLight": theme === Theme.LIGHT,
            //   "group-hover:animate-snakeBorderGreen1s": !theme || theme === Theme.DARK,
            })}
          />
        )}
      </div>
    </>
  );
};

export default GlowingVioletButton;


