import { familyHistory } from "../data/history";
import { useLanguage } from "../i18n/LanguageContext";

export function FamilyHistoryCard() {
  const { language, ui } = useLanguage();
  const text = language === "bn" ? familyHistory.bn : familyHistory.en;

  return (
    <section className="family-history-card" aria-labelledby="family-history">
      <h2 id="family-history">{ui.familyHistoryHeading}</h2>
      <p lang={language}>{text}</p>
    </section>
  );
}
