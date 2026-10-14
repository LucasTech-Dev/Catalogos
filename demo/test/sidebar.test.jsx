import React from 'react';
import {it,expect,vi,beforeEach,afterEach} from 'vitest';
import {render,screen,fireEvent,cleanup} from '@testing-library/react';
const mocks=vi.hoisted(()=>({sair:vi.fn()}));
vi.mock('../src/components/admin/AdminGate',()=>({useAdminSessao:()=>({loja:{nome:'Loja autorizada'},sair:mocks.sair})}));
import AdminSidebar from '../src/components/admin/AdminSidebar';
beforeEach(()=>vi.clearAllMocks());afterEach(cleanup);
it('Etapa24: sidebar renderiza sessão autorizada sem tela branca',()=>{
  render(<AdminSidebar currentPath='/admin/produto/novo' open onNavigate={()=>{}}/>);
  expect(screen.getByText('Loja autorizada')).toBeTruthy();expect(screen.getByRole('link',{name:'Produtos'}).getAttribute('aria-current')).toBe('page');
});
it('Etapa24: Sair da sidebar encerra sessão em vez de só navegar',()=>{
  const onNavigate=vi.fn();render(<AdminSidebar currentPath='/admin' onNavigate={onNavigate}/>);
  fireEvent.click(screen.getByRole('link',{name:'Sair'}));expect(mocks.sair).toHaveBeenCalledOnce();expect(onNavigate).toHaveBeenCalledOnce();
});
