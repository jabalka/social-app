"use client";

import { resetPassword } from "@/app/actions/reset-password.actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { PasswordFormValues, PasswordSchema } from "@/schemas/password";

interface ResetPasswordClientProps {
  token?: string | null;
}

const ResetPasswordClient: React.FC<ResetPasswordClientProps> = ({ token }) => {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(PasswordSchema),
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
    const { password } = form.getValues();

    if (!token) {
      toast.error("Invalid or expired reset link.");
      return;
    }

    try {
      const result = await resetPassword(token, password);

      if (result.success) {
        toast.success("Password reset successfully!");
        router.push("/dashboard");
      } else {
        toast.error(result.error || "Failed to reset password.");
      }
    } catch {
      toast.error("Something went wrong. Try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        aria-describedby="dialog-reset-password"
        onInteractOutside={(e) => e.preventDefault()}
        className="fixed left-1/2 top-1/2 z-50 max-w-md -translate-x-1/2 -translate-y-1/2 transform rounded-lg border border-gray-600 bg-black p-8 text-white"
      >
        <p id="dialog-reset-password" className="sr-only">
          Reset your password
        </p>
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-2 top-2 rounded-full text-gray-400 hover:bg-gray-800 hover:text-white"
          onClick={() => {
            setOpen(false);
            router.push("/");
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

        <DialogTitle className="mb-4 text-center text-xl font-semibold">Reset your password</DialogTitle>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-400">New Password</FormLabel>
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
                  {form.formState.touchedFields.password && <FormMessage />}
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
                  {form.formState.touchedFields.confirmPassword && <FormMessage />}
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full rounded-full bg-white font-bold text-black hover:bg-gray-200"
              disabled={!isReady}
            >
              Reset Password
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ResetPasswordClient;
