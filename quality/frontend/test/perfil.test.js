import {it,expect} from 'vitest';
import {validarPerfil,criarServicoPerfil} from '../../../frontend/src/services/perfil';
it('perfil preserva contrato e normaliza espaços',()=>{expect(validarPerfil({nome:' Cliente ',telefone:'(51) 99999-9999'})).toEqual({nome:'Cliente',telefone:'(51) 99999-9999'});});
it.each([{nome:'',telefone:'51999999999'},{nome:'Cliente',telefone:'00000000000'},{nome:'Cliente',telefone:'abc'},{nome:'Cliente',telefone:'51999999999',role:'admin'},{nome:'Cliente\n',telefone:'51999999999'}])('perfil rejeita entrada inválida ou autoridade: %j',dados=>{expect(()=>validarPerfil(dados)).toThrow();});
it('mudança de UID antes da operação impede escrita na nova conta',async()=>{
 const auth={currentUser:{uid:'A'}},conta=criarServicoPerfil({db:{},auth,lojaId:'loja',sessao:async()=>{auth.currentUser={uid:'B'};return auth.currentUser;}});
 await expect(conta.salvarPerfil({nome:'Cliente A',telefone:'51999999999'})).rejects.toMatchObject({status:409});
});
