import {describe,it,expect} from 'vitest';
import {createRequire} from 'node:module';
import {TRANSICOES_STATUS,TRANSICOES_PAGAMENTO} from '../../../frontend/src/services/adminPedidos.js';
const require=createRequire(import.meta.url);
describe('contratos preservados na Ordem007',()=>{
 it('preserva exatamente a matriz operacional original',()=>{
  expect(TRANSICOES_STATUS).toEqual(require('../../fixtures/contratos-originais/src/services/pedidoStatusService.js').TRANSICOES_PERMITIDAS);
 });
 it('preserva exatamente a matriz financeira original',()=>{
  expect(TRANSICOES_PAGAMENTO).toEqual(require('../../fixtures/contratos-originais/src/services/pagamentoService.js').TRANSICOES_PAGAMENTO);
 });
});
