import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getFromBrowser } from '../utils';

import translationEn from './locales/en.json';
import translationDe from './locales/de.json';
import translationPt from './locales/pt.json';
import translationFr from './locales/fr.json';

const LOCALE_EN = { name: 'en', flag: 'fi fi-gb' };
const LOCALE_DE = { name: 'de', flag: 'fi fi-de' };
const LOCALE_PT = { name: 'pt', flag: 'fi fi-mz' };
const LOCALE_FR = { name: 'fr', flag: 'fi fi-fr' };
export const LOCALES = [LOCALE_EN, LOCALE_PT, LOCALE_DE, LOCALE_FR];

export const DEFAULT_LOCALE = LOCALE_EN.name;
export const USER_PREF_LOCALE = getFromBrowser('locale') ?? undefined;

const resources = {
  en: {
    translation: translationEn
  },
  de: {
    translation: translationDe
  },
  pt: {
    translation: translationPt
  },
  fr: {
    translation: translationFr
  }
};

i18n.use(initReactI18next).init({
  lng: USER_PREF_LOCALE,
  fallbackLng: DEFAULT_LOCALE,
  interpolation: {
    escapeValue: false
  },
  debug: true,
  resources
});

export const $t = (key: string, params = {}) => {
  return i18n.t(key, params);
};

export default i18n;
