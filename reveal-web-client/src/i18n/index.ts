import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationEn from './locales/en.json';

const LOCALE_EN = 'en';

export const LOCALES = [LOCALE_EN];

export const DEFAULT_LOCALE = LOCALE_EN;

const resources = {
  en: {
    translation: translationEn
  }
};

i18n.use(initReactI18next).init({
  lng: DEFAULT_LOCALE,
  fallbackLng: DEFAULT_LOCALE,
  interpolation: {
    escapeValue: false
  },
  resources
});

export const $t = (key: string, params = {}) => {
  return i18n.t(key, params);
};

export default i18n;
