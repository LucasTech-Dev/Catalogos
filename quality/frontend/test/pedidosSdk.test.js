import {it,expect} from 'vitest';
import {criarPedido,CRIACAO_BLOQUEADA,projetarPedido} from '../../../frontend/src/services/pedidos';
import {calcularPrevia,validarPreviaCompra} from '../../../frontend/src/lib/previaCompra';
const itens=[{id:'a',ativo:true,preco:0.1,quantidade:3},{id:'b',ativo:true,preco:0.2,quantidade:1}],cliente={nome:'Teste',telefone:'51999999999'},loja={entrega:{habilitada:true,taxa:5},retirada:{habilitada:true},pagamentos:{pix:true}},endereco={rua:'Rua',numero:'1',bairro:'Centro',cidade:'Cidade',uf:'RS'};
const entrada={loja,itens,cliente,endereco,tipoEntrega:'entrega',forma:'pix'};
it('prévia reproduz arredondamento por item do backend',()=>{expect(calcularPrevia(itens,0.1)).toEqual({subtotal:0.5,taxaEntrega:0.1,total:0.6});});
it('entrega e retirada preservam taxa e endereço',()=>{expect(validarPreviaCompra(entrada).total).toBe(5.5);expect(validarPreviaCompra({...entrada,tipoEntrega:'retirada',endereco:null}).total).toBe(0.5);});
it.each([{endereco:null},{tipoEntrega:'invalido'},{forma:'bitcoin'},{itens:[{...itens[0],disponivel:false}]},{itens:[{...itens[0],quantidade:100}]},{loja:{...loja,pedidoMinimo:20}},{loja:{...loja,entrega:{habilitada:false}}}])('prévia rejeita condição inválida %j',patch=>expect(()=>validarPreviaCompra({...entrada,...patch})).toThrow());
it('B-02 impede qualquer criação, sem simular confirmação',async()=>{await expect(criarPedido({itens})).rejects.toMatchObject({code:'PEDIDO_CRIACAO_BLOQUEADA',message:CRIACAO_BLOQUEADA});});
it('DTO preserva Timestamp e retira campos fora do contrato React',()=>{const p=projetarPedido({itens:[],criadoEm:{seconds:42,nanoseconds:5},interno:'nao-retornar'},'id');expect(p.criadoEm).toEqual({_seconds:42,_nanoseconds:5});expect(p.interno).toBeUndefined();});

it('projeção preserva observação histórica por item sem expor campos privados',()=>{expect(projetarPedido({itens:[{nome:'Produto',observacao:'Sem cebola',privado:'segredo'}]},'id').itens).toEqual([{nome:'Produto',observacao:'Sem cebola'}]);});
