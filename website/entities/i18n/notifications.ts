/**
 * Notification topic catalogue.
 *
 * Mirrors ALLOWED_TOPICS in
 * backend/services/main-service/app/api/v1/notifications.py. Adding a
 * topic means adding it to both lists — the backend filters stored
 * topics against its set on read, so a topic the frontend offers but
 * the backend doesn't know about would be silently dropped.
 *
 * Topics are the *content* dimension of subscriptions. The *channel*
 * dimension (email vs telegram) is separate and orthogonal — a user
 * can subscribe to "events" over email but not telegram, etc.
 *
 * The following are intentionally absent because they aren't
 * subscriptions:
 *   • Transactional (password resets, order confirmations) — always sent.
 *   • Legal (terms/privacy changes) — always sent.
 *   • Order notifications — routed to root-configured recipients only.
 */
export const USER_TOPICS = [
  {
    key: "events",
    label: "События",
    description: "Форумы, хакатоны, митапы",
  },
  {
    key: "vershiny",
    label: "Вершины",
    description: "Обновления программы",
  },
  {
    key: "marketing",
    label: "Акции и скидки",
    description: "Промо, специальные предложения",
  },
  {
    key: "news",
    label: "Новости",
    description: "Блог и продуктовые обновления",
  },
  {
    key: "jobs",
    label: "Вакансии",
    description: "Открытые позиции и стажировки",
  },
] as const;

export type UserTopicKey = (typeof USER_TOPICS)[number]["key"];
