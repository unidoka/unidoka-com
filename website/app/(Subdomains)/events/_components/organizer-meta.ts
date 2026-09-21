// Fallback palette for organizers we haven't hand-tuned.
const FALLBACK = ["#20C997", "#F76707", "#7048E8", "#1098AD", "#D6336C", "#5C940D"];

const KNOWN: Record<string, string> = {
  "Росмолодёжь": "#336DFF",
  "Росконгресс": "#E8590C",
  "Унидока": "#0CA678",
  "Rovno.dev": "#845EF7",
};

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function colorForOrganizer(organizer: string): string {
  return KNOWN[organizer] ?? FALLBACK[hash(organizer) % FALLBACK.length];
}
