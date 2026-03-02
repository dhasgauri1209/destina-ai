import { createContext, useContext, useMemo, useState } from "react";

const I18nContext = createContext(null);

const dictionary = {
  en: {
    home: "Home",
    login: "Login",
    register: "Register",
    dashboard: "Dashboard",
    preferences: "Preferences",
    notifications: "Notifications",
    save: "Save",
    close: "Close",
    language: "Language"
  },
  es: {
    home: "Inicio",
    login: "Acceso",
    register: "Registro",
    dashboard: "Panel",
    preferences: "Preferencias",
    notifications: "Alertas",
    save: "Guardar",
    close: "Cerrar",
    language: "Idioma"
  },
  fr: {
    home: "Accueil",
    login: "Connexion",
    register: "Inscription",
    dashboard: "Tableau",
    preferences: "Préférences",
    notifications: "Notifications",
    save: "Enregistrer",
    close: "Fermer",
    language: "Langue"
  }
};

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("destina_lang") || "en");

  const value = useMemo(
    () => ({
      lang,
      setLang: (nextLang) => {
        localStorage.setItem("destina_lang", nextLang);
        setLang(nextLang);
      },
      t: (key) => dictionary[lang]?.[key] || dictionary.en[key] || key
    }),
    [lang]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider");
  }
  return context;
}
