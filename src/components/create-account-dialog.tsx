"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { cn } from "@/utils/cn.utils";
import { BaseUserData } from "./create-account-flow";

import Image from "next/image";
import { findUserByIdentifier } from "@/app/actions/common.actions";

const formSchema = z.object({
  name: z.string().min(1, "What's your name?"),
  email: z.string().email("Please enter a valid email.").optional(),
  // phone: z
  //   .string()
  //   .transform((val) => val.replace(/\s+/g, ""))
  //   .refine((val) => /^\d{11}$/.test(val), {
  //     message: "Please enter a valid 11-digit phone number.",
  //   })
  //   .optional(),
  dob: z.date({
    required_error: "Please select a date of birth.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNext: (data: BaseUserData) => void;
  onClose: () => void;
}

const CreateAccountDialog: React.FC<CreateAccountDialogProps> = ({ open, onOpenChange, onNext, onClose }) => {
  // const [isPhone, setIsPhone] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      // phone: "",
      dob: undefined,
    },
    mode: "onChange",
    criteriaMode: "all",
  });

  useEffect(() => {
    // form.unregister("phone");

    const subscription = form.watch(async (values, { name }) => {
      const touched = form.formState.touchedFields;
      const emailTouched = !!touched.email;
      // const phoneTouched = !!touched.phone;

      const hasEmail = !!values.email?.trim();
      // const hasPhone = !!values.phone?.trim();

      // form.clearErrors(["email", "phone"]);
      form.clearErrors(["email"]);

      // if ((emailTouched || phoneTouched) && !hasEmail && !hasPhone) {
      //   if (emailTouched) {
      //     form.setError("email", {
      //       type: "manual",
      //       message: "Either email or phone is required.",
      //     });
      //   }
      //   if (phoneTouched) {
      //     form.setError("phone", {
      //       type: "manual",
      //       message: "Either phone or email is required.",
      //     });
      //   }
      // }

      if (emailTouched && !hasEmail) {
        if (emailTouched) {
          form.setError("email", {
            type: "manual",
            message: "Email is required.",
          });
        }
      }

      if (name && values.dob && values.email) {
        const isValidName = !!name.trim();
        const isValidDob = !!values.dob;
        const isValidContact = !!values.email?.trim();

        const isReadyNow = isValidName && isValidDob && isValidContact;

        setIsReady(isReadyNow);
        setErrorMessage("");
      }

      const identifier = values.email;
      if (identifier) {
        const existingUser = await findUserByIdentifier(identifier);
        if (existingUser) {
          setErrorMessage(`User with this email already exists!`);
          setIsReady(false);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  const handleNext = async () => {
    const values = form.getValues();
    console.log("**********values:  ", values);
    const identifier = values.email;
    setErrorMessage("");

    if (identifier) {
      const existingUser = await findUserByIdentifier( identifier);
      if (existingUser) {
        setErrorMessage(`User with this ${values.email ? "email" : "phone"} already exists!`);
        return;
      }
    }

    onOpenChange(false);
    if (values.email) {
      onNext({
        name: values.name,
        email: values.email,
      });
    }
  };

  // const toggleInputType = () => {
  //   setIsPhone((prev) => {
  //     const next = !prev;
  //     if (next) {
  //       form.unregister("email");
  //     } else {
  //       form.setValue("email", "");
  //     }
  //     return next;
  //   });
  // };

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
          alt="CivDev Logo"
          width={80}
          height={80}
          className="absolute -right-4 -top-6 w-full max-w-[100px]"
          priority
        />

          <DialogTitle className="mb-2 text-center text-xl font-semibold">Create your account</DialogTitle>

          <Form {...form}>
            <form className="space-y-4">
              <FormField
                control={form.control}
                name="name"
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
              />

              {/* {isPhone ? (
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-400">Phone</FormLabel>
                      <FormControl>
                        <Input {...field} className="border-gray-600 bg-transparent text-white focus:border-blue-500" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : ( */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-400">Email</FormLabel>
                    <FormControl>
                      <Input {...field} className="border-gray-600 bg-transparent text-white focus:border-blue-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* <div className="text-right">
                <button type="button" onClick={toggleInputType} className="text-sm text-blue-500 hover:underline">
                  {isPhone ? "Use email instead" : "Use phone instead"}
                </button>
              </div> */}

              <div className="space-y-2">
                <h3 className="text-white">Date of birth</h3>
                <p className="text-sm text-gray-400">
                  This will not be shown publicly. Confirm your own age, even if this account is for a business, a pet,
                  or something else.
                </p>

                <FormField
                  control={form.control}
                  name="dob"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full border-gray-600 bg-transparent pl-3 text-left font-normal text-white",
                                !field.value && "text-gray-400",
                              )}
                            >
                              {field.value ? format(field.value, "MM/dd/yyyy") : <span>MM/DD/YYYY</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto border-gray-700 bg-gray-900 p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                            initialFocus
                            className="bg-gray-900 text-white"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {errorMessage && <div className="text-center text-red-500">{errorMessage}</div>}

              <Button
                type="button"
                className="w-full rounded-full bg-white font-bold text-black hover:bg-gray-200"
                disabled={!isReady}
                onClick={handleNext}
              >
                Next
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
    </>
  );
};

export default CreateAccountDialog;
