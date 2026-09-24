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
| 13 | Confronto → Condividi → Email apre una finestra interna (stile "Avvisami sugli aggiornamenti") con destinatario e messaggio modificabile; "Invia" apre il programma di posta, "Copia messaggio" copia il testo. | `app.js` (`openShareEmailModal`) | Confronto → Condividi → Email |
| 14 | La pagina `/ferrara/` (link in fondo alla home, indicizzata da Google) usa gli stessi stili e script della home: cambia solo titolo e testo per Google. Se si aggiunge uno script o uno stile a `index.html`, va aggiunto anche a `ferrara/index.html`. | `ferrara/index.html` | cliccare l'ultima riga in fondo alla pagina |
| 15 | L'icona "i" sta sempre sulla stessa riga del testo e mostra la "i" (anche nel riepilogo della Scheda accanto a "Da completare"). | `app.js` (regola `.verifyinfo`) | aprire una Scheda con costo reale da completare |
| 16 | Nella Scheda il link del percorso dice "Apri il percorso su Google Maps®" e apre Google Maps. | `app.js` (`ddmaplink`) | Scheda con sede scelta |
| 17 | Le statistiche arrivano in Airtable: visita, scheda aperta, preferito, confronto, annuncio originale, richieste; ciascuna con la provenienza (es. "meta / nome-campagna"). Il tracciamento si aggancia alle funzioni del sito (`openDetail`, `toggleFav`, `openComparison`), non ai nomi delle classi. | `pilot-tracking.js`, `pilot-analytics.js`, `api/pilot-event.js` | aprire `/api/pilot-event`: token e base `true`; poi un giro sul sito e controllare Airtable |
| 18 | Privacy e Cookie descrivono esattamente ciò che il sito salva e invia: se si aggiunge uno strumento (es. Meta Pixel) o una chiave nella memoria del browser, vanno aggiornate prima di pubblicare. | `privacy.html`, `cookie.html` | tabella nella Cookie Policy |
| 21 | Nessuna risorsa del sito viene caricata da `fuorisede-demo.vercel.app` (su iPhone non risponde): il logo è `img/logo-fuorisede.png` (trasparente, leggero). | tutte le pagine, `app.js` | aprire Contatti da iPhone: il logo si vede |
| 22 | Si possono confrontare tipologie diverse (camera, posto letto, appartamento) anche da telefono: nessun avviso "Puoi confrontare solo…". | `android-map-pill-fix.js` (`compatible`) | da telefono, mappa: aggiungere al confronto una camera e un posto letto |
| 9 | Nella Scheda, sopra "… sopra/sotto la media FUORISEDE" c'è una sola riga. | `app.js` (`launch-stability-fixes`) | aprire una Scheda con prezzo |

## Regole di lavoro

- Si modifica il codice esistente; non si aggiunge una nuova "toppa" che ridefinisce una funzione già ridefinita.
- Un commit per ogni correzione, con la voce corrispondente aggiunta qui.
- Nessuna modifica fuori dal punto richiesto.
