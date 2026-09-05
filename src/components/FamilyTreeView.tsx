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

function ellipsize(value: string, max: number) {
  const chars = Array.from(value);
  if (chars.length <= max) return value;
  return `${chars.slice(0, Math.max(1, max - 1)).join("")}…`;
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

  const cardClass = [
    "rd3t-person",
    `rd3t-person--${gender}`,
    compact ? "is-compact" : "",
    selected ? "is-selected" : "",
    matched ? "is-match" : "",
    onPath && !selected ? "is-lineage" : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (compact) {
    const width = 220;
    const height = secondary ? 82 : 68;
    const x = -width / 2;
    const y = -height / 2;
    return (
      <g
        className={`rd3t-svg-card ${cardClass}`}
        role="button"
        aria-pressed={selected}
        tabIndex={0}
        style={{ pointerEvents: "all" }}
        onClick={(event) => {
          event.stopPropagation();
          onSelect(id);
        }}
      >
        <rect
          className="rd3t-svg-card__body"
          x={x}
          y={y}
          width={width}
          height={height}
          rx={12}
        />
        <rect
          className="rd3t-svg-card__mark"
          x={x}
          y={y}
          width={8}
          height={height}
          rx={3}
        />
        <text
          className="rd3t-svg-card__primary"
          lang={language}
          x={x + 18}
          y={secondary ? y + 32 : y + 42}
        >
          {ellipsize(primary, 18)}
        </text>
        {secondary ? (
          <text
            className="rd3t-svg-card__secondary"
            lang={language === "bn" ? "en" : "bn"}
            x={x + 18}
            y={y + 56}
          >
            {ellipsize(secondary, 22)}
          </text>
        ) : null}
        {deceased ? (
          <text className="rd3t-svg-card__dagger" x={x + width - 18} y={y + 30}>
            †
          </text>
        ) : null}
        {hasChildren ? (
          <g
            className="rd3t-svg-card__branch"
            style={{ pointerEvents: "all" }}
            onClick={(event) => {
              event.stopPropagation();
              toggleNode();
            }}
          >
            <circle cx={x + width - 4} cy={y + height - 4} r={13} />
            <text x={x + width - 4} y={y + height + 1} textAnchor="middle">
              {collapsed ? "+" : "–"}
            </text>
          </g>
        ) : null}
      </g>
    );
  }

  const cardHeight = note || title || childCount > 0 ? 96 : 78;
  const cardWidth = 232;

  return (
    <foreignObject
      width={cardWidth}
      height={cardHeight}
      x={-108}
      y={-39}
      className="rd3t-foreign"
    >
      <div
        className={cardClass}
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
  const [dimensions, setDimensions] = useState(() => {
    if (typeof window === "undefined") return { width: 900, height: 640 };
    return {
      width: Math.max(280, window.innerWidth),
      height: Math.max(240, Math.floor(window.innerHeight * 0.5)),
    };
  });
  const [search, setSearch] = useState("");
  const [depthKey, setDepthKey] = useState<"open" | "closed" | "full">("open");
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
  const initialDepth =
    depthKey === "closed" ? 0 : depthKey === "full" || !compact ? undefined : 2;

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

  const toolbar = (
          <div className="tree-toolbar">
            <button
              type="button"
              className="tree-toolbar__btn"
              onClick={() => setDepthKey(compact ? "full" : "open")}
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
              onClick={() => {
                setDepthKey("open");
                setViewKey((value) => value + 1);
              }}
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
  );

  return (
    <section
      className={compact ? "tree-panel is-compact" : "tree-panel"}
      aria-labelledby="tree-heading"
    >
      {compact ? toolbar : null}
      {!treeData ? (
        <p className="tree-empty">{ui.noMatches}</p>
      ) : (
        <div ref={wrapRef} className={compact ? "tree-canvas is-compact" : "tree-canvas"}>
          <div className="tree-frame" aria-hidden="true" />
          <h2 id="tree-heading" className="sr-only">
            {ui.treeHeading}
          </h2>
          {compact ? null : toolbar}
          {compact ? null : (
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
          )}
          <Tree
            key={`${language}-${depthKey}-${search}-${viewKey}-${familyTreeRevision}-${dimensions.width}x${dimensions.height}`}
            data={treeData}
            orientation="vertical"
            translate={{ x: dimensions.width / 2, y: compact ? 64 : 88 }}
            dimensions={dimensions}
            depthFactor={compact ? 118 : 128}
            nodeSize={{ x: compact ? 248 : 280, y: compact ? 124 : 150 }}
            separation={{
              siblings: compact ? 1.12 : 1.35,
              nonSiblings: compact ? 1.22 : 1.5,
            }}
            pathFunc="elbow"
            pathClassFunc={pathClassFunc}
            collapsible
            zoomable
            draggable
            scaleExtent={{ min: compact ? 0.6 : 0.08, max: 1.8 }}
            zoom={compact ? 1 : 0.72}
            renderCustomNodeElement={renderNode}
            hasInteractiveNodes
            initialDepth={initialDepth}
          />
          {compact ? null : <p className="tree-hint">{ui.treeHint}</p>}
        </div>
      )}
    </section>
  );
}
