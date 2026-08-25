export function neutralLocationState(){return {city:'',campus:'',zone:'',maxDistance:''}}
export function distanceEnabled(s){return Boolean(s.city&&(s.city==='Milano'?s.campus:s.zone))}
export function changeCity(s,city){s.city=city||'';s.campus='';s.zone='';s.maxDistance='';if(s.sort==='distance')s.sort='date';return s}
export function changeCampus(s,campus){s.campus=campus||'';s.maxDistance='';if(!s.campus&&s.sort==='distance')s.sort='date';return s}
export function changeZone(s,zone){s.zone=zone||'';s.maxDistance='';if(!s.zone&&s.sort==='distance')s.sort='date';return s}
export function changeDistance(s,value){s.maxDistance=distanceEnabled(s)?(value||''):'';return s}
export function changeSort(s,value){s.sort=value==='distance'&&!distanceEnabled(s)?'date':(value||'date');return s}
