/**
 * AuthContext — Global authentication state management
 * Provides user data, role, and auth methods to all components
 */
import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail,
  deleteUser
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
          if (user.email === '23312067@sppg.id' || user.email === '23312067@gmail.com') {
            setUserData({
              uid: user.uid,
              email: user.email,
              nama: 'Super Admin',
              role: 'superadmin',
              nip: '23312067',
              status: 'active',
              createdAt: new Date()
            });
            setLoading(false);
            return;
          }

          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            
            // If it's a student, find their managing SPPG
            if (data.role === 'student' && data.instansi) {
              const spgQuery = query(
                collection(db, 'users'),
                where('role', '==', 'spg'),
                where('managed_schools', 'array-contains', data.instansi)
              );
              const spgSnap = await getDocs(spgQuery);
              if (!spgSnap.empty) {
                // Attach the SPG UID to the student's userData in state
                data.spg_uid = spgSnap.docs[0].id;
              } else {
                data.spg_uid = null; // No SPG has claimed this school yet
              }
            } else if (data.role === 'spg') {
              // Admin's SPG UID is their own
              data.spg_uid = user.uid;
            }

            setUserData(data);
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

    if (cleanUsername === '23312067') {
      targetEmail = '23312067@sppg.id';
    } else if (cleanUsername.includes('@')) {
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
    
    // Check for superadmin override
    if (targetEmail === '23312067@sppg.id' || targetEmail === '23312067@gmail.com') {
      return result;
    }

    const userDoc = await getDoc(doc(db, 'users', result.user.uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      
      // Block unapproved SPPG accounts
      if (data.role === 'spg' && data.status === 'pending_approval') {
        await signOut(auth).catch(() => {});
        setCurrentUser(null);
        setUserData(null);
        throw new Error('Akun SPPG Anda sedang menunggu persetujuan dari Super Admin.');
      }

      setUserData(data);
    } else {
      // Orphaned account detection during login
      // Delete the Auth account so the user can re-register properly
      await deleteUser(result.user).catch(() => {});
      await signOut(auth).catch(() => {});
      setCurrentUser(null);
      setUserData(null);
      throw new Error('Akun belum selesai didaftarkan. Data lama telah dibersihkan, silakan Daftar Baru.');
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
      nip: nisn.trim(), // Added to satisfy strict Firestore rules
      nama: nama.trim(),
      role: role,
      createdAt: new Date(),
      ...extraData,
    };

    try {
      // Create user document in Firestore
      await setDoc(doc(db, 'users', result.user.uid), newUserData);
    } catch (error) {
      // Rollback Auth if Firestore creation fails (e.g. timeout)
      await deleteUser(result.user).catch(() => {});
      throw error;
    }

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

  /**
   * Update local user data
   */
  const updateUserData = (newData) => {
    setUserData(prev => ({ ...prev, ...newData }));
  };

  const value = {
    currentUser,
    userData,
    loading,
    login,
    register,
    logout,
    resetPassword,
    updateUserData,
    isAdmin: userData?.role === 'spg' || userData?.role === 'superadmin',
    isStudent: userData?.role === 'student',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
