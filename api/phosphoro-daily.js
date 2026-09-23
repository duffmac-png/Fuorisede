const FEED='https://roomanager.phosphoro.com/public/tmp/fuorisede.json';
export default async function handler(req,res){
 if(req.method!=='GET') return res.status(405).json({ok:false,error:'method_not_allowed'});
 try{
  const r=await fetch(FEED,{headers:{accept:'application/json','user-agent':'FUORISEDE/1.0'},cache:'no-store'});
  if(!r.ok) throw new Error('feed_http_'+r.status);
  const raw=await r.json(); const a=Array.isArray(raw)?raw:(raw.items||raw.listings||raw.annunci||raw.data||[]);
  const ferrara=a.filter(x=>(x.property?.city||'')==='Ferrara');
  const ids=ferrara.map(x=>String(x.id)); const unique=new Set(ids);
  const bad=ferrara.filter(x=>!x.id||!x.url||!(x.room?.photos?.length||x.property?.photos?.length));
  const zeroPrice=ferrara.filter(x=>Number(x.monthlyPrice)===0).length;
  if(!ferrara.length||unique.size!==ferrara.length||bad.length) throw new Error('feed_validation_failed');
  console.log('PHOSPHORO_DAILY_OK',JSON.stringify({count:ferrara.length,zeroPrice,checkedAt:new Date().toISOString()}));
  return res.status(200).json({ok:true,count:ferrara.length,unique:unique.size,zeroPrice,checkedAt:new Date().toISOString()});
 }catch(e){
  console.error('PHOSPHORO_DAILY_FAIL',String(e?.message||e));
  return res.status(502).json({ok:false,fallback:'static_snapshot_preserved',error:String(e?.message||e)});
 }
}