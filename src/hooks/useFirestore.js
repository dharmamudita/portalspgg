/**
 * useFirestore — Custom hook for Firestore operations
 * Centralizes all database queries with error handling
 */
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';

/**
 * Get today's menu with real-time updates
 */
export function useTodayMenu(spgUid) {
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (spgUid === null) {
      setLoading(false);
      return;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const conditions = [
      where('tanggal', '>=', Timestamp.fromDate(today)),
      where('tanggal', '<', Timestamp.fromDate(tomorrow))
    ];
    if (spgUid) conditions.push(where('spg_uid', '==', spgUid));

    const q = query(collection(db, 'menus'), ...conditions, limit(1));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const docData = snapshot.docs[0];
          setMenu({ id: docData.id, ...docData.data() });
        } else {
          setMenu(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching today menu:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [spgUid]);

  return { menu, loading, error };
}

/**
 * Get voting options (menus marked as voting options)
 */
export function useVotingMenus(spgUid) {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (spgUid === null) {
      setLoading(false);
      return;
    }
    const conditions = [where('is_voting_option', '==', true), orderBy('tanggal', 'asc')];
    if (spgUid) conditions.push(where('spg_uid', '==', spgUid));

    const q = query(collection(db, 'menus'), ...conditions);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMenus(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [spgUid]);

  return { menus, loading };
}

/**
 * Get feedbacks for a specific menu
 */
export function useMenuFeedbacks(menuId) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!menuId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'feedbacks'),
      where('menu_id', '==', menuId),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setFeedbacks(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [menuId]);

  return { feedbacks, loading };
}

/**
 * Get all menus for admin management
 */
export function useAllMenus(spgUid) {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (spgUid === null) {
      setLoading(false);
      return;
    }
    const conditions = [orderBy('tanggal', 'desc'), limit(100)];
    if (spgUid) conditions.push(where('spg_uid', '==', spgUid));
    
    const q = query(collection(db, 'menus'), ...conditions);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMenus(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [spgUid]);

  return { menus, loading };
}

/**
 * Submit feedback with sanitized data
 */
export async function submitFeedback(menuId, userUid, userNip, userInstansi, rating, komentar) {
  return addDoc(collection(db, 'feedbacks'), {
    menu_id: menuId,
    user_uid: userUid,
    user_nip: userNip,
    user_instansi: userInstansi,
    rating: rating,
    komentar: komentar,
    timestamp: Timestamp.now(),
  });
}

/**
 * Submit a vote
 */
export async function submitVote(menuId, userUid) {
  return addDoc(collection(db, 'votes'), {
    menu_id: menuId,
    user_uid: userUid,
    timestamp: Timestamp.now(),
  });
}

/**
 * Realtime check: which menus has the user already voted on?
 * Returns a map { [menuId]: true/false }
 */
export function useUserVotedMap(menuIds, userUid) {
  const [votedMap, setVotedMap] = useState({});

  useEffect(() => {
    if (!userUid || !menuIds || menuIds.length === 0) return;

    const unsubscribes = menuIds.map((menuId) => {
      const q = query(
        collection(db, 'votes'),
        where('menu_id', '==', menuId),
        where('user_uid', '==', userUid),
        limit(1)
      );
      return onSnapshot(q, (snapshot) => {
        setVotedMap((prev) => ({ ...prev, [menuId]: !snapshot.empty }));
      });
    });

    return () => unsubscribes.forEach((unsub) => unsub());
  }, [menuIds, userUid]);

  return votedMap;
}

/**
 * Realtime check: has user already gave feedback for a menu?
 */
export function useHasUserFeedback(menuId, userUid) {
  const [hasFeedback, setHasFeedback] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!menuId || !userUid) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'feedbacks'),
      where('menu_id', '==', menuId),
      where('user_uid', '==', userUid),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setHasFeedback(!snapshot.empty);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [menuId, userUid]);

  return { hasFeedback, loading };
}

/**
 * Add a new menu (admin only)
 */
export async function addMenu(menuData) {
  return addDoc(collection(db, 'menus'), {
    ...menuData,
    tanggal: Timestamp.fromDate(new Date(menuData.tanggal)),
    createdAt: Timestamp.now(),
  });
}

/**
 * Update a menu (admin only)
 */
export async function updateMenu(menuId, menuData) {
  const ref = doc(db, 'menus', menuId);
  return updateDoc(ref, menuData);
}

/**
 * Update managed schools for SPG
 */
export async function updateManagedSchools(userUid, schools) {
  const ref = doc(db, 'users', userUid);
  return updateDoc(ref, { managed_schools: schools });
}

/**
 * Update user profile
 */
export async function updateUserProfile(userUid, data) {
  const ref = doc(db, 'users', userUid);
  return updateDoc(ref, data);
}

/**
 * Delete a menu (admin only)
 */
export async function deleteMenu(menuId) {
  return deleteDoc(doc(db, 'menus', menuId));
}

/**
 * Get vote counts for voting menus with real-time updates
 */
export function useVoteCounts(menuIds) {
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!menuIds || menuIds.length === 0) {
      setLoading(false);
      return;
    }

    const unsubscribes = menuIds.map((id) => {
      const q = query(collection(db, 'votes'), where('menu_id', '==', id));
      return onSnapshot(q, (snapshot) => {
        setCounts((prev) => ({ ...prev, [id]: snapshot.size }));
        setLoading(false);
      });
    });

    return () => unsubscribes.forEach((unsub) => unsub());
  }, [menuIds]);

  return { counts, loading };
}

/**
 * Get all feedbacks for admin overview
 */
export function useAllFeedbacks() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'feedbacks'),
      orderBy('timestamp', 'desc'),
      limit(200)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setFeedbacks(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { feedbacks, loading };
}

/**
 * Get menus within a date range (for weekly view / history)
 */
export function useMenusByDateRange(startDate, endDate, spgUid) {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!startDate || !endDate || spgUid === null) {
      setLoading(false);
      return;
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const conditions = [
      where('tanggal', '>=', Timestamp.fromDate(start)),
      where('tanggal', '<=', Timestamp.fromDate(end)),
      orderBy('tanggal', 'asc')
    ];
    if (spgUid) conditions.push(where('spg_uid', '==', spgUid));

    const q = query(collection(db, 'menus'), ...conditions);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMenus(items);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching menus by range:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [startDate, endDate, spgUid]);

  return { menus, loading };
}

/**
 * Get feedbacks filtered by date range
 */
export function useFeedbacksByDateRange(startDate, endDate) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!startDate || !endDate) {
      setLoading(false);
      return;
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const q = query(
      collection(db, 'feedbacks'),
      where('timestamp', '>=', Timestamp.fromDate(start)),
      where('timestamp', '<=', Timestamp.fromDate(end)),
      orderBy('timestamp', 'desc'),
      limit(500)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setFeedbacks(items);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching feedbacks by range:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [startDate, endDate]);

  return { feedbacks, loading };
}

/**
 * Get user's own feedback history
 */
export function useUserFeedbackHistory(userUid) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userUid) { setLoading(false); return; }

    const q = query(
      collection(db, 'feedbacks'),
      where('user_uid', '==', userUid),
      orderBy('timestamp', 'desc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setFeedbacks(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userUid]);

  return { feedbacks, loading };
}

/**
 * Get a single menu by ID with real-time updates
 */
export function useMenuById(menuId) {
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!menuId) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(doc(db, 'menus', menuId), (docSnap) => {
      if (docSnap.exists()) {
        setMenu({ id: docSnap.id, ...docSnap.data() });
      } else {
        setMenu(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [menuId]);

  return { menu, loading };
}

/**
 * Realtime hook: resolve menu details for a list of menu IDs
 */
export function useMenuDetails(menuIds) {
  const [details, setDetails] = useState({});

  useEffect(() => {
    if (!menuIds || menuIds.length === 0) return;

    const uniqueIds = [...new Set(menuIds)];
    const unsubscribes = uniqueIds.map((id) =>
      onSnapshot(doc(db, 'menus', id), (docSnap) => {
        if (docSnap.exists()) {
          setDetails((prev) => ({ ...prev, [id]: docSnap.data() }));
        }
      })
    );

    return () => unsubscribes.forEach((unsub) => unsub());
  }, [menuIds]);

  return details;
}

/**
 * Get all SPG users (for Super Admin map)
 */
export function useAllSpgUsers() {
  const [spgUsers, setSpgUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'spg')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((d) => ({ uid: d.id, ...d.data() }));
      setSpgUsers(items);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching SPG users:', err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { spgUsers, loading, error };
}
