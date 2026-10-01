import type { Language } from './translations';
export const orderTranslations: Record<Language, Record<string, string>> = {
  en: {
    'order.about_project': 'About the project',
    'order.agree': 'I consent to the processing of my personal data',
    'order.company': 'About the company',
    'order.contacts': 'Contacts',
    'order.files': 'Additional files (max 10MB)',
    'order.services_label': 'Service type',
    'order.submit': 'Submit Request',
    'order.subtitle': "Describe your task and we'll prepare an offer.",
    'order.title': 'Make an Order',
  },
  ru: {
    'order.about_project': 'О проекте',
    'order.agree': 'Согласен на обработку персональных данных',
    'order.company': 'О компании',
    'order.contacts': 'Контакты',
    'order.files': 'Доп. файлы (макс 10МБ)',
    'order.services_label': 'Тип услуги',
    'order.submit': 'Отправить заявку',
    'order.subtitle': 'Опишите вашу задачу и мы подготовим предложение.',
    'order.title': 'Сделать заказ',
  },
};
