import React from 'react';
import {it,expect,vi,afterEach} from 'vitest';
import {render,screen,fireEvent,cleanup} from '@testing-library/react';
import ObservacaoItem from '../../../frontend/src/components/ui/ObservacaoItem';
import ProductCard from '../../../frontend/src/components/ui/ProductCard';
afterEach(cleanup);
it('edita apenas ao sair do campo e entrega a chave da variante correta',()=>{
 const salvar=vi.fn(),item={id:'p',chave:'p|sem sal',nome:'Produto A',observacao:'sem sal'};
 render(<ObservacaoItem item={item} onSalvar={salvar}/>);
 const campo=screen.getByRole('textbox');fireEvent.change(campo,{target:{value:'molho separado'}});expect(salvar).not.toHaveBeenCalled();
 fireEvent.blur(campo);expect(salvar).toHaveBeenCalledWith(item.chave,'molho separado');
});
it('erro preserva observação confirmada e explica falha',()=>{
 render(<ObservacaoItem item={{id:'p',nome:'Produto',observacao:'original'}} onSalvar={()=>false}/>);
 const campo=screen.getByRole('textbox');fireEvent.change(campo,{target:{value:'nova'}});fireEvent.blur(campo);
 expect(campo.value).toBe('original');expect(screen.getByRole('alert')).toBeTruthy();
});
it('editor fica desabilitado durante gravação',()=>{
 render(<ObservacaoItem item={{id:'p',nome:'Produto'}} onSalvar={vi.fn()} disabled/>);
 expect(screen.getByRole('textbox').disabled).toBe(true);
});
it('produto indisponível mantém detalhes consultáveis sem ação de adicionar',()=>{
 render(<ProductCard produto={{id:'p',nome:'Produto',ativo:true,disponivel:false,preco:10}}/>);
 expect(screen.getByRole('link',{name:'Produto'})).toBeTruthy();
 expect(screen.queryByRole('link',{name:'Ver Produto'})).toBeNull();
 expect(screen.getByRole('status').className).toContain('add-button-unavailable');
});
