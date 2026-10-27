import {useEffect,useRef} from 'react';

// Modais de edição/detalhe compartilham foco, Escape e retorno ao acionador.
export function useAdminModal(aberto,ocupado,fechar) {
  const ref=useRef(null),atual=useRef({ocupado,fechar});atual.current={ocupado,fechar};
  useEffect(()=>{
    if(!aberto)return;
    const anterior=document.activeElement;
    const elementos=()=>[...ref.current?.querySelectorAll('button,a[href],input,select,textarea,[tabindex="0"]')||[]].filter(el=>!el.matches(':disabled'));
    elementos()[0]?.focus();
    const teclado=e=>{
      if(e.key==='Escape'&&!atual.current.ocupado){e.preventDefault();atual.current.fechar();}
      if(e.key==='Tab'){
        const itens=elementos(),primeiro=itens[0],ultimo=itens.at(-1);
        if(!primeiro){e.preventDefault();return;}
        if(e.shiftKey&&document.activeElement===primeiro){e.preventDefault();ultimo.focus();}
        else if(!e.shiftKey&&document.activeElement===ultimo){e.preventDefault();primeiro.focus();}
      }
    };
    document.addEventListener('keydown',teclado);
    return()=>{document.removeEventListener('keydown',teclado);if(anterior?.isConnected)anterior.focus();};
  },[aberto]);
  return ref;
}
