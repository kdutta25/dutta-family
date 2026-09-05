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
  kicker: string;
  languageLabel: string;
  english: string;
  bengali: string;
  historyHeading: string;
  familyHistoryHeading: string;
  historyButton: string;
  close: string;
  treeHeading: string;
  deceasedLegend: string;
  sourceNote: string;
  expandAll: string;
  collapseAll: string;
  resetView: string;
  searchLabel: string;
  searchPlaceholder: string;
  treeHint: string;
  noMatches: string;
  male: string;
  female: string;
  deceased: string;
  generation: string;
  parent: string;
  children: string;
  noChildren: string;
  lineage: string;
  gotra: string;
  gotraName: string;
  membersStat: string;
  generationsStat: string;
  selectHint: string;
  expandNode: string;
  collapseNode: string;
  treeHintMobile: string;
  sheetExpand: string;
  sheetCollapse: string;
};

const UI: Record<Language, UiStrings> = {
  en: {
    siteTitle: "Dutta Family",
    subtitle: "দত্ত পরিবারের বংশবৃক্ষ",
    kicker: "A living copy of the family chart",
    languageLabel: "Language",
    english: "English",
    bengali: "বাংলা",
    historyHeading: "History",
    familyHistoryHeading: "Family History",
    historyButton: "History",
    close: "Close",
    treeHeading: "Dutta lineage",
    deceasedLegend:
      "† marks a person recorded as deceased. The original chart often uses ৺ before Bengali names.",
    sourceNote:
      "Names and relationships follow the family’s historical document. Spellings may vary across sources.",
    expandAll: "Expand",
    collapseAll: "Collapse",
    resetView: "Reset view",
    searchLabel: "Search",
    searchPlaceholder: "Find a name…",
    treeHint: "Drag to pan · Scroll to zoom · Click a name",
    treeHintMobile: "Pinch to zoom · Drag to move · Tap a name",
    sheetExpand: "Show details",
    sheetCollapse: "Hide details",
    noMatches: "No one in this lineage matches that search.",
    male: "Son / male",
    female: "Daughter / female",
    deceased: "Deceased",
    generation: "Generation",
    parent: "Parent",
    children: "Children",
    noChildren: "No descendants on this chart",
    lineage: "Line from the ancestor",
    gotra: "Gotra",
    gotraName: "Bharadwaj",
    membersStat: "members",
    generationsStat: "generations",
    selectHint: "Select a name to read their place in the lineage.",
    expandNode: "Show children",
    collapseNode: "Hide children",
  },
  bn: {
    siteTitle: "দত্ত পরিবার",
    subtitle: "The Dutta lineage",
    kicker: "ঐতিহাসিক বংশবৃক্ষের জীবন্ত অনুলিপি",
    languageLabel: "ভাষা",
    english: "EN",
    bengali: "বাংলা",
    historyHeading: "ইতিহাস",
    familyHistoryHeading: "পারিবারিক ইতিহাস",
    historyButton: "ইতিহাস",
    close: "বন্ধ",
    treeHeading: "দত্ত পরিবারের বংশবৃক্ষ",
    deceasedLegend:
      "† প্রয়াত চিহ্ন। মূল চার্টে প্রায়শই বাংলা নামের আগে ৺ ব্যবহৃত হয়।",
    sourceNote:
      "নাম ও সম্পর্ক ঐতিহাসিক নথি অনুসারে। বিভিন্ন উৎসে বানানের পার্থক্য থাকতে পারে।",
    expandAll: "সব খুলুন",
    collapseAll: "সব বন্ধ",
    resetView: "মূল দৃশ্য",
    searchLabel: "খোঁজ",
    searchPlaceholder: "নাম খুঁজুন…",
    treeHint: "টেনে সরান · স্ক্রল করে জুম · নামে ক্লিক করুন",
    treeHintMobile: "পিঞ্চ করে জুম · টেনে সরান · নামে ট্যাপ করুন",
    sheetExpand: "বিস্তারিত দেখুন",
    sheetCollapse: "বিস্তারিত লুকান",
    noMatches: "এই খোঁজার সাথে কেউ মেলে না।",
    male: "পুত্র / পুরুষ",
    female: "কন্যা / মহিলা",
    deceased: "প্রয়াত",
    generation: "প্রজন্ম",
    parent: "পিতা/মাতা",
    children: "সন্তান",
    noChildren: "এই চার্টে বংশধর নেই",
    lineage: "আদি পুরুষ থেকে ধারা",
    gotra: "গোত্র",
    gotraName: "ভরদ্বাজ",
    membersStat: "সদস্য",
    generationsStat: "প্রজন্ম",
    selectHint: "বংশলতিকা দেখতে একটি নাম বেছে নিন।",
    expandNode: "সন্তান দেখান",
    collapseNode: "সন্তান লুকান",
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
