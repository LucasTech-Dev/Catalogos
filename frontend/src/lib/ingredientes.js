// Um ingrediente por linha; vírgulas podem fazer parte do nome do ingrediente.
export function ingredientesDoTexto(texto) {
  const ingredientes = texto.split(/\r?\n/).map(linha => linha.trim()).filter(Boolean);
  if (ingredientes.length > 50) throw new Error('Informe no máximo 50 ingredientes.');
  if (ingredientes.some(item => item.length > 200)) {
    throw new Error('Cada ingrediente deve ter no máximo 200 caracteres.');
  }
  return ingredientes;
}
