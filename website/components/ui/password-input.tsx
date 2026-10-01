"use client";
import * as React from "react";
import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Input } from "./input";
export interface PasswordInputProps extends React.ComponentProps<"input"> {
  /**
   * "login" → autocomplete="current-password"
   * "signup" → autocomplete="new-password"
   * Password managers (Chrome, Bitwarden, 1Password) key off these.
   */
  mode?: "login" | "signup";
}
export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, mode = "login", ...props }, ref) => {
    const [show, setShow] = React.useState(false);
    return (
      <div className="relative">
        <Input
          ref={ref}
          type={show ? "text" : "password"}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          className={cn("pr-10", className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 size-7 rounded-md flex items-center justify-center text-(--on-bg-low) hover:text-(--on-bg-high) hover:bg-(--state-hover) transition-colors"
          aria-label={show ? "Скрыть пароль" : "Показать пароль"}
          tabIndex={-1}
        >
          {show ? (
            <EyeSlashIcon className="size-4" />
          ) : (
            <EyeIcon className="size-4" />
          )}
        </button>
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";
