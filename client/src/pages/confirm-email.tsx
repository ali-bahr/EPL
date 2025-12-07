import { useState } from "react";
import { useLocation } from "wouter";
import { Trophy, Loader2, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const confirmEmailSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().min(1, "OTP is required"),
});

type ConfirmEmailInput = z.infer<typeof confirmEmailSchema>;

interface ConfirmEmailState {
  email: string;
}

export default function ConfirmEmail() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [resendCooldown, setResendCooldown] = useState(0);

  // Get email from location state
  const state = window.history.state?.usr as ConfirmEmailState | undefined;
  const email = state?.email || "";

  const form = useForm<ConfirmEmailInput>({
    resolver: zodResolver(confirmEmailSchema),
    defaultValues: {
      email: email,
      otp: "",
    },
  });

  const confirmMutation = useMutation({
    mutationFn: async (data: ConfirmEmailInput) => {
            console.log("confirm email")
      const response = await apiRequest("PATCH", "/Auth/confirm-email", data);
      return response.json();
    },
    onSuccess: (response) => {
      toast({
        title: "Email Verified!",
        description: "Your email has been verified successfully. You can now login.",
      });
      setLocation("/login");
    },
    onError: (error: Error) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid OTP. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resendMutation = useMutation({
    mutationFn: async (email: string) => {
    console.log("resend verification code")
      const response = await apiRequest("PATCH", "/Auth/resend-verification-code", { email });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Code Sent",
        description: "Verification code has been sent to your email.",
      });
      // Set cooldown for resend button
      setResendCooldown(60);
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Send Code",
        description: error.message || "Could not send verification code.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ConfirmEmailInput) => {
    confirmMutation.mutate(data);
  };

  const handleResendCode = () => {
    const emailValue = form.getValues("email");
    if (emailValue) {
      resendMutation.mutate(emailValue);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md overflow-visible">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-4">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="font-heading text-2xl">Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a verification code to your email. Enter it below to confirm your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        data-testid="input-email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verification Code *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter 6-digit code"
                        data-testid="input-otp"
                        maxLength={6}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={confirmMutation.isPending}
                data-testid="button-confirm"
              >
                {confirmMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Email"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={resendMutation.isPending || resendCooldown > 0}
            onClick={handleResendCode}
            data-testid="button-resend"
          >
            {resendMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : resendCooldown > 0 ? (
              `Resend Code (${resendCooldown}s)`
            ) : (
              "Resend Verification Code"
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Didn't receive the code? Check your spam folder or request a new code.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
