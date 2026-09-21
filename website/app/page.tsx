import HeroSection from "./_components/hero-section";

// Was: redirect to events.site.com/vershiny.
// Now: render the real site.com homepage. If you later want
// events to be the "landing" experience, do the redirect inside
// proxy.ts based on an explicit opt-in, not unconditionally.
export default function RootPage() {
  return (
    <main className="min-h-[100dvh]">
      <HeroSection />
    </main>
  );
}
