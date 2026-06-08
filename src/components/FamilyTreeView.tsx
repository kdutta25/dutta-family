import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type JSX,
} from "react";
import Tree, {
  type CustomNodeElementProps,
  type RawNodeDatum,
} from "react-d3-tree";

import type { FamilyNode } from "../data/familyTree";
import { useLanguage } from "../i18n/LanguageContext";

function toRd3(node: FamilyNode): RawNodeDatum {
  return {
    name: node.en,
    attributes: {
      id: node.id,
      en: node.en,
      bn: node.bn ?? "",
      gender: node.gender ?? "m",
      deceased: node.deceased ? "yes" : "no",
      titleEn: node.title?.en ?? "",
      titleBn: node.title?.bn ?? "",
      noteEn: node.note?.en ?? "",
      noteBn: node.note?.bn ?? "",
    },
    children: node.children?.map(toRd3),
  };
}

function filterFamilyNode(node: FamilyNode, q: string): FamilyNode | null {
  const needle = q.trim().toLowerCase();
  if (!needle) return node;

  const selfMatch =
    node.en.toLowerCase().includes(needle) ||
    (node.bn?.toLowerCase().includes(needle) ?? false);

  const kids = (node.children ?? [])
    .map((c) => filterFamilyNode(c, q))
    .filter((x): x is FamilyNode => x !== null);

  if (selfMatch || kids.length) {
    return { ...node, children: kids.length ? kids : undefined };
  }
  return null;
}

function Rd3CustomNode({
  rd3tProps,
  language,
}: {
  rd3tProps: CustomNodeElementProps;
  language: "en" | "bn";
}): JSX.Element {
  const { nodeDatum, toggleNode } = rd3tProps;
  const a = nodeDatum.attributes ?? {};
  const en = String(a.en ?? nodeDatum.name);
  const bn = String(a.bn ?? "");
  const gender = a.gender === "f" ? "f" : "m";
  const deceased = a.deceased === "yes" || a.deceased === true;
  const titleEn = String(a.titleEn ?? "");
  const titleBn = String(a.titleBn ?? "");
  const noteEn = String(a.noteEn ?? "");
  const noteBn = String(a.noteBn ?? "");
  const title =
    language === "bn" && titleBn ? titleBn : titleEn || undefined;
  const note =
    language === "bn" && noteBn ? noteBn : noteEn || undefined;
  const hasChildren = Boolean(
    nodeDatum.children && nodeDatum.children.length > 0,
  );

  return (
    <foreignObject
      width={190}
      height={hasChildren ? 72 : 66}
      x={-95}
      y={-33}
      className="rd3t-foreign"
    >
      <div
        className={`rd3t-person rd3t-person--${gender}`}
        role="group"
        onClick={(e) => {
          e.stopPropagation();
          toggleNode();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleNode();
          }
        }}
        tabIndex={0}
      >
        <span className="rd3t-person__gender" aria-hidden="true">
          {gender === "m" ? "♂" : "♀"}
        </span>
        <span className="rd3t-person__body">
          <strong className="rd3t-person__en">{en}</strong>
          {bn ? (
            <span className="rd3t-person__bn" lang="bn">
              {bn}
            </span>
          ) : null}
          {title ? (
            <small className="rd3t-person__title">{title}</small>
          ) : null}
          {note ? <span className="rd3t-person__note">{note}</span> : null}
        </span>
        {deceased ? (
          <span className="rd3t-person__dagger" title="Deceased">
            †
          </span>
        ) : null}
      </div>
    </foreignObject>
  );
}

export function FamilyTreeView({ root }: { root: FamilyNode }) {
  const { ui, language } = useLanguage();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 640 });
  const [search, setSearch] = useState("");
  const [depthKey, setDepthKey] = useState<"open" | "closed">("open");

  const filteredRoot = useMemo(
    () => filterFamilyNode(root, search),
    [root, search],
  );

  const treeData = useMemo(() => {
    if (!filteredRoot) return null;
    return toRd3(filteredRoot);
  }, [filteredRoot]);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setDimensions({
        width: Math.max(360, Math.floor(r.width)),
        height: Math.max(480, Math.floor(r.height)),
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const renderNode = useCallback(
    (rd3tProps: CustomNodeElementProps) => (
      <Rd3CustomNode rd3tProps={rd3tProps} language={language} />
    ),
    [language],
  );

  const initialDepth = depthKey === "closed" ? 0 : undefined;

  return (
    <section
      className="tree-panel rd3t-tree-panel"
      aria-labelledby="tree-heading"
    >
      {!treeData ? (
        <p className="rd3t-tree-empty">{ui.noMatches}</p>
      ) : (
        <div ref={wrapRef} className="rd3t-tree-wrap">
          <h2 id="tree-heading" className="sr-only">
            {ui.treeHeading}
          </h2>
          <div className="rd3t-toolbar">
            <button
              type="button"
              className="rd3t-toolbar__btn"
              onClick={() => setDepthKey("open")}
            >
              <span aria-hidden="true">↕</span>
              {ui.expandAll}
            </button>
            <button
              type="button"
              className="rd3t-toolbar__btn"
              onClick={() => setDepthKey("closed")}
            >
              <span aria-hidden="true">◇</span>
              {ui.collapseAll}
            </button>
            <label className="rd3t-toolbar__search">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={ui.searchPlaceholder}
                aria-label={ui.searchLabel}
              />
              <span className="rd3t-toolbar__search-icon" aria-hidden="true">
                ⌕
              </span>
            </label>
          </div>
          <aside className="rd3t-legend" aria-label="Legend">
            <div>
              <span className="rd3t-legend__dot rd3t-legend__dot--m" />
              {ui.male}
            </div>
            <div>
              <span className="rd3t-legend__dot rd3t-legend__dot--f" />
              {ui.female}
            </div>
            <div>
              <span className="rd3t-legend__dagger">†</span>
              {ui.deceased}
            </div>
          </aside>
          <Tree
            key={`${language}-${depthKey}-${search}-${dimensions.width}x${dimensions.height}`}
            data={treeData}
            orientation="vertical"
            translate={{ x: dimensions.width / 2, y: 62 }}
            dimensions={dimensions}
            depthFactor={112}
            nodeSize={{ x: 210, y: 124 }}
            separation={{ siblings: 1, nonSiblings: 1.2 }}
            pathFunc="elbow"
            collapsible
            zoomable
            draggable
            scaleExtent={{ min: 0.08, max: 1.75 }}
            zoom={0.8}
            renderCustomNodeElement={renderNode}
            hasInteractiveNodes
            initialDepth={initialDepth}
          />
          <p className="rd3t-tree-hint">{ui.treeHint}</p>
        </div>
      )}
    </section>
  );
}
