"use client";

import { Button } from "@/components/ui/button"; // Use shadcn Button for consistent styling
// import { useAuth } from "@/hooks/use-auth";
// import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
import CreateAccountFlow from "./create-account-flow";
import GoogleSignUp from "./google-sign-up";
import LoginFlow from "./login-flow";

const HomeButtons: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);

  
  return (
    <div className="w-full max-w-md mt-20 ">
      <div className="mb-6 font-bold text-white">
        <h1 className="mb-2 text-3xl">Happening now</h1>
        <h3 className="text-xl">Join today.</h3>
      </div>

      <section className="flex w-full flex-col gap-3">

        <div className="mx-auto w-4/5 justify-center">
        <GoogleSignUp />
        </div>


        {/* ----------- Since Apple API for sign in is paid, this function will be temporarily disabled! ---------------- */}
        {/* <Button
          variant="outline"
          className="mx-auto w-4/5 justify-center rounded-full bg-white text-black hover:bg-gray-200"
        >
          <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8-1.287-1.82-2.323-4.63-2.323-7.28 0-4.28 2.797-6.55 5.552-6.55 1.448 0 2.675.95 3.6.95.865 0 2.222-1.01 3.902-1.01.613 0 2.886.06 4.374 2.19-.13.09-2.383 1.37-2.383 4.19 0 3.26 2.854 4.42 2.955 4.45z"
              fill="currentColor"
            />
          </svg>
          <span>Sign up with Apple</span>
        </Button> */}

        <Button
          variant="outline"
          className="mx-auto w-4/5 justify-center rounded-full bg-white text-black hover:bg-gray-200"
        >
          <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
              fill="#1877F2"
            />
          </svg>
          <span>Sign up with Facebook</span>
        </Button>

        <div className="relative my-px flex items-center text-center">
          <div className="absolute w-full border-t border-gray-600"></div>
          <div className="relative z-10 mx-auto bg-black px-2 text-gray-300">or</div>
        </div>

        <div className="mx-auto w-4/5">
          <Button
            className="w-full justify-center rounded-full bg-blue-500 font-bold text-white hover:bg-blue-600"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            Create Account
          </Button>
        </div>



        <span className="mt-px text-center text-xs text-gray-400">
          By signing up, you agree to the{" "}
          <a href="/toLink" className="text-blue-400 no-underline hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/toLink" className="text-blue-400 no-underline hover:underline">
            Privacy Policy
          </a>
          , including{" "}
          <a href="/goLink" className="text-blue-400 no-underline hover:underline">
            Cookie Use.
          </a>
        </span>

        <div className="mx-auto w-4/5 mt-10">
        <h1 className="mb-3 text-lg font-semibold">Already have an account?</h1>
          <Button
            className="w-full justify-center rounded-full border-2 border-white bg-black font-bold text-blue-400 hover:bg-blue-900/30"
            onClick={() => setIsLoginDialogOpen(true)}
          >
            Sign In
          </Button>
        </div>
      </section>

      {isCreateDialogOpen && <CreateAccountFlow onClose={() => setIsCreateDialogOpen(false)} />}
      {isLoginDialogOpen && <LoginFlow onClose={() => setIsLoginDialogOpen(false)} />}
    </div>
  );
};

export default HomeButtons;
