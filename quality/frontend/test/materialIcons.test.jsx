import React from 'react';
import {it,expect,afterEach} from 'vitest';
import {render,screen,cleanup} from '@testing-library/react';
import MaterialIcon,{CategoryIcon} from '../../../frontend/src/components/ui/MaterialIcon';
afterEach(cleanup);
it('mantém o nome acessível do controle sem anunciar o ícone decorativo',()=>{
 render(<button aria-label="Abrir carrinho"><MaterialIcon name="shopping_cart"/></button>);
 const b=screen.getByRole('button',{name:'Abrir carrinho'});
 expect(b.querySelector('svg').getAttribute('aria-hidden')).toBe('true');
 expect(b.querySelector('svg path').getAttribute('d').length).toBeGreaterThan(20);
 expect(b.querySelector('img,link')).toBeNull();
});
it('exibe categorias legadas como SVG, preservando os dados de configuração',()=>{
 const categoria={nome:'Bebidas',icone:'🥤'};const {container}=render(<CategoryIcon categoria={categoria}/>);
 expect(container.textContent).toBe('');expect(container.querySelector('svg path')).toBeTruthy();expect(categoria.icone).toBe('🥤');
});
it('fornece ícone neutro quando a categoria ou nome não é reconhecido',()=>{
 const {container}=render(<><CategoryIcon categoria={{nome:'Especiais'}}/><MaterialIcon name="inexistente"/></>);
 expect(container.querySelectorAll('svg path').length).toBeGreaterThanOrEqual(2);
});
