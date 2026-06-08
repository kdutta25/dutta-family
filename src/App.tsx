import { familyTreeRoot } from "./data/familyTree";
import { FamilyHistoryCard } from "./components/FamilyHistoryCard";
import { FamilyTreeView } from "./components/FamilyTreeView";
import { useLanguage } from "./i18n/LanguageContext";

function LanguageToggle() {
  const { language, setLanguage, ui } = useLanguage();
  return (
    <div className="lang-toggle" role="group" aria-label={ui.languageLabel}>
      <button
        type="button"
        className={language === "en" ? "is-active" : ""}
        onClick={() => setLanguage("en")}
      >
        {ui.english}
      </button>
      <button
        type="button"
        className={language === "bn" ? "is-active" : ""}
        onClick={() => setLanguage("bn")}
      >
        {ui.bengali}
      </button>
    </div>
  );
}

export default function App() {
  const { ui } = useLanguage();
  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <div>
            <h1 className="brand__title">{ui.siteTitle}</h1>
            <p className="brand__subtitle">{ui.subtitle}</p>
          </div>
        </div>
        <LanguageToggle />
      </header>
      <main className="tree-shell">
        <FamilyTreeView root={familyTreeRoot} />
        <FamilyHistoryCard />
      </main>
    </div>
  );
}
