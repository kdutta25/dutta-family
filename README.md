# Dutta family

Small React (Vite + TypeScript) site for the **Dutta** printed family chart in **English** and **Bengali**: **History** plus an **interactive family tree** (zoom/pan) built from the same data.

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

## Data source

Names and relationships are edited in **`src/data/familyTree.json`** (loaded at build time). The layout matches your latest chart where **Gouricharan** has two sons **Ramram** and **Madanmohan**, and **Debendranath** includes **Sthulata → Sushil Kumar**, **Kedarnath → Bholanath** (alongside the other lines). The **History** block is in `src/data/history.ts`.

## Tech

- [Vite](https://vitejs.dev/) + React + TypeScript  
- [react-d3-tree](https://github.com/bkrem/react-d3-tree) for the interactive tree (zoom, pan, expand/collapse)  
- Tree data: **`src/data/familyTree.json`** — types in `src/data/familyTree.types.ts`, re-exported from `src/data/familyTree.ts`  
- Language toggle with `localStorage` key `dutta-family-lang`  
- Typography: [Noto Sans Bengali](https://fonts.google.com/noto/specimen/Noto+Sans+Bengali) + Source Serif 4 (loaded from Google Fonts in `index.html`)
