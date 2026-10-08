/**
 * Metadata for every custom solution page that can be selected from the
 * admin editor. Add a new entry here whenever you create a new custom
 * page component in `solution-custom-pages.tsx`.
 *
 * The `key` is what gets stored in the DB `solutions.custom_page` column.
 * The `label` is what admins see in the select box.
 */
export interface CustomSolutionPageMeta {
  key: string;
  label: string;
  description?: string;
}

export const SOLUTION_CUSTOM_PAGES_META: CustomSolutionPageMeta[] = [
  {
    key: "nash-dev",
    label: "Nash Dev (кастомная)",
    description: "Лендинг проекта Nash Dev",
  },
  // Add more entries here as you build more custom pages:
  // { key: "my-page", label: "My Page", description: "..." },
];
