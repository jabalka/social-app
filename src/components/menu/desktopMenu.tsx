import { logout } from "@/app/actions/auth-actions";
import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

interface Props {
  theme: string;
}

const DesktopMenu: React.FC<Props> = ({ theme }) => {
  // const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    // setIsLoggingOut(false);

    router.push("/");
  };

  return (
    <nav
      className={cn("w-full min-w-max", {
        "text-zinc-700": theme === Theme.LIGHT,
        "text-zinc-200": theme === Theme.DARK,
      })}
    >
      <ul className="flex items-center justify-center whitespace-nowrap">
        <li className="group relative p-1 sm:p-0.5 md:p-1 lg:p-4 xl:p-5">
          <Link href="/" className="relative flex items-center space-x-2">
            <span className="text-sm font-medium transition-colors duration-200 hover:text-[#FF5C00] sm:text-xs md:text-xs lg:text-sm xl:text-base 2xl:text-lg">
              GET STARTED
            </span>
            <ChevronDown className="ml-2 h-4 w-4 transition-transform duration-300 ease-in-out group-hover:rotate-180 group-hover:text-[#FF5C00]" />
          </Link>
          <div className="pointer-events-none absolute top-8 z-[1] opacity-0 transition-all duration-200 focus-within:pointer-events-auto focus-within:top-8 focus-within:opacity-100 group-hover:pointer-events-auto group-hover:top-8 group-hover:opacity-100 sm:top-4 sm:focus-within:top-4 sm:group-hover:top-4 md:top-6 md:focus-within:top-6 md:group-hover:top-6 lg:top-10 lg:focus-within:top-10 lg:group-hover:top-10 xl:top-14 xl:focus-within:top-16 xl:group-hover:top-16">
            <div
              className={cn("flex flex-col rounded-md  shadow-lg", {
                "bg-[#443d3a]": theme === Theme.DARK,
                "bg-[#eeded7]": theme === Theme.LIGHT,
              })}
            >
              {/* min-w-[200px] sm:min-w-[180px] lg:min-w-[220px] */}
              <Link
                href="/what-is-starck"
                className="nav-link border-l border-r border-gray-400/30 px-3 py-1.5 transition-colors duration-200 first:rounded-tl-md first:rounded-tr-md first:border-t last:rounded-bl-md last:rounded-br-md last:border-b hover:bg-[#FF5C00]/10 hover:text-[#FF5C00] sm:px-4 sm:py-2 lg:px-5 lg:py-2.5"
              >
                <span className="sm:text-xs md:text-xs lg:text-sm xl:text-base 2xl:text-lg">CREATE PROJECT</span>
              </Link>

              <Link
                href="/faq"
                className="nav-link border-l border-r border-gray-400/30 px-3 py-1.5 transition-colors duration-200 first:rounded-tl-md first:rounded-tr-md first:border-t last:rounded-bl-md last:rounded-br-md last:border-b hover:bg-[#FF5C00]/10 hover:text-[#FF5C00] sm:px-4 sm:py-2 lg:px-5 lg:py-2.5"
              >
                <span className="sm:text-xs md:text-xs lg:text-sm xl:text-base 2xl:text-lg">SHARE IDEA</span>
              </Link>

              <Link
                href="/faq"
                className="nav-link border-l border-r border-gray-400/30 px-3 py-1.5 transition-colors duration-200 first:rounded-tl-md first:rounded-tr-md first:border-t last:rounded-bl-md last:rounded-br-md last:border-b hover:bg-[#FF5C00]/10 hover:text-[#FF5C00] sm:px-4 sm:py-2 lg:px-5 lg:py-2.5"
              >
                <span className="sm:text-xs md:text-xs lg:text-sm xl:text-base 2xl:text-lg">REPORT ISSUE</span>
              </Link>
            </div>
          </div>
        </li>

        <li className="group relative p-1 sm:p-0.5 md:p-1 lg:p-4 xl:p-5">
          <Link href="/asip-by-starck" className="relative flex items-center">
            <span className="text-sm font-medium transition-colors duration-200 hover:text-[#FF5C00] sm:text-xs md:text-xs lg:text-sm xl:text-base 2xl:text-lg">
              ASIP BY STARCK
            </span>
          </Link>
        </li>

        <li className="group relative p-1 sm:p-0.5 md:p-1 lg:p-4 xl:p-5">
          <Link href="/stake-starck" className="relative flex items-center">
            <span className="text-sm font-medium transition-colors duration-200 hover:text-[#FF5C00] sm:text-xs md:text-xs lg:text-sm xl:text-base 2xl:text-lg">
              STAKE STARCK
            </span>
            <ChevronDown className="ml-2 h-4 w-4 transition-transform duration-300 ease-in-out group-hover:rotate-180 group-hover:text-[#FF5C00]" />
          </Link>

          <div className="pointer-events-none absolute top-8 z-[1] opacity-0 transition-all duration-200 focus-within:pointer-events-auto focus-within:top-8 focus-within:opacity-100 group-hover:pointer-events-auto group-hover:top-8 group-hover:opacity-100 sm:top-4 sm:focus-within:top-4 sm:group-hover:top-4 md:top-6 md:focus-within:top-6 md:group-hover:top-6 lg:top-10 lg:focus-within:top-10 lg:group-hover:top-10 xl:top-14 xl:focus-within:top-16 xl:group-hover:top-16">
            <div className={cn("flex flex-col rounded-md  shadow-lg", {
                "bg-[#443d3a]": theme === Theme.DARK,
                "bg-[#eeded7]": theme === Theme.LIGHT,
              })}>
              <Link
                href="/stake-packages"
                className="nav-link border-l border-r border-gray-400/30 px-4 py-2 transition-colors duration-200 first:rounded-tl-md first:rounded-tr-md first:border-t last:rounded-bl-md last:rounded-br-md last:border-b hover:bg-[#FF5C00]/10 hover:text-[#FF5C00]"
              >
                <span className="sm:text-xs md:text-xs lg:text-sm xl:text-base 2xl:text-lg">STAKE PACKAGES</span>
              </Link>
            </div>
          </div>
        </li>

        <li className="group relative p-1 sm:p-0.5 md:p-1 lg:p-4 xl:p-5">
          <Link href="/documents" className="relative flex items-center">
            <span className="text-sm font-medium transition-colors duration-200 hover:text-[#FF5C00] sm:text-xs md:text-xs lg:text-sm xl:text-base 2xl:text-lg">
              DOCUMENTS
            </span>
            <ChevronDown className="ml-2 h-4 w-4 transition-transform duration-300 ease-in-out group-hover:rotate-180 group-hover:text-[#FF5C00]" />
          </Link>
          <div className="pointer-events-none absolute top-8 z-[1] opacity-0 transition-all duration-200 focus-within:pointer-events-auto focus-within:top-8 focus-within:opacity-100 group-hover:pointer-events-auto group-hover:top-8 group-hover:opacity-100 sm:top-4 sm:focus-within:top-4 sm:group-hover:top-4 md:top-6 md:focus-within:top-6 md:group-hover:top-6 lg:top-10 lg:focus-within:top-10 lg:group-hover:top-10 xl:top-14 xl:focus-within:top-16 xl:group-hover:top-16">
            <div className={cn("flex flex-col rounded-md  shadow-lg", {
                "bg-[#443d3a]": theme === Theme.DARK,
                "bg-[#eeded7]": theme === Theme.LIGHT,
              })}>
              <Link
                href="https://starck.gitbook.io/starck-whitepaper-v.3.0"
                className="nav-link border-l border-r border-gray-400/30 px-4 py-2 transition-colors duration-200 first:rounded-tl-md first:rounded-tr-md first:border-t last:rounded-bl-md last:rounded-br-md last:border-b hover:bg-[#FF5C00]/10 hover:text-[#FF5C00]"
              >
                <span className="sm:text-xs md:text-xs lg:text-sm xl:text-base 2xl:text-lg">WHITEPAPER</span>
              </Link>

              <Link
                href="/#roadmap"
                className="nav-link border-l border-r border-gray-400/30 px-4 py-2 transition-colors duration-200 first:rounded-tl-md first:rounded-tr-md first:border-t last:rounded-bl-md last:rounded-br-md last:border-b hover:bg-[#FF5C00]/10 hover:text-[#FF5C00]"
              >
                <span className="sm:text-xs md:text-xs lg:text-sm xl:text-base 2xl:text-lg">ROADMAP</span>
              </Link>

              <Link
                href="https://bscscan.com/address/0xa35b5c783117e107644056f5d39faa468e9d8d47#code"
                className="nav-link border-l border-r border-gray-400/30 px-4 py-2 transition-colors duration-200 first:rounded-tl-md first:rounded-tr-md first:border-t last:rounded-bl-md last:rounded-br-md last:border-b hover:bg-[#FF5C00]/10 hover:text-[#FF5C00]"
              >
                <span className="sm:text-xs md:text-xs lg:text-sm xl:text-base 2xl:text-lg">SMART CONTRACT</span>
              </Link>

              <Link
                href="/audits"
                className="nav-link border-l border-r border-gray-400/30 px-4 py-2 transition-colors duration-200 first:rounded-tl-md first:rounded-tr-md first:border-t last:rounded-bl-md last:rounded-br-md last:border-b hover:bg-[#FF5C00]/10 hover:text-[#FF5C00]"
              >
                <span className="sm:text-xs md:text-xs lg:text-sm xl:text-base 2xl:text-lg">AUDITS</span>
              </Link>
            </div>
          </div>
        </li>

        <li className="group relative p-1 sm:p-0.5 md:p-1 lg:p-4 xl:p-5">
          <Link href="" className="relative flex items-center">
            <span className="text-sm font-medium transition-colors duration-200 hover:text-[#FF5C00] sm:text-xs md:text-xs lg:text-sm xl:text-base 2xl:text-lg">
              PROGRAM
            </span>
            <ChevronDown className="ml-2 h-4 w-4 transition-transform duration-300 ease-in-out group-hover:rotate-180 group-hover:text-[#FF5C00]" />
          </Link>

          <div className="pointer-events-none absolute top-8 z-[1] opacity-0 transition-all duration-200 focus-within:pointer-events-auto focus-within:top-8 focus-within:opacity-100 group-hover:pointer-events-auto group-hover:top-8 group-hover:opacity-100 sm:top-4 sm:focus-within:top-4 sm:group-hover:top-4 md:top-6 md:focus-within:top-6 md:group-hover:top-6 lg:top-10 lg:focus-within:top-10 lg:group-hover:top-10 xl:top-14 xl:focus-within:top-16 xl:group-hover:top-16">
            <div className={cn("flex flex-col rounded-md  shadow-lg", {
                "bg-[#443d3a]": theme === Theme.DARK,
                "bg-[#eeded7]": theme === Theme.LIGHT,
              })}>
              <Link
                href="/ambassador"
                className="nav-link border-l border-r border-gray-400/30 px-4 py-2 transition-colors duration-200 first:rounded-tl-md first:rounded-tr-md first:border-t last:rounded-bl-md last:rounded-br-md last:border-b hover:bg-[#FF5C00]/10 hover:text-[#FF5C00]"
              >
                <span className="sm:text-xs md:text-xs lg:text-sm xl:text-base 2xl:text-lg">AMBASSADOR</span>
              </Link>

              <Link
                href="/affiliate"
                className="nav-link border-l border-r border-gray-400/30 px-4 py-2 transition-colors duration-200 first:rounded-tl-md first:rounded-tr-md first:border-t last:rounded-bl-md last:rounded-br-md last:border-b hover:bg-[#FF5C00]/10 hover:text-[#FF5C00]"
              >
                <span className="sm:text-xs md:text-xs lg:text-sm xl:text-base 2xl:text-lg">AFFILIATE</span>
              </Link>

              <Link
                href="/partners"
                className="nav-link border-l border-r border-gray-400/30 px-4 py-2 transition-colors duration-200 first:rounded-tl-md first:rounded-tr-md first:border-t last:rounded-bl-md last:rounded-br-md last:border-b hover:bg-[#FF5C00]/10 hover:text-[#FF5C00]"
              >
                <span className="sm:text-xs md:text-xs lg:text-sm xl:text-base 2xl:text-lg">PARTNERS</span>
              </Link>
            </div>
          </div>
        </li>

        <li className="group relative p-1 sm:p-0.5 md:p-1 lg:p-4 xl:p-5">
          <Link href="/news" className="relative flex items-center">
            <span className="text-sm font-medium transition-colors duration-200 hover:text-[#FF5C00] sm:text-xs md:text-xs lg:text-sm xl:text-base 2xl:text-lg">
              ABOUT
            </span>
            <ChevronDown className="ml-2 h-4 w-4 transition-transform duration-300 ease-in-out group-hover:rotate-180 group-hover:text-[#FF5C00]" />
          </Link>

          <div className="pointer-events-none absolute top-8 z-[1] opacity-0 transition-all duration-200 focus-within:pointer-events-auto focus-within:top-8 focus-within:opacity-100 group-hover:pointer-events-auto group-hover:top-8 group-hover:opacity-100 sm:top-4 sm:focus-within:top-4 sm:group-hover:top-4 md:top-6 md:focus-within:top-6 md:group-hover:top-6 lg:top-10 lg:focus-within:top-10 lg:group-hover:top-10 xl:top-14 xl:focus-within:top-16 xl:group-hover:top-16">
            <div className={cn("flex flex-col rounded-md  shadow-lg", {
                "bg-[#443d3a]": theme === Theme.DARK,
                "bg-[#eeded7]": theme === Theme.LIGHT,
              })}>
              <Link
                href="/media"
                className="nav-link border-l border-r border-gray-400/30 px-4 py-2 transition-colors duration-200 first:rounded-tl-md first:rounded-tr-md first:border-t last:rounded-bl-md last:rounded-br-md last:border-b hover:bg-[#FF5C00]/10 hover:text-[#FF5C00]"
              >
                <span className="sm:text-xs md:text-xs lg:text-sm xl:text-base 2xl:text-lg">What is CivilDev</span>
              </Link>

              <Link
                href="/media"
                className="nav-link border-l border-r border-gray-400/30 px-4 py-2 transition-colors duration-200 first:rounded-tl-md first:rounded-tr-md first:border-t last:rounded-bl-md last:rounded-br-md last:border-b hover:bg-[#FF5C00]/10 hover:text-[#FF5C00]"
              >
                <span className="sm:text-xs md:text-xs lg:text-sm xl:text-base 2xl:text-lg">FAQ</span>
              </Link>

              <Link
                href="/media"
                className="nav-link border-l border-r border-gray-400/30 px-4 py-2 transition-colors duration-200 first:rounded-tl-md first:rounded-tr-md first:border-t last:rounded-bl-md last:rounded-br-md last:border-b hover:bg-[#FF5C00]/10 hover:text-[#FF5C00]"
              >
                <span className="sm:text-xs md:text-xs lg:text-sm xl:text-base 2xl:text-lg">CONTACT</span>
              </Link>
            </div>
          </div>
        </li>

        <li className="group relative p-1 sm:p-0.5 md:p-1 lg:p-4 xl:p-5">
          <Link href="/documents" className="relative flex items-center">
            <span className="text-sm font-medium transition-colors duration-200 hover:text-[#FF5C00] sm:text-xs md:text-xs lg:text-sm xl:text-base 2xl:text-lg">
              PROFILE
            </span>
            <ChevronDown className="ml-2 h-4 w-4 transition-transform duration-300 ease-in-out group-hover:rotate-180 group-hover:text-[#FF5C00]" />
          </Link>
          <div className="pointer-events-none absolute top-8 z-[1] opacity-0 transition-all duration-200 focus-within:pointer-events-auto focus-within:top-8 focus-within:opacity-100 group-hover:pointer-events-auto group-hover:top-8 group-hover:opacity-100 sm:top-4 sm:focus-within:top-4 sm:group-hover:top-4 md:top-6 md:focus-within:top-6 md:group-hover:top-6 lg:top-10 lg:focus-within:top-10 lg:group-hover:top-10 xl:top-14 xl:focus-within:top-16 xl:group-hover:top-16">
            <div className={cn("flex flex-col rounded-md  shadow-lg", {
                "bg-[#443d3a]": theme === Theme.DARK,
                "bg-[#eeded7]": theme === Theme.LIGHT,
              })}>
              <Link
                href="/profile/dashboard"
                className="nav-link border-l border-r border-gray-400/30 px-4 py-2 transition-colors duration-200 first:rounded-tl-md first:rounded-tr-md first:border-t last:rounded-bl-md last:rounded-br-md last:border-b hover:bg-[#FF5C00]/10 hover:text-[#FF5C00]"
              >
                <span className="sm:text-xs md:text-xs lg:text-sm xl:text-base 2xl:text-lg">YOUR ACCOUNT</span>
              </Link>

              <Link
                href="/#roadmap"
                className="nav-link border-l border-r border-gray-400/30 px-4 py-2 transition-colors duration-200 first:rounded-tl-md first:rounded-tr-md first:border-t last:rounded-bl-md last:rounded-br-md last:border-b hover:bg-[#FF5C00]/10 hover:text-[#FF5C00]"
              >
                <span className="sm:text-xs md:text-xs lg:text-sm xl:text-base 2xl:text-lg">YOUR LISTS</span>
              </Link>

              <Link
                href={""}
                onClick={handleLogout}
                className="nav-link border-l border-r border-gray-400/30 px-4 py-2 transition-colors duration-200 first:rounded-tl-md first:rounded-tr-md first:border-t last:rounded-bl-md last:rounded-br-md last:border-b hover:bg-[#FF5C00]/10 hover:text-[#FF5C00]"
              >
                <span className="sm:text-xs md:text-xs lg:text-sm xl:text-base 2xl:text-lg">SIGN OUT</span>
              </Link>
            </div>
          </div>
        </li>
      </ul>
    </nav>
  );
};

export default DesktopMenu;
