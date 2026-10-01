const { initializeApp, applicationDefault, getApps } = require("firebase-admin/app");

const firebaseApp =
  getApps().length === 0
    ? initializeApp({
        credential: applicationDefault(),
      })
    : getApps()[0];

module.exports = firebaseApp;

