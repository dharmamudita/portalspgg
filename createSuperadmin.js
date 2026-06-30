import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createSuperAdmin() {
  try {
    const email = '23312067@sppg.id';
    const password = '23312067';
    
    console.log('Creating superadmin user...');
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('User created with UID:', user.uid);
    console.log('Saving to Firestore...');
    
    await setDoc(doc(db, 'users', user.uid), {
      email: email,
      nama: 'Super Admin',
      role: 'superadmin',
      nip: '23312067', // ID for login lookup
      status: 'active',
      createdAt: new Date()
    });
    
    console.log('Super Admin successfully created in Firestore!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating super admin:', error);
    process.exit(1);
  }
}

createSuperAdmin();
