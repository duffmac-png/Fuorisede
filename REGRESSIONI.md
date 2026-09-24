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
| 6 | Cuore dei preferiti: vuoto = contorno nero e cerchio nero; salvato = pieno nero. Mai rosso. | `app.js` (`favorite-heart-style`, `favorite-heart-black`) | Home: salva un alloggio |
| 7 | Navigazione (← pagina di provenienza a sinistra, pagina successiva → a destra) subito sotto la barra dei menu in Mappa, Scheda e Confronto. | `app.js` (`render`, `contextNavHtml`) | Alloggi → Mappa → Scheda → indietro → avanti |
| 8 | Nel Confronto nella barra dei menu è acceso solo "Confronta" (non anche "Mappa"). | `app.js` (`nav`) | aprire il Confronto dalla Mappa |
| 10 | "La tua sede" (Centro/Mammut/Darsena) NON filtra gli annunci: serve solo a calcolare distanze e tempi. Sempre 35 alloggi a Ferrara, qualunque sede. | `app.js` (`matches`, `setZone`) | cambiare sede: il contatore resta 35 |
| 11 | Nel Confronto si sceglie la sede direttamente in pagina; senza sede, Distanza e Tempo dicono "Scegli la sede ↑" per tutti. | `app.js` (`compareZonePicker`) | aprire il Confronto senza sede, poi sceglierla |
| 12 | "🏅 più basso" solo tra gli alloggi con prezzo: un alloggio senza prezzo non vale 0 €. | `app.js` (`designComparisonRow`) | Confronto con un alloggio "— €" |
| 9 | Nella Scheda, sopra "… sopra/sotto la media FUORISEDE" c'è una sola riga. | `app.js` (`launch-stability-fixes`) | aprire una Scheda con prezzo |

## Regole di lavoro

- Si modifica il codice esistente; non si aggiunge una nuova "toppa" che ridefinisce una funzione già ridefinita.
- Un commit per ogni correzione, con la voce corrispondente aggiunta qui.
- Nessuna modifica fuori dal punto richiesto.
