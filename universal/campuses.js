/* FUORISEDE universal campus registry.
 * Coordinates are campus reference points used for proximity estimates.
 * Keep this registry independent from listing providers.
 */

export const CAMPUSES = {
  Milano: [
    { id: 'bocconi', name: 'Università Bocconi', lat: 45.4489, lng: 9.1897 },
    { id: 'polimi-leonardo', name: 'Politecnico di Milano · Leonardo', lat: 45.4781, lng: 9.2273 },
    { id: 'polimi-bovisa', name: 'Politecnico di Milano · Bovisa', lat: 45.5029, lng: 9.1566 },
    { id: 'unimi-festa-perdono', name: 'Università degli Studi di Milano · Festa del Perdono', lat: 45.4603, lng: 9.1940 },
    { id: 'bicocca', name: 'Università Milano-Bicocca', lat: 45.5185, lng: 9.2132 },
    { id: 'cattolica', name: 'Università Cattolica · Largo Gemelli', lat: 45.4631, lng: 9.1760 },
    { id: 'iulm', name: 'IULM', lat: 45.4427, lng: 9.1640 },
  ],
  Ferrara: [
    { id: 'mammut', name: 'Mammut · Polo Chimico Biomedico', lat: 44.8357, lng: 11.6200 },
    { id: 'centro', name: 'Centro · sedi universitarie', lat: 44.8332, lng: 11.6198 },
  ],
};

export function campusesForCity(city) {
  return CAMPUSES[city] || [];
}

export function campusById(city, campusId) {
  return campusesForCity(city).find((campus) => campus.id === campusId) || null;
}

export function emptyCampusSelection() {
  return { city: '', campusId: '' };
}
