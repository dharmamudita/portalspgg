import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UtensilsCrossed, Lock, User, Building2, Eye, EyeOff, UserPlus, 
  LogIn, ShieldCheck, Mail, ChevronRight, ChevronLeft, AlertCircle,
  GraduationCap, ChefHat, Crown, KeyRound, ArrowLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { sanitizeInput } from '../lib/sanitize';
import { validatePassword } from '../lib/validators';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const getMockSchools = (tingkat, kecamatan) => {
  if (!kecamatan || !tingkat) return [];
  const tk = tingkat.toUpperCase();
  return [
    `${tk}N 1 ${kecamatan}`,
    `${tk}N 2 ${kecamatan}`,
    `${tk} IT ${kecamatan}`,
    `${tk} Swasta ${kecamatan}`
  ];
};

const MOCK_WILAYAH = {
  "Lampung": {
    "Bandar Lampung": ["Bumi Waras", "Enggal", "Kedamaian", "Kedaton", "Kemiling", "Labuhan Ratu", "Langkapura", "Panjang", "Rajabasa", "Sukabumi", "Sukarame", "Tanjung Karang Barat", "Tanjung Karang Pusat", "Tanjung Karang Timur", "Tanjung Senang", "Teluk Betung Barat", "Teluk Betung Selatan", "Teluk Betung Timur", "Teluk Betung Utara", "Way Halim"],
    "Metro": ["Metro Barat", "Metro Pusat", "Metro Selatan", "Metro Timur", "Metro Utara"],
    "Lampung Barat": ["Air Hitam", "Balik Bukit", "Bandar Negeri Suoh", "Batu Brak", "Batu Ketulis", "Belalau", "Gedung Surian", "Kebun Tebu", "Lumbok Seminung", "Pagar Dewa", "Sekincau", "Sukau", "Sumber Jaya", "Suoh", "Way Tenong"],
    "Lampung Selatan": ["Bakauheni", "Candipuro", "Jati Agung", "Kalianda", "Katibung", "Ketapang", "Merbau Mataram", "Natar", "Palas", "Penengahan", "Rajabasa", "Sidomulyo", "Sragi", "Tanjung Bintang", "Tanjung Sari", "Way Panji", "Way Sulan"],
    "Lampung Tengah": ["Anak Ratu Aji", "Anak Tuha", "Bandar Mataram", "Bandar Surabaya", "Bangunrejo", "Bekri", "Bumi Nabung", "Bumi Ratu Nuban", "Gunung Sugih", "Kalirejo", "Kota Gajah", "Padang Ratu", "Punggur", "Putra Rumbia", "Rumbia", "Selagai Lingga", "Sendang Agung", "Seputih Agung", "Seputih Banyak", "Seputih Mataram", "Seputih Raman", "Seputih Surabaya", "Terbanggi Besar", "Terusan Nunyai", "Trimurjo", "Way Pengubuan", "Way Seputih"],
    "Lampung Timur": ["Bandar Sribhawono", "Batanghari", "Batanghari Nuban", "Braja Selebah", "Bumi Agung", "Gunung Pelindung", "Jabung", "Labuhan Maringgai", "Labuhan Ratu", "Marga Sekampung", "Marga Tiga", "Mataram Baru", "Melinting", "Metro Kibang", "Pasir Sakti", "Pekalongan", "Purbolinggo", "Raman Utara", "Sekampung", "Sekampung Udik", "Sukadana", "Waway Karya", "Way Bungur", "Way Jepara"],
    "Lampung Utara": ["Abung Barat", "Abung Kunang", "Abung Pekurun", "Abung Selatan", "Abung Semuli", "Abung Surakarta", "Abung Tengah", "Abung Timur", "Abung Tinggi", "Blambangan Umpu", "Bukit Kemuning", "Bunga Mayang", "Hulu Sungkai", "Kotabumi", "Kotabumi Selatan", "Kotabumi Utara", "Muara Sungkai", "Sungkai Barat", "Sungkai Jaya", "Sungkai Selatan", "Sungkai Tengah", "Sungkai Utara", "Tanjung Raja"],
    "Mesuji": ["Mesuji", "Mesuji Timur", "Panca Jaya", "Rawa Jitu Utara", "Simpang Pematang", "Tanjung Raya", "Way Serdang"],
    "Pesawaran": ["Gedong Tataan", "Kedondong", "Marga Punduh", "Negeri Katon", "Padang Cermin", "Punduh Pedada", "Tegineneng", "Way Khilau", "Way Lima", "Way Ratai", "Teluk Pandan"],
    "Pesisir Barat": ["Bangkunat", "Krui Selatan", "Karya Penggawa", "Lemong", "Ngambur", "Ngaras", "Pesisir Selatan", "Pesisir Tengah", "Pesisir Utara", "Pulau Pisang", "Way Krui"],
    "Pringsewu": ["Adiluwih", "Ambarawa", "Banyumas", "Gading Rejo", "Pagelaran", "Pagelaran Utara", "Pardasuka", "Pringsewu", "Sukoharjo"],
    "Tanggamus": ["Air Naningan", "Bandar Negeri Semuong", "Bulok", "Cukuh Balak", "Gisting", "Gunung Alip", "Kelumbayan", "Kelumbayan Barat", "Kota Agung", "Kota Agung Barat", "Kota Agung Timur", "Limau", "Pematang Sawa", "Pugung", "Pulau Panggung", "Semaka", "Sumberejo", "Talang Padang", "Ulu Belu", "Wonosobo"],
    "Tulang Bawang": ["Banjar Agung", "Banjar Baru", "Banjar Margo", "Dente Teladas", "Gedung Aji", "Gedung Aji Baru", "Gedung Meneng", "Menggala", "Menggala Timur", "Meraksa Aji", "Penawar Aji", "Penawar Tama", "Rawa Jitu Selatan", "Rawa Jitu Timur", "Rawa Pitu"],
    "Tulang Bawang Barat": ["Batu Putih", "Gunung Agung", "Gunung Terang", "Lambu Kibang", "Pagar Dewa", "Tulang Bawang Tengah", "Tulang Bawang Udik", "Tumijajar", "Way Kenanga"],
    "Way Kanan": ["Banjit", "Baradatu", "Blambangan Umpu", "Bumi Agung", "Gunung Labuhan", "Kasui", "Negara Batin", "Negeri Agung", "Negeri Besar", "Pakuan Ratu", "Rebang Tangkas", "Tangkas", "Umpu Semenguk", "Way Tuba"]
  }
};

export default function LoginPage() {
  const { login, register, resetPassword } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [regStep, setRegStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [lastRole, setLastRole] = useState('student');

  useEffect(() => {
    const savedRole = localStorage.getItem('sppg_last_role');
    if (savedRole) setLastRole(savedRole);
  }, []);
  
  const [form, setForm] = useState({ 
    email: '', 
    password: '', 
    role: 'student',
    nama: '',
    nisn: '', // or NIP for admin
    instansi: '',
    tingkat: '',
    alergi: '',
    provinsi: '',
    kabupaten: '',
    kecamatan: ''
  });

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleNextStep = () => {
    const newErrors = {};
    if (regStep === 1) {
      if (!form.role) newErrors.role = 'Pilih peran Anda';
    } else if (regStep === 2) {
      if (!form.nama.trim()) newErrors.nama = 'Nama wajib diisi';
      if (!form.email.trim() || !form.email.includes('@')) newErrors.email = 'Email tidak valid';
      const passCheck = validatePassword(form.password);
      if (!passCheck.valid) newErrors.password = passCheck.message;
    } else if (regStep === 3) {
      if (!form.provinsi) newErrors.provinsi = 'Pilih Provinsi';
      if (!form.kabupaten) newErrors.kabupaten = 'Pilih Kabupaten/Kota';
      if (!form.kecamatan) newErrors.kecamatan = 'Pilih Kecamatan';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setRegStep(prev => prev + 1);
  };

  const handlePrevStep = () => setRegStep(prev => prev - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (mode === 'login') {
      if (!form.email.trim()) newErrors.email = 'Identitas wajib diisi';
      if (!form.password) newErrors.password = 'Password wajib diisi';
    } else if (mode === 'forgot') {
      if (!form.email.trim()) newErrors.email = 'Email wajib diisi';
    } else if (mode === 'register') {
      if (form.role === 'student' && regStep === 4) {
        if (!form.nisn.trim()) newErrors.nisn = 'NISN wajib diisi';
        if (!form.tingkat) newErrors.tingkat = 'Pilih tingkat pendidikan';
        if (!form.instansi) newErrors.instansi = 'Pilih sekolah';
      } else if (form.role === 'spg' && regStep === 3) {
        if (!form.nama.trim()) newErrors.nama = 'Nama wajib diisi';
        if (!form.provinsi) newErrors.provinsi = 'Pilih Provinsi';
        if (!form.kabupaten) newErrors.kabupaten = 'Pilih Kabupaten/Kota';
        if (!form.kecamatan) newErrors.kecamatan = 'Pilih Kecamatan';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const cleanEmail = sanitizeInput(form.email);
      
      if (mode === 'register') {
        const cleanNama = sanitizeInput(form.nama);
        const cleanInstansi = sanitizeInput(form.instansi);
        const cleanNisn = sanitizeInput(form.nisn);
        const allergiesArray = form.alergi ? form.alergi.split(',').map(s => s.trim()).filter(Boolean) : [];
        
        await register(
          cleanEmail, 
          form.password, 
          cleanNisn, 
          cleanNama, 
          form.role,
          { 
            tingkat: form.tingkat, 
            instansi: form.role === 'spg' ? `SPPG ${form.kecamatan}, ${form.kabupaten}, ${form.provinsi}` : cleanInstansi,
            alergi: allergiesArray,
            status: form.role === 'spg' ? 'pending_approval' : 'active',
            provinsi: form.provinsi,
            kabupaten: form.kabupaten,
            kecamatan: form.kecamatan
          }
        );
        
        localStorage.setItem('sppg_last_role', form.role);
        setLastRole(form.role);

        if (form.role === 'spg') {
          addToast('Registrasi berhasil! Menunggu persetujuan Super Admin.', 'success');
        } else {
          addToast('Registrasi berhasil!', 'success');
        }
        navigate(form.role === 'student' ? '/dashboard' : '/admin');
        
      } else if (mode === 'login') {
        const result = await login(cleanEmail, form.password);
        addToast('Login berhasil!', 'success');
        
        const { getDoc, doc } = await import('firebase/firestore');
        const { db } = await import('../lib/firebase');
        const userDoc = await getDoc(doc(db, 'users', result.user.uid));
        const role = userDoc.exists() ? userDoc.data().role : 'student';
        navigate(role === 'spg' || role === 'superadmin' ? '/admin' : '/dashboard');
        
      } else if (mode === 'forgot') {
        await resetPassword(cleanEmail);
        addToast('Email reset password telah dikirim! Periksa kotak masuk Anda.', 'success');
        setMode('login');
      }
    } catch (err) {
      console.error('Submission Error:', err);
      let msg = err.message || 'Terjadi kesalahan';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Kredensial salah atau tidak ditemukan';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'Email sudah terdaftar';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Terlalu banyak percobaan. Coba lagi nanti.';
      } else if (err.code === 'permission-denied' || err.message?.includes('network') || err.message?.includes('offline')) {
        msg = 'Koneksi ke database gagal. Pastikan internet Anda tidak memblokir server Google.';
      }
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-surface">
      {/* LEFT SIDE: Premium Branding Split Screen (Hidden on mobile) */}
      <div className="hidden lg:flex w-[45%] relative bg-primary overflow-hidden flex-col justify-center items-center p-12 text-center text-white">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-accent/40 rounded-full blur-[100px] animate-pulse-glow" />
          <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-secondary/30 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
        </div>
        
        {/* Gradients */}
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-white/10 to-transparent pointer-events-none" />

        {/* Neumorphic Shapes on Blue */}
        <div className="absolute inset-0 pointer-events-none opacity-50 flex items-center justify-center">
          <div className="absolute w-[600px] h-[600px] rounded-full border border-white/5 bg-primary shadow-[inset_10px_10px_30px_rgba(0,0,0,0.2),inset_-10px_-10px_30px_rgba(255,255,255,0.05),20px_20px_40px_rgba(0,0,0,0.2)]" />
          <div className="absolute w-[300px] h-[300px] rounded-[60px] border border-white/5 bg-primary shadow-[inset_10px_10px_20px_rgba(0,0,0,0.2),inset_-10px_-10px_20px_rgba(255,255,255,0.05),15px_15px_30px_rgba(0,0,0,0.15)] rotate-12" />
        </div>

        <div className="relative z-10 max-w-md mx-auto">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="w-40 h-40 mx-auto flex items-center justify-center mb-8 bg-white/10 rounded-full backdrop-blur-xl border border-white/20 shadow-2xl p-6"
          >
            <img src="/logo-bgn.png" alt="Logo BGN" className="w-full h-full object-contain drop-shadow-2xl" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl font-black mb-6 font-display tracking-tight leading-tight"
          >
            Portal<span className="text-accent">SPPG</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg text-white/80 leading-relaxed font-medium"
          >
            Sistem Pengelolaan Pangan Gratis Terpadu. Wujudkan generasi cerdas tanpa sisa makanan.
          </motion.p>
        </div>
      </div>

      {/* RIGHT SIDE: Auth Form */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-6 sm:p-12 relative bg-surface overflow-hidden">
        
        {/* --- Neumorphic Background Elements --- */}
        {/* Main Center-Right Object */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 pointer-events-none opacity-60 flex items-center justify-center translate-x-1/4 lg:translate-x-0">
          {/* Outer Squircle */}
          <div className="absolute w-[600px] h-[600px] sm:w-[800px] sm:h-[800px] rounded-[100px] sm:rounded-[150px] bg-surface shadow-[inset_10px_10px_30px_rgba(0,0,0,0.03),inset_-10px_-10px_30px_rgba(255,255,255,1),20px_20px_40px_rgba(0,0,0,0.03)] border border-white/50 rotate-45" />
          
          {/* Inner Circle */}
          <div className="absolute w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] rounded-full bg-surface shadow-[inset_15px_15px_40px_rgba(0,0,0,0.04),inset_-15px_-15px_40px_rgba(255,255,255,1),15px_15px_30px_rgba(0,0,0,0.02)] border border-white/60" />
        </div>

        {/* Top Left Floating Object */}
        <div className="absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4 pointer-events-none opacity-50 flex items-center justify-center">
          <div className="absolute w-[300px] h-[300px] rounded-full bg-surface shadow-[inset_10px_10px_20px_rgba(0,0,0,0.03),inset_-10px_-10px_20px_rgba(255,255,255,1),15px_15px_30px_rgba(0,0,0,0.02)] border border-white/50" />
          <div className="absolute w-[150px] h-[150px] rounded-[30px] bg-surface shadow-[inset_5px_5px_15px_rgba(0,0,0,0.04),inset_-5px_-5px_15px_rgba(255,255,255,1),10px_10px_20px_rgba(0,0,0,0.02)] border border-white/60 rotate-12" />
        </div>

        {/* Bottom Left Floating Object */}
        <div className="absolute bottom-0 left-20 translate-y-1/3 pointer-events-none opacity-40 flex items-center justify-center">
          <div className="absolute w-[200px] h-[200px] rounded-[50px] bg-surface shadow-[inset_8px_8px_16px_rgba(0,0,0,0.03),inset_-8px_-8px_16px_rgba(255,255,255,1),12px_12px_24px_rgba(0,0,0,0.02)] border border-white/50 -rotate-12" />
        </div>

        {/* Top Right Floating Object (mobile only) */}
        <div className="lg:hidden absolute top-10 right-[-50px] pointer-events-none opacity-40 flex items-center justify-center">
          <div className="absolute w-[150px] h-[150px] rounded-full bg-surface shadow-[inset_5px_5px_15px_rgba(0,0,0,0.03),inset_-5px_-5px_15px_rgba(255,255,255,1),10px_10px_20px_rgba(0,0,0,0.02)] border border-white/50" />
        </div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-20 h-20 mx-auto flex items-center justify-center mb-4 bg-primary/10 rounded-3xl p-3">
              <img src="/logo-bgn.png" alt="Logo BGN" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl font-bold gradient-text font-display">Portal SPPG</h1>
          </div>

          <div className="glass p-8 sm:p-10 relative">
            {/* Liquid Glass ambient inside card */}
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-black text-text-primary mb-2 font-display">
                {mode === 'login' ? 'Selamat Datang Kembali' : mode === 'forgot' ? 'Reset Password' : 'Buat Akun Baru'}
              </h2>
              <p className="text-sm text-text-muted">
                {mode === 'login' ? 'Masuk untuk melanjutkan ke Portal SPPG' : 
                 mode === 'forgot' ? 'Kami akan mengirimkan instruksi reset ke email Anda' : 
                 `Langkah ${regStep} dari ${form.role === 'student' ? 4 : 3} — Selesaikan pendaftaran`}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 relative z-10 min-h-[380px]">
              
              {/* === MODE: LOGIN === */}
              {mode === 'login' && (
                <AnimatePresence mode="wait">
                  <motion.div key="login" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                    <Input 
                      id="login-email" 
                      label={lastRole === 'student' ? 'NISN' : lastRole === 'spg' ? 'Nama Lengkap' : 'NISN / Nama / Email Admin'} 
                      icon={User} 
                      placeholder={lastRole === 'student' ? 'Masukkan 10 digit NISN' : 'Masukkan nama Anda'} 
                      type="text" 
                      value={form.email} 
                      onChange={(e) => updateField('email', e.target.value)} 
                      error={errors.email} 
                    />
                    <Input 
                      id="login-password" 
                      label="Password" 
                      icon={Lock} 
                      type={showPassword ? 'text' : 'password'} 
                      placeholder="Masukkan password" 
                      value={form.password} 
                      onChange={(e) => updateField('password', e.target.value)} 
                      error={errors.password} 
                      rightElement={
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-text-muted hover:text-primary cursor-pointer p-1">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      }
                    />
                    <div className="flex justify-end">
                      <button type="button" onClick={() => { setMode('forgot'); setErrors({}); }} className="text-xs font-bold text-primary hover:text-primary-dark transition-colors cursor-pointer">
                        Lupa Password?
                      </button>
                    </div>
                    <Button type="submit" loading={loading} icon={LogIn} className="w-full mt-6" size="lg">Masuk ke Portal</Button>
                  </motion.div>
                </AnimatePresence>
              )}

              {/* === MODE: FORGOT PASSWORD === */}
              {mode === 'forgot' && (
                <AnimatePresence mode="wait">
                  <motion.div key="forgot" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex gap-3 text-sm text-primary-dark mb-4">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <p>Tautan untuk membuat kata sandi baru akan dikirimkan ke alamat email ini.</p>
                    </div>
                    <Input id="forgot-email" label="Alamat Email" icon={Mail} placeholder="nama@email.com" type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} error={errors.email} />
                    <Button type="submit" loading={loading} icon={Mail} className="w-full mt-6" size="lg">Kirim Link Reset</Button>
                    <button type="button" onClick={() => { setMode('login'); setErrors({}); }} className="w-full mt-3 py-2 text-sm font-semibold text-text-muted hover:text-text-primary transition-colors cursor-pointer">
                      Kembali ke Login
                    </button>
                  </motion.div>
                </AnimatePresence>
              )}

              {/* === MODE: REGISTER === */}
              {mode === 'register' && (
                <div className="flex flex-col h-full">
                  {/* Stepper Indicator */}
                  <div className="flex gap-2 mb-6">
                    {Array.from({ length: form.role === 'student' ? 4 : 3 }, (_, i) => i + 1).map(step => (
                      <div key={step} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${regStep >= step ? 'bg-primary' : 'bg-black/10'}`} />
                    ))}
                  </div>

                  <div className="min-h-[280px]">
                    <AnimatePresence mode="wait">
                      {/* STEP 1: ROLE SELECTION */}
                    {regStep === 1 && (
                      <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-3">
                        <label className="block text-sm font-bold text-text-primary mb-3">Pilih Peran Anda:</label>
                        
                        <div onClick={() => updateField('role', 'student')} className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${form.role === 'student' ? 'border-primary bg-primary/5' : 'border-black/5 hover:border-black/20'}`}>
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${form.role === 'student' ? 'bg-primary text-white' : 'bg-black/5 text-text-secondary'}`}><GraduationCap className="w-5 h-5" /></div>
                            <div>
                              <h4 className={`font-bold ${form.role === 'student' ? 'text-primary-dark' : 'text-text-primary'}`}>Siswa (Student)</h4>
                              <p className="text-xs text-text-muted mt-0.5">Menerima makanan & memberi ulasan</p>
                            </div>
                          </div>
                        </div>

                        <div onClick={() => updateField('role', 'spg')} className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${form.role === 'spg' ? 'border-secondary bg-secondary/5' : 'border-black/5 hover:border-black/20'}`}>
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${form.role === 'spg' ? 'bg-secondary text-white' : 'bg-black/5 text-text-secondary'}`}><ChefHat className="w-5 h-5" /></div>
                            <div>
                              <h4 className={`font-bold ${form.role === 'spg' ? 'text-secondary-dark' : 'text-text-primary'}`}>Admin SPPG (Operator)</h4>
                              <p className="text-xs text-text-muted mt-0.5">Mendaftar dengan Nama Lengkap (Butuh ACC)</p>
                            </div>
                          </div>
                        </div>

                        {errors.role && <p className="text-xs text-danger font-semibold mt-2">{errors.role}</p>}
                      </motion.div>
                    )}

                    {/* STEP 2: CREDENTIALS */}
                    {regStep === 2 && (
                      <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                        <Input id="reg-nama" label="Nama Lengkap" icon={User} placeholder="Nama sesuai identitas" value={form.nama} onChange={(e) => updateField('nama', e.target.value)} error={errors.nama} />
                        <Input id="reg-email" label="Alamat Email (Asli)" icon={Mail} placeholder="Akan digunakan untuk login & reset" type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} error={errors.email} />
                        <Input 
                          id="reg-password" 
                          label="Password" 
                          icon={Lock} 
                          type={showPassword ? 'text' : 'password'} 
                          placeholder="Minimal 6 karakter" 
                          value={form.password} 
                          onChange={(e) => updateField('password', e.target.value)} 
                          error={errors.password} 
                          rightElement={
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-text-muted hover:text-primary cursor-pointer p-1">
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          }
                        />
                      </motion.div>
                    )}

                    {/* STEP 3: REGION SELECTION */}
                    {regStep === 3 && (
                      <motion.div key="step3-region" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                        
                        <div>
                          <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5 ml-1">Provinsi</label>
                          <select 
                            className="w-full bg-black/5 border border-black/10 rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
                            value={form.provinsi}
                            onChange={(e) => { updateField('provinsi', e.target.value); updateField('kabupaten', ''); updateField('kecamatan', ''); }}
                          >
                            <option value="">Pilih Provinsi...</option>
                            {Object.keys(MOCK_WILAYAH).map(prov => (
                              <option key={prov} value={prov}>{prov}</option>
                            ))}
                          </select>
                          {errors.provinsi && <p className="text-xs text-danger font-semibold mt-1 ml-1">{errors.provinsi}</p>}
                        </div>

                        {form.provinsi && (
                          <div>
                            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5 ml-1">Kabupaten / Kota</label>
                            <select 
                              className="w-full bg-black/5 border border-black/10 rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
                              value={form.kabupaten}
                              onChange={(e) => { updateField('kabupaten', e.target.value); updateField('kecamatan', ''); }}
                            >
                              <option value="">Pilih Kabupaten/Kota...</option>
                              {Object.keys(MOCK_WILAYAH[form.provinsi] || {}).map(kab => (
                                <option key={kab} value={kab}>{kab}</option>
                              ))}
                            </select>
                            {errors.kabupaten && <p className="text-xs text-danger font-semibold mt-1 ml-1">{errors.kabupaten}</p>}
                          </div>
                        )}

                        {form.kabupaten && (
                          <div>
                            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5 ml-1">Kecamatan</label>
                            <select 
                              className="w-full bg-black/5 border border-black/10 rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
                              value={form.kecamatan}
                              onChange={(e) => updateField('kecamatan', e.target.value)}
                            >
                              <option value="">Pilih Kecamatan...</option>
                              {(MOCK_WILAYAH[form.provinsi]?.[form.kabupaten] || []).map(kec => (
                                <option key={kec} value={kec}>{kec}</option>
                              ))}
                            </select>
                            {errors.kecamatan && <p className="text-xs text-danger font-semibold mt-1 ml-1">{errors.kecamatan}</p>}
                          </div>
                        )}

                        {form.role === 'spg' && (
                          <div className="bg-warning/10 border border-warning/20 rounded-xl p-3 flex gap-2 text-xs text-warning-dark mt-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <p>Pendaftaran akun SPPG memerlukan persetujuan Super Admin sebelum bisa digunakan secara penuh.</p>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* STEP 4: STUDENT DETAILS */}
                    {regStep === 4 && form.role === 'student' && (
                      <motion.div key="step4-student" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                        <Input id="reg-nisn" label="NISN" icon={User} placeholder="10 Digit NISN" value={form.nisn} onChange={(e) => updateField('nisn', e.target.value)} error={errors.nisn} />
                        
                        <div>
                          <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5 ml-1">Tingkat Pendidikan</label>
                          <select 
                            className="w-full bg-black/5 border border-black/10 rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
                            value={form.tingkat}
                            onChange={(e) => { updateField('tingkat', e.target.value); updateField('instansi', ''); }}
                          >
                            <option value="">Pilih Tingkat...</option>
                            <option value="sd">Sekolah Dasar (SD)</option>
                            <option value="smp">Sekolah Menengah Pertama (SMP)</option>
                            <option value="sma">Sekolah Menengah Atas (SMA)</option>
                            <option value="smk">Sekolah Menengah Kejuruan (SMK)</option>
                          </select>
                          {errors.tingkat && <p className="text-xs text-danger font-semibold mt-1 ml-1">{errors.tingkat}</p>}
                        </div>

                        {form.tingkat && (
                          <div>
                            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5 ml-1">Pilih Sekolah</label>
                            <select 
                              className="w-full bg-black/5 border border-black/10 rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
                              value={form.instansi}
                              onChange={(e) => updateField('instansi', e.target.value)}
                            >
                              <option value="">Pilih Sekolah...</option>
                              {getMockSchools(form.tingkat, form.kecamatan).map(school => (
                                <option key={school} value={school}>{school}</option>
                              ))}
                            </select>
                            {errors.instansi && <p className="text-xs text-danger font-semibold mt-1 ml-1">{errors.instansi}</p>}
                          </div>
                        )}

                        <div className="pt-2">
                          <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5 ml-1">Riwayat Alergi (Opsional)</label>
                          <p className="text-[10px] text-text-muted mb-2 ml-1">Pisahkan dengan koma. Contoh: Kacang, Seafood, Susu</p>
                          <Input id="reg-alergi" label="" icon={AlertCircle} placeholder="Misal: Kacang, Udang..." value={form.alergi} onChange={(e) => updateField('alergi', e.target.value)} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  </div>

                  {/* Stepper Navigation */}
                  <div className="flex gap-3 mt-auto pt-8">
                    {regStep > 1 && (
                      <button type="button" onClick={handlePrevStep} className="px-5 py-3 rounded-xl border border-black/10 hover:bg-black/5 text-text-secondary font-bold transition-colors flex items-center justify-center shrink-0 cursor-pointer">
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                    )}
                    {regStep < (form.role === 'student' ? 4 : 3) ? (
                      <Button type="button" onClick={handleNextStep} icon={ChevronRight} className="flex-1" size="lg">Selanjutnya</Button>
                    ) : (
                      <Button type="submit" loading={loading} icon={UserPlus} className="flex-1" size="lg">Selesaikan Pendaftaran</Button>
                    )}
                  </div>
                </div>
              )}

            </form>

            {/* Toggle Modes - Premium Aesthetic Design */}
            {mode === 'login' ? (
              <div className="mt-8">
                <div className="relative flex items-center py-4 mb-4">
                  <div className="flex-grow border-t border-black/5"></div>
                  <span className="flex-shrink-0 mx-4 text-xs font-bold text-text-muted tracking-widest">ATAU</span>
                  <div className="flex-grow border-t border-black/5"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button 
                    type="button"
                    onClick={() => { setMode('register'); setErrors({}); setRegStep(1); }} 
                    className="flex items-center gap-3 p-4 rounded-xl border border-black/10 hover:border-primary/30 hover:bg-primary/5 transition-all group text-left cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-lg bg-black/5 group-hover:bg-primary/10 flex items-center justify-center shrink-0 transition-colors">
                      <UserPlus className="w-5 h-5 text-text-secondary group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">Pengguna Baru?</h4>
                      <p className="text-[11px] text-text-muted mt-0.5">Daftar akun di sini</p>
                    </div>
                  </button>

                  <button 
                    type="button"
                    onClick={() => { setMode('forgot'); setErrors({}); }} 
                    className="flex items-center gap-3 p-4 rounded-xl border border-black/10 hover:border-primary/30 hover:bg-primary/5 transition-all group text-left cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-lg bg-black/5 group-hover:bg-primary/10 flex items-center justify-center shrink-0 transition-colors">
                      <KeyRound className="w-5 h-5 text-text-secondary group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">Lupa Sandi?</h4>
                      <p className="text-[11px] text-text-muted mt-0.5">Reset akses Anda</p>
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-8 text-center border-t border-black/5 pt-6">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setErrors({}); setRegStep(1); }}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-text-muted hover:text-primary transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Kembali ke Halaman Login
                </button>
              </div>
            )}
          </div>

          <p className="flex items-center justify-center gap-1.5 text-center text-xs text-text-muted mt-6 font-medium">
            <ShieldCheck className="w-4 h-4 text-success" /> Enkripsi End-to-End • Data Aman 100%
          </p>
        </motion.div>
      </div>
    </div>
  );
}
