import "dotenv/config";

import {
  applicationDefault,
  getApps,
  initializeApp,
} from "firebase-admin/app";

import { getFirestore } from "firebase-admin/firestore";

const firebaseApp =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential: applicationDefault(),
      });

export const db = getFirestore(firebaseApp);

console.log("Firebase Admin SDK initialized.");