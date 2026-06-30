import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UtensilsCrossed, Lock, User, Building2, Eye, EyeOff, UserPlus, LogIn, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { sanitizeInput } from '../lib/sanitize';
import { validateNIP, validatePassword } from '../lib/validators';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function LoginPage() {
  const { login, register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nip: '', password: '', nama: '', instansi: '' });
  const [errors, setErrors] = useState({});

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    const nipCheck = validateNIP(form.nip);
    if (!nipCheck.valid) newErrors.nip = nipCheck.message;

    const passCheck = validatePassword(form.password);
    if (!passCheck.valid) newErrors.password = passCheck.message;

    if (isRegister) {
      if (!form.nama.trim()) newErrors.nama = 'Nama wajib diisi';
      if (!form.instansi.trim()) newErrors.instansi = 'Instansi wajib diisi';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const cleanNip = sanitizeInput(form.nip);
      if (isRegister) {
        const cleanNama = sanitizeInput(form.nama);
        const cleanInstansi = sanitizeInput(form.instansi);
        await register(cleanNip, form.password, cleanNama, cleanInstansi, 'student');
        addToast('Registrasi berhasil!', 'success');
        navigate('/dashboard');
      } else {
        const result = await login(cleanNip, form.password);
        addToast('Login berhasil!', 'success');
        // Get role from Firestore user doc (set by login function in AuthContext)
        const { getDoc, doc } = await import('firebase/firestore');
        const { db } = await import('../lib/firebase');
        const userDoc = await getDoc(doc(db, 'users', result.user.uid));
        const role = userDoc.exists() ? userDoc.data().role : 'student';
        navigate(role === 'spg' ? '/admin' : '/dashboard');
      }
    } catch (err) {
      let msg = 'Terjadi kesalahan';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'NIP atau password salah';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'NIP sudah terdaftar';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Terlalu banyak percobaan. Coba lagi nanti.';
      }
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-mesh flex items-center justify-center p-4">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-accent/15 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-secondary/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="w-24 h-24 mx-auto flex items-center justify-center mb-2"
          >
            <img src="/logo-bgn.png" alt="Logo BGN" className="w-full h-full object-contain drop-shadow-xl" />
          </motion.div>
          <h1 className="text-2xl font-bold gradient-text">Portal SPPG</h1>
          <p className="text-sm text-text-muted mt-1">Sistem Pengelolaan Pangan Gratis</p>
        </div>

        {/* Card */}
        <div className="glass-strong rounded-3xl p-8 shadow-2xl">
          <h2 className="text-lg font-bold text-text-primary mb-1">
            {isRegister ? 'Daftar Akun Baru' : 'Masuk ke Akun'}
          </h2>
          <p className="text-xs text-text-muted mb-6">
            {isRegister ? 'Isi data diri untuk membuat akun' : 'Gunakan NIP dan password Anda'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="login-nip"
              label="NIP"
              icon={User}
              placeholder="Masukkan NIP"
              value={form.nip}
              onChange={(e) => updateField('nip', e.target.value)}
              error={errors.nip}
              autoComplete="username"
            />

            {isRegister && (
              <>
                <Input
                  id="register-nama"
                  label="Nama Lengkap"
                  icon={User}
                  placeholder="Masukkan nama"
                  value={form.nama}
                  onChange={(e) => updateField('nama', e.target.value)}
                  error={errors.nama}
                />
                <Input
                  id="register-instansi"
                  label="Instansi / Sekolah"
                  icon={Building2}
                  placeholder="Masukkan instansi"
                  value={form.instansi}
                  onChange={(e) => updateField('instansi', e.target.value)}
                  error={errors.instansi}
                />
              </>
            )}

            <div className="relative">
              <Input
                id="login-password"
                label="Password"
                icon={Lock}
                type={showPassword ? 'text' : 'password'}
                placeholder="Masukkan password"
                value={form.password}
                onChange={(e) => updateField('password', e.target.value)}
                error={errors.password}
                autoComplete={isRegister ? 'new-password' : 'current-password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-text-muted hover:text-text-primary cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <Button
              type="submit"
              loading={loading}
              icon={isRegister ? UserPlus : LogIn}
              className="w-full mt-2"
              size="lg"
            >
              {isRegister ? 'Daftar' : 'Masuk'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => { setIsRegister(!isRegister); setErrors({}); }}
              className="text-sm text-text-muted hover:text-primary transition-colors cursor-pointer"
            >
              {isRegister ? 'Sudah punya akun? Masuk' : 'Belum punya akun? Daftar'}
            </button>
          </div>
        </div>

        {/* Security Notice */}
        <p className="flex items-center justify-center gap-1.5 text-center text-[10px] text-text-muted mt-4">
          <ShieldCheck className="w-3.5 h-3.5 text-success" /> Dilindungi enkripsi end-to-end • Data Anda aman
        </p>
      </motion.div>
    </div>
  );
}
