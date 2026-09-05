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
  type TreeLinkDatum,
} from "react-d3-tree";

import type { FamilyNode, Language } from "../data/familyTree";
import { familyTreeRevision } from "../data/familyTree";
import { useLanguage } from "../i18n/LanguageContext";
import { filterFamilyNode, matchingIds } from "../utils/tree";

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
      childCount: String(node.children?.length ?? 0),
    },
    children: node.children?.map(toRd3),
  };
}

function Rd3CustomNode({
  rd3tProps,
  language,
  selectedId,
  matchIds,
  pathIds,
  compact,
  onSelect,
}: {
  rd3tProps: CustomNodeElementProps;
  language: Language;
  selectedId: string | null;
  matchIds: Set<string>;
  pathIds: Set<string>;
  compact: boolean;
  onSelect: (id: string) => void;
}): JSX.Element {
  const { ui } = useLanguage();
  const { nodeDatum, toggleNode } = rd3tProps;
  const a = nodeDatum.attributes ?? {};
  const id = String(a.id ?? "");
  const en = String(a.en ?? nodeDatum.name);
  const bn = String(a.bn ?? "");
  const gender = a.gender === "f" ? "f" : "m";
  const deceased = a.deceased === "yes" || a.deceased === true;
  const titleEn = String(a.titleEn ?? "");
  const titleBn = String(a.titleBn ?? "");
  const noteEn = String(a.noteEn ?? "");
  const noteBn = String(a.noteBn ?? "");
  const title = language === "bn" && titleBn ? titleBn : titleEn || undefined;
  const note = language === "bn" && noteBn ? noteBn : noteEn || undefined;
  const primary = language === "bn" && bn ? bn : en;
  const secondary = language === "bn" ? en : bn;
  const childCount = Number(a.childCount ?? 0);
  const hasChildren = childCount > 0 || Boolean(
    nodeDatum.children && nodeDatum.children.length > 0,
  );
  const collapsed = Boolean(nodeDatum.__rd3t?.collapsed);
  const selected = id === selectedId;
  const matched = matchIds.has(id);
  const onPath = pathIds.has(id);

  const cardHeight = compact
    ? note || title || childCount > 0
      ? 84
      : 68
    : note || title || childCount > 0
      ? 96
      : 78;
  const cardWidth = compact ? 176 : 232;

  return (
    <foreignObject
      width={cardWidth}
      height={cardHeight}
      x={compact ? -82 : -108}
      y={compact ? -34 : -39}
      className="rd3t-foreign"
    >
      <div
        className={[
          "rd3t-person",
          `rd3t-person--${gender}`,
          compact ? "is-compact" : "",
          selected ? "is-selected" : "",
          matched ? "is-match" : "",
          onPath && !selected ? "is-lineage" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        role="button"
        aria-pressed={selected}
        onClick={(event) => {
          event.stopPropagation();
          onSelect(id);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onSelect(id);
          }
        }}
        tabIndex={0}
      >
        <span className="rd3t-person__mark" aria-hidden="true" />
        <span className="rd3t-person__body">
          <strong className="rd3t-person__primary" lang={language}>
            {primary}
          </strong>
          {secondary ? (
            <span
              className="rd3t-person__secondary"
              lang={language === "bn" ? "en" : "bn"}
            >
              {secondary}
            </span>
          ) : null}
          {title ? (
            <small className="rd3t-person__title">{title}</small>
          ) : null}
          {note ? <span className="rd3t-person__note">{note}</span> : null}
          {childCount > 0 ? (
            <span className="rd3t-person__kids">
              {childCount} {ui.children}
            </span>
          ) : null}
        </span>
        {deceased ? (
          <span className="rd3t-person__dagger" title="Deceased">
            †
          </span>
        ) : null}
        {hasChildren ? (
          <button
            type="button"
            className="rd3t-person__branch"
            aria-label={collapsed ? ui.expandNode : ui.collapseNode}
            onClick={(event) => {
              event.stopPropagation();
              toggleNode();
            }}
          >
            {collapsed ? "+" : "–"}
          </button>
        ) : null}
      </div>
    </foreignObject>
  );
}

export function FamilyTreeView({
  root,
  selectedId,
  pathIds,
  onSelect,
}: {
  root: FamilyNode;
  selectedId: string | null;
  pathIds: Set<string>;
  onSelect: (id: string) => void;
}) {
  const { ui, language } = useLanguage();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 640 });
  const [search, setSearch] = useState("");
  const [depthKey, setDepthKey] = useState<"open" | "closed">("open");
  const [viewKey, setViewKey] = useState(0);

  const filteredRoot = useMemo(
    () => filterFamilyNode(root, search),
    [root, search],
  );

  const treeData = useMemo(() => {
    if (!filteredRoot) return null;
    return toRd3(filteredRoot);
  }, [filteredRoot]);

  const matchIds = useMemo(() => matchingIds(root, search), [root, search]);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      setDimensions({
        width: Math.max(280, Math.floor(rect.width)),
        height: Math.max(240, Math.floor(rect.height)),
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const compact = dimensions.width < 760;

  const renderNode = useCallback(
    (rd3tProps: CustomNodeElementProps) => (
      <Rd3CustomNode
        rd3tProps={rd3tProps}
        language={language}
        selectedId={selectedId}
        matchIds={matchIds}
        pathIds={pathIds}
        compact={compact}
        onSelect={onSelect}
      />
    ),
    [language, selectedId, matchIds, pathIds, compact, onSelect],
  );

  const pathClassFunc = useCallback(
    (link: TreeLinkDatum) => {
      const targetId = String(link.target.data.attributes?.id ?? "");
      return pathIds.has(targetId) ? "rd3t-link--lineage" : "";
    },
    [pathIds],
  );

  const initialDepth = depthKey === "closed" ? 0 : undefined;

  return (
    <section
      className="tree-panel"
      aria-labelledby="tree-heading"
    >
      {!treeData ? (
        <p className="tree-empty">{ui.noMatches}</p>
      ) : (
        <div ref={wrapRef} className={compact ? "tree-canvas is-compact" : "tree-canvas"}>
          <div className="tree-frame" aria-hidden="true" />
          <h2 id="tree-heading" className="sr-only">
            {ui.treeHeading}
          </h2>
          <div className="tree-toolbar">
            <button
              type="button"
              className="tree-toolbar__btn"
              onClick={() => setDepthKey("open")}
            >
              {ui.expandAll}
            </button>
            <button
              type="button"
              className="tree-toolbar__btn"
              onClick={() => setDepthKey("closed")}
            >
              {ui.collapseAll}
            </button>
            <button
              type="button"
              className="tree-toolbar__btn"
              onClick={() => setViewKey((value) => value + 1)}
            >
              {ui.resetView}
            </button>
            <label className="tree-toolbar__search">
              <span className="sr-only">{ui.searchLabel}</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={ui.searchPlaceholder}
                aria-label={ui.searchLabel}
              />
            </label>
          </div>
          <aside className="tree-legend" aria-label="Legend">
            <div>
              <span className="tree-legend__bar tree-legend__bar--m" />
              {ui.male}
            </div>
            <div>
              <span className="tree-legend__bar tree-legend__bar--f" />
              {ui.female}
            </div>
            <div>
              <span className="tree-legend__dagger">†</span>
              {ui.deceased}
            </div>
          </aside>
          <Tree
            key={`${language}-${depthKey}-${search}-${viewKey}-${familyTreeRevision}-${dimensions.width}x${dimensions.height}`}
            data={treeData}
            orientation="vertical"
            translate={{ x: dimensions.width / 2, y: compact ? 126 : 88 }}
            dimensions={dimensions}
            depthFactor={compact ? 108 : 128}
            nodeSize={{ x: compact ? 196 : 280, y: compact ? 118 : 150 }}
            separation={{
              siblings: compact ? 1.12 : 1.35,
              nonSiblings: compact ? 1.24 : 1.5,
            }}
            pathFunc="elbow"
            pathClassFunc={pathClassFunc}
            collapsible
            zoomable
            draggable
            scaleExtent={{ min: compact ? 0.05 : 0.08, max: 1.8 }}
            zoom={compact ? 0.46 : 0.72}
            renderCustomNodeElement={renderNode}
            hasInteractiveNodes
            initialDepth={initialDepth}
          />
          <p className="tree-hint">{compact ? ui.treeHintMobile : ui.treeHint}</p>
        </div>
      )}
    </section>
  );
}
