import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)));
const types={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml'};
const port=Number(process.env.PORT||5174);
createServer(async(req,res)=>{
 try{
  const raw=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const candidate=resolve(root,'.'+(raw==='/'?'/index.html':raw));
  if(candidate!==root && !candidate.startsWith(root+sep)){res.writeHead(403);res.end('Forbidden');return;}
  const file=await readFile(candidate);const info=await stat(candidate);
  res.writeHead(200,{'content-type':types[extname(candidate)]||'application/octet-stream','cache-control':'no-cache','content-length':info.size});res.end(file);
 }catch(e){res.writeHead(e.code==='ENOENT'?404:500);res.end('Not found');}
}).listen(port,()=>console.log(`ZOND Labs: http://localhost:${port}`));
