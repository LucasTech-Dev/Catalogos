function validarAmbiente(env=process.env) {
  const auth=env.FIREBASE_AUTH_EMULATOR_HOST,firestore=env.FIRESTORE_EMULATOR_HOST;
  const projectId=env.GCLOUD_PROJECT || 'bancorestaurante';
  if(auth || firestore) {
    if(!auth || !firestore || !/^(localhost|127\.0\.0\.1):\d{1,5}$/.test(auth) || !/^(localhost|127\.0\.0\.1):\d{1,5}$/.test(firestore) || !projectId.startsWith('demo-')) throw new Error('Emulação exige Auth e Firestore locais e projeto demo-.');
    for(const host of [auth,firestore]) {const porta=Number(host.split(':')[1]);if(porta<1 || porta>65535)throw new Error('Porta de emulador inválida.');}
    return {projectId,emulador:true};
  }
  if(projectId.startsWith('demo-'))throw new Error('Projeto demo exige ambos os emuladores.');
  return {projectId,emulador:false};
}
module.exports={validarAmbiente};
