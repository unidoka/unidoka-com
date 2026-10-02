"use client";

import { useRouter } from "next/navigation";
import { useUser } from "@/entities/user/model/user-context";

/**
 * Thin wrapper that navigates to /events/submit. Auth is enforced by the
 * target page (CheckUser), so an unauthenticated click lands on /login and
 * bounces back to the submission form.
 *
 * Kept as a component so existing call sites — footer, header, anywhere that
 * imports <AddEventDialog> — keep working without edits.
 */
export function AddEventDialog({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading } = useUser();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLoading) return;
    if (!user) {
      router.push(`/login?next=${encodeURIComponent("/events/submit")}`);
    } else {
      router.push("/events/submit");
    }
  };

  return (
    <span onClick={handleClick} className="contents cursor-pointer">
      {children}
    </span>
  );
}
