"use client";
import Link from "next/link";
import Logo from "@/components/layout/logo/logo";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";

export default function Home() {
  return (
    <div className="flex sm:h-screen flex-col items-center justify-center bg-bg text-white px-6 overflow-hidden">
      <h1 className="text-display-2 text-center mb-10">
        To get started, edit the{" "}
        <code className="rounded bg-white/10 px-2 py-1 font-mono">page.tsx</code>{" "}
        file.
      </h1>
      <div className="mb-4 text-left bg-card border border-outline rounded-lg p-4 max-w-md relative">
        <p className="text-(--on-bg-medium) text-body-4 mb-2">Quick start:</p>
        <pre className="text-(--green-4) font-mono text-sm whitespace-pre-wrap">docker compose --profile prod up -d --build</pre>
        <CopyButton
          text="docker compose --profile prod up -d --build"
          className="absolute top-2 right-2"
        />
      </div>
      <div className="mb-8 text-center text-(--on-bg-medium) text-body-4 max-w-md">
        <p className="mt-3">
          Check the <code className="rounded bg-white/10 px-2 py-1 font-mono">@/app/admin/</code>, <code className="rounded bg-white/10 px-2 py-1 font-mono">@/app/admin/</code>{" "}
          to see simple admin and user dashboard pages implementation (it has credentials check, so setup backend first)
        </p>
        <p className="mt-3">
          and <code className="rounded bg-white/10 px-2 py-1 font-mono">@/app/login/</code>{" "}
          to see simple form with client validation implementation
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="filled"
          size="large"
          asChild
          className="w-full sm:w-[200px]"
        >
          <a href="https://github.com/unidoka/amorfa" target="_blank" rel="noopener noreferrer">GitHub</a>
        </Button>
      </div>
      <div className="mt-14 flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <p className="text-(--on-bg-low)">You can use <span className="text-(--on-bg-medium)">repomix</span> and <span className="text-(--on-bg-medium)"><Link className="underline" href={"https://github.com/niyazgim/uniskilla"}>lazy-accurate skill</Link></span> to have agentic-like experience on any chat AI</p>
        <p className="text-(--on-bg-low) hidden sm:inline-block">|</p>
        <a
          href="https://unidoka.com/amorfa"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Made on Amorfa"
          className="mt-3 sm:m-0"
        >
          <img src="/made-on-amorfa-badge-v0.svg" alt="made-on-amorfa-badge-v0" />
        </a>
      </div>
    </div>
  );
}
