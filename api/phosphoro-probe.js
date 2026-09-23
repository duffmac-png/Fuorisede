export default async function handler(req,res){
  if(req.method!=='GET') return res.status(405).json({ok:false,error:'method_not_allowed'});
  const url='https://roomanager.phosphoro.com/public/tmp/fuorisede.json';
  try{
    const r=await fetch(url,{headers:{'accept':'application/json','user-agent':'FUORISEDE/1.0'}});
    const textBody=await r.text();
    let raw; try{raw=JSON.parse(textBody)}catch(e){throw new Error('invalid_json:'+textBody.slice(0,120))}
    const arr=Array.isArray(raw)?raw:(raw?.items||raw?.listings||raw?.annunci||raw?.data||[]);
    const first=Array.isArray(arr)&&arr.length?arr[0]:null;
    console.log('PHOSPHORO_PROBE',JSON.stringify({status:r.status,count:Array.isArray(arr)?arr.length:null,root:Array.isArray(raw)?'array':Object.keys(raw||{}),firstKeys:first?Object.keys(first):[],first}));
    return res.status(200).json({ok:r.ok,status:r.status,count:Array.isArray(arr)?arr.length:null,root:Array.isArray(raw)?'array':Object.keys(raw||{}),firstKeys:first?Object.keys(first):[],first});
  }catch(e){console.error('PHOSPHORO_PROBE_ERROR',e);return res.status(502).json({ok:false,error:String(e?.message||e)})}
}