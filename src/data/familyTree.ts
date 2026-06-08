import type { FamilyNode } from "./familyTree.types";
import familyTreeJson from "./familyTree.json";

export type { FamilyNode, Language } from "./familyTree.types";

/** Root of the Dutta tree (loaded from `familyTree.json`). */
export const familyTreeRoot = familyTreeJson as FamilyNode;
