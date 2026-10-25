import {describe,it,expect} from 'vitest';
import {createRequire} from 'node:module';
import {CAMPOS_LOJA,validarLojaPatch,periodoGestao} from '../../../frontend/src/services/adminGestao.js';
const require=createRequire(import.meta.url),original=require('../../fixtures/contratos-originais/src/validators/administracao.js');
describe('contratos administrativos preservados008',()=>{
 it('mantém os campos originais de atualização da loja',()=>expect(CAMPOS_LOJA).toEqual(original.CAMPOS_LOJA));
 it('preserva validação de patch de horários, endereço e entrega',()=>{const p={nome:' Loja ',descricao:'Duas\nlinhas',entrega:{taxa:8.5},endereco:{uf:'rs',complemento:'Sala1'},horarios:{segunda:{fechamento:'19:00'}}};expect(validarLojaPatch(p)).toEqual(original.loja(p));});
 it('preserva período inclusivo com limite31 e fusoSãoPaulo',()=>{const p=periodoGestao({inicio:'2026-10-01',fim:'2026-10-31'});expect(p.de.toISOString()).toBe('2026-10-01T03:00:00.000Z');expect(p.ate.toISOString()).toBe('2026-11-01T03:00:00.000Z');expect(()=>periodoGestao({inicio:'2026-02-30'})).toThrow();expect(()=>periodoGestao({inicio:'2026-10-01',fim:'2026-11-01'})).toThrow();});
});
