export type Language = "en" | "bn";

export type Gender = "m" | "f";

/** Matches `familyTree.json`; `bn` optional for English-only nodes. */
export type FamilyNode = {
  id: string;
  en: string;
  bn?: string;
  gender?: Gender;
  deceased?: boolean;
  title?: {
    en: string;
    bn?: string;
  };
  note?: {
    en: string;
    bn?: string;
  };
  children?: FamilyNode[];
};
