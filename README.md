# Dutta Family

React (Vite + TypeScript) application for presenting the **Dutta** printed family chart in **English** and **Bengali**. The app renders an interactive tree with zoom, pan, search, expand/collapse, and a separate family history card sourced from the document footer.

## Run locally

From **`dutta-family`** (this app’s folder):

```bash
cd dutta-family
npm install
npm start
```

If your shell is already at the parent **`website`** folder, you can run `npm start` there too; it forwards to this project (after `cd dutta-family && npm install` once so dependencies exist).

Then open the URL Vite prints (usually `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```

## Application Architecture

The app is intentionally small and data-driven:

- `src/main.tsx` mounts the React app and wraps it with `LanguageProvider`.
- `src/App.tsx` owns the page shell: header, language toggle, tree view, and family history card.
- `src/i18n/LanguageContext.tsx` stores the selected language (`en` / `bn`) in `localStorage` under `dutta-family-lang` and exposes UI strings.
- `src/data/familyTree.json` is the editable family-tree source of truth.
- `src/data/familyTree.types.ts` defines the `FamilyNode` shape used by the JSON tree.
- `src/data/familyTree.ts` imports the JSON and exports `familyTreeRoot`.
- `src/data/history.ts` stores the family-history text from the bottom of the printed chart.
- `src/index.css` contains the app layout, toolbar, legend, cards, tree canvas, and history-card styling.

## Component Design

### `App`

`App` composes the page:

- Header with title/subtitle and language toggle.
- `FamilyTreeView` for the interactive tree.
- `FamilyHistoryCard` below the tree for the document footnote/history text.

### `FamilyTreeView`

`FamilyTreeView` adapts `FamilyNode` data into the `react-d3-tree` shape at render time.

Responsibilities:

- Converts each person into a `react-d3-tree` node with display attributes.
- Renders custom person cards with gender icon, English name, Bengali name, title, note, and deceased marker.
- Provides search by English or Bengali name.
- Supports expand all / collapse all.
- Enables drag, pan, and zoom through `react-d3-tree`.
- Shows the floating legend for male, female, and deceased markers.

### `FamilyHistoryCard`

`FamilyHistoryCard` reads `familyHistory` and displays it below the tree as a left-aligned card. The text switches automatically with the selected language.

### Data Model

Each person is stored as:

```ts
type FamilyNode = {
  id: string;
  en: string;
  bn?: string;
  gender?: "m" | "f";
  deceased?: boolean;
  title?: { en: string; bn?: string };
  note?: { en: string; bn?: string };
  children?: FamilyNode[];
};
```

The tree is nested parent-to-children. To update the family chart, edit `src/data/familyTree.json`; no component changes are needed for normal genealogy edits.

## Data Source

Names and relationships are based on the uploaded printed Dutta family chart. The current structure includes the corrected sequence from `Shambhucharan Dutta` and `Siddheswar Dutta`, including:

- `Girindranath Dutta → Sri Sripati Charan Dutta → Sriman Ramendra Nath Dutta`
- `Akshyakumar Dutta → Khetu` as the only daughter
- `Kedareswar Dutta` branch with `Narendranath`, `Satyendranath`, and their descendants

The family-history block is sourced from the note at the bottom of the printed chart and lives in `src/data/history.ts`.

## Tech Stack

- [Vite](https://vitejs.dev/) + React + TypeScript
- [react-d3-tree](https://github.com/bkrem/react-d3-tree) for tree layout, zoom, pan, and node collapse/expand
- JSON-backed tree data via TypeScript `resolveJsonModule`
- Language toggle with `localStorage`
- Bengali rendering with [Noto Sans Bengali](https://fonts.google.com/noto/specimen/Noto+Sans+Bengali)
