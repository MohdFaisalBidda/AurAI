"use client";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BACKEND_URL } from "@/constants";

const isEmailValid = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export function Email({
  setEmail,
  setStep,
  email,
}: {
  setEmail: (email: string) => void;
  setStep: (step: string) => void;
  email: string;
}) {
  const router = useRouter();
  const [sendingRequest, setSendingRequest] = useState(false);

  const handleSendOTP = async () => {
    setSendingRequest(true);
    
    try {
      const response = await fetch(`${BACKEND_URL}/auth/initialize_sigin`, {
        method: "POST",
        body: JSON.stringify({ email }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        setStep("otp");
        toast.success(data.message);
        console.log(data,"data here in 200");
      } else {
        console.log(data,"data here outside 200");
        toast.error(data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to send OTP, please try again.");
    } finally {
      setSendingRequest(false);
    }
  };
  return (
    <div className="mx-auto max-h-screen max-w-6xl">
      <div className="flex h-full flex-col items-center justify-center gap-8 max-w-xl ">
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tighter text-center">
          Welcome to <span className="text-primary">AurAI</span>
        </h1>
        <div className="w-full flex flex-col gap-2">
          <Input
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            onKeyDown={(e) => {
              if (e.key === "Enter" && isEmailValid(email) && !sendingRequest) {
                handleSendOTP();
              }
            }}
          />
          <Button
            disabled={!isEmailValid(email) || sendingRequest}
            variant="accent"
            onClick={() => {
              if (isEmailValid(email) && !sendingRequest) {
                handleSendOTP();
              }
            }}
            className="w-full h-12"
          >
            Continue with Email
          </Button>
        </div>
        {/* <div className="text-muted-foreground text-sm">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="text-muted-foreground font-medium">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-muted-foreground font-medium">
            Privacy Policy
          </Link>
        </div> */}
      </div>
    </div>
  );
}