export type Language = "en" | "ru";
import { aboutTranslations } from './about';
import { blogTranslations } from './blog';
import { commonTranslations } from './common';
import { cookieTranslations } from './cookie';
import { editorTranslations } from './editor';
import { errorsTranslations } from './errors';
import { eventsTranslations } from './events';
import { footerTranslations } from './footer';
import { formsTranslations } from './forms';
import { headerTranslations } from './header';
import { heroTranslations } from './hero';
import { homeTranslations } from './home';
import { orderTranslations } from './order';
import { projectsTranslations } from './projects';
import { servicesTranslations } from './services';
const translations: Record<Language, Record<string, string>> = {
  en: { ...aboutTranslations.en, ...blogTranslations.en, ...commonTranslations.en, ...cookieTranslations.en, ...editorTranslations.en, ...errorsTranslations.en, ...eventsTranslations.en, ...footerTranslations.en, ...formsTranslations.en, ...headerTranslations.en, ...heroTranslations.en, ...homeTranslations.en, ...orderTranslations.en, ...projectsTranslations.en, ...servicesTranslations.en },
  ru: { ...aboutTranslations.ru, ...blogTranslations.ru, ...commonTranslations.ru, ...cookieTranslations.ru, ...editorTranslations.ru, ...errorsTranslations.ru, ...eventsTranslations.ru, ...footerTranslations.ru, ...formsTranslations.ru, ...headerTranslations.ru, ...heroTranslations.ru, ...homeTranslations.ru, ...orderTranslations.ru, ...projectsTranslations.ru, ...servicesTranslations.ru },
};
export { translations };
