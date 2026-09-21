/* LLM context: Keeping JS config focused on simple font-scaling utilities while moving experimental CSS to globals.css for parser safety. */
import plugin from 'tailwindcss/plugin';

export default plugin(function ({ addUtilities }) {
  const newUtilities = {
    ...Array.from({ length: 6 }, (_, i) => i + 1).reduce((acc, n) => {
      acc[`.text-display-${n}`] = {
        fontFamily: `var(--display-${n}-font-face)`,
        fontSize: `var(--display-${n}-size)`,
        fontWeight: `var(--display-${n}-weight)`,
        lineHeight: `var(--display-${n}-lh)`,
      };
      acc[`.text-heading-${n}`] = {
        fontFamily: `var(--heading-${n}-font-face)`,
        fontSize: `var(--heading-${n}-size)`,
        fontWeight: `var(--heading-${n}-weight)`,
        lineHeight: `var(--heading-${n}-lh)`,
      };
      acc[`.text-body-${n}`] = {
        fontFamily: `var(--body-${n}-font-face)`,
        fontSize: `var(--body-${n}-size)`,
        fontWeight: `var(--body-${n}-weight)`,
        lineHeight: `var(--body-${n}-lh)`,
      };
      return acc;
    }, {}),
  };

  addUtilities(newUtilities);
});