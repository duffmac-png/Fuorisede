# Modello dati FUORISEDE

Gli annunci devono entrare in FUORISEDE attraverso uno schema comune, indipendentemente dalla fonte originale.

## Campi MVP

- `id`: identificatore interno
- `title`: titolo sintetico
- `price`: canone mensile
- `expenses`: spese mensili note/stimate; `0` indica zero euro solo se `expensesKnown` è `true`
- `expensesKnown`: distingue spese realmente note (anche pari a zero) da spese non disponibili
- `zone`: zona/polo urbano
- `campus`: sede universitaria di riferimento
- `lat`, `lng`: coordinate per la mappa
- `minutes`, `km`, `mode`: percorrenza verso la sede
- `features`: servizi e dotazioni
- `available`: disponibilità mostrata all'utente secondo la regola seguente:
  - data precisa se nota, ad esempio `1 settembre 2026`
  - `Disponibile` se sappiamo che l'alloggio è disponibile ma non conosciamo la data esatta
  - `Disponibilità da verificare` se non abbiamo informazioni sufficienti
- `candidates`: candidature correnti
- `sourceName`: nome leggibile della fonte
- `sourceUrl`: pagina ufficiale o annuncio originale in HTTPS
- `sourceCheckedAt`: data dell'ultima verifica delle informazioni
- `verified`: stato di verifica
- `partnerAuthorized`: autorizzazione ricevuta dalla fonte
- `externalOnly`: se `true`, disponibilità, domanda, prenotazione o assegnazione
  restano interamente sul canale ufficiale e FUORISEDE mostra solo il rinvio
- `publicationStatus`: può rendere pubblica la scheda solo nei casi
  `authorized`, `open_licensed` o `demo`
- `trust`: indicatore sintetico mostrato all'utente

## Regole fondamentali

Non confondere mai un dato dimostrativo, importato, dichiarato o stimato con un
dato verificato. La UI deve rendere comprensibile la provenienza e il grado di
affidabilità senza appesantire le card.

La mancanza di un dato non deve essere trasformata in un valore numerico o in una
certezza apparente. In particolare, `expenses: 0` senza `expensesKnown: true` non
significa "nessuna spesa": significa che il dato economico aggiuntivo non è stato
ancora determinato.

Se `externalOnly` è attivo, FUORISEDE non deve mostrare una candidatura interna:
il pulsante deve portare alla fonte ufficiale.

## Fonti future

L'importazione da portali, agenzie, proprietari, social, studentati o altre fonti deve avvenire solo tramite modalità autorizzate e compatibili con condizioni d'uso e normativa applicabile. Il livello di importazione deve trasformare ciascuna fonte nello schema normalizzato sopra descritto.
