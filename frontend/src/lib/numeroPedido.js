// Rótulo comercial apenas; links e autorização continuam usando o ID original.
export function numeroPedido(pedido) {
  const n=pedido?.numeroPedido;
  if(Number.isSafeInteger(n) && n>=1 && n<=999999999)return String(n);
  const id=String(pedido?.id || '');
  return 'Anterior '+(id.length<=12?id:id.slice(0,8).toUpperCase());
}
