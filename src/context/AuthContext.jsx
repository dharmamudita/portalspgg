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
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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
   * Login with NIP (used as email: nip@sppg.id) and password
   * Using email format because Firebase Auth requires email
   */
  async function login(nip, password) {
    const email = `${nip.trim().toLowerCase()}@sppg.id`;
    const result = await signInWithEmailAndPassword(auth, email, password);
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
  async function register(nip, password, nama, instansi, role = 'student') {
    const email = `${nip.trim().toLowerCase()}@sppg.id`;
    const result = await createUserWithEmailAndPassword(auth, email, password);

    // Create user document in Firestore
    await setDoc(doc(db, 'users', result.user.uid), {
      uid: result.user.uid,
      nip: nip.trim(),
      nama: nama.trim(),
      instansi: instansi.trim(),
      role: role,
      createdAt: new Date(),
    });

    setUserData({
      uid: result.user.uid,
      nip: nip.trim(),
      nama: nama.trim(),
      instansi: instansi.trim(),
      role: role,
    });

    return result;
  }

  /**
   * Logout — clears all state
   */
  async function logout() {
    setUserData(null);
    return signOut(auth);
  }

  const value = {
    currentUser,
    userData,
    loading,
    login,
    register,
    logout,
    isAdmin: userData?.role === 'spg',
    isStudent: userData?.role === 'student',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
