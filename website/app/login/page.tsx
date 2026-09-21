"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { $fetch } from "@/utils/fetch";
import { toast } from "sonner";
import { safeCookieStorage } from "@/utils/safe-cookie-storage";
import { useUser } from "@/entities/user/model/user-context";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { z } from "zod";

const loginSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export default function LoginPage() {
  const router = useRouter();
  const { setToken } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    // Client-side validation with Zod
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    const res = await $fetch("/api/v1/login/email", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: { "Content-Type": "application/json" },
      isToast: false,
    });

    // Handle 5xx (server errors)
    if (res.response && res.response.status >= 500) {
      toast.error("Server error. Please try again later.");
      setLoading(false);
      return;
    }

    // Handle non-OK responses (401, 403, 404, 422, etc.)
    if (!res.response?.ok) {
      // If 422 and detail is an array (FastAPI validation)
      if (res.response?.status === 422 && Array.isArray(res.json?.detail)) {
        const fieldErrors: Record<string, string> = {};
        res.json.detail.forEach((err: any) => {
          const loc = err.loc;
          if (loc && loc.length > 1) {
            const field = loc[1];
            fieldErrors[field] = err.msg;
          }
        });
        setErrors(fieldErrors);
      } else {
        // Non‑422 errors: show toast or message
        toast.error(res.json?.message || "Login failed");
      }
      setLoading(false);
      return;
    }

    // Success: store tokens and redirect
    safeCookieStorage.setItem("access_token", res.json.access_token);
    safeCookieStorage.setItem("refresh_token", res.json.refresh_token);
    setToken(res.json.access_token);
    toast.success("Welcome!");
    router.push("/");
  }

  return (
    <div className="flex mt-40 justify-center bg-background">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 p-6">
        <h1 className="text-display-2 mb-6">Login</h1>
        <Field>
          <FieldLabel>Email</FieldLabel>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!errors.email}
          />
          <FieldError errors={errors.email ? [{ message: errors.email }] : []} />
        </Field>
        <Field>
          <FieldLabel>Password</FieldLabel>
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!errors.password}
          />
          <FieldError errors={errors.password ? [{ message: errors.password }] : []} />
        </Field>
        <Button type="submit" disabled={loading} className="w-full mt-4">
          {loading ? "Logging in..." : "Login"}
        </Button>
      </form>
    </div>
  );
}