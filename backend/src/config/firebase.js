const {
  initializeApp,
  applicationDefault,
  getApps,
} = require("firebase-admin/app");

const firebaseApp =
  getApps().length === 0
    ? initializeApp({
        ...(process.env.FIRESTORE_EMULATOR_HOST &&
        process.env.FIREBASE_AUTH_EMULATOR_HOST
          ? {}
          : { credential: applicationDefault() }),
        projectId: process.env.GCLOUD_PROJECT || "bancorestaurante",
      })
    : getApps()[0];

module.exports = firebaseApp;
