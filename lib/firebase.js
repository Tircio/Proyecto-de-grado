// lib/firebase.js
// const serviceaccount = require('serviceAccountKey.json');
// const admin = require('firebase-admin');
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// admin.initializeApp({
//   credential: admin.credential.cert(serviceaccount),
//   storageBucket: 'prototipo-358ae.firebaseapp.com',
// });
// const bucket = admin.storage().bucket();

const firebaseConfig = {
  apiKey: "AIzaSyCEUmXT5I45EJs6o_jjHkqTZTlx0pum4-o",
  authDomain: "prototipo-358ae.firebaseapp.com",
  projectId: "prototipo-358ae",
  storageBucket: "prototipo-358ae.firebasestorage.app",
  messagingSenderId: "637546677164",
  appId: "1:637546677164:web:65e251de93accff629b009",
  measurementId: "G-QHEDLGFQGJ"
};

// ✅ Solo inicializa si aún no ha sido inicializado
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// module.exports = bucket;
// module.exports = bucket;
export { auth, db, storage, app };
