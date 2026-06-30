import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import fs from "fs";

// Load .env variables manually for Node script
const env = fs.readFileSync(".env", "utf8");
const config = {};
env.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val) config[key.trim()] = val.join('=').trim().replace(/['"]/g, '');
});

const firebaseConfig = {
  apiKey: config.VITE_FIREBASE_API_KEY,
  authDomain: config.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: config.VITE_FIREBASE_PROJECT_ID,
  storageBucket: config.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: config.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: config.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkSPG() {
  const q = query(collection(db, 'users'), where('role', '==', 'spg'));
  const snap = await getDocs(q);
  console.log(`Found ${snap.size} SPG users in database!`);
  snap.forEach(doc => {
    console.log(doc.id, doc.data().email, doc.data().instansi);
  });
  process.exit(0);
}

checkSPG().catch(console.error);
