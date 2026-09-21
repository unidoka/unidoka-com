import Link from "next/link";

export function MadeOnAmorfa() {
  return (
    <a
      href="https://unidoka.com/amorfa"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Made on Amorfa — visit unidoka.com/amorfa"
      className="inline-flex items-center gap-2 rounded-full border border-(--outline) bg-(--card) px-4 py-2 text-sm font-medium text-(--on-bg-high) transition-colors hover:border-(--primary)"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="7" cy="7" r="6" fill="var(--primary)" />
        <path d="M7 1L10 5H4L7 1Z" fill="white" />
      </svg>
      <span>Made on Amorfa</span>
    </a>
  );
}
