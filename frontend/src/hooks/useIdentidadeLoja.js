import {useEffect, useMemo} from 'react';
import {lojaId} from '../services/api';
import {personalizarLoja, aplicarIdentidade} from '../lib/identidadeLoja';
export function useIdentidadeLoja(loja) {
  const identidade = useMemo(() => personalizarLoja(loja, lojaId, import.meta.env.VITE_IDENTIDADES_LOJAS), [loja]);
  useEffect(() => aplicarIdentidade(identidade), [identidade]);
  return identidade;
}
