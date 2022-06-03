import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getFromBrowser } from '../utils';

import translationEn from './locales/en.json';
import translationDe from './locales/de.json';

const LOCALE_EN = {name: 'en', flag: 'fi fi-gb'};
const LOCALE_DE = {name: 'de', flag: 'fi fi-de'};

export const LOCALES = [LOCALE_EN, LOCALE_DE];

export const DEFAULT_LOCALE = LOCALE_EN.name;
export const USER_PREF_LOCALE = getFromBrowser('locale') ?? undefined;

const resources = {
  en: {
    translation: translationEn
  },
  de: {
    translation: translationDe
  }
};

i18n.use(initReactI18next).init({
  lng: USER_PREF_LOCALE,
  fallbackLng: DEFAULT_LOCALE,
  interpolation: {
    escapeValue: false
  },
  react: {
    useSuspense: false
  },
  resources
});

export const $t = (key: string, params = {}) => {
  return i18n.t(key, params);
};

export default i18n;
