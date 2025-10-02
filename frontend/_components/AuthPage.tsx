"use client";

import React, { useState } from "react";
import { Email } from "./Email";
import { Otp } from "./Otp";

function AuthPage() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState("email");
  return (
    <div className="flex bg-gradient-to-tl from-[#1E293B] to-[#111827] h-screen w-screen items-center justify-center">
      {step === "email" && (
        <Email setEmail={setEmail} setStep={setStep} email={email} />
      )}
      {step === "otp" && <Otp email={email} />}
    </div>
  );
}

export default AuthPage;
