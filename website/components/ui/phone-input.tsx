"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Local phone input. No third-party library, no external CSS, no flag
 * SVGs fetched from a CDN. Displays RU numbers as `+7 (XXX) XXX-XX-XX`
 * while typing and emits E.164 (`+7XXXXXXXXXX`) to the parent.
 *
 * The backend validator (`app/api/v1/orders.py`, `phonenumbers` lib)
 * accepts any of the ALLOWED_REGIONS formats - we just need to send
 * clean E.164. Non-RU international inputs are passed through as
 * `+<digits>`, which the same backend validator handles.
 */
const RU_PREFIX = "+7";

function digitsOnly(s: string): string {
  return s.replace(/\D/g, "");
}

function formatRu(digits10: string): string {
  let out = "+7";
  const p1 = digits10.slice(0, 3);
  const p2 = digits10.slice(3, 6);
  const p3 = digits10.slice(6, 8);
  const p4 = digits10.slice(8, 10);
  if (p1) out += ` (${p1}`;
  if (p1.length === 3) out += ")";
  if (p2) out += ` ${p2}`;
  if (p3) out += `-${p3}`;
  if (p4) out += `-${p4}`;
  return out;
}

interface PhoneInputProps {
  value: string;
  onChange: (value: string | undefined) => void;
  className?: string;
  error?: string;
  placeholder?: string;
  name?: string;
  disabled?: boolean;
}

export function PhoneInputField({
  value,
  onChange,
  className,
  error,
  placeholder = "+7 (___) ___-__-__",
  name,
  disabled,
}: PhoneInputProps) {
  const [display, setDisplay] = React.useState("");

  // Keep display in sync when the parent resets the value to "".
  React.useEffect(() => {
    if (!value) {
      setDisplay("");
      return;
    }
    const d = digitsOnly(value);
    if (value.startsWith("+7") && d.length === 11) {
      setDisplay(formatRu(d.slice(1)));
    } else {
      setDisplay(value);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const d = digitsOnly(raw);
    if (!d) {
      setDisplay("");
      onChange(undefined);
      return;
    }
    // RU path: starts with 7 or 8, up to 11 digits total
    if (d.length <= 11 && (d.startsWith("7") || d.startsWith("8"))) {
      const ten = d.startsWith("8") ? "7" + d.slice(1) : d;
      setDisplay(formatRu(ten.slice(1)));
      onChange(RU_PREFIX + ten.slice(1));
    } else {
      // International: pass through as +<digits>
      setDisplay("+" + d);
      onChange("+" + d);
    }
  };

  return (
    <div className="w-full">
      <input
        type="tel"
        autoComplete="tel"
        disabled={disabled}
        value={display}
        onChange={handleChange}
        placeholder={placeholder}
        name={name}
        className={cn(
          "h-10 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none",
          "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 md:text-sm",
          "hover:border-(--primary-card)",
          error && "border-destructive focus-visible:ring-destructive/30",
          className,
        )}
      />
      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
    </div>
  );
}
