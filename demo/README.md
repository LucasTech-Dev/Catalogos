# Catálogo Demo — Lanche da Vila

Esta pasta é a primeira aplicação completa do produto Catálogos. A empresa é fictícia, mas o funcionamento é real: autenticação, Firestore, catálogo, carrinho, criação de pedido, WhatsApp e painel administrativo.

## Preparação

1. Crie um projeto no Firebase.
2. Ative Authentication com Email/Password.
3. Crie o Firestore Database.
4. Copie .env.example para .env e preencha as credenciais do app Web.
5. Na raiz do repositório, execute firebase login e depois firebase deploy --only firestore.
6. Rode npm install dentro de demo.
7. Rode npm run dev.
8. Crie uma conta pelo próprio login.
9. No Firestore, altere manualmente o documento usuarios/UID dessa conta para:
   tipo = admin
   nivel = loja
   status = ativo
   lojaId = lanche-da-vila
10. Acesse /admin e clique em Preparar dados demo.

## Estrutura de dados

usuarios/{uid}
lojas/{lojaId}
  categorias/{categoriaId}
  produtos/{produtoId}
  pedidos/{pedidoId}

## Fluxo real da V1

LOGIN → LOJA → CATÁLOGO → PRODUTO → CARRINHO → PEDIDO → WHATSAPP

O pedido é registrado no Firestore e a mensagem estruturada é aberta no WhatsApp da loja. A confirmação final, pagamento e atendimento ficam fora do sistema.

## Importante

Nunca faça commit do arquivo .env. As credenciais do Firebase devem permanecer no ambiente local/deploy.
