"use client"

import React from "react";
import Lottie from "lottie-react";
import robotAnimation from "public/images/robot-maintenance.json";


const PageUnderMaintenance: React.FC = () => {
  return (
    <>
 

        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-full max-w-md">
            <Lottie animationData={robotAnimation} loop={true} />
          </div>
          <h1 className="mt-8 text-3xl font-bold">Page Under Maintenance</h1>
          <p className="mt-4 text-gray-400">
            This page is temporarily unavailable. Please navigate to another section of the platform.
          </p>
        </div>
 

    </>
  );
};

export default PageUnderMaintenance;
