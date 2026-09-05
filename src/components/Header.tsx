import { familyStats } from "../utils/tree";
import type { FamilyNode } from "../data/familyTree";
import { useLanguage } from "../i18n/LanguageContext";

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

function Flourish() {
  return (
    <svg
      className="flourish"
      viewBox="0 0 160 16"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M2 8h52M106 8h52"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
      />
      <path
        d="M80 2.2c4.6 3.2 8.2 3.2 12.6 0-4.2 4.6-4.2 7.4 0 12-4.4-3.1-8-3.1-12.6 0 4.2-4.6 4.2-7.4 0-12Z"
        fill="currentColor"
      />
      <circle cx="62" cy="8" r="1.15" fill="currentColor" />
      <circle cx="98" cy="8" r="1.15" fill="currentColor" />
    </svg>
  );
}

export function Header({
  root,
  onOpenHistory,
}: {
  root: FamilyNode;
  onOpenHistory: () => void;
}) {
  const { ui, language } = useLanguage();
  const stats = familyStats(root);

  return (
    <header className="app-header">
      <div className="brand">
        <div className="seal" aria-hidden="true">
          দ
        </div>
        <div className="brand__text">
          <p className="brand__kicker">{ui.kicker}</p>
          <h1 className="brand__title" lang={language}>
            {ui.siteTitle}
          </h1>
          <p className="brand__subtitle" lang={language === "bn" ? "en" : "bn"}>
            {ui.subtitle}
          </p>
        </div>
      </div>

      <div className="header-center">
        <Flourish />
        <p className="header-stats">
          <span>
            {stats.members} {ui.membersStat}
          </span>
          <span className="header-stats__dot" aria-hidden="true">
            ·
          </span>
          <span>
            {stats.generations} {ui.generationsStat}
          </span>
          <span className="header-stats__dot" aria-hidden="true">
            ·
          </span>
          <span>
            {ui.gotra} {ui.gotraName}
          </span>
        </p>
      </div>

      <div className="header-actions">
        <button type="button" className="history-launch" onClick={onOpenHistory}>
          {ui.historyButton}
        </button>
        <LanguageToggle />
      </div>
    </header>
  );
}
