
import Image from "next/image";
import type React from "react";

const ProfileDashboard: React.FC = async () => {


  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center md:flex-row md:items-start">
      <div className="mb-0 flex justify-center md:mb-0 md:mr-2 md:w-2/3">
        <Image
          src="/images/civ-dev-logo-white.png"
          alt="CivilDev Logo"
          width={720}
          height={720}
          className="absolute left-20 top-48 w-full max-w-[120px] transition-all duration-300 hover:scale-105 md:relative md:left-0 md:top-0 md:max-w-[720px]"
          priority
        />
      </div>

      <div className="mb-14 flex w-full flex-col items-center md:mt-0 md:w-2/3 md:items-start">
    <p>Welcome to your profile page</p>
      </div>
    </div>
  );
};

export default ProfileDashboard;
