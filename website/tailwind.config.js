/* LLM context: Typography utilities are generated from CSS design tokens.
   Every `.text-*` utility carries family, size, weight AND line-height, so
   call sites never need `font-*` classes — the token is the single source
   of truth for how a level of type looks.
   display-0 is the hero step (largest); heading/body keep steps 1–6. */
import plugin from 'tailwindcss/plugin';

const DISPLAY_STEPS = [0, 1, 2, 3, 4, 5, 6];
const STEPS = [1, 2, 3, 4, 5, 6];

function level(kind, n) {
  return {
    fontFamily: `var(--${kind}-${n}-font-face)`,
    fontSize: `var(--${kind}-${n}-size)`,
    fontWeight: `var(--${kind}-${n}-weight)`,
    lineHeight: `var(--${kind}-${n}-lh)`,
    // Tracking and vertical scale follow the same cascade:
    // per-level override → per-kind value → global default.
    letterSpacing: `var(--${kind}-${n}-tracking, var(--${kind}-tracking, var(--text-tracking, 0)))`,
    transform: `scaleY(var(--${kind}-${n}-scale-y, var(--${kind}-scale-y, var(--text-scale-y, 100%))))`,
    transformOrigin: 'left center',
  };
}

export default plugin(function ({ addUtilities }) {
  const utilities = {};

  for (const n of DISPLAY_STEPS) {
    utilities[`.text-display-${n}`] = level('display', n);
  }
  for (const n of STEPS) {
    utilities[`.text-heading-${n}`] = level('heading', n);
    utilities[`.text-body-${n}`] = level('body', n);
  }

  addUtilities(utilities);
});
