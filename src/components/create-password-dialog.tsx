"use client";

import { signInWithCredentials } from "@/app/actions/auth-actions";
import { registerUser } from "@/app/actions/credentials-register.actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, X } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { BaseUserData, ServerUserData } from "./create-account";

const formSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string(),
});
// .refine((data) => data.password === data.confirmPassword, {
//   message: "Passwords don't match",
//   path: ["confirmPassword"],
// });

type FormValues = z.infer<typeof formSchema>;

interface CreatePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userData: BaseUserData; // userData needs an interface as the data is passed from previous dialog
  onComplete: () => void;
  onClose: () => void;
}

const CreatePasswordDialog: React.FC<CreatePasswordDialogProps> = ({
  open,
  onOpenChange,
  userData,
  onComplete,
  onClose,
}) => {
  const [errorMessage, setErrorMessage] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const subscription = form.watch((values) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(async () => {
        const { password, confirmPassword } = values;
        const touched = form.formState.touchedFields;

        const hasPassword = !!password?.trim();
        const hasConfirm = !!confirmPassword?.trim();
        const confirmTouched = touched.confirmPassword;

        const passwordValid = await form.trigger("password");

        const match = password === confirmPassword;

        if (confirmTouched && hasPassword && hasConfirm && !match) {
          form.setError("confirmPassword", {
            type: "manual",
            message: "Passwords don't match",
          });
        } else {
          form.clearErrors("confirmPassword");
        }

        const ready = passwordValid && match && hasPassword && hasConfirm;
        setIsReady(ready);
      }, 400);
    });

    return () => subscription.unsubscribe();
  }, [form]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const values = form.getValues();

    setErrorMessage("");

    const completeUserData: ServerUserData = {
      password: values.password,
      email: userData.email,
      name: userData.name,
    };
    const result = await registerUser(completeUserData.email, completeUserData.password, completeUserData.name);

    if (result.success) {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      await signInWithCredentials(completeUserData.email, completeUserData.password);

      onOpenChange(false);
      onComplete();
    } else {
      setErrorMessage(result.error ?? "Something went wrong, please try again later.");
    }
  };

  const testCheck = () => {
    console.log("**********values:  ", form.getValues());
    console.log("is The form valid: ", form.formState.isValid);
  };

  return (
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

        <DialogTitle className="mb-4 text-center text-xl font-semibold">Create a password</DialogTitle>

        <Form {...form}>
          <form className="space-y-4">
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

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-400">Confirm Password</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        {...field}
                        type={showConfirmPassword ? "text" : "password"}
                        className="border-gray-600 bg-transparent text-white focus:border-blue-500"
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 h-auto -translate-y-1/2 p-1 text-gray-400 hover:text-white"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
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

            {errorMessage && <div className="text-center text-red-500">{errorMessage}</div>}

            <Button
              type="submit"
              onClick={handleSubmit}
              className="w-full rounded-full bg-white font-bold text-black hover:bg-gray-200"
              disabled={!isReady}
            >
              Create Account
            </Button>

            <Button
              type="button"
              className="w-full rounded-full bg-white font-bold text-black hover:bg-gray-200"
              onClick={testCheck}
            >
              Test Check
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePasswordDialog;
