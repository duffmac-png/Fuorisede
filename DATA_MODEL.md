# Modello dati FUORISEDE

Gli annunci devono entrare in FUORISEDE attraverso uno schema comune, indipendentemente dalla fonte originale.

## Campi MVP
- `id`: identificatore interno
- `title`: titolo sintetico
- `price`: canone mensile
- `expenses`: spese mensili note/stimate
- `zone`: zona/polo urbano
- `campus`: sede universitaria di riferimento
- `lat`, `lng`: coordinate per la mappa
- `minutes`, `km`, `mode`: percorrenza verso la sede
- `features`: servizi e dotazioni
- `available`: disponibilità
- `candidates`: candidature correnti
- `source`: provenienza del dato
- `verified`: stato di verifica
- `trust`: indicatore sintetico mostrato all'utente

## Regola fondamentale
Non confondere mai un dato dimostrativo, importato, dichiarato o stimato con un dato verificato. La UI dovrà rendere comprensibile la provenienza e il grado di affidabilità senza appesantire le card.

## Fonti future
L'importazione da portali, agenzie, proprietari, social, studentati o altre fonti deve avvenire solo tramite modalità autorizzate e compatibili con condizioni d'uso e normativa applicabile. Il livello di importazione deve trasformare ciascuna fonte nello schema normalizzato sopra descritto.
