import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UtensilsCrossed, Lock, User, Building2, Eye, EyeOff, UserPlus, 
  LogIn, ShieldCheck, Mail, ChevronRight, ChevronLeft, AlertCircle,
  GraduationCap, ChefHat, Crown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { sanitizeInput } from '../lib/sanitize';
import { validatePassword } from '../lib/validators';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

// Mock Data for Schools
const MOCK_SCHOOLS = {
  sd: ['SDN 1 Jakarta', 'SDN Menteng 01', 'SDIT Al-Falah'],
  smp: ['SMPN 2 Bandung', 'SMPN 115 Jakarta', 'SMP Labschool'],
  sma: ['SMAN 8 Jakarta', 'SMAN 3 Bandung', 'SMA Taruna Nusantara'],
  smk: ['SMKN 1 Jakarta', 'SMKN 2 Surabaya', 'SMK Telkom']
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
    alergi: ''
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
    } else if (mode === 'register' && regStep === 3) {
      if (form.role === 'student') {
        if (!form.nisn.trim()) newErrors.nisn = 'NISN wajib diisi';
        if (!form.tingkat) newErrors.tingkat = 'Pilih tingkat pendidikan';
        if (!form.instansi) newErrors.instansi = 'Pilih sekolah';
      } else {
        if (!form.nama.trim()) newErrors.nama = 'Nama wajib diisi';
        if (!form.instansi.trim()) newErrors.instansi = 'Instansi wajib diisi';
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
            instansi: cleanInstansi,
            alergi: allergiesArray,
            status: form.role === 'spg' ? 'pending_approval' : 'active'
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
      let msg = 'Terjadi kesalahan';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Kredensial salah atau tidak ditemukan';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'Email sudah terdaftar';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Terlalu banyak percobaan. Coba lagi nanti.';
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
      <div className="w-full lg:w-[55%] flex items-center justify-center p-6 sm:p-12 relative bg-surface">
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

          <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-2xl shadow-primary/5 border border-black/5 relative overflow-hidden">
            {/* Liquid Glass ambient inside card */}
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-black text-text-primary mb-2 font-display">
                {mode === 'login' ? 'Selamat Datang Kembali' : mode === 'forgot' ? 'Reset Password' : 'Buat Akun Baru'}
              </h2>
              <p className="text-sm text-text-muted font-medium">
                {mode === 'login' 
                  ? 'Masuk menggunakan email terdaftar Anda' 
                  : mode === 'forgot'
                  ? 'Masukkan email untuk menerima tautan reset password'
                  : `Langkah ${regStep} dari 3 — Selesaikan pendaftaran`}
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
                    {[1, 2, 3].map(step => (
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

                    {/* STEP 3: DETAILS */}
                    {regStep === 3 && form.role === 'student' && (
                      <motion.div key="step3-student" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
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
                              {MOCK_SCHOOLS[form.tingkat]?.map(school => (
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

                    {regStep === 3 && form.role !== 'student' && (
                      <motion.div key="step3-admin" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                        <Input id="reg-instansi-admin" label="Instansi / Wilayah SPPG" icon={Building2} placeholder="Misal: SPPG Wilayah Jakarta Selatan" value={form.instansi} onChange={(e) => updateField('instansi', e.target.value)} error={errors.instansi} />
                        <div className="bg-warning/10 border border-warning/20 rounded-xl p-3 flex gap-2 text-xs text-warning-dark mt-2">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <p>Pendaftaran akun SPPG memerlukan persetujuan Super Admin sebelum bisa digunakan secara penuh.</p>
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
                    {regStep < 3 ? (
                      <Button type="button" onClick={handleNextStep} icon={ChevronRight} className="flex-1" size="lg">Selanjutnya</Button>
                    ) : (
                      <Button type="submit" loading={loading} icon={UserPlus} className="flex-1" size="lg">Selesaikan Pendaftaran</Button>
                    )}
                  </div>
                </div>
              )}

            </form>

            {/* Toggle Modes */}
            <div className="mt-8 text-center border-t border-black/5 pt-6">
              <button
                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErrors({}); setRegStep(1); }}
                className="text-sm font-semibold text-text-muted hover:text-primary transition-colors cursor-pointer"
              >
                {mode === 'login' ? 'Belum punya akun? Daftar Sekarang' : 'Sudah punya akun? Masuk'}
              </button>
            </div>
          </div>

          <p className="flex items-center justify-center gap-1.5 text-center text-xs text-text-muted mt-6 font-medium">
            <ShieldCheck className="w-4 h-4 text-success" /> Enkripsi End-to-End • Data Aman 100%
          </p>
        </motion.div>
      </div>
    </div>
  );
}
