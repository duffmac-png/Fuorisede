# Regressioni da non far tornare

Ogni errore già risolto va scritto qui, con il commit che lo ha risolto e il modo di verificarlo.
Prima di pubblicare una Preview, controlla tutte le voci.

| # | Regola | Dove vive | Come si verifica |
|---|--------|-----------|------------------|
| 1 | Sulla mappa ogni alloggio ha la sua pillola: "429 €" oppure "— € ⓘ". Niente cluster "+N" o "N alloggi". | `map-pills.js` | `tests/check-mappa.js` in console → "MAPPA OK" |
| 2 | Le pillole non si sovrappongono mai, a nessuno zoom. Se serve, una pillola viene spostata e collegata al punto con una linea grigia. | `map-pills.js` | `tests/check-mappa.js` a zoom iniziale, +1, +2 |
| 3 | Ogni pillola è cliccabile: su desktop apre il popup, su telefono la scheda in basso. | `map-pills.js` (desktop), `android-map-pill-fix.js` (mobile) | clic su una pillola |
| 4 | Su telefono la mappa occupa tutta la larghezza e le mini-schede scorrono sotto. | `map-pills.js` (CSS mobile) | aprire Mappa da telefono |
| 5 | Dal popup, "Confronta" non chiude il popup, la pillola diventa invertita con ✓ e con 2 alloggi compare la barra in basso. | `app.js` (`mapCompareAction`) | 2 clic su "Confronta" da due popup |

## Regole di lavoro

- Si modifica il codice esistente; non si aggiunge una nuova "toppa" che ridefinisce una funzione già ridefinita.
- Un commit per ogni correzione, con la voce corrispondente aggiunta qui.
- Nessuna modifica fuori dal punto richiesto.
