# FUORISEDE — Validation V2

## Principio di prodotto
FUORISEDE non tratta la sede universitaria come un distretto geografico rigido. La sede scelta dallo studente è un punto di riferimento rispetto al quale misurare distanza e percorrenza. Gli alloggi restano ricercabili anche se si trovano in altre zone della città.

## Disponibilità
Ogni scheda pubblicabile deve poter gestire:
- `availableFrom`: data ISO quando nota con precisione;
- `availableLabel`: testo mostrato quando la disponibilità è espressa come periodo (es. "fine novembre 2026");
- `availabilityStatus`: `confirmed`, `to_reconfirm`, `unavailable`, `unknown`;
- `availabilityConfirmedAt`: data dell'ultima conferma ricevuta dall'offerente;
- `nextAvailabilityCheckAt`: data prevista per la prossima richiesta di riconferma.

Non si inventano date mancanti. Un dato non noto viene mostrato come "Da verificare".

## Validazione trasparente
Evitare un unico bollino generico "verificato". La scheda deve poter dichiarare separatamente:
- `publicationAuthorized`: autorizzazione alla pubblicazione;
- `contactProvided`: contatto fornito/confermato dall'offerente;
- `priceDeclared`: canone dichiarato;
- `expensesDeclared`: spese dichiarate;
- `contractDeclared`: condizioni contrattuali dichiarate;
- `depositDeclared`: deposito dichiarato;
- `utilitiesDeclared`: utenze/spese dichiarate;
- `listingConfirmedAt`: ultimo aggiornamento complessivo.

L'interfaccia deve distinguere chiaramente informazioni confermate, dichiarate e ancora da verificare.

## Costo reale
La scheda distingue canone, spese note e componenti non note. Se tutte le componenti necessarie sono note, mostra il costo mensile complessivo. Se mancano dati, mostra il costo minimo noto e segnala esplicitamente le voci da verificare. Nessuna stima arbitraria.

## Sede universitaria
Il campo `campus` non deve essere usato come confine per escludere automaticamente gli alloggi. La UI deve mostrare distanza e tempo rispetto alla sede selezionata e permettere ordinamenti per distanza/percorrenza, costo e disponibilità.

### Distanza e routing
- `distanceKm` può rappresentare la distanza geografica great-circle ed è sempre etichettata come **in linea d'aria**.
- `routeDistanceKm` rappresenta la distanza lungo la rete percorribile e deve provenire da un motore di routing.
- `minutesWalk` e `minutesBike` non vengono derivati con formule del tipo distanza / velocità media: devono provenire da profili di routing pedonale e ciclabile.
- Ogni risultato di routing deve registrare almeno `routingProvider`, `routingProfile` e `routingCalculatedAt`, così da poterlo aggiornare e spiegare.
- Se il routing non è disponibile, la UI mostra la sola distanza in linea d'aria e non inventa minuti di percorrenza.
- Il routing è informativo e non crea soglie rigide di inclusione/esclusione degli alloggi.

OSRM è compatibile con questo modello perché supporta profili distinti di routing (tipicamente car, bike e foot) e restituisce distanza/durata del percorso; in produzione FUORISEDE dovrà usare un'istanza/provider con profili effettivamente configurati per bici e pedoni, senza assumere che un endpoint pubblico generico li esponga correttamente.

## Comparatore
Priorità delle righe:
1. costo mensile complessivo/minimo noto;
2. tempo e distanza dalla sede selezionata;
3. disponibilità e data ultima conferma;
4. canone e spese;
5. contratto e deposito;
6. bagno, coinquilini e dotazioni;
7. stato di validazione delle informazioni.

Il comparatore evidenzia i trade-off e non assegna automaticamente un vincitore.

## Ciclo di vita offerente
Facebook/altro canale → consenso → email con dati → scheda → controllo offerente → pubblicazione → riconferma periodica → aggiornamento oppure sospensione.

La prima email dell'offerente deve diventare il riferimento del ciclo di aggiornamento. Le richieste periodiche di riconferma possono proseguire nello stesso thread. In caso di mancata conferma entro la finestra stabilita, la scheda passa a `to_reconfirm`; quando l'alloggio è affittato passa a `unavailable` e viene escluso dai risultati attivi.

## Priorità implementativa
1. Disponibile dal + ultima conferma.
2. Stato disponibilità.
3. Pannello validazione.
4. Costo reale/minimo noto.
5. Comparatore V2.
6. Filtro data richiesta dallo studente.
7. Distanza dinamica rispetto alla sede selezionata.
8. Routing pedonale/ciclabile verificato con provenienza e data di calcolo.
