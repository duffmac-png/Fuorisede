export function neutralLocationState(){return {city:'',campus:'',zone:'',maxDistance:'',selected:new Set(),compareOpen:false}}
export function distanceEnabled(s){return Boolean(s.city&&(s.city==='Milano'?s.campus:s.zone))}
export function clearComparison(s){s.selected=new Set();s.compareOpen=false;return s}
export function changeFilter(s,key,value){s[key]=value??'';return clearComparison(s)}
export function changeCity(s,city){s.city=city||'';s.campus='';s.zone='';s.maxDistance='';if(s.sort==='distance')s.sort='date';return clearComparison(s)}
export function changeCampus(s,campus){s.campus=campus||'';s.maxDistance='';if(!s.campus&&s.sort==='distance')s.sort='date';return clearComparison(s)}
export function changeZone(s,zone){s.zone=zone||'';s.maxDistance='';if(!s.zone&&s.sort==='distance')s.sort='date';return clearComparison(s)}
export function changeDistance(s,value){s.maxDistance=distanceEnabled(s)?(value||''):'';return clearComparison(s)}
export function changeSort(s,value){s.sort=value==='distance'&&!distanceEnabled(s)?'date':(value||'date');return clearComparison(s)}
