# Das magische Gestüt – Projektregeln

Lern-Web-App für Grundschulkinder (3. Klasse, Bayern). Eine junge Magierin
befreit verzauberte Pferde, indem sie Aufgaben in Mathe, Deutsch und HSU löst.

## Dauerhafte Regeln – gelten für JEDE Änderung

### 1. Versionierung
Bei **jeder** Code-Änderung müssen synchron erhöht werden:
- `version.json` → `"version"`
- `sw.js` → `APP_VERSION` (steuert den Cache-Namen `CACHE_NAME`)
- `index.html` → `const APP_VERSION`

Alle drei Werte müssen identisch sein, sonst erkennt die App Updates nicht
oder zeigt dauerhaft das Update-Banner. Der Service Worker darf
`version.json` **niemals** cachen (ist in `sw.js` so implementiert – nicht
entfernen).

### 2. Spielstände sind heilig
Fortschritt in `localStorage` (Key `magischesGestuetV1`) darf **niemals**
verloren gehen:
- Bei Strukturänderungen am State-Schema: `schemaVersion` erhöhen und in
  `loadState()` eine Migration von allen älteren Schemata schreiben
  (Vorbild: `migrateLegacyState()`).
- Neue Felder immer mit Defaults auffüllen (`Object.assign(default, saved)`),
  niemals gespeicherte Daten wegwerfen.
- Kapitel-IDs, Pferde-IDs und Topic-Keys sind persistierte Identifikatoren –
  bestehende niemals umbenennen oder umnummerieren, nur neue hinzufügen.

### 3. Zielgerät: iPad (Safari)
- Touch-Bedienung: große Tap-Ziele (min. 56 px hoch), großzügige Abstände,
  kein Hover-abhängiges UI.
- Querformat ist das Primärformat.
- Stabile 30+ FPS: nur CSS-Transforms/Opacity animieren, keine
  Layout-Thrashing-Animationen, Partikel-Anzahl begrenzt halten.
- Safari-Kompatibilität beachten (kein Chrome-only-JS/CSS).

### 4. Stil: magisch, freundlich, liebevoll
- Cartoon-Look, weiche runde Formen, großzügige Radien.
- Farbwelt: Nachtblau/Lila-Verlauf mit Gold-Akzenten, Pastelltöne,
  Glitzer-/Sternpartikel.
- **Nichts Gruseliges, nichts Hektisches**: keine Jumpscares, kein Zeitdruck,
  keine roten Fehlermeldungen. Fehler werden immer ermutigend beantwortet
  (Pferd gibt freundlichen Tipp, Aufgabe darf wiederholt werden) – das Wort
  „falsch" erscheint nie.

### 5. Sprache
Alles auf Deutsch, kindgerecht für 8–10 Jahre: kurze Sätze, warmer Ton,
direkte Ansprache („du"). Auch Code-Kommentare zu Fachlichkeit gern deutsch.

### 6. Lerninhalte
Immer am **LehrplanPLUS Bayern, Grundschule, Jahrgangsstufe 3** ausrichten –
inklusive der dort vorgesehenen Rechenwege (schrittweise, stellenweise,
Hilfsaufgabe, Ergänzen) und Rechtschreibstrategien (Verlängern, Ableiten,
Silben schwingen, Merkwörter). Tipps erklären immer die Lehrplan-Strategie
in maximal 2 kindgerechten Sätzen. Andere Klassenstufen erst freischalten,
wenn echte Inhalte dafür existieren (`GRADE_HAS_CONTENT`).

### 7. Code-Struktur
- Modular halten: **keine Datei über 500 Zeilen**.
- ES-Module (`<script type="module">` + `import`/`export`) **ohne
  Build-Schritt** – alles muss direkt auf GitHub Pages lauffähig sein
  (kein npm, kein Bundler, keine Transpilierung).
- Hinweis zum Bestand: `index.html` ist historisch eine große Einzeldatei.
  Bei größeren Arbeiten daran schrittweise in ES-Module aufteilen
  (z. B. `js/state.js`, `js/tasks-mathe.js`, `js/tasks-deutsch.js`,
  `js/tasks-hsu.js`, `js/views.js`); neue Features nicht mehr in die
  Monolith-Datei stopfen, sondern als Modul anlegen. Beim Aufteilen
  Regel 1 (Version) und Regel 2 (Spielstände) beachten und die neuen
  Dateien in die `CORE_ASSETS` des Service Workers aufnehmen.

## Architektur-Kurzüberblick

- `index.html` – 2D-App (UI, State, Aufgaben-Generatoren) + Integration des 3D-Hubs
- `js/stall3d.js` – 3D-Stall-Szene (Haupt-Hub): Raum, Licht, Partikel, Kamera-
  Steuerung, Navigations-Symbole; Three.js per CDN (cdn.jsdelivr.net), wird
  per dynamischem `import()` nachgeladen
- `js/horse3d.js` – Low-Poly-Pferd aus Grundformen mit Toon-Shading und
  Idle-Animationen
- `js/avatar-data.js` – Avatar-Optionskatalog (`window.AVATAR_OPTIONS`,
  `window.AVATAR_DEFAULT`); klassisches Script wie story-data.js
- `js/avatar3d.js` – Cartoon-Kinderfigur im Toon-Look (buildAvatar),
  Editor-Vorschau (initAvatarPreview) und Portrait-Renderer
  (renderAvatarPortrait → PNG-DataURL in `profile.avatarImage` für
  2D-Ansichten); Avatar-Konfiguration liegt in `profile.avatar`
- `js/pflege3d.js` – Pflege-Minispiele im 3D-Stall (Striegeln, Hufe säubern);
  reine Belohnungs-Aktivitäten mit Bonus-Sternen, Pferd ist nie traurig
- `js/story-data.js` – Story "Der erloschene Sternenstall" (10 Kapitel,
  `window.STORY_CHAPTERS`/`window.STORY_PROLOG`); Freischalt-Logik:
  3× "Sehr gut" (≥90 % im ersten Versuch, 10 Aufgaben/Runde) öffnet das
  nächste Kapitel; Story-Fortschritt pro Profil unter `profile.story`
  (`chapterStars`, `subjects`, `unlocked` für Gebiete/Aktivitäten/Ausrüstung)
- Kein WebGL oder CDN nicht erreichbar → automatischer Fallback auf die
  2D-Fachwahl (`subjectMap`); alle Lerninhalte funktionieren ohne 3D
- `sw.js` – Service Worker: Offline-Cache, Update-Flow (SKIP_WAITING)
- `version.json` – einzige Quelle der Server-Versionsnummer, nie gecacht
- State: `localStorage` unter `magischesGestuetV1`, 3 Profil-Slots
  (`child1`–`child3`), Fortschritt pro Fach (`mathe`/`deutsch`/`hsu`)
  und pro Thema (Level 1–5, richtig/falsch-Zähler)
- Adaptivität pro Thema: 3× richtig im ersten Versuch → Level hoch,
  2 Aufgaben mit Fehlversuch in Folge → Level runter
- Elternbereich: Zahnrad + PIN (Standard 2412), Profile verwalten,
  Themen (de)aktivieren, Statistik, Versionsanzeige
