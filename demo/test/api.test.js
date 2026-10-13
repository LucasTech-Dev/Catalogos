import {it,expect,vi,beforeEach} from 'vitest';
const {auth,sessao,sessaoExistente}=vi.hoisted(()=>({auth:{currentUser:null},sessao:vi.fn(),sessaoExistente:vi.fn()}));
vi.mock('../src/lib/firebase',()=>({auth,sessao,sessaoExistente}));
import {api} from '../src/services/api';
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
