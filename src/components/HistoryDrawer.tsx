import { useEffect } from "react";

import { familyHistory } from "../data/history";
import { useLanguage } from "../i18n/LanguageContext";

export function HistoryDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { language, ui } = useLanguage();
  const text = language === "bn" ? familyHistory.bn : familyHistory.en;

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="drawer-root">
      <button
        type="button"
        className="drawer-backdrop"
        aria-label={ui.close}
        onClick={onClose}
      />
      <aside
        className="history-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="family-history"
      >
        <div className="history-drawer__ornament" aria-hidden="true" />
        <div className="history-drawer__top">
          <p className="history-drawer__kicker">{ui.gotra}</p>
          <h2 id="family-history">{ui.familyHistoryHeading}</h2>
          <button type="button" className="icon-close" onClick={onClose}>
            {ui.close}
          </button>
        </div>
        <p className="history-drawer__gotra" lang={language}>
          {ui.gotraName}
        </p>
        <p className="history-drawer__body" lang={language}>
          {text}
        </p>
        <p className="history-drawer__note">{ui.deceasedLegend}</p>
        <p className="history-drawer__note">{ui.sourceNote}</p>
      </aside>
    </div>
  );
}
