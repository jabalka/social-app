"use client";

import { login } from "@/app/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, X } from "lucide-react";
import Image from "next/image";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { BaseLoginUserData } from "./login-flow";

const formSchema = z.object({
  password: z.string(),
  email: z.string().optional(),
  username: z.string().optional(),
});
// .refine((data) => data.password === data.confirmPassword, {
//   message: "Passwords don't match",
//   path: ["confirmPassword"],
// });

type FormValues = {
  password: string;
  email?: string;
  username?: string;
};

interface LoginPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userData: BaseLoginUserData;
  onComplete: () => void;
  onClose: () => void;
}

const LoginPasswordDialog: React.FC<LoginPasswordDialogProps> = ({
  open,
  onOpenChange,
  userData,
  onComplete,
  onClose,
}) => {
  const [errorMessage, setErrorMessage] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isForgottenPassword, setIsForgottenPassword] = useState(false);

  const credentialFromParent = userData.email ?? userData.username ?? "";
  const isEmail = !!userData.email;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: isEmail ? credentialFromParent : undefined,
      username: !isEmail ? credentialFromParent : undefined,
      password: "",
    },
  });

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const subscription = form.watch((values) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        const passwordValid = await form.trigger("password");
        const touched = form.formState.touchedFields;

        const hasPassword = !!values.password?.trim();

        const passTouched = touched.password;

        if (passTouched && !hasPassword) {
          form.setError("password", {
            type: "manual",
            message: "You need your password to login.",
          });
        } else {
          form.clearErrors("password");
        }

        const ready = passwordValid && hasPassword;
        setIsReady(ready);
      }, 300);
    });

    return () => subscription.unsubscribe();
  }, [form]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const values = form.getValues();
    const identifier = values.email ?? values.username ?? "";

    const result = await login(identifier, values.password);

    if (result.success) {
      onOpenChange(false);
      await new Promise((resolve) => setTimeout(resolve, 500));
      onComplete();
    } else {
      setErrorMessage(result.error ?? "Something went wrong, please try again later.");
    }
  };

  const toggleForgotPassword = () => {
    setIsForgottenPassword(true);
  };

  const testCheck = () => {
    console.log("**********values:  ", form.getValues());
    console.log("is The form valid: ", form.formState.isValid);
  };

  return (
    <>
      {isForgottenPassword ? (
        ""
      ) : (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent
            aria-describedby="dialog-password-creation"
            onInteractOutside={(e) => e.preventDefault()}
            className="fixed left-1/2 top-1/2 z-50 max-w-md -translate-x-1/2 -translate-y-1/2 transform rounded-lg border border-gray-600 bg-black p-8 text-white"
          >
            <p id="dialog-password-creation" className="sr-only">
              Secure password setup
            </p>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-2 rounded-full text-gray-400 hover:bg-gray-800 hover:text-white"
              onClick={() => {
                onOpenChange(false);
                onClose();
              }}
            >
              <X className="h-4 w-4" />
            </Button>

            <Image
              src="/images/civ-dev-logo-white.png"
              alt="CivDev Logo"
              width={80}
              height={80}
              className="absolute -right-4 -top-6 w-full max-w-[100px]"
              priority
            />

            <DialogTitle className="mb-4 text-center text-xl font-semibold">Enter your password</DialogTitle>

            <Form {...form}>
              {isEmail ? (
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="mx-auto w-4/5 justify-center text-gray-400">Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled
                          className="mx-auto w-4/5 justify-center border-gray-600 bg-transparent text-white focus:border-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="mx-auto w-4/5 justify-center text-gray-400">Username</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled
                          className="mx-auto w-4/5 justify-center border-gray-600 bg-transparent text-white focus:border-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-400">Password</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          className="border-gray-600 bg-transparent text-white focus:border-blue-500"
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 h-auto -translate-y-1/2 p-1 text-gray-400 hover:text-white"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <>
                            <EyeOff className="h-4 w-4" />
                            <span className="sr-only">Hide password</span>
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Show password</span>
                          </>
                        )}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="mx-auto w-full justify-center text-left">
                <button type="button" onClick={toggleForgotPassword} className="text-sm text-blue-500 hover:underline">
                  Forgot Password?
                </button>
              </div>

              {errorMessage && <div className="text-center text-red-500">{errorMessage}</div>}

              <Button
                type="submit"
                onClick={handleSubmit}
                className="w-full rounded-full bg-white font-bold text-black hover:bg-gray-200"
                disabled={!isReady}
              >
                Login
              </Button>

              <Button
                type="button"
                className="w-full rounded-full bg-white font-bold text-black hover:bg-gray-200"
                onClick={testCheck}
              >
                Test Check
              </Button>
            </Form>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default LoginPasswordDialog;
