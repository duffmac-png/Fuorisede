# FUORISEDE Universale — baseline verificata

Data di consolidamento: 27 agosto 2026

## Produzione di riferimento

- Progetto Vercel: `fuorisede-evoluzione-universale`
- Alias pubblico: <https://fuorisede-evoluzione-universale.vercel.app>
- Deployment verificato: `dpl_DDWZAGCsPz7uFiGdkS76ZpGraEJZ`
- Stato: `READY`

## Sorgenti riallineati

La radice di questo branch contiene la copia verificata dei file usati dalla
versione di produzione:

- `index.html`
- `app.js`
- `data/listings-operativa-v3.json`
- `api/immobiliare.js`
- `api/nearby.js`
- `api/map-tile.js`

I contenuti statici `index.html`, `app.js` e
`data/listings-operativa-v3.json` sono stati confrontati byte per byte con
l'alias di produzione.

## Regola per i prossimi aggiornamenti

1. Partire da questo branch e da questa baseline.
2. Creare una preview senza modificare l'alias di produzione.
3. Verificare home, filtri, schede, mappa, confronto e link originali.
4. Promuovere la preview soltanto dopo il collaudo.

## Nota operativa

Nei log del deployment è presente un singolo errore `502` della funzione
`/api/nearby` e alcuni avvisi di deprecazione Node relativi a `url.parse()`.
Non impediscono il funzionamento principale della vetrina, ma vanno trattati
in una preview separata prima del prossimo rilascio.
