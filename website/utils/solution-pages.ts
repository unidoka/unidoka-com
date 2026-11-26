/**
 * Site pages that a solution can be attached to. The value is the path
 * stored in `solutions.page` and matched by `/api/v1/solutions?page=`.
 */
export const SOLUTION_PAGE_OPTIONS = [
  { value: "/", label: "Главная (/)", description: "Основной лендинг" },
  { value: "/amorfa", label: "Amorfa (/amorfa)" },
  { value: "/vershiny_top", label: "Вершины (/vershiny_top)" },
  { value: "/events", label: "События (/events)" },
  { value: "/blog", label: "Журнал (/blog)" },
  { value: "/solutions", label: "Решения (/solutions)" },
] as const;

export const SOLUTION_PAGE_CUSTOM = "__custom__";
export const SOLUTION_PAGE_NONE = "__none__";
