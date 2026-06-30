/**
 * AuthContext — Global authentication state management
 * Provides user data, role, and auth methods to all components
 */
import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';

const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Login with NISN (Siswa), Nama (SPPG), or Email (Admin)
   */
  async function login(username, password) {
    const cleanUsername = username.trim();
    let targetEmail = null;

    if (cleanUsername.includes('@')) {
      // If it's an email (like superadmin), use it directly
      targetEmail = cleanUsername.toLowerCase();
    } else {
      // Lookup by NISN or Nama
      const usersRef = collection(db, 'users');
      const qNisn = query(usersRef, where('nisn', '==', cleanUsername));
      const qNama = query(usersRef, where('nama', '==', cleanUsername));

      const snapNisn = await getDocs(qNisn);
      if (!snapNisn.empty) {
        targetEmail = snapNisn.docs[0].data().email;
      } else {
        const snapNama = await getDocs(qNama);
        if (!snapNama.empty) {
          targetEmail = snapNama.docs[0].data().email;
        }
      }

      if (!targetEmail) {
        throw { code: 'auth/user-not-found' };
      }
    }

    const result = await signInWithEmailAndPassword(auth, targetEmail, password);
    const userDoc = await getDoc(doc(db, 'users', result.user.uid));
    if (userDoc.exists()) {
      setUserData(userDoc.data());
    }
    return result;
  }

  /**
   * Register new user
   * Creates Firebase Auth account + Firestore user document
   */
  async function register(email, password, nisn, nama, role = 'student', extraData = {}) {
    const cleanEmail = email.trim().toLowerCase();
    const result = await createUserWithEmailAndPassword(auth, cleanEmail, password);

    const newUserData = {
      uid: result.user.uid,
      email: cleanEmail,
      nisn: nisn.trim(),
      nama: nama.trim(),
      role: role,
      createdAt: new Date(),
      ...extraData,
    };

    // Create user document in Firestore
    await setDoc(doc(db, 'users', result.user.uid), newUserData);

    setUserData(newUserData);

    return result;
  }

  /**
   * Logout — clears all state
   */
  async function logout() {
    setUserData(null);
    return signOut(auth);
  }

  /**
   * Send Password Reset Email
   */
  async function resetPassword(email) {
    return sendPasswordResetEmail(auth, email.trim().toLowerCase());
  }

  const value = {
    currentUser,
    userData,
    loading,
    login,
    register,
    logout,
    resetPassword,
    isAdmin: userData?.role === 'spg',
    isStudent: userData?.role === 'student',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
