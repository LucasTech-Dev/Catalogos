# Catálogos — Plataforma de Catálogo e Pedidos

## Primeira entrega: Catálogo Demo

O primeiro produto desenvolvido neste repositório é um **catálogo fictício próprio**, usado como demonstração comercial para apresentar aos futuros clientes como o site pode funcionar.

### Demo atual

**Lanche da Vila** — lancheria fictícia criada para validar o visual e o fluxo do produto.

Fluxo da V1:

`CATÁLOGO → PRODUTO → CARRINHO → PEDIDO → WHATSAPP`

O sistema não realiza pagamento online na V1. O cliente monta o pedido e o envia para o WhatsApp da loja, onde o estabelecimento confirma os detalhes e combina o pagamento.

## Por que o demo fica separado

O demo é uma aplicação real de demonstração, mas seus dados são fictícios. A intenção é usá-lo para:

- vender o produto para clientes;
- validar o padrão visual e de experiência;
- testar catálogo, carrinho e pedido;
- servir como referência para futuras lojas;
- identificar o que deve virar componente reutilizável.

Depois, os dados e a identidade visual do demo poderão ser substituídos pelos dados de uma loja real sem reconstruir a plataforma.

## Estrutura

- `demo/` — primeira aplicação demonstrável e fictícia.
- `frontend/` — base reutilizável da plataforma.
- `backend/` — APIs e regras de negócio quando necessárias.
- `firebase/` — autenticação, Firestore, Storage e regras.
- `docs/` — arquitetura, fluxos e escopos.

## Stack

- React + JavaScript
- Tailwind CSS
- Node.js + Express quando necessário
- Firebase Authentication
- Firestore
- Firebase Storage quando necessário

## Arquitetura comercial

O objetivo é construir **um produto-base**, não um site descartável.

A estrutura do demo deve evoluir para permitir a criação de diferentes catálogos por configuração:

`MESMA PLATAFORMA → NOVA LOJA → NOVA IDENTIDADE → NOVOS PRODUTOS`

O conteúdo atual é fictício e não representa uma empresa real.
