import { useMemo, useState } from "react";

import { familyTreeRoot } from "./data/familyTree";
import { Header } from "./components/Header";
import { HistoryDrawer } from "./components/HistoryDrawer";
import { FamilyTreeView } from "./components/FamilyTreeView";
import { PersonPanel } from "./components/PersonPanel";
import { useLanguage } from "./i18n/LanguageContext";
import { useIsPhone } from "./utils/media";
import { pathTo } from "./utils/tree";

function SelectHint() {
  const { ui } = useLanguage();
  return <p className="select-hint">{ui.selectHint}</p>;
}

export default function App() {
  const [selectedId, setSelectedId] = useState<string | null>(() =>
    typeof window !== "undefined" && window.matchMedia("(max-width: 760px)").matches
      ? null
      : familyTreeRoot.id,
  );
  const [historyOpen, setHistoryOpen] = useState(false);
  const isPhone = useIsPhone();

  const lineage = useMemo(
    () => (selectedId ? pathTo(familyTreeRoot, selectedId) : null),
    [selectedId],
  );
  const person = lineage?.at(-1) ?? null;
  const parent = lineage && lineage.length > 1 ? lineage[lineage.length - 2] : null;
  const pathIds = useMemo(
    () => new Set((lineage ?? []).map((node) => node.id)),
    [lineage],
  );

  return (
    <div className="app">
      <Header
        root={familyTreeRoot}
        onOpenHistory={() => setHistoryOpen(true)}
      />
      <main className={person && isPhone ? "stage has-sheet" : "stage"}>
        <FamilyTreeView
          root={familyTreeRoot}
          selectedId={selectedId}
          pathIds={pathIds}
          onSelect={setSelectedId}
        />
        {person ? (
          <PersonPanel
            person={person}
            parent={parent ?? null}
            generation={lineage?.length ?? 1}
            lineage={lineage ?? [person]}
            onSelect={setSelectedId}
            onClose={() => setSelectedId(null)}
          />
        ) : (
          <SelectHint />
        )}
      </main>
      <HistoryDrawer
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
      />
    </div>
  );
}
