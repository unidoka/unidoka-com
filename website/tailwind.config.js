/* LLM context: Typography utilities are generated from CSS design tokens.
   Every `.text-*` utility carries family, size, weight AND line-height, so
   call sites never need `font-*` classes — the token is the single source
   of truth for how a level of type looks.
   display-0 is the hero step (largest); heading/body keep steps 1–6. */
import plugin from 'tailwindcss/plugin';

const DISPLAY_STEPS = [0, 1, 2, 3, 4, 5, 6];
const STEPS = [1, 2, 3, 4, 5, 6];

function level(kind, n) {
  const utility = {
    fontFamily: `var(--${kind}-${n}-font-face)`,
    fontSize: `var(--${kind}-${n}-size)`,
    fontWeight: `var(--${kind}-${n}-weight)`,
    lineHeight: `var(--${kind}-${n}-lh)`,
    // Tracking follows the same cascade everywhere:
    // per-level override → per-kind value → global default.
    letterSpacing: `var(--${kind}-${n}-tracking, var(--${kind}-tracking, var(--text-tracking, 0)))`,
  };

  // Vertical scale is display-only. Applying even a 100% transform to
  // body/heading utilities creates stacking contexts and breaks margin
  // collapsing, which shows up as phantom space around paragraphs.
  if (kind === 'display') {
    utility.scale = `1 var(--${kind}-${n}-scale-y, var(--display-scale-y, var(--text-scale-y, 100%)))`;
    utility.transformOrigin = 'left center';
    // Display numerals stay on Georgia's old-style figures.
    utility.fontVariantNumeric = 'oldstyle-nums';
    utility.fontFeatureSettings = '"onum" 1';
  }

  return utility;
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
