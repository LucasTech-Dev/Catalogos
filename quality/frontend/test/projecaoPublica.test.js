import {it,expect} from 'vitest';
import {projetarRegistro,salvarComProjecao} from '../../../frontend/src/services/projecaoPublica.js';
it('remove campos reservados na raiz e em mapas sem modificar a origem',()=>{
 const origem={nome:'Loja',segredo:'sentinela',endereco:{rua:'Rua pública',segredo:'sentinela'},horarios:{segunda:{abertura:'09:00',fechamento:'18:00',segredo:'sentinela'}},pagamentos:{pix:true,credencial:'sentinela'},entrega:{habilitada:true,taxa:5,segredo:'sentinela'}};
 const antes=JSON.stringify(origem),publico=projetarRegistro('loja',origem);
 expect(JSON.stringify(publico)).not.toMatch(/segredo|credencial|sentinela/);
 expect(publico.endereco.rua).toBe('Rua pública');expect(publico.horarios.segunda).toBe('09:00 às 18:00');
 expect(JSON.stringify(origem)).toBe(antes);
});
it('mantém horários textuais, aliases e taxa legada no contrato do React',()=>{
 const p=projetarRegistro('loja',{horarioFuncionamento:{'terça':{fechado:true},sabado:'10h às 14h'},taxaEntrega:7});
 expect(p.horarios.terca).toBe('Fechado');expect(p.horarios.sabado).toBe('10h às 14h');expect(p.entrega.taxa).toBe(7);
 expect(projetarRegistro('loja',{horarios:'Segunda a sexta'}).horarios).toBe('Segunda a sexta');
});
it('rejeita ingredientes estruturados, excesso e campos públicos com tipos indevidos',()=>{
 for(const ingredientes of [[{segredo:'sentinela'}],[1],Array(51).fill('Arroz')])expect(()=>projetarRegistro('produtos',{preco:1,ingredientes})).toThrow();
 expect(()=>projetarRegistro('produtos',{preco:1,nome:{segredo:'sentinela'}})).toThrow();
 expect(()=>projetarRegistro('loja',{horarios:{segunda:{abertura:{segredo:'sentinela'}}}})).toThrow();
});
it('bloqueia identificadores e patches fora do contrato antes de acessar o banco',async()=>{
 for(const id of ['../loja-b','loja/b','loja\\b',''])await expect(salvarComProjecao(null,id,'loja')).rejects.toThrow('Registro inválido');
 await expect(salvarComProjecao(null,'loja-a','produtos','prato',{segredo:'sentinela'})).rejects.toThrow('contrato público');
});

it('nunca inventa preço zero para produto sem preço válido na origem',()=>{
 for(const preco of [undefined,null,'20',NaN,-1,1000001])expect(()=>projetarRegistro('produtos',{preco})).toThrow('Preço público inválido');
 expect(projetarRegistro('produtos',{preco:0}).preco).toBe(0);
});
