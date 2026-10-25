import {it,expect,vi,beforeEach} from 'vitest';
const {auth,sessao,sessaoExistente}=vi.hoisted(()=>({auth:{currentUser:null},sessao:vi.fn(),sessaoExistente:vi.fn()}));
vi.mock('../../../frontend/src/lib/firebase',()=>({auth,sessao,sessaoExistente}));
import {api} from '../../../frontend/src/services/api';
beforeEach(()=>{vi.resetAllMocks();auth.currentUser=null;});
it('renova ID Token uma vez após 401 sem mudar chave ou corpo',async()=>{
  const getIdToken=vi.fn().mockResolvedValueOnce('antigo').mockResolvedValueOnce('novo');sessao.mockResolvedValue({getIdToken});
  global.fetch=vi.fn().mockResolvedValueOnce({status:401,ok:false}).mockResolvedValueOnce({status:201,ok:true,json:async()=>({id:'pedido'})});
  await expect(api('/lojas/loja/pedidos',{method:'POST',body:{itens:[]},chave:'chave-estavel'})).resolves.toEqual({id:'pedido'});
  expect(getIdToken.mock.calls).toEqual([[false],[true]]);const calls=fetch.mock.calls;
  expect(calls[0][1].headers.Authorization).toBe('Bearer antigo');expect(calls[1][1].headers.Authorization).toBe('Bearer novo');expect(calls[0][1].body).toBe(calls[1][1].body);expect(calls[1][1].headers['Idempotency-Key']).toBe('chave-estavel');
});
it('catálogo público dispensa token e falha de conexão gera mensagem compreensível',async()=>{
  global.fetch=vi.fn().mockRejectedValue(new TypeError('network'));
  await expect(api('/publico/catalogo',{privado:false})).rejects.toThrow('Não foi possível conectar');expect(sessao).not.toHaveBeenCalled();
});

it('API administrativa não cria sessão anônima quando falta login',async()=>{
  sessaoExistente.mockRejectedValue(Object.assign(new Error('Entre com uma conta administrativa.'),{status:401}));global.fetch=vi.fn();
  await expect(api('/admin/lojas/loja/sessao',{administrativo:true})).rejects.toMatchObject({status:401});expect(sessao).not.toHaveBeenCalled();expect(fetch).not.toHaveBeenCalled();
});
it('API administrativa invalida painel após token recusado mesmo depois de renovar',async()=>{
  const getIdToken=vi.fn().mockResolvedValue('token');sessaoExistente.mockResolvedValue({getIdToken});global.fetch=vi.fn().mockResolvedValue({status:401,ok:false,json:async()=>({error:'Token revogado.'})});
  const listener=vi.fn();window.addEventListener('admin:sessao-invalida',listener);
  try{await expect(api('/admin/lojas/loja/sessao',{administrativo:true})).rejects.toMatchObject({status:401});expect(listener).toHaveBeenCalledOnce();expect(getIdToken.mock.calls).toEqual([[false],[true]]);expect(sessao).not.toHaveBeenCalled();}finally{window.removeEventListener('admin:sessao-invalida',listener);}
});

it('falha Firebase ao renovar token revogado também retira acesso administrativo',async()=>{
  sessaoExistente.mockResolvedValue({getIdToken:vi.fn().mockResolvedValueOnce('antigo').mockRejectedValueOnce({code:'auth/user-token-expired'})});
  global.fetch=vi.fn().mockResolvedValue({status:401,ok:false});const listener=vi.fn();window.addEventListener('admin:sessao-invalida',listener);
  try{await expect(api('/admin/lojas/loja/sessao',{administrativo:true})).rejects.toMatchObject({status:401,message:'Sessão expirada ou revogada. Entre novamente.'});expect(listener).toHaveBeenCalledOnce();}finally{window.removeEventListener('admin:sessao-invalida',listener);}
});

it('não envia mutação de checkout para identidade diferente da esperada',async()=>{
  sessao.mockResolvedValue({uid:'B',getIdToken:vi.fn().mockResolvedValue('token')});global.fetch=vi.fn();
  await expect(api('/pedidos',{method:'POST',expectedUid:'A',body:{}})).rejects.toMatchObject({status:409});expect(fetch).not.toHaveBeenCalled();
});

it('não envia dados quando UID muda durante obtenção do token',async()=>{
  let resolver;auth.currentUser={uid:'A'};sessao.mockResolvedValue({uid:'A',getIdToken:()=>new Promise(r=>{resolver=r;})});global.fetch=vi.fn();
  const chamada=api('/enderecos',{method:'POST',body:{rua:'Rua privada'}});await vi.waitFor(()=>expect(resolver).toBeTypeOf('function'));auth.currentUser={uid:'B'};resolver('token-antigo');
  await expect(chamada).rejects.toMatchObject({status:409});expect(fetch).not.toHaveBeenCalled();
});

it('Etapa 22: erro de validação mantém mensagem e não repete mutação nem invalida sessão',async()=>{
  const getIdToken=vi.fn().mockResolvedValue('token');sessaoExistente.mockResolvedValue({getIdToken});
  global.fetch=vi.fn().mockResolvedValue({status:400,ok:false,json:async()=>({error:'Preço deve possuir no máximo duas casas decimais.'})});
  const listener=vi.fn();window.addEventListener('admin:sessao-invalida',listener);
  try {
    await expect(api('/admin/lojas/loja/produtos',{administrativo:true,method:'POST',body:{nome:'Açaí',preco:1.001,categoriaId:'cat'}})).rejects.toMatchObject({status:400,message:'Preço deve possuir no máximo duas casas decimais.'});
    expect(fetch).toHaveBeenCalledOnce();expect(listener).not.toHaveBeenCalled();expect(getIdToken.mock.calls).toEqual([[false]]);
  } finally {window.removeEventListener('admin:sessao-invalida',listener);}
});
it('Etapa 22: checkout envia apenas contrato público e conserva Unicode e chave',async()=>{
  sessao.mockResolvedValue({getIdToken:vi.fn().mockResolvedValue('token')});global.fetch=vi.fn().mockResolvedValue({status:201,ok:true,json:async()=>({id:'pedido'})});
  const body={itens:[{produtoId:'produto',quantidade:2}],tipoEntrega:'retirada',cliente:{nome:'João D’Ávila 🍕',telefone:'11999999999'},pagamento:{forma:'pix'},observacao:'Sem cebola\nObrigado'};
  await api('/lojas/loja/pedidos',{method:'POST',body,chave:'etapa22-chave-0001'});
  expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual(body);expect(fetch.mock.calls[0][1].headers['Idempotency-Key']).toBe('etapa22-chave-0001');
});

it.each([400,401,403,404,409,429,500,503])('Etapa 23: interpreta HTTP %s com mensagem e diagnóstico seguros',async status=>{
  const getIdToken=vi.fn().mockResolvedValue('token');sessaoExistente.mockResolvedValue({getIdToken});
  global.fetch=vi.fn().mockResolvedValue({status,ok:false,json:async()=>({error:status>=500?'token=sentinela':'Erro esperado.'}),headers:{get:()=> '550e8400-e29b-41d4-a716-446655440000'}});
  const listener=vi.fn();window.addEventListener('admin:sessao-invalida',listener);
  try {
    await expect(api('/admin/lojas/loja/loja',{method:'PATCH',body:{nome:'Loja'},administrativo:true})).rejects.toMatchObject({status,requestId:'550e8400-e29b-41d4-a716-446655440000'});
    expect(fetch).toHaveBeenCalledOnce();expect(listener).toHaveBeenCalledTimes([401,403].includes(status)?1:0);
  }finally{window.removeEventListener('admin:sessao-invalida',listener);}
});
it('Etapa 23: 503 não renova token nem encerra sessão legítima',async()=>{
  const getIdToken=vi.fn().mockResolvedValue('token');sessaoExistente.mockResolvedValue({getIdToken});
  global.fetch=vi.fn().mockResolvedValue({status:503,ok:false,json:async()=>({error:'token=sentinela'})});
  await expect(api('/admin/lojas/loja/sessao',{administrativo:true})).rejects.toMatchObject({status:503,message:'Serviço temporariamente indisponível. Tente novamente.'});
  expect(fetch).toHaveBeenCalledOnce();expect(getIdToken.mock.calls).toEqual([[false]]);
});
it.each(['auth/network-request-failed','auth/internal-error'])('Etapa 23: falha Firebase %s não invalida painel',async code=>{
  sessaoExistente.mockResolvedValue({getIdToken:vi.fn().mockRejectedValue({code,message:'sentinela privada'})});global.fetch=vi.fn();
  const listener=vi.fn();window.addEventListener('admin:sessao-invalida',listener);
  try {await expect(api('/admin/sessao',{administrativo:true})).rejects.toMatchObject({status:code==='auth/network-request-failed'?503:500});expect(listener).not.toHaveBeenCalled();expect(fetch).not.toHaveBeenCalled();}finally{window.removeEventListener('admin:sessao-invalida',listener);}
});
it('Etapa 23: timeout limita obtenção de token e impede envio tardio',async()=>{
  vi.useFakeTimers();let resolver;const token=new Promise(resolve=>{resolver=resolve;});sessao.mockResolvedValue({getIdToken:()=>token});global.fetch=vi.fn();
  try {
    const p=api('/lojas/loja/pedidos',{method:'POST',body:{},chave:'etapa23-chave-0001',timeoutMs:100}).catch(e=>e);
    await vi.advanceTimersByTimeAsync(101);expect(await p).toMatchObject({status:503,code:'TIMEOUT'});resolver('token');await Promise.resolve();expect(fetch).not.toHaveBeenCalled();
  }finally{vi.useRealTimers();}
});
it('Etapa 23: timeout abrange resposta JSON e aborta transporte',async()=>{
  vi.useFakeTimers();sessao.mockResolvedValue({getIdToken:vi.fn().mockResolvedValue('token')});global.fetch=vi.fn().mockResolvedValue({status:200,ok:true,json:()=>new Promise(()=>{})});
  try {const p=api('/pedidos',{timeoutMs:100}).catch(e=>e);await vi.advanceTimersByTimeAsync(101);expect(await p).toMatchObject({code:'TIMEOUT'});expect(fetch.mock.calls[0][1].signal.aborted).toBe(true);}finally{vi.useRealTimers();}
});
it('Etapa 23: cancelamento explícito e prévio não envia mutação',async()=>{
  const controller=new AbortController();controller.abort();global.fetch=vi.fn();
  await expect(api('/pedidos',{method:'POST',body:{},signal:controller.signal})).rejects.toMatchObject({name:'AbortError'});expect(fetch).not.toHaveBeenCalled();expect(sessao).not.toHaveBeenCalled();
});
it.each([null,'texto'])('Etapa 23: resposta JSON incompatível %s não é sucesso',async data=>{
  global.fetch=vi.fn().mockResolvedValue({status:200,ok:true,json:async()=>data});
  await expect(api('/catalogo',{privado:false})).rejects.toMatchObject({status:502,code:'RESPONSE_INVALID'});
});
it('Etapa 23: JSON inválido em sucesso conserva falha em vez de devolver null',async()=>{
  global.fetch=vi.fn().mockResolvedValue({status:201,ok:true,json:async()=>{throw new SyntaxError('sentinela');}});
  await expect(api('/pedido',{privado:false})).rejects.toMatchObject({status:502,code:'RESPONSE_INVALID'});expect(fetch).toHaveBeenCalledOnce();
});
it('Etapa 23: UID trocado durante resposta 401 não renova nem invalida nova sessão',async()=>{
  let resolver;const user={uid:'A',getIdToken:vi.fn().mockResolvedValue('token')};auth.currentUser=user;sessaoExistente.mockResolvedValue(user);global.fetch=vi.fn().mockImplementation(()=>new Promise(resolve=>{resolver=resolve;}));
  const listener=vi.fn();window.addEventListener('admin:sessao-invalida',listener);
  try {const p=api('/admin/sessao',{administrativo:true}).catch(e=>e);await vi.waitFor(()=>expect(resolver).toBeTypeOf('function'));auth.currentUser={uid:'B'};resolver({status:401,ok:false});expect(await p).toMatchObject({status:409,code:'SESSION_CHANGED'});expect(fetch).toHaveBeenCalledOnce();expect(listener).not.toHaveBeenCalled();}finally{window.removeEventListener('admin:sessao-invalida',listener);}
});
it('Etapa 23: descarta JSON privado tardio após troca de UID',async()=>{
  let resolver;const user={uid:'A',getIdToken:vi.fn().mockResolvedValue('token')};auth.currentUser=user;sessao.mockResolvedValue(user);global.fetch=vi.fn().mockResolvedValue({status:200,ok:true,json:()=>new Promise(resolve=>{resolver=resolve;})});
  const p=api('/me').catch(e=>e);await vi.waitFor(()=>expect(resolver).toBeTypeOf('function'));auth.currentUser={uid:'B'};resolver({nome:'Cliente privado'});expect(await p).toMatchObject({code:'SESSION_CHANGED'});
});
it('Etapa 23: token que falha após troca de UID não encerra sessão nova',async()=>{
  let rejeitar;const user={uid:'A',getIdToken:()=>new Promise((_,reject)=>{rejeitar=reject;})};auth.currentUser=user;sessaoExistente.mockResolvedValue(user);
  const listener=vi.fn();window.addEventListener('admin:sessao-invalida',listener);
  try {const p=api('/admin/me',{administrativo:true}).catch(e=>e);await vi.waitFor(()=>expect(rejeitar).toBeTypeOf('function'));auth.currentUser={uid:'B'};rejeitar({code:'auth/user-token-expired'});expect(await p).toMatchObject({code:'SESSION_CHANGED'});expect(listener).not.toHaveBeenCalled();}finally{window.removeEventListener('admin:sessao-invalida',listener);}
});

it('Etapa 23: timeout cobre espera pela sessão sem iniciar fetch',async()=>{
  vi.useFakeTimers();sessao.mockImplementation(()=>new Promise(()=>{}));global.fetch=vi.fn();
  try {const p=api('/pedido',{timeoutMs:100}).catch(e=>e);await vi.advanceTimersByTimeAsync(101);expect(await p).toMatchObject({code:'TIMEOUT'});expect(fetch).not.toHaveBeenCalled();}finally{vi.useRealTimers();}
});
it('Etapa 23: timeout de fetch não reenvia mutação',async()=>{
  vi.useFakeTimers();sessao.mockResolvedValue({getIdToken:vi.fn().mockResolvedValue('token')});global.fetch=vi.fn().mockImplementation(()=>new Promise(()=>{}));
  try {const p=api('/lojas/loja/pedidos',{method:'POST',body:{},chave:'etapa23-chave-0001',timeoutMs:100}).catch(e=>e);await vi.advanceTimersByTimeAsync(101);expect(await p).toMatchObject({code:'TIMEOUT'});expect(fetch).toHaveBeenCalledOnce();expect(fetch.mock.calls[0][1].signal.aborted).toBe(true);}finally{vi.useRealTimers();}
});
it('Etapa 23: cancelamento durante fetch mantém AbortError sem repetir pedido',async()=>{
  const controller=new AbortController();sessao.mockResolvedValue({getIdToken:vi.fn().mockResolvedValue('token')});global.fetch=vi.fn().mockImplementation(()=>new Promise(()=>{}));
  const p=api('/pedido',{signal:controller.signal}).catch(e=>e);await vi.waitFor(()=>expect(fetch).toHaveBeenCalledOnce());controller.abort();expect(await p).toMatchObject({name:'AbortError'});expect(fetch.mock.calls[0][1].signal.aborted).toBe(true);
});
it('Etapa 23: resposta não JSON de erro preserva status e mensagem segura',async()=>{
  global.fetch=vi.fn().mockResolvedValue({status:500,ok:false,json:async()=>{throw new SyntaxError('sentinela privada');}});
  await expect(api('/catalogo',{privado:false})).rejects.toMatchObject({status:500,message:'Não foi possível concluir a operação.'});
});
it('Etapa 23: falha da sessão antiga durante espera não invalida novo UID',async()=>{
  let rejeitar;auth.currentUser={uid:'A'};sessaoExistente.mockImplementation(()=>new Promise((_,reject)=>{rejeitar=reject;}));global.fetch=vi.fn();
  const listener=vi.fn();window.addEventListener('admin:sessao-invalida',listener);
  try {const p=api('/admin/me',{administrativo:true}).catch(e=>e);await vi.waitFor(()=>expect(rejeitar).toBeTypeOf('function'));auth.currentUser={uid:'B'};rejeitar({status:401});expect(await p).toMatchObject({code:'SESSION_CHANGED'});expect(listener).not.toHaveBeenCalled();}finally{window.removeEventListener('admin:sessao-invalida',listener);}
});
