"use client";

import { ArrowLeft, ArrowLeftCircle, MoveLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { Button } from "./ui/button";

function GoBack() {
  const navigate = useRouter();

  const handleGoBack = () => {
    navigate.back();
  };

  return (
    <div className="absolute top-4 left-4">
      <Button
        asChild
        variant="ghost"
        className="font-semibold"
        onClick={handleGoBack}
      >
        <div className="">
          {/* Icon for all screen sizes */}
          <ArrowLeft className="w-6 h-6 md:w-4 md:h-4 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />

          {/* Text that hides on small screens */}
          <span className="hidden sm:inline-block font-medium text-sm group-hover:translate-x-[-2px] transition-transform duration-200">
            Go Back
          </span>
        </div>
      </Button>
    </div>
  );
}

export default GoBack;
