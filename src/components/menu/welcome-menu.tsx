import React from "react";
import MenuDropdownButton from "./menu-dropdown-button";

interface Props {
  className?: string;
  theme: string;
}

const WelcomeMenu: React.FC<Props> = ({ theme }) => {
  return (
    <nav className="w-full min-w-max">
      <ul className="flex items-center justify-center whitespace-nowrap">
        <MenuDropdownButton
          label="GET STARTED"
          items={[
            { href: "/what-is-starck", label: "CREATE PROJECT" },
            { href: "/faq", label: "SHARE IDEA" },
            { href: "/faq", label: "REPORT ISSUE" },
          ]}
          theme={theme}
        />

        <MenuDropdownButton
          label="ABOUT"
          items={[
            { href: "/media", label: "What is CivilDev" },
            { href: "/media", label: "FAQ" },
            { href: "/media", label: "CONTACT" },
          ]}
          theme={theme}
        />
      </ul>
    </nav>
  );
};


export default WelcomeMenu;
