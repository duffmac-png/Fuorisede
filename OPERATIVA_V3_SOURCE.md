# FUORISEDE V3 Operativa — sorgente canonico

Questo branch è il riferimento operativo per la V3 Ferrara.

## Produzione di riferimento

- Progetto Vercel: `fuorisede-v3-operativa`
- Project ID: `prj_twzg995EBySaAHy6GyqDikk0woqU`
- Deployment base: `dpl_EfMsjNeMYrEBvPQaEAuahG7BxwWp`
- Alias: `https://fuorisede-v3-operativa.vercel.app`
- Tipo: pacchetto statico, senza framework e senza integrazione Git
- Build originaria: 3 file caricati direttamente su Vercel

## Dataset operativo

Quattro schede Ferrara:

1. Le Corti di Medoro
2. Residenza Putinati 149
3. Bilocale Via Giuoco del Pallone
4. Appartamento Via Corta 12

I dati mancanti devono rimanere esplicitamente indicati come da verificare. Non inventare prezzi, foto, coordinate, disponibilità o condizioni.

## Correzioni obbligatorie prima della prossima produzione

- eliminare `PREVIEW V3 · TEST INTERNO` dalla UI pubblica;
- eliminare `FOTO DEMO` / `FOTO DIMOSTRATIVA` sulle fotografie reali;
- eliminare `ESEMPIO DIMOSTRATIVO` dalle schede autorizzate;
- sostituire il footer demo con dicitura operativa;
- attivare pin e percorsi solo dopo inserimento di coordinate verificate;
- mantenere invariati layout V3, filtri, preferiti, comparatore e comportamento mobile già approvati;
- mantenere il bug mobile del comparatore congelato se non bloccante, come da decisione di progetto.

## Regola di pubblicazione

Nessun nuovo deployment deve diventare produzione finché non è stato verificato su URL preview. La produzione corrente resta il rollback di sicurezza fino all'approvazione del nuovo deployment.
