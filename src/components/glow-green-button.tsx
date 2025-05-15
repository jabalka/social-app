import { cn } from "@/utils/cn.utils";
import { Button } from "./ui/button";

interface Props {
  children: React.ReactNode;
  onClick?: () => void;
  onClickTwo?: () => void;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
}

const GlowingGreenButton: React.FC<Props> = ({
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
    <>
      <div className="group relative inline-flex overflow-hidden rounded-full p-[4px]">
        <Button
             onClick={handleClick}
             disabled={disabled}
             type={type}
          className={cn("rounded-full bg-gradient-to-br from-[#359c33] via-[#185b17] to-[#359c33]  text-sm text-white outline outline-[#359c33]/60 hover:from-[#185b17] hover:via-[#2a8829] hover:to-[#185b17] hover:outline-2 group-hover:bg-gradient-to-br",
            className
          )}
        >
                 {children}
        </Button>
        <span
          className={`group-hover:animate-snakeBorderGreen1s pointer-events-none absolute inset-0 overflow-hidden rounded-full`}
        />
      </div>
    </>
  );
};

export default GlowingGreenButton;
