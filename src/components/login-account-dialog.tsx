"use client";

import { getUser } from "@/actions/common.actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
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
}

const LoginAccountDialog: React.FC<LoginAccountDialogProps> = ({ open, onOpenChange, onNext, onClose }) => {
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

      form.clearErrors(["email"]);
      form.clearErrors(["username"]);

      if (emailTouched && !hasEmail) {
        if (emailTouched) {
          form.setError("email", {
            type: "manual",
            message: "Email is required.",
          });
        }
      } else if (usernameTouched && hasUsername) {
        if (usernameTouched) {
          form.setError("username", {
            type: "manuel",
            message: "Username is required.",
          });
        }
      }

      if (values.username || values.email) {
        const isReadyNow = hasUsername || hasEmail;

        setIsReady(isReadyNow);
        setErrorMessage("");
      }

      const identifier = values.email || values.username;
      if (identifier) {
        const existingUser = await getUser(identifier);
        if (!existingUser && values.email) {
          setErrorMessage(`User with this email already exists!`);
        } else if (!existingUser && values.username) {
          setErrorMessage(`User with this username already exists!`);
        }
        setIsReady(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  const handleNext = async () => {
    const values = form.getValues();
    console.log("**********values:  ", values);
    const identifier = values.email || values.username;
    setErrorMessage("");

    if (identifier) {
      const existingUser = await getUser(identifier);
      if (existingUser) {
        setErrorMessage(`User with this ${values.email ? "email" : "phone"} already exists!`);
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
    setIsUsername((prev) => {
      const next = !prev;
      if (next) {
        form.unregister("email");
        form.setValue("username", "");
      } else {
        form.setValue("email", "");
        form.unregister("username");
      }
      return next;
    });
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

          <DialogTitle className="mb-4 text-center text-2xl font-semibold">Sign in CivilDev</DialogTitle>

          <Form {...form}>
            <form className="space-y-4">
              <div className="w-full max-w-md">
                <div className="flex w-full flex-col gap-3">
                  <div className="mx-auto w-4/5 justify-center">
                    <GoogleSignIn />
                  </div>

                  {isUsername ? (
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-400 mx-auto w-4/5 justify-center">Username</FormLabel>
                      <FormControl>
                        <Input {...field} className="mx-auto w-4/5 justify-center border-gray-600 bg-transparent text-white focus:border-blue-500" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-400 mx-auto w-4/5 justify-center">Email</FormLabel>
                      <FormControl>
                        <Input {...field} className="mx-auto w-4/5 justify-center border-gray-600 bg-transparent text-white focus:border-blue-500" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="text-right mx-auto w-4/5 justify-center">
                <button type="button" onClick={toggleInputType} className="text-sm text-blue-500 hover:underline">
                  {isUsername ? "Use email instead" : "Use username instead"}
                </button>
              </div>

              {errorMessage && <div className="text-center text-red-500">{errorMessage}</div>}

              <Button
                type="button"
                className="mx-auto w-4/5 justify-center rounded-full bg-white font-bold text-black hover:bg-gray-200"
                disabled={!isReady}
                onClick={handleNext}
              >
                Next
              </Button>

              <Button
                type="button"
                className="mx-auto w-4/5 justify-center rounded-full bg-white font-bold text-black hover:bg-gray-200"
                onClick={testCheck}
              >
                Test Check
              </Button>

                </div>
              </div>
              {/* <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-400">Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        maxLength={50}
                        className="border-gray-600 bg-transparent text-white focus:border-blue-500"
                      />
                    </FormControl>
                    <div className="text-right text-xs text-gray-500">{field.value.length}/50</div>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}


            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LoginAccountDialog;
