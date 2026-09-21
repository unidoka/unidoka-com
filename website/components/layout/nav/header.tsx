"use client";
import Link from "next/link";
import Logo from "@/components/layout/logo/logo";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="border-b border-(--outline) bg-(--bg)">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/">
          <Logo className="!h-8" />
        </Link>
        <div className="flex items-center gap-2">
          <Button variant={'glass'} size="small" asChild>
            <Link href="https://unidoka.com/amorfa">Amorfa's home page</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
