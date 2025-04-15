"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { requestPasswordReset } from "@/app/actions/forgot-password.actions";
import { SCHEMAS } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

const formSchema = z.object({
  email: SCHEMAS.EMAIL,
});

type FormValues = {
  email?: string;
};

interface ResetPasswordProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
}

const ForgotPasswordDialog: React.FC<ResetPasswordProps> = ({ open, onOpenChange, onClose }) => {
  const [errorMessage, setErrorMessage] = useState("");
  const [isReady, setIsReady] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const subscription = form.watch((value) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        const emailValid = await form.trigger("email");
        const touched = form.formState.touchedFields;

        const hasEmail = !!value.email?.trim();
        const emailTouched = touched.email;

        if (emailTouched && !hasEmail) {
          form.setError("email", {
            type: "manual",
            message: "You need your email to reset password.",
          });
        } else {
          form.clearErrors("email");
        }

        const ready = emailValid && hasEmail;
        setIsReady(ready);
      }, 300);
    });

    return () => subscription.unsubscribe();
  }, [form]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    const email = form.getValues().email;

    if (email) {
      const result = await requestPasswordReset(email);

      try {
        if (result.error) {
          toast.error(result.error);
        } else if (result.success) {
          toast.success(result.success);
          onClose();
        }
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        }
      }
    }
  };

  const testCheck = () => {
    console.log("**********values:  ", form.getValues());
    console.log("is The form valid: ", form.formState.isValid);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          aria-describedby="dialog-reset-password-creation"
          onInteractOutside={(e) => e.preventDefault()}
          className="fixed left-1/2 top-1/2 z-50 max-w-md -translate-x-1/2 -translate-y-1/2 transform rounded-lg border border-gray-600 bg-black p-8 text-white"
        >
          <p id="dialog-reset-password-creation" className="sr-only">
            Reset password
          </p>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-2 rounded-full text-gray-400 hover:bg-gray-800 hover:text-white"
            onClick={() => {
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

          <DialogTitle className="mb-4 text-center text-xl font-semibold">Find your CivilDev account</DialogTitle>

          <Form {...form}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="mx-auto w-4/5 justify-center text-gray-400">
                    Enter the email associated with your account to change your password.
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="mx-auto w-4/5 justify-center border-gray-600 bg-transparent text-white focus:border-blue-500"
                    />
                  </FormControl>
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
              Reset
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
    </>
  );
};

export default ForgotPasswordDialog;
