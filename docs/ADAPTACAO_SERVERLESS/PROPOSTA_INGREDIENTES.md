# Proposta de ingredientes — 11 produtos — 25/10/2026

Anexo revisável da ING-01 ao plano único, não executável. Inventário atual: 11 produtos na origem e nove ativos no catálogo público; conferência das nove projeções sem divergência dos campos comerciais consultados. Fontes: leitura GET autorizada de lojas/loja-demo/produtos e leitura pública WebSDK em 25/10/2026. Nenhuma escrita.

Novas composições são propostas para aprovação. A lista do Classic Burger já existe e será preservada. IDs, preços, categorias, disponibilidade, imagens e descrições não serão alterados.

| Produto / ID | Estado | Lista proposta ou composição | Decisão |
| --- | --- | --- | --- |
| Bacon Burger (`bacon-burger`) | Ativo | Pão de hambúrguer; Hambúrguer artesanal; Queijo; Bacon; Molho especial | Preservar molho especial da descrição; não substituir por maionese. Pão é proposta adicional, ainda não documentada na descrição. |
| Bacon Supreme (`bacon-supreme`) | Ativo | Pão de hambúrguer; Hambúrguer artesanal; Cheddar; Bacon crocante; Molho da casa | Sem segunda carne ou cebola caramelizada: não constam na descrição. Preservar cheddar, bacon crocante e molho da casa; pão proposto. |
| Batata da Casa (`batata-da-casa`) | Ativo | Batata; Óleo vegetal; Sal; Molho especial | Preservar molho especial documentado; não acrescentar cheddar, bacon ou cebolinha. Óleo e sal são proposta, não receita confirmada. |
| Batata Frita (`batata-frita`) | Ativo | Batata; Óleo vegetal; Sal | Batata, óleo e sal são proposta; a descrição atual informa somente porção individual. |
| Chicken Crispy (`chicken-crispy`) | Ativo | Pão de hambúrguer; Frango empanado; Queijo; Alface; Molho especial | Preservar molho especial da descrição; não substituir por maionese. Pão e preparo empanado propostos, pendentes de aprovação. |
| Classic Burger (`classic-burger`) | Ativo | Pão brioche; Hambúrguer artesanal; Queijo cheddar; Molho especial; Alface; Tomate | Preservar exatamente a lista já cadastrada, incluindo pão brioche e queijo cheddar. |
| Coca-Cola Lata (`coca-cola-lata`) | Ativo | Bebida industrializada fechada; ingredientes permanecem vazios, sem remoção. | Manter lista vazia; refrigerante fechado 350 ml. Não criar remoção de componentes industriais. |
| Combo Classic (`combo-classic`) | Inativo, preservado | Componentes: Classic Burger + batata frita + refrigerante; ingredientes permanecem vazios. | Manter inativo. Composição documentada: Classic Burger + batata frita + refrigerante. Componentes não serão gravados como ingredientes removíveis. |
| Guaraná Lata (`guarana-lata`) | Inativo, preservado | Bebida industrializada fechada; ingredientes permanecem vazios, sem remoção. | Manter inativo e lista vazia; refrigerante fechado 350 ml. Sem opções de remoção. |
| Onion Rings (`onion-rings`) | Ativo | Cebola; Farinha de trigo; Temperos; Massa para empanar; Óleo vegetal | Cebola empanada consta na descrição; farinha de trigo, temperos, massa e óleo são sugestões pendentes de aprovação. |
| Refrigerante (`refrigerante`) | Ativo | Bebida industrializada fechada; ingredientes permanecem vazios, sem remoção. | Manter lista vazia; sabor e embalagem não definidos no cadastro. Não criar variações nem opções de remoção. |

Diferença proposta: seis listas vazias passam a conter ingredientes (Bacon Burger, Bacon Supreme, Chicken Crispy, Batata da Casa, Batata Frita e Onion Rings). Classic Burger permanece igual; três bebidas e Combo Classic permanecem sem array artificial de ingredientes. Combo e Guaraná continuam inativos.

Não confundir componentes do combo, ingredientes de preparo e itens removíveis. Pedidos de retirada já podem seguir nas observações existentes; qualquer seletor deverá refletir a lista de removíveis aprovada por produto e reaproveitar esse fluxo (carrinho → checkout → observação do pedido → painel), sem reduzir preço ou criar adicionais. Não há promessa de ausência de alergênicos ou contaminação cruzada.

Compatibilidade: campo ingredientes já aceito pelo editor/serviço, projeção pública e Rules. Não são necessárias novas coleções ou Rules para cadastrar estas listas. Uma aplicação futura deve usar a transação existente de origem/projeção/revisão, preservando campos comerciais e abortando em divergência. Aprovar esta proposta não autoriza automaticamente deploy, push, IAM ou alteração de Rules.

A — Codex: inventário, comparação, manifesto e verificação local do contrato preparados. B — proprietário: aprovar ou corrigir as listas e, em ato específico, autorizar eventual atualização dos seis produtos no Firebase bancorestaurante/loja-demo. Nenhuma operação remota de escrita disparada.
