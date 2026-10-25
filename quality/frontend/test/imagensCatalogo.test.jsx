import React from 'react';
import {it,expect,afterEach} from 'vitest';
import {render,screen,fireEvent,cleanup} from '@testing-library/react';
import ImagemCatalogo from '../../../frontend/src/components/ui/ImagemCatalogo';
afterEach(cleanup);
it('mantém foto e nome originais enquanto carregam',()=>{
 render(<ImagemCatalogo src="/foto-original.jpg" alt="Bacon Burger"/>);
 expect(screen.getByRole('img').getAttribute('src')).toBe('/foto-original.jpg');
 expect(screen.getByRole('img').getAttribute('alt')).toBe('Bacon Burger');
});
it.each(['',undefined,'   '])('campo vazio %s usa ilustração local e aviso acessível',src=>{
 render(<ImagemCatalogo src={src} alt="Batata Frita"/>);
 expect(screen.getByRole('img').getAttribute('src')).toBe('/demo-produto.svg');
 expect(screen.getByRole('img').getAttribute('alt')).toContain('foto indisponível');
});
it('erro usa fallback sem repetição e aceita uma referência corrigida',()=>{
 const {rerender}=render(<ImagemCatalogo src="/inexistente.jpg" alt="Chicken Crispy"/>);
 fireEvent.error(screen.getByRole('img'));
 expect(screen.getByRole('img').getAttribute('src')).toBe('/demo-produto.svg');
 fireEvent.error(screen.getByRole('img'));
 expect(screen.getByRole('img').getAttribute('src')).toBe('/demo-produto.svg');
 rerender(<ImagemCatalogo src="/corrigida.jpg" alt="Chicken Crispy"/>);
 expect(screen.getByRole('img').getAttribute('src')).toBe('/corrigida.jpg');
});
