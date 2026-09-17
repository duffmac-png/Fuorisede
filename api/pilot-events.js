var ALLOWED=new Set(['visit','listing_open','compare_action','interest_click','info_click','alert_click','partner_out']);
module.exports=async function(req,res){
 if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({ok:false,error:'POST required'})}
 var b=req.body||{};if(!ALLOWED.has(b.event))return res.status(400).json({ok:false,error:'Invalid event'});
 var event={event:b.event,sessionId:String(b.sessionId||'').slice(0,80),listingId:String(b.listingId||'').slice(0,80),listingTitle:String(b.listingTitle||'').slice(0,160),partner:String(b.partner||'').slice(0,40),path:String(b.path||'').slice(0,160),ts:new Date().toISOString()};
 console.log('FUORISEDE_PILOT_EVENT '+JSON.stringify(event));
 res.setHeader('Cache-Control','no-store');return res.status(204).end();
};