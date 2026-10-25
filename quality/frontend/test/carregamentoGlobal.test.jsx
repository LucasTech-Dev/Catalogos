import React,{useCallback} from 'react';
import {it,expect,vi,beforeEach,afterEach,describe} from 'vitest';
import {render,screen,act,fireEvent,cleanup,waitFor} from '@testing-library/react';
const m=vi.hoisted(()=>({auth:{currentUser:null},listener:null,ler:vi.fn(),admin:vi.fn(),perfil:vi.fn(),enderecos:vi.fn()}));
vi.mock('../../../frontend/src/lib/firebase',()=>({auth:m.auth}));
vi.mock('firebase/auth',()=>({onIdTokenChanged:(_,cb)=>{m.listener=cb;return ()=>{m.listener=null;};}}));
vi.mock('../../../frontend/src/services/api',()=>({api:m.ler}));
vi.mock('../../../frontend/src/services/admin',()=>({admin:{listar:m.admin}}));
import {PageBoundary,PageLoader} from '../../../frontend/src/components/ui/PageLoader';
import {useRecurso} from '../../../frontend/src/hooks/useRecurso';
import {useAdminRecurso} from '../../../frontend/src/hooks/useAdmin';
import {LIMITE_LEITURA_MS} from '../../../frontend/src/lib/carregamento';
const adiar=()=>{let resolve,reject;const promise=new Promise((r,j)=>{resolve=r;reject=j;});return {promise,resolve,reject};};
beforeEach(()=>{vi.resetAllMocks();m.auth.currentUser=null;});
afterEach(()=>{cleanup();vi.useRealTimers();});
function Conta({fonte=m.ler}){
 const recurso=useRecurso(fonte,[]);
 return <><nav>Navegação</nav><PageBoundary recursos={[recurso]}><p>Lista: {recurso.dados.map(d=>d.nome).join(',')||'vazia'}</p><button onClick={recurso.atualizar}>Atualizar</button>{recurso.carregando&&<small>Atualizando</small>}{recurso.erro&&<p role="alert">{recurso.erro}</p>}</PageBoundary></>;
}
async function sessao(uid='A'){await act(async()=>{m.auth.currentUser=uid?{uid}:null;m.listener(m.auth.currentUser);});}
it('aguarda resolução inicial de Auth, sem leitura prematura ou conteúdo privado',async()=>{
 m.ler.mockResolvedValue([{nome:'Cliente A'}]);render(<Conta/>);
 expect(screen.getByText('Carregando...')).toBeTruthy();expect(screen.queryByText(/Lista:/)).toBeNull();expect(m.ler).not.toHaveBeenCalled();expect(screen.getByText('Navegação')).toBeTruthy();
 await sessao();await screen.findByText('Lista: Cliente A');expect(m.ler).toHaveBeenCalledTimes(1);
 await sessao();expect(m.ler).toHaveBeenCalledTimes(1);
});
it('aguarda todas as dependências essenciais, sem depender das imagens',()=>{
 const {rerender}=render(<PageBoundary recursos={[{pronto:true},{pronto:false}]}><img src="/quebrada.jpg" alt="Imagem opcional"/><p>Completo</p></PageBoundary>);
 expect(screen.queryByText('Completo')).toBeNull();
 rerender(<PageBoundary recursos={[{pronto:true},{pronto:true}]}><img src="/quebrada.jpg" alt="Imagem opcional"/><p>Completo</p></PageBoundary>);
 expect(screen.getByText('Completo')).toBeTruthy();fireEvent.error(screen.getByAltText('Imagem opcional'));expect(screen.queryByText('Carregando...')).toBeNull();
});
it('diferencia lista vazia de loading e erro; retry não mantém loading preso',async()=>{
 m.ler.mockRejectedValueOnce(new Error('Falha de rede')).mockResolvedValueOnce([]);render(<Conta/>);await sessao();
 expect(screen.getByRole('alert').textContent).toContain('Falha de rede');expect(screen.queryByText('Lista: vazia')).toBeNull();
 fireEvent.click(screen.getByText('Tentar novamente'));await screen.findByText('Lista: vazia');expect(m.ler).toHaveBeenCalledTimes(2);
});
it('mantém conteúdo validado durante atualização secundária e falha transitória',async()=>{
 const pendente=adiar();m.ler.mockResolvedValueOnce([{nome:'Pronto'}]).mockImplementationOnce(()=>pendente.promise);render(<Conta/>);await sessao();
 fireEvent.click(screen.getByText('Atualizar'));expect(screen.getByText('Lista: Pronto')).toBeTruthy();expect(screen.queryByText('Carregando...')).toBeNull();
 await act(async()=>pendente.reject(new Error('Sem conexão')));expect(screen.getByText('Lista: Pronto')).toBeTruthy();expect(screen.getByRole('alert').textContent).toBe('Sem conexão');
});
it('remove conteúdo privado ao revogar permissão durante uma releitura',async()=>{
 m.ler.mockResolvedValueOnce([{nome:'Privado'}]).mockRejectedValueOnce(Object.assign(new Error('Acesso negado'),{status:403}));render(<Conta/>);await sessao();
 fireEvent.click(screen.getByText('Atualizar'));await screen.findByText('Não foi possível abrir esta página');expect(screen.queryByText('Lista: Privado')).toBeNull();
});
it('limpa dados na troca de conta e ignora resposta antiga fora de ordem',async()=>{
 const antiga=adiar(),nova=adiar();m.ler.mockImplementationOnce(()=>antiga.promise).mockImplementationOnce(()=>nova.promise);render(<Conta/>);await sessao('A');await sessao('B');
 await act(async()=>antiga.resolve([{nome:'Privado A'}]));expect(screen.queryByText(/Privado A/)).toBeNull();expect(screen.getByText('Carregando...')).toBeTruthy();
 await act(async()=>nova.resolve([{nome:'Cliente B'}]));expect(screen.getByText('Lista: Cliente B')).toBeTruthy();
});
it('trocar o recurso não revela resultado anterior nem inicia consulta extra',async()=>{
 const fonteA=vi.fn().mockResolvedValue([{nome:'Rota A'}]),pendente=adiar(),fonteB=vi.fn(()=>pendente.promise);
 const view=render(<Conta fonte={fonteA}/>);await sessao();view.rerender(<Conta fonte={fonteB}/>);await sessao();
 expect(screen.queryByText('Lista: Rota A')).toBeNull();expect(screen.getByText('Carregando...')).toBeTruthy();
 await act(async()=>pendente.resolve([{nome:'Rota B'}]));expect(screen.getByText('Lista: Rota B')).toBeTruthy();expect(fonteB).toHaveBeenCalledTimes(1);
});
it('encerra espera de leitura pendente por timeout e admite retry, sem resultado atrasado',async()=>{
 vi.useFakeTimers();const pendente=adiar();m.ler.mockImplementationOnce(()=>pendente.promise).mockResolvedValueOnce([]);render(<Conta/>);await sessao();
 await act(async()=>vi.advanceTimersByTimeAsync(LIMITE_LEITURA_MS));expect(screen.getByRole('alert').textContent).toContain('demorou mais');
 await act(async()=>pendente.resolve([{nome:'Tardio'}]));expect(screen.queryByText(/Tardio/)).toBeNull();
 await act(async()=>fireEvent.click(screen.getByText('Tentar novamente')));expect(screen.getByText('Lista: vazia')).toBeTruthy();
});
it('encerra espera de Auth que não resolveu, com opção de tentar novamente',async()=>{
 vi.useFakeTimers();render(<Conta/>);await act(async()=>vi.advanceTimersByTimeAsync(LIMITE_LEITURA_MS));
 expect(screen.getByRole('alert').textContent).toContain('verificar sua sessão');expect(screen.queryByText('Carregando...')).toBeNull();expect(screen.getByText('Tentar novamente')).toBeTruthy();
});
function Painel({categoria='a'}){
 const carregar=useCallback(()=>m.admin(categoria),[categoria]),r=useAdminRecurso(carregar);
 return <PageBoundary recursos={[r]}><p>Admin: {r.dados?.nome}</p><button onClick={r.atualizar}>Recarregar</button></PageBoundary>;
}
it('admin não renderiza métricas provisórias; troca de filtro não revela o dado anterior',async()=>{
 const pendente=adiar();m.admin.mockResolvedValueOnce({nome:'Categoria A'}).mockImplementationOnce(()=>pendente.promise);
 const view=render(<Painel/>);expect(screen.queryByText(/Admin:/)).toBeNull();await screen.findByText('Admin: Categoria A');
 view.rerender(<Painel categoria="b"/>);expect(screen.queryByText('Admin: Categoria A')).toBeNull();
 await act(async()=>pendente.resolve({nome:'Categoria B'}));expect(screen.getByText('Admin: Categoria B')).toBeTruthy();
});
it('loader acessível tem identidade opcional e imagem do logo não prende a carga',()=>{
 render(<PageLoader loja={{nome:'Minha loja',logo:'/logo-invalido.svg'}}/>);expect(screen.getByRole('status').getAttribute('aria-busy')).toBe('true');
 const logo=screen.getByAltText('Minha loja');fireEvent.error(logo);expect(logo.hidden).toBe(true);expect(screen.getByText('Carregando...')).toBeTruthy();
});
it('cliques rápidos na atualização compartilham a mesma leitura pendente',async()=>{
 const pendente=adiar();m.ler.mockResolvedValueOnce([{nome:'Atual'}]).mockImplementationOnce(()=>pendente.promise);render(<Conta/>);await sessao();
 fireEvent.click(screen.getByText('Atualizar'));fireEvent.click(screen.getByText('Atualizar'));expect(m.ler).toHaveBeenCalledTimes(2);
 await act(async()=>pendente.resolve([{nome:'Novo'}]));expect(screen.getByText('Lista: Novo')).toBeTruthy();
});
it('admin preserva conteúdo em atualização e encerra timeout inicial com retry',async()=>{
 vi.useFakeTimers();m.admin.mockImplementationOnce(()=>new Promise(()=>{})).mockResolvedValueOnce({nome:'Pronto'});render(<Painel/>);
 await act(async()=>vi.advanceTimersByTimeAsync(LIMITE_LEITURA_MS));expect(screen.getByRole('alert').textContent).toContain('demorou mais');
 await act(async()=>fireEvent.click(screen.getByText('Tentar novamente')));expect(screen.getByText('Admin: Pronto')).toBeTruthy();
});
