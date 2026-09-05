import type { FamilyNode } from "../data/familyTree.types";

export function walk(
  node: FamilyNode,
  visit: (n: FamilyNode, depth: number, parent: FamilyNode | null) => void,
  depth = 0,
  parent: FamilyNode | null = null,
): void {
  visit(node, depth, parent);
  for (const child of node.children ?? []) {
    walk(child, visit, depth + 1, node);
  }
}

export function findNode(root: FamilyNode, id: string): FamilyNode | null {
  if (root.id === id) return root;
  for (const child of root.children ?? []) {
    const found = findNode(child, id);
    if (found) return found;
  }
  return null;
}

export function pathTo(root: FamilyNode, id: string): FamilyNode[] | null {
  if (root.id === id) return [root];
  for (const child of root.children ?? []) {
    const rest = pathTo(child, id);
    if (rest) return [root, ...rest];
  }
  return null;
}

export function familyStats(root: FamilyNode) {
  let members = 0;
  let males = 0;
  let females = 0;
  let generations = 1;
  walk(root, (node, depth) => {
    members += 1;
    if (node.gender === "f") females += 1;
    else males += 1;
    generations = Math.max(generations, depth + 1);
  });
  return { members, males, females, generations };
}

export function nodeMatchesQuery(node: FamilyNode, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return false;
  return (
    node.en.toLowerCase().includes(needle) ||
    (node.bn?.toLowerCase().includes(needle) ?? false) ||
    (node.title?.en.toLowerCase().includes(needle) ?? false) ||
    (node.title?.bn?.toLowerCase().includes(needle) ?? false)
  );
}

export function filterFamilyNode(
  node: FamilyNode,
  query: string,
): FamilyNode | null {
  const needle = query.trim().toLowerCase();
  if (!needle) return node;

  const kids = (node.children ?? [])
    .map((child) => filterFamilyNode(child, query))
    .filter((x): x is FamilyNode => x !== null);

  if (nodeMatchesQuery(node, query) || kids.length) {
    return { ...node, children: kids.length ? kids : undefined };
  }
  return null;
}

export function matchingIds(root: FamilyNode, query: string): Set<string> {
  const ids = new Set<string>();
  if (!query.trim()) return ids;
  walk(root, (node) => {
    if (nodeMatchesQuery(node, query)) ids.add(node.id);
  });
  return ids;
}
