// Deprecated — kept so older imports don't break. Use organizer-meta.
import { colorForOrganizer } from "./organizer-meta";
import type { EventItem } from "../_data/events";

export const SOURCE_META: Record<
  string,
  { label: string; color: string }
> = new Proxy(
  {},
  {
    get: (_t, key: string) => ({
      label: key,
      color: colorForOrganizer(key),
    }),
  }
);

export { colorForOrganizer };
