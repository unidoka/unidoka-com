import type { EventSource } from "../_data/events";

export interface SourceMeta {
  label: string;
  /** Base hex — tinted at render time via color-mix. */
  color: string;
}

export const SOURCE_META: Record<EventSource, SourceMeta> = {
  rosmolodez: { label: "Росмолодёжь", color: "#336DFF" },
  roscongress: { label: "Росконгресс", color: "#E8590C" },
};
