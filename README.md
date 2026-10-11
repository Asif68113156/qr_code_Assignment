# QR Code Scanner Interface (FA-1 + FA-2)

**Course:** Advanced Web Technologies - MCA, PCCoE  |  **Student:** Asifali Siddiqui  |  **PRN:** 125M1H050

**Live Demo:** [https://jocular-blini-66f74b.netlify.app/](https://jocular-blini-66f74b.netlify.app/)

A browser-based QR code scanner built with React. Scan with the live camera or from an uploaded image,
keep a searchable history, and edit / favourite / delete entries. All decoding happens locally in the browser.

## Features
| FA-1 (Phase I) | FA-2 (Phase II) |
|---|---|
| Components, JSX, props | React Router (Scanner / History / Detail / About / 404) |
| `useState`, events | Hooks: `useEffect`, `useRef`, `useCallback`, `useMemo`, `useReducer`, `useContext`, custom hooks |
| Conditional rendering | Forms with validation (manual entry + edit form) |
| Lists and keys | REST API + CRUD (JSON Server, auto localStorage fallback) |
| Responsive UI | Search, filter & sort in History |
| | Error handling (ErrorBoundary, camera/upload/API errors, 404) |
| | Performance: lazy routes, `React.memo`, `useMemo`, debounce, chunk splitting |
| | Testing: 35 automated tests (Vitest + React Testing Library) |
| | Deployment-ready (Vercel / Netlify / GitHub Pages) |

## Run locally
```bash
npm install
npm start          # runs Vite (http://localhost:5173) + JSON Server (http://localhost:3001) together
```
Or separately: `npm run dev` and `npm run server`.
If JSON Server is not running the app shows an "Offline mode" banner and saves history to `localStorage`.

> Camera access needs `https://` or `localhost`.

## Scripts
| Command | Purpose |
|---|---|
| `npm run dev` | Start dev server |
| `npm run server` | Start JSON Server on port 3001 (`db.json`) |
| `npm start` | Both of the above |
| `npm test` | Run all tests |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Preview the production build |
| `npm run deploy` | Build and publish `dist/` to GitHub Pages (`gh-pages` branch) |

## Deployment
* **Live URL:** [https://jocular-blini-66f74b.netlify.app/](https://jocular-blini-66f74b.netlify.app/)
* **Vercel / Netlify:** import the repo, build command `npm run build`, output directory `dist`.
  Set `VITE_API_URL` only if you host a JSON Server; otherwise the app uses localStorage.
* **GitHub Pages:** `npm run deploy` (build uses relative base `./` and `HashRouter`, so no extra config is needed).

## Folder structure
```
src/
  api/          scansApi.js            REST + localStorage CRUD layer
  context/      ScansContext.jsx       global state (useReducer + Context)
  hooks/        useCameraScanner.js, useDebounce.js
  components/   Header, Scanner, ScanResultCard, HistoryList, SearchFilterBar,
                ManualEntryForm, EditScanForm, Toast, ErrorBoundary
  pages/        ScannerPage, HistoryPage, ScanDetailPage, AboutPage, NotFoundPage
  utils/        classify, validators, filterScans, decodeImage, clipboard, format
  __tests__/    unit + integration tests
db.json         JSON Server data
```
