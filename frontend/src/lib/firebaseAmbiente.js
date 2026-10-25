export function validarFirebaseWeb(env) {
  const project=env.VITE_FIREBASE_PROJECT_ID || '',host=env.VITE_FIREBASE_AUTH_EMULATOR_URL;
  const firestore=env.VITE_FIRESTORE_EMULATOR_HOST;
  if(firestore && (!host || !project.startsWith('demo-') || !/^(localhost|127\.0\.0\.1):\d{1,5}$/.test(firestore) || Number(firestore.split(':')[1])<1 || Number(firestore.split(':')[1])>65535))throw new Error('Firestore Emulator exige projeto demo, Auth Emulator e host local válidos.');
  if(host) {
    let url;try{url=new URL(host);}catch{throw new Error('URL do emulador inválida.');}
    if(!['localhost','127.0.0.1'].includes(url.hostname) || url.username || url.password || !['http:','https:'].includes(url.protocol) || !project.startsWith('demo-'))throw new Error('Emulador exige projeto demo e host local.');
    return url.origin;
  }
  if(project.startsWith('demo-'))throw new Error('Projeto demo exige Auth Emulator configurado.');
  return null;
}
