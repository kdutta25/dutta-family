import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Language } from "../data/familyTree";

const STORAGE_KEY = "dutta-family-lang";

type UiStrings = {
  siteTitle: string;
  subtitle: string;
  languageLabel: string;
  english: string;
  bengali: string;
  historyHeading: string;
  familyHistoryHeading: string;
  treeHeading: string;
  deceasedLegend: string;
  sourceNote: string;
  expandAll: string;
  collapseAll: string;
  searchLabel: string;
  searchPlaceholder: string;
  treeHint: string;
  noMatches: string;
  male: string;
  female: string;
  deceased: string;
};

const UI: Record<Language, UiStrings> = {
  en: {
    siteTitle: "Dutta Family",
    subtitle: "দত্ত পরিবারের বংশবৃক্ষ",
    languageLabel: "Language",
    english: "English",
    bengali: "Bengali",
    historyHeading: "History",
    familyHistoryHeading: "Family History",
    treeHeading: "Dutta Family",
    deceasedLegend:
      "† indicates deceased on this page. The original chart often uses ৺ before Bengali names.",
    sourceNote:
      "Names and relationships follow the family’s historical document. Spelling variants may exist across sources.",
    expandAll: "Expand All",
    collapseAll: "Collapse All",
    searchLabel: "Search",
    searchPlaceholder: "Search person...",
    treeHint: "All individuals shown are marked as deceased (†)",
    noMatches: "No people match that search.",
    male: "Male",
    female: "Female",
    deceased: "Deceased",
  },
  bn: {
    siteTitle: "দত্ত পরিবার",
    subtitle: "Dutta Family",
    languageLabel: "ভাষা",
    english: "ইংরেজি",
    bengali: "বাংলা",
    historyHeading: "ইতিহাস",
    familyHistoryHeading: "পারিবারিক ইতিহাস",
    treeHeading: "দত্ত পরিবার বংশবৃক্ষ",
    deceasedLegend:
      "† এখানে প্রয়াত চিহ্ন। মূল চার্টে প্রায়শই বাংলা নামের আগে ৺।",
    sourceNote:
      "নাম ও সম্পর্ক ঐতিহাসিক নথি অনুসারে। বিভিন্ন উৎসে বানানের পার্থক্য থাকতে পারে।",
    expandAll: "সব খুলুন",
    collapseAll: "সব বন্ধ",
    searchLabel: "খোঁজ",
    searchPlaceholder: "ব্যক্তির নাম খুঁজুন...",
    treeHint: "প্রদর্শিত সকল ব্যক্তিকে প্রয়াত (†) হিসাবে চিহ্নিত করা হয়েছে",
    noMatches: "এই খোঁজার সাথে কেউ মেলে না।",
    male: "পুরুষ",
    female: "মহিলা",
    deceased: "প্রয়াত",
  },
};

type LanguageContextValue = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (node: { en: string; bn: string }) => string;
  ui: UiStrings;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readStoredLanguage(): Language {
  if (typeof window === "undefined") return "en";
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw === "bn" || raw === "en" ? raw : "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(readStoredLanguage);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language === "bn" ? "bn" : "en";
  }, [language]);

  const t = useCallback(
    (node: { en: string; bn: string }) => (language === "bn" ? node.bn : node.en),
    [language],
  );

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      t,
      ui: UI[language],
    }),
    [language, setLanguage, t],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
