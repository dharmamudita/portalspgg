/**
 * Firebase Seed Script
 * Run this ONCE to populate Firestore with initial demo data.
 * 
 * Usage: node scripts/seed-firestore.mjs
 * 
 * Prerequisites:
 *   npm install firebase
 */

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, addDoc, Timestamp } from 'firebase/firestore';

// ─── Firebase Config (sama dengan .env) ───
const firebaseConfig = {
  apiKey: "AIzaSyB2eSGNSUXyo29ocPNlvMobFcpp_jAMdes",
  authDomain: "portalsppg.firebaseapp.com",
  projectId: "portalsppg",
  storageBucket: "portalsppg.firebasestorage.app",
  messagingSenderId: "184199266809",
  appId: "1:184199266809:web:75be77b92c74234a383d28",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ─── Helper ───
function today(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setHours(8, 0, 0, 0);
  return Timestamp.fromDate(d);
}

// ═══════════════════════════════════════════
// 1. SEED USERS
// ═══════════════════════════════════════════
async function seedUsers() {
  console.log('\n📌 Creating users...');

  const users = [
    { nip: 'admin01', password: 'Admin@123', nama: 'Budi Santoso', instansi: 'SDN 01 Jakarta', role: 'spg' },
    { nip: 'admin02', password: 'Admin@123', nama: 'Siti Rahayu', instansi: 'SDN 02 Bandung', role: 'spg' },
    { nip: 'siswa01', password: 'Siswa@123', nama: 'Ahmad Fauzi', instansi: 'SDN 01 Jakarta', role: 'student' },
    { nip: 'siswa02', password: 'Siswa@123', nama: 'Dewi Lestari', instansi: 'SDN 01 Jakarta', role: 'student' },
    { nip: 'siswa03', password: 'Siswa@123', nama: 'Rizki Pratama', instansi: 'SDN 02 Bandung', role: 'student' },
  ];

  for (const user of users) {
    try {
      const email = `${user.nip.toLowerCase()}@sppg.id`;
      const result = await createUserWithEmailAndPassword(auth, email, user.password);

      await setDoc(doc(db, 'users', result.user.uid), {
        uid: result.user.uid,
        nip: user.nip,
        nama: user.nama,
        instansi: user.instansi,
        role: user.role,
        createdAt: Timestamp.now(),
      });

      console.log(`  ✅ ${user.role.toUpperCase().padEnd(7)} | NIP: ${user.nip} | ${user.nama}`);
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        console.log(`  ⏭️  Sudah ada: ${user.nip}`);
      } else {
        console.error(`  ❌ Error ${user.nip}:`, err.message);
      }
    }
  }
}

// ═══════════════════════════════════════════
// 2. SEED MENUS
// ═══════════════════════════════════════════
async function seedMenus() {
  console.log('\n📌 Creating menus...');

  const menus = [
    {
      nama_menu: 'Nasi Goreng Spesial Ayam',
      kalori: 450,
      protein: 25,
      lemak: 18,
      karbo: 52,
      harga_porsi: 15000,
      bahan_baku: ['Beras', 'Telur Ayam', 'Daging Ayam', 'Kecap Manis', 'Bawang Merah', 'Bawang Putih', 'Cabai'],
      image_url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&h=400&fit=crop',
      tanggal: today(0),
      is_voting_option: false,
    },
    {
      nama_menu: 'Soto Ayam Kampung',
      kalori: 380,
      protein: 28,
      lemak: 12,
      karbo: 45,
      harga_porsi: 12000,
      bahan_baku: ['Ayam Kampung', 'Beras', 'Kunyit', 'Serai', 'Daun Jeruk', 'Kentang', 'Telur Puyuh'],
      image_url: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&h=400&fit=crop',
      tanggal: today(1),
      is_voting_option: false,
    },
    {
      nama_menu: 'Rendang Daging Sapi',
      kalori: 520,
      protein: 35,
      lemak: 28,
      karbo: 40,
      harga_porsi: 20000,
      bahan_baku: ['Daging Sapi', 'Santan Kelapa', 'Serai', 'Lengkuas', 'Daun Kunyit', 'Cabai Merah', 'Beras'],
      image_url: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=600&h=400&fit=crop',
      tanggal: today(7),
      is_voting_option: true,
    },
    {
      nama_menu: 'Ayam Bakar Madu',
      kalori: 420,
      protein: 32,
      lemak: 15,
      karbo: 48,
      harga_porsi: 18000,
      bahan_baku: ['Paha Ayam', 'Madu', 'Kecap Manis', 'Bawang Putih', 'Jahe', 'Beras', 'Lalapan'],
      image_url: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600&h=400&fit=crop',
      tanggal: today(7),
      is_voting_option: true,
    },
    {
      nama_menu: 'Pecel Lele Sambal Terasi',
      kalori: 390,
      protein: 26,
      lemak: 20,
      karbo: 42,
      harga_porsi: 13000,
      bahan_baku: ['Ikan Lele', 'Tepung Beras', 'Cabai Rawit', 'Terasi', 'Tomat', 'Beras', 'Lalapan Segar'],
      image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop',
      tanggal: today(7),
      is_voting_option: true,
    },
  ];

  const menuIds = [];
  for (const menu of menus) {
    try {
      const docRef = await addDoc(collection(db, 'menus'), {
        ...menu,
        createdAt: Timestamp.now(),
      });
      menuIds.push(docRef.id);
      console.log(`  ✅ ${menu.nama_menu} ${menu.is_voting_option ? '(VOTING)' : ''}`);
    } catch (err) {
      console.error(`  ❌ Error:`, err.message);
    }
  }
  return menuIds;
}

// ═══════════════════════════════════════════
// 3. SEED FEEDBACKS
// ═══════════════════════════════════════════
async function seedFeedbacks(menuIds) {
  console.log('\n📌 Creating sample feedbacks...');

  if (!menuIds || menuIds.length === 0) {
    console.log('  ⏭️  No menus to add feedback for');
    return;
  }

  const feedbacks = [
    { menu_id: menuIds[0], user_nip: 'siswa01', user_instansi: 'SDN 01 Jakarta', rating: 5, komentar: 'Nasi gorengnya enak sekali! Porsinya juga pas, kenyang sampai siang.', user_uid: 'seed-siswa01' },
    { menu_id: menuIds[0], user_nip: 'siswa02', user_instansi: 'SDN 01 Jakarta', rating: 4, komentar: 'Rasanya lumayan enak, tapi bisa lebih pedas sedikit.', user_uid: 'seed-siswa02' },
    { menu_id: menuIds[0], user_nip: 'siswa03', user_instansi: 'SDN 02 Bandung', rating: 5, komentar: 'Mantap! Semoga menunya selalu bergizi seperti ini.', user_uid: 'seed-siswa03' },
  ];

  for (const fb of feedbacks) {
    try {
      await addDoc(collection(db, 'feedbacks'), {
        ...fb,
        timestamp: Timestamp.now(),
      });
      console.log(`  ✅ Feedback dari ${fb.user_nip} — ⭐${fb.rating}`);
    } catch (err) {
      console.error(`  ❌ Error:`, err.message);
    }
  }
}

// ═══════════════════════════════════════════
// RUN SEED
// ═══════════════════════════════════════════
async function main() {
  console.log('🌱 ═══════════════════════════════════════');
  console.log('   SEEDING FIRESTORE — Portal SPPG');
  console.log('═══════════════════════════════════════════');

  await seedUsers();
  const menuIds = await seedMenus();
  await seedFeedbacks(menuIds);

  console.log('\n✅ ═══════════════════════════════════════');
  console.log('   SEEDING COMPLETE!');
  console.log('═══════════════════════════════════════════');
  console.log('\n📋 Akun yang bisa digunakan:');
  console.log('   ADMIN : NIP=admin01  Password=Admin@123');
  console.log('   ADMIN : NIP=admin02  Password=Admin@123');
  console.log('   SISWA : NIP=siswa01  Password=Siswa@123');
  console.log('   SISWA : NIP=siswa02  Password=Siswa@123');
  console.log('   SISWA : NIP=siswa03  Password=Siswa@123\n');

  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
