export default async function handler(req,res){
 try{
  const r=await fetch('https://roomanager.phosphoro.com/public/tmp/fuorisede.json',{headers:{accept:'application/json','user-agent':'FUORISEDE/1.0'}});
  const raw=await r.json(); const arr=Array.isArray(raw)?raw:(raw.items||raw.listings||raw.annunci||raw.data||[]);
  const out=arr.filter(x=>(x.property?.city||'')==='Ferrara').map(x=>({id:String(x.id),price:Number(x.monthlyPrice),title:(x.title&&((typeof x.title==='string'&&x.title)||x.title.it||x.title.en))||x.code,photos:(x.room?.photos?.length?x.room.photos:x.property?.photos||[]).length,address:[x.property?.address,x.property?.houseNumber].filter(Boolean).join(' '),url:x.url,availableFrom:x.availableFrom||null}));
  res.status(200).json({count:out.length,unique:new Set(out.map(x=>x.id)).size,missingPrice:out.filter(x=>!Number.isFinite(x.price)).length,missingPhotos:out.filter(x=>!x.photos).length,missingUrl:out.filter(x=>!x.url).length,items:out});
 }catch(e){res.status(502).json({error:String(e?.message||e)})}
}