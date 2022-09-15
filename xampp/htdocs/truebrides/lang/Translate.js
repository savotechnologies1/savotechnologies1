import i18n from "i18n-js";

const translationGetters = {
  en: () => require("../lang/en.json"),
};

export const setI18nConfig = () => {
  let appLanguage = "en";
  i18n.translations = { [appLanguage]: translationGetters[appLanguage]() };
  i18n.locale = appLanguage;
};

export const translate = (key, config) => {
  if (!config) {
    config = {};
  }
  config.defaultValue = key;
  return i18n.t(key, config);
};
