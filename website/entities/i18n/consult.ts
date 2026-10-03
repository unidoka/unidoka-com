import type { Language } from './translations';

export const consultTranslations: Record<Language, Record<string, string>> = {
  en: {
    // Section copy
    'consult.eyebrow': 'Consultation',
    'consult.title_prefix': "Let's discuss",
    'consult.title_highlight': 'your project',
    'consult.title_suffix': '?',
    'consult.body':
      'Tell us about the task - we will propose a solution, estimate the timeline and cost. No fluff, within one business day.',
    'consult.bullet_1': 'Reply within one business day',
    'consult.bullet_2': 'Free and with no obligation',
    'consult.bullet_3': 'Then you decide',

    // Form labels
    'consult.form.name_label': 'Your name *',
    'consult.form.name_placeholder': 'Ivan',
    'consult.form.email_label': 'Email *',
    'consult.form.email_placeholder': 'you@example.com',
    'consult.form.phone_label': 'Phone *',
    'consult.form.telegram_label': 'Telegram (optional)',
    'consult.form.telegram_placeholder': '@username',
    'consult.form.description_label': 'Task description (optional)',
    'consult.form.description_placeholder': 'Short summary of what needs to be done',
    'consult.form.submit': 'Send request',
    'consult.form.submitting': 'Sending…',

    // Feedback
    'consult.form.success': 'Request sent! We will get back to you within one business day.',
    'consult.form.error_send': 'Could not send the request',
    'consult.form.error_connection': 'Connection error. Try again later.',

    // Validation
    'consult.form.error_name': 'Name must be at least 2 characters',
    'consult.form.error_email': 'Invalid email',
    'consult.form.error_phone': 'Please enter your phone number',
    'consult.form.error_agreement': 'You must agree to the data processing terms',

    // Consent text
    'consult.form.agreement_prefix': 'I give',
    'consult.form.agreement_consent': 'consent to the processing of personal data',
    'consult.form.agreement_middle': 'and confirm that I have read the',
    'consult.form.agreement_privacy': 'Privacy Policy',
    'consult.form.agreement_and': 'and the',
    'consult.form.agreement_terms': 'User Agreement',
  },
  ru: {
    'consult.eyebrow': 'Консультация',
    'consult.title_prefix': 'Обсудим',
    'consult.title_highlight': 'ваш проект',
    'consult.title_suffix': '?',
    'consult.body':
      'Расскажите о задаче - предложим решение, оценим сроки и стоимость. Без воды, в течение рабочего дня.',
    'consult.bullet_1': 'Ответ в течение рабочего дня',
    'consult.bullet_2': 'Бесплатно и без обязательств',
    'consult.bullet_3': 'Дальше - как решите',

    'consult.form.name_label': 'Ваше имя *',
    'consult.form.name_placeholder': 'Иван',
    'consult.form.email_label': 'Email *',
    'consult.form.email_placeholder': 'you@example.com',
    'consult.form.phone_label': 'Телефон *',
    'consult.form.telegram_label': 'Telegram (опционально)',
    'consult.form.telegram_placeholder': '@username',
    'consult.form.description_label': 'Описание задачи (опционально)',
    'consult.form.description_placeholder': 'Коротко о том, что нужно сделать',
    'consult.form.submit': 'Отправить заявку',
    'consult.form.submitting': 'Отправка…',

    'consult.form.success': 'Заявка отправлена! Свяжемся с вами в течение рабочего дня.',
    'consult.form.error_send': 'Не удалось отправить заявку',
    'consult.form.error_connection': 'Ошибка соединения. Попробуйте позже.',

    'consult.form.error_name': 'Имя должно быть не короче 2 символов',
    'consult.form.error_email': 'Некорректный email',
    'consult.form.error_phone': 'Укажите телефон',
    'consult.form.error_agreement': 'Необходимо согласие на обработку данных',

    'consult.form.agreement_prefix': 'Я даю',
    'consult.form.agreement_consent': 'согласие на обработку персональных данных',
    'consult.form.agreement_middle': 'и подтверждаю, что ознакомлен(а) с',
    'consult.form.agreement_privacy': 'Политикой конфиденциальности',
    'consult.form.agreement_and': 'и',
    'consult.form.agreement_terms': 'Пользовательским соглашением',
  },
};
