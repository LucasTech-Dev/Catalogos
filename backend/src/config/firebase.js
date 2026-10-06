const {
  initializeApp,
  applicationDefault,
  getApps,
} = require("firebase-admin/app");

const firebaseApp =
  getApps().length === 0
    ? initializeApp({
        credential: applicationDefault(),
        projectId: "bancorestaurante",
      })
    : getApps()[0];

module.exports = firebaseApp;