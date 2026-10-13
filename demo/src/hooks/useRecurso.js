import {useCallback,useEffect,useState} from 'react';
import {api} from '../services/api';
export function useRecurso(path, initial = null) {
  const [dados,setDados] = useState(initial),[erro,setErro] = useState(''),[carregando,setCarregando] = useState(true);
  const atualizar = useCallback(async() => {setCarregando(true);setErro('');try {setDados(await api(path));} catch(e) {setErro(e.message);} finally {setCarregando(false);}},[path]);
  useEffect(() => {atualizar();},[atualizar]);
  return {dados,erro,carregando,atualizar};
}
