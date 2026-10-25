import React,{useState} from 'react';
import {Eye,EyeOff} from "./MaterialIcon";
export default function CampoSenha({id,autoComplete='current-password',...props}) {
  const [visivel,setVisivel]=useState(false);
  return <div className="password-field"><input {...props} id={id} type={visivel?'text':'password'} autoComplete={autoComplete}/><button type="button" className="password-toggle" aria-label={visivel?'Ocultar senha':'Mostrar senha'} aria-controls={id} aria-pressed={visivel} onClick={()=>setVisivel(v=>!v)}>{visivel?<EyeOff size={20} aria-hidden="true"/>:<Eye size={20} aria-hidden="true"/>}</button></div>;
}
