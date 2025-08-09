# Japanese Flashcards (Frontend)

Minimal React + Vite + TypeScript frontend for the Japanese Flashcards game.

- JLPT level selection (N1–N5 or all)
- 10 rounds per game, 20s per word
- Immediate feedback, auto-advance
- Score summary and results screen
- Recent history (10 games) + Favorites
- Responsive UI, TailwindCSS + Framer Motion animations

## Setup

1. Install dependencies

```bash
npm install
```

2. Run the dev server

```bash
npm run dev
```

3. Build for production

```bash
npm run build
npm run preview
```

## Deploy (Netlify Drop)

- Run `npm run build`
- Drag and drop the `dist/` folder to Netlify Drop

## Notes

- API schema expected:
  - `GET {API_BASE}?jlptLevel=all|N1|N2|N3|N4|N5`
  - Response includes `{ success: boolean, words: Word[] }`
- LocalStorage keys: `jfc_history_v1`, `jfc_favorites_v1` 