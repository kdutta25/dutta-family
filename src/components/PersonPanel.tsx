import { useEffect, useState } from "react";

import type { FamilyNode } from "../data/familyTree";
import { useLanguage } from "../i18n/LanguageContext";
import { useIsPhone } from "../utils/media";

function displayName(node: FamilyNode, language: "en" | "bn") {
  return language === "bn" && node.bn ? node.bn : node.en;
}

function secondaryName(node: FamilyNode, language: "en" | "bn") {
  if (language === "bn") return node.en;
  return node.bn;
}

export function PersonPanel({
  person,
  parent,
  generation,
  lineage,
  onSelect,
  onClose,
}: {
  person: FamilyNode;
  parent: FamilyNode | null;
  generation: number;
  lineage: FamilyNode[];
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const { language, ui, t } = useLanguage();
  const title = person.title
    ? language === "bn" && person.title.bn
      ? person.title.bn
      : person.title.en
    : undefined;
  const note = person.note
    ? language === "bn" && person.note.bn
      ? person.note.bn
      : person.note.en
    : undefined;
  const children = person.children ?? [];
  const gender = person.gender === "f" ? "f" : "m";
  const isPhone = useIsPhone();
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setExpanded(false);
  }, [person.id]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const collapsed = isPhone && !expanded;

  return (
    <aside
      className={[
        "person-panel",
        `person-panel--${gender}`,
        collapsed ? "is-collapsed" : "",
        isPhone ? "is-sheet" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-labelledby="person-panel-name"
    >
      {isPhone ? (
        <button
          type="button"
          className="person-panel__handle"
          aria-expanded={expanded}
          aria-label={expanded ? ui.sheetCollapse : ui.sheetExpand}
          onClick={() => setExpanded((open) => !open)}
        >
          <span className="person-panel__grip" aria-hidden="true" />
        </button>
      ) : null}

      <button type="button" className="icon-close" onClick={onClose}>
        {ui.close}
      </button>

      <p className="person-panel__gen">
        {ui.generation} {generation}
      </p>
      <h2
        id="person-panel-name"
        lang={language}
        onClick={isPhone ? () => setExpanded((open) => !open) : undefined}
      >
        {displayName(person, language)}
      </h2>
      {secondaryName(person, language) ? (
        <p
          className="person-panel__other"
          lang={language === "bn" ? "en" : "bn"}
        >
          {secondaryName(person, language)}
        </p>
      ) : null}
      {collapsed ? (
        <p className="person-panel__peek-hint">{ui.sheetExpand}</p>
      ) : null}

      <div className="person-panel__meta">
        <span className={`gender-chip gender-chip--${gender}`}>
          {gender === "m" ? ui.male : ui.female}
        </span>
        {person.deceased ? (
          <span className="gender-chip gender-chip--deceased">
            † {ui.deceased}
          </span>
        ) : null}
      </div>

      {title ? <p className="person-panel__title">{title}</p> : null}
      {note ? <p className="person-panel__note">{note}</p> : null}

      {parent ? (
        <section className="person-panel__block">
          <h3>{ui.parent}</h3>
          <button type="button" onClick={() => onSelect(parent.id)}>
            {t({ en: parent.en, bn: parent.bn ?? parent.en })}
          </button>
        </section>
      ) : null}

      <section className="person-panel__block">
        <h3>
          {ui.children}
          {children.length ? ` (${children.length})` : ""}
        </h3>
        {children.length ? (
          <ol className="person-panel__children">
            {children.map((child, index) => (
              <li key={child.id}>
                <button type="button" onClick={() => onSelect(child.id)}>
                  <span className="person-panel__num">{index + 1}</span>
                  {t({ en: child.en, bn: child.bn ?? child.en })}
                </button>
              </li>
            ))}
          </ol>
        ) : (
          <p className="person-panel__empty">{ui.noChildren}</p>
        )}
      </section>

      {lineage.length > 1 ? (
        <section className="person-panel__block">
          <h3>{ui.lineage}</h3>
          <ol className="person-panel__lineage">
            {lineage.map((node, index) => (
              <li key={node.id}>
                {index > 0 ? (
                  <span className="person-panel__arrow" aria-hidden="true">
                    →
                  </span>
                ) : null}
                <button
                  type="button"
                  className={node.id === person.id ? "is-current" : ""}
                  onClick={() => onSelect(node.id)}
                >
                  {t({ en: node.en, bn: node.bn ?? node.en })}
                </button>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </aside>
  );
}
