// Chrome DevTools Protocol com WebSocket nativo do Node 24, sem dependências extras.
const {spawn}=require('node:child_process');
const fs=require('node:fs/promises');
const path=require('node:path');
const os=require('node:os');
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function chrome() {
  const perfil=await fs.mkdtemp(path.join(os.tmpdir(),'catalogos-chrome-'));
  const proc=spawn(process.env.CHROME_BIN || '/usr/bin/google-chrome',['--headless=new','--disable-gpu','--no-sandbox','--disable-dev-shm-usage','--no-first-run','--disable-background-networking','--remote-debugging-address=127.0.0.1','--remote-debugging-port=0','--user-data-dir='+perfil,'about:blank'],{stdio:'ignore'});
  let port;
  for(let i=0;i<100;i++){try{port=Number((await fs.readFile(path.join(perfil,'DevToolsActivePort'),'utf8')).split('\n')[0]);break;}catch{await pause(100);}}
  if(!port){proc.kill();throw new Error('Chrome não iniciou.');}
  const target=await (await fetch('http://127.0.0.1:'+port+'/json/new?about:blank',{method:'PUT'})).json();
  const ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.addEventListener('open',r,{once:true});ws.addEventListener('error',j,{once:true});});
  let n=0;const pending=new Map(),errors=[],consoleErrors=[];
  ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);if(p){pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(new Error(m.error.message)):p.resolve(m.result);}}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text);else if(m.method==='Runtime.consoleAPICalled' && m.params.type==='error')consoleErrors.push(m.params.args.map(a=>a.value || a.description || '').join(' ').slice(0,500));});
  function send(method,params={}){return new Promise((resolve,reject)=>{const id=++n;const timer=setTimeout(()=>{pending.delete(id);reject(new Error('CDP timeout: '+method));},30000);pending.set(id,{resolve,reject,timer});ws.send(JSON.stringify({id,method,params}));});}
  await send('Page.enable');await send('Runtime.enable');await send('Network.enable');
  async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw new Error('Falha no JavaScript de teste: '+(r.exceptionDetails.exception?.description || r.exceptionDetails.text));return r.result.value;}
  async function wait(expression,timeout=25000){const start=Date.now();while(Date.now()-start<timeout){try{if(await evaluate(expression))return;}catch(error){if(!/context|Uncaught|Cannot read/i.test(error.message))throw error;}await pause(100);}throw new Error('Espera não atendida: '+expression);}
  async function navigate(url){await send('Page.navigate',{url});await wait('location.href==='+JSON.stringify(url)+' && document.readyState === "complete" && Boolean(document.body)');}
  async function click(selector){await wait('Boolean(document.querySelector('+JSON.stringify(selector)+'))');await evaluate('document.querySelector('+JSON.stringify(selector)+').click()');}
  async function fill(selector,value){await wait('Boolean(document.querySelector('+JSON.stringify(selector)+'))');await evaluate(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});if(!el)throw Error('campo ausente');const proto=el.tagName==='SELECT'?HTMLSelectElement.prototype:el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(el,${JSON.stringify(value)});el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));})()`);}
  return {send,evaluate,wait,navigate,click,fill,errors,consoleErrors,pause,async screenshot(file){await send('Page.bringToFront');await pause(150);const r=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await fs.writeFile(file,Buffer.from(r.data,'base64'));},async close(){ws.close();proc.kill('SIGTERM');await pause(300);await fs.rm(perfil,{recursive:true,force:true});}};
}
module.exports={chrome,pause};
