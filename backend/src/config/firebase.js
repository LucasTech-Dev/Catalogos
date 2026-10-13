const {
  initializeApp,
  applicationDefault,
  getApps,
} = require("firebase-admin/app");

const ambiente = require('./ambiente').validarAmbiente();
const firebaseApp = getApps().length === 0 ? initializeApp({
  ...(ambiente.emulador ? {} : {credential:applicationDefault()}),
  projectId:ambiente.projectId,
}) : getApps()[0];
module.exports = firebaseApp;
