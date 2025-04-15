"use client";

import { findUserByIdentifier } from "@/app/actions/common.actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import Image from "next/image";
import type React from "react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import GoogleSignIn from "./google-sign-in";
import { BaseLoginUserData } from "./login-flow";

const formSchema = z.object({
  username: z.string().min(1, "Please enter your username.").optional(),
  email: z.string().email("Please enter a valid email.").optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface LoginAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNext: (data: BaseLoginUserData) => void;
  onClose: () => void;
  onSignUpRequest: () => void;
}

const LoginAccountDialog: React.FC<LoginAccountDialogProps> = ({
  open,
  onOpenChange,
  onNext,
  onClose,
  onSignUpRequest,
}) => {
  const [isUsername, setIsUsername] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      // phone: "",
    },
    shouldUnregister: true,
    mode: "onChange",
    criteriaMode: "all",
  });

  useEffect(() => {
    const subscription = form.watch(async (values) => {
      const touched = form.formState.touchedFields;
      const emailTouched = !!touched.email;
      const usernameTouched = !!touched.username;

      const hasUsername = !!values.username?.trim();
      const hasEmail = !!values.email?.trim();

      form.clearErrors(["email", "username"]);

      if (emailTouched && !hasEmail) {
        if (emailTouched) {
          form.setError("email", {
            type: "manual",
            message: "Email is required.",
          });
        }
      }
      if (usernameTouched && !hasUsername) {
        form.setError("username", {
          type: "manual",
          message: "Username is required.",
        });
      }

      setIsReady(hasUsername || hasEmail);
      setErrorMessage("");
    });

    return () => subscription.unsubscribe();
  }, [form]);

  const handleNext = async () => {
    const values = form.getValues();
    console.log("**********values:  ", values);
    setErrorMessage("");

    const valid = await form.trigger();
    if (!valid) {
      return;
    }

    const identifier = values.email || values.username;
    if (identifier) {
      const existingUser = await findUserByIdentifier(identifier);
      if (!existingUser) {
        setErrorMessage(`User with this ${values.email ? "email" : "username"} do not exist!`);
        return;
      }
    }

    onOpenChange(false);
    if (values.email) {
      onNext({
        email: values.email,
      });
    } else if (values.username) {
      onNext({
        username: values.username,
      });
    }
  };

  const toggleInputType = () => {
    setIsUsername((prev) => !prev);
  };

  const toggleSignUp = () => {
    onOpenChange(false);
    onSignUpRequest();
    onClose();
  };

  const testCheck = () => {
    console.log("**********values:  ", form.getValues());
    console.log("is The form valid: ", form.formState.isValid);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          onInteractOutside={(e) => e.preventDefault()}
          className="fixed left-1/2 top-1/2 z-50 max-w-md -translate-x-1/2 -translate-y-1/2 transform rounded-lg border border-gray-600 bg-black p-8 text-white"
        >
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
            alt="CivilDev Logo"
            width={80}
            height={80}
            className="absolute -right-4 -top-6 w-full max-w-[100px]"
            priority
          />

          <DialogTitle className="mb-2 text-center text-xl font-semibold">Sign in to CivilDev</DialogTitle>
          <div className="mx-auto w-4/5 justify-center">
            <GoogleSignIn />
          </div>
          <Form {...form}>
            <form className="space-y-4 mx-auto w-4/5 justify-center">
              <div className="w-full max-w-md">
                <div className="flex w-full flex-col gap-3">
                  {isUsername ? (
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel className="text-gray-400">Username</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                form.trigger("username");
                              }}
                              className="border-gray-600 bg-transparent text-white focus:border-blue-500"
                            />
                          </FormControl>
                          {fieldState.isTouched && <FormMessage />}
                        </FormItem>
                      )}
                    />
                  ) : (
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel className="text-gray-400">Email</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                form.trigger("email");
                              }}
                              className="border-gray-600 bg-transparent text-white focus:border-blue-500"
                            />
                          </FormControl>
                          {fieldState.isTouched && <FormMessage />}
                        </FormItem>
                      )}
                    />
                  )}

                  <div className="text-right">
                    <button type="button" onClick={toggleInputType} className="text-sm text-blue-500 hover:underline">
                      {isUsername ? "Use email instead" : "Use username instead"}
                    </button>
                  </div>

                  {errorMessage && <div className="text-center text-red-500">{errorMessage}</div>}

                  <Button
                    type="button"
                    className="rounded-full bg-white font-bold text-black hover:bg-gray-200"
                    disabled={!isReady}
                    onClick={handleNext}
                  >
                    Next
                  </Button>

                  <Button
                    type="button"
                    className="rounded-full bg-white font-bold text-black hover:bg-gray-200"
                    onClick={testCheck}
                  >
                    Test Check
                  </Button>
                </div>

                <div className="text-left mt-4">
                  <span className="mx-auto w-4/5 justify-center text-sm text-gray-400">Don’t have an account? </span>
                  <button type="button" onClick={toggleSignUp} className="text-sm text-blue-500 hover:underline">
                     Sign up 
                  </button>
                </div>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LoginAccountDialog;
