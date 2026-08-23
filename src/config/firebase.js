const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

let initialized = false;

function initFirebase() {
  if (initialized) return admin;

  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (!serviceAccountPath || !fs.existsSync(path.resolve(serviceAccountPath))) {
    console.warn(
      "Firebase service account not found — push notifications and storage are disabled " +
        "(set FIREBASE_SERVICE_ACCOUNT_PATH in .env)."
    );
    return null;
  }

  const serviceAccount = require(path.resolve(serviceAccountPath));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || undefined,
  });
  initialized = true;
  console.log("Firebase Admin initialized");
  return admin;
}

/** Sends a push notification to one device token via FCM. Returns null if Firebase isn't configured. */
async function sendPushNotification({ token, title, body, data }) {
  const app = initFirebase();
  if (!app) return null;
  return app.messaging().send({
    token,
    notification: { title, body },
    data: data || {},
  });
}

/** Returns the Firebase Storage bucket, or null if Firebase isn't configured. */
function getStorageBucket() {
  const app = initFirebase();
  if (!app) return null;
  return app.storage().bucket();
}

module.exports = { initFirebase, sendPushNotification, getStorageBucket };
