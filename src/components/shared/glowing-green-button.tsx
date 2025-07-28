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

const GlowingGreenButton: React.FC<Props> = ({
  children,
  onClick,
  onClickTwo,
  disabled = false,
  className = "",
  type = "button",
  theme,
  form
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
          form={form}
          className={cn(
            "rounded-full bg-gradient-to-br from-[#359c33] via-[#185b17] to-[#359c33] text-sm text-white outline outline-[#359c33]/60 hover:from-[#185b17] hover:via-[#2a8829] hover:to-[#185b17] hover:outline-2 group-hover:bg-gradient-to-br",
            className,
          )}
        >
          {children}
        </Button>
        {!disabled && (
          <span
            className={cn(`pointer-events-none absolute inset-0 overflow-hidden rounded-full`, {
              "group-hover:animate-snakeBorderGreen1sLight": theme === Theme.LIGHT,
              "group-hover:animate-snakeBorderGreen1s": !theme || theme === Theme.DARK,
            })}
          />
        )}
      </div>
    </>
  );
};

export default GlowingGreenButton;
