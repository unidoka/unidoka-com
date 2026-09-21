"use client";
import * as React from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { cn } from "@/lib/utils";

interface PhoneInputProps extends Omit<React.ComponentProps<typeof PhoneInput>, "onChange"> {
  value: string;
  onChange: (value: string | undefined) => void;
  className?: string;
  error?: string;
}

export function PhoneInputField({ value, onChange, className, error, ...props }: PhoneInputProps) {
  return (
    <div className="w-full">
      <PhoneInput
        value={value}
        onChange={onChange}
        international
        defaultCountry="RU"
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-destructive focus-visible:ring-destructive",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
    </div>
  );
}
