# FUORISEDE · le 3 versioni

Il sito pubblico è **www.fuori-sede.it** (Vercel, progetto `fuorisede-evoluzione-universale`); test-interno è su fuorisede.vercel.app.

Il codice è lo stesso per tutte le versioni. Cambia solo il branch e il file `versione.js`.

| Branch | A cosa serve | Annunci | Online? |
|---|---|---|---|
| **`produzione`** | Il sito pubblico | Ferrara: Phosphoro + ACER + privati | Sì, è il sito vero: www.fuori-sede.it |
| **`test-interno`** | Prove interne prima di pubblicare | Quelli di produzione + Milano (Sandbox Immobiliare.it) | No: banner rosso "TEST INTERNO", statistiche spente |
| **`demo`** | Vecchia demo, non più usata | 3 alloggi fittizi | No |

`produzione` è anche il branch principale del repository.

## Da dove arrivano gli annunci

| File | Contenuto | Come si aggiorna |
|---|---|---|
| `data/listings-operativa-v3.json` | Schede FUORISEDE: ACER e privati | A mano |
| `data/phosphoro-ferrara.json` | Annunci Phosphoro | **Da solo, ogni notte alle 05:15**: `.github/workflows/phosphoro-giornaliero.yml` legge l'URL del feed Phosphoro con `scripts/sync-phosphoro.mjs` e aggiorna sia `produzione` sia `test-interno` |
| `/api/immobiliare` | Annunci Milano dalla Sandbox Immobiliare.it | Dal vivo, solo in `test-interno` |

Se il feed Phosphoro non risponde, è quasi vuoto o perde più della metà degli annunci in una notte, l'aggiornamento si blocca. Gli annunci restano quelli del giorno prima e GitHub manda una mail di errore.

Per lanciare l'aggiornamento a mano: GitHub → **Actions** → *Phosphoro · aggiornamento giornaliero* → **Run workflow**.

## Regole

- Le modifiche al sito si fanno su `produzione` e poi si portano su `test-interno`. `versione.js` **non** va copiato: è l'unica differenza tra i due branch.
- Per rendere non disponibile un annuncio privato o ACER, in `data/listings-operativa-v3.json` si imposta `"status": "unavailable"`. Il sito mostra "Non più disponibile" e disattiva "Mi interessa".
- I vecchi branch sono archiviati come tag `archivio/<nome>`: niente è andato perso.
