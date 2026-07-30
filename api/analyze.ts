export default async function handler(req:any,res:any){
 if(req.method!=='POST')return res.status(405).json({error:'POST only'});
 const key=process.env.GEMINI_API_KEY;if(!key)return res.status(500).json({error:'GEMINI_API_KEY is not configured on Vercel'});
 try{
  const {text,file}=req.body||{};if(!text&&!file?.data)return res.status(400).json({error:'No text or file supplied'});
  const prompt=`You are Gradeflow Academic Import AI for an Indian engineering college. Extract ONLY facts explicitly present in the supplied source. Never invent a mark, credit, weight, date, subject mapping, grade boundary, SGPA or CGPA. Return JSON only with this shape: {"summary":"","confidence":0,"changes":[{"type":"mark|assessment_rule|exam_date|holiday|deadline|subject|credit|result|other","subject":"","assessment":"","value":null,"max":null,"weight_percent":null,"date":null,"description":"","confidence":0}],"warnings":[]}. If information is ambiguous put it in warnings and lower confidence. Source text follows:\n${text||''}`;
  const parts:any[]=[{text:prompt}];if(file?.data)parts.push({inlineData:{mimeType:file.mimeType||'application/octet-stream',data:file.data}});
  const r=await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent',{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},body:JSON.stringify({contents:[{parts}],generationConfig:{responseMimeType:'application/json',temperature:0.1}})});
  const raw=await r.json();if(!r.ok)return res.status(r.status).json({error:raw?.error?.message||'Gemini request failed'});
  const out=raw?.candidates?.[0]?.content?.parts?.[0]?.text;if(!out)return res.status(502).json({error:'Gemini returned no analysis'});
  let parsed;try{parsed=JSON.parse(out)}catch{parsed={summary:out,confidence:0,changes:[],warnings:['Model response was not valid JSON']}}
  return res.status(200).json(parsed);
 }catch(e:any){return res.status(500).json({error:e?.message||'Analysis failed'})}
}
