import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Shield, Building2, Save, KeyRound, AlertCircle, CheckCircle2, MapPin, Map, Navigation, ChevronRight, Settings, ShieldCheck, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile } from '../hooks/useFirestore';
import { verifyBeforeUpdateEmail, getAuth } from 'firebase/auth';
import { useToast } from '../components/ui/Toast';
import Navbar from '../components/layout/Navbar';
import PageHeaderBg from '../components/ui/PageHeaderBg';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MOCK_WILAYAH } from '../lib/wilayah';

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Location Marker Component for the Map
function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

export default function ProfilePage() {
  const { userData, currentUser, updateUserData, resetPassword } = useAuth();
  const { addToast } = useToast();
  
  // State
  const [activeTab, setActiveTab] = useState('personal'); // 'personal', 'security'
  const [loading, setLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [newEmail, setNewEmail] = useState('');

  // Parse initial location for SPG
  const initialInstansi = userData?.instansi || userData?.nama_instansi || '';
  let initProv = '', initKab = '', initKec = '';
  if (userData?.role === 'spg' && initialInstansi.startsWith('SPPG ')) {
    const parts = initialInstansi.replace('SPPG ', '').split(', ');
    initKec = parts[0] || '';
    initKab = parts[1] || '';
    initProv = parts[2] || '';
  }

  // Form State
  const [form, setForm] = useState({
    nama: userData?.nama || '',
    instansi: userData?.role === 'student' ? initialInstansi : '',
    provinsi: initProv,
    kabupaten: initKab,
    kecamatan: initKec,
    nip: userData?.nip || userData?.nisn || '',
    photoURL: userData?.photoURL || '',
    latitude: userData?.latitude || -6.200000,
    longitude: userData?.longitude || 106.816666,
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      addToast('Harap pilih file gambar (JPG/PNG)', 'error');
      return;
    }

    // Convert to base64 and resize to max 200x200 to save space in Firestore
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Use webp for better compression, fallback to jpeg
        const dataUrl = canvas.toDataURL('image/webp', 0.8);
        setForm(prev => ({ ...prev, photoURL: dataUrl }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let finalInstansi = form.instansi;
      if (userData?.role === 'spg') {
        if (!form.provinsi || !form.kabupaten || !form.kecamatan) {
          addToast('Harap pilih Provinsi, Kabupaten/Kota, dan Kecamatan', 'error');
          setLoading(false);
          return;
        }
        finalInstansi = `SPPG ${form.kecamatan}, ${form.kabupaten}, ${form.provinsi}`;
      }

      const dataToUpdate = {
        nama: form.nama,
        ...(userData?.role === 'spg' ? { nip: form.nip, latitude: form.latitude, longitude: form.longitude } : { nisn: form.nip }), // Update NIP/NISN & location for SPG
        ...(form.photoURL ? { photoURL: form.photoURL } : {}), // Update photoURL
        ...(userData?.role === 'student' ? { instansi: finalInstansi } : { nama_instansi: finalInstansi })
      };
      
      await updateUserProfile(currentUser.uid, dataToUpdate);
      updateUserData(dataToUpdate);
      addToast('Profil berhasil diperbarui!', 'success');
    } catch (error) {
      console.error(error);
      addToast('Gagal memperbarui profil.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setResetLoading(true);
    try {
      await resetPassword(currentUser.email);
      addToast('Link reset password telah dikirim ke email Anda!', 'success');
    } catch (error) {
      console.error(error);
      addToast('Gagal mengirim link reset password.', 'error');
    } finally {
      setResetLoading(false);
    }
  };

  const handleChangeEmail = async (e) => {
    e.preventDefault();
    if (!newEmail || newEmail === currentUser.email) return;
    
    setEmailLoading(true);
    try {
      const auth = getAuth();
      await verifyBeforeUpdateEmail(auth.currentUser, newEmail);
      addToast(`Link verifikasi telah dikirim ke ${newEmail}. Harap cek inbox Anda.`, 'success');
      setNewEmail('');
    } catch (error) {
      console.error(error);
      if (error.code === 'auth/requires-recent-login') {
        addToast('Gagal! Anda harus logout dan login kembali untuk mengganti email (demi keamanan).', 'error');
      } else {
        addToast('Gagal mengirim link ganti email.', 'error');
      }
    } finally {
      setEmailLoading(false);
    }
  };

  const menuItems = [
    { id: 'personal', label: 'Informasi Personal', icon: User, desc: 'Kelola data diri & instansi' },
    { id: 'security', label: 'Akun & Keamanan', icon: ShieldCheck, desc: 'Pengaturan email & sandi' },
  ];

  return (
    <div className="min-h-screen bg-[#f1f5f9] font-sans pb-12 relative overflow-hidden">
      <PageHeaderBg />

      <div className="relative z-10">
        <Navbar />

        <main className="pt-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Profile Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-8 pt-8"
          >
            <div className="relative group">
              <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-md border-4 border-white shadow-2xl flex items-center justify-center relative overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
                {form.photoURL ? (
                  <img src={form.photoURL} alt="Profile" className="w-full h-full object-cover relative z-10" />
                ) : (
                  <User className="w-16 h-16 text-white drop-shadow-md relative z-10" />
                )}
                
                {/* Upload Overlay */}
                <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-20">
                  <Camera className="w-8 h-8 text-white mb-1" />
                  <span className="text-white text-xs font-bold">Ubah Foto</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            </div>
            <div className="text-center md:text-left mb-2">
              <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-md">{userData?.nama || 'Pengguna'}</h1>
              <div className="flex items-center justify-center md:justify-start gap-2 mt-2 text-white/80 font-medium">
                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm border border-white/10">
                  {userData?.role === 'superadmin' ? 'Super Admin' : userData?.role === 'spg' ? 'Admin SPPG' : 'Siswa'}
                </span>
                <span className="text-sm">{userData?.nip || userData?.nisn}</span>
              </div>
            </div>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Sidebar Navigation */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:w-1/3 shrink-0"
            >
              <div className="bg-white rounded-3xl shadow-xl shadow-black/5 p-4 border border-black/5 sticky top-28">
                <div className="space-y-2">
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 text-left group ${
                        activeTab === item.id 
                          ? 'bg-primary/10 border-transparent shadow-sm' 
                          : 'bg-transparent border-transparent hover:bg-black/5'
                      }`}
                    >
                      <div className={`p-3 rounded-xl transition-colors ${
                        activeTab === item.id ? 'bg-primary text-white shadow-md shadow-primary/30' : 'bg-black/5 text-text-secondary group-hover:bg-black/10'
                      }`}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-bold ${activeTab === item.id ? 'text-primary' : 'text-text-primary'}`}>{item.label}</h3>
                        <p className={`text-xs mt-0.5 ${activeTab === item.id ? 'text-primary/70' : 'text-text-muted'}`}>{item.desc}</p>
                      </div>
                      <ChevronRight className={`w-5 h-5 transition-transform ${activeTab === item.id ? 'text-primary translate-x-1' : 'text-text-muted/50'}`} />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Content Area */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:w-2/3 flex-1"
            >
              <AnimatePresence mode="wait">
                {/* === TAB: INFORMASI PERSONAL === */}
                {activeTab === 'personal' && (
                  <motion.div
                    key="personal"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-black/5 overflow-hidden"
                  >
                    <div className="p-8 md:p-10">
                      <div className="mb-8">
                        <h2 className="text-2xl font-black text-text-primary">Informasi Personal</h2>
                        <p className="text-text-secondary mt-1">Perbarui data diri dan informasi wilayah kelolaan Anda.</p>
                      </div>
                      
                      <form onSubmit={handleSaveProfile} className="space-y-6">
                        <div className="bg-background rounded-2xl p-6 border border-black/5 space-y-5">
                          <Input
                            label="Nama Lengkap"
                            value={form.nama}
                            onChange={(e) => setForm({ ...form, nama: e.target.value })}
                            icon={User}
                          />
                          <Input
                            label={userData?.role === 'spg' ? 'NIP / ID Pengelola' : 'NISN / NIP'}
                            value={form.nip}
                            onChange={(e) => setForm({ ...form, nip: e.target.value })}
                            icon={Shield}
                            placeholder={userData?.role === 'spg' ? 'Kosongkan jika tidak ada' : 'Nomor Induk Siswa Nasional'}
                          />
                        </div>
                        
                        {userData?.role === 'student' && (
                          <div className="bg-background rounded-2xl p-6 border border-black/5 space-y-5">
                            <Input
                              label="Asal Sekolah"
                              value={form.instansi}
                              onChange={(e) => setForm({ ...form, instansi: e.target.value })}
                              icon={Building2}
                              disabled
                            />
                          </div>
                        )}

                        {userData?.role === 'superadmin' && (
                          <div className="bg-background rounded-2xl p-6 border border-black/5 space-y-5 text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold">
                              <Shield className="w-5 h-5" />
                              Akses Super Admin Nasional
                            </div>
                            <p className="text-sm text-text-muted mt-2">Anda memiliki akses penuh ke seluruh data secara nasional, tidak terikat pada wilayah atau instansi tertentu.</p>
                          </div>
                        )}
                        
                        {userData?.role === 'spg' && (
                          <div className="bg-background rounded-2xl p-6 border border-black/5">
                            <h3 className="font-bold text-text-primary mb-5 flex items-center gap-2">
                              <Map className="w-5 h-5 text-primary" /> Wilayah Pengelolaan
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                              <div className="col-span-1 md:col-span-2">
                                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 ml-1">Provinsi</label>
                                <div className="relative">
                                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <MapPin className="h-5 w-5 text-text-muted" />
                                  </div>
                                  <select 
                                    className="w-full bg-white border border-black/10 rounded-xl pl-11 pr-4 py-3.5 text-sm font-medium text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer hover:border-black/20"
                                    value={form.provinsi}
                                    onChange={(e) => setForm({ ...form, provinsi: e.target.value, kabupaten: '', kecamatan: '' })}
                                  >
                                    <option value="">Pilih Provinsi...</option>
                                    {Object.keys(MOCK_WILAYAH).map(prov => (
                                      <option key={prov} value={prov}>{prov}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                              
                              {form.provinsi && (
                                <div>
                                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 ml-1">Kabupaten / Kota</label>
                                  <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                      <Building2 className="h-5 w-5 text-text-muted" />
                                    </div>
                                    <select 
                                      className="w-full bg-white border border-black/10 rounded-xl pl-11 pr-4 py-3.5 text-sm font-medium text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer hover:border-black/20"
                                      value={form.kabupaten}
                                      onChange={(e) => setForm({ ...form, kabupaten: e.target.value, kecamatan: '' })}
                                    >
                                      <option value="">Pilih Kabupaten...</option>
                                      {Object.keys(MOCK_WILAYAH[form.provinsi] || {}).map(kab => (
                                        <option key={kab} value={kab}>{kab}</option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                              )}
                              
                              {form.kabupaten && (
                                <div>
                                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 ml-1">Kecamatan</label>
                                  <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                      <Navigation className="h-5 w-5 text-text-muted" />
                                    </div>
                                    <select 
                                      className="w-full bg-white border border-black/10 rounded-xl pl-11 pr-4 py-3.5 text-sm font-medium text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer hover:border-black/20"
                                      value={form.kecamatan}
                                      onChange={(e) => setForm({ ...form, kecamatan: e.target.value })}
                                    >
                                      <option value="">Pilih Kecamatan...</option>
                                      {(MOCK_WILAYAH[form.provinsi]?.[form.kabupaten] || []).map(kec => (
                                        <option key={kec} value={kec}>{kec}</option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {/* Map Selector */}
                            <div className="mt-8">
                              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 ml-1">Pin Lokasi Dapur SPPG</label>
                              <p className="text-sm text-text-muted mb-4 ml-1">Klik pada peta untuk menandai koordinat lokasi dapur Anda secara akurat.</p>
                              
                              <div className="h-64 rounded-xl overflow-hidden border border-black/10 shadow-inner z-0 relative">
                                <MapContainer 
                                  center={[form.latitude, form.longitude]} 
                                  zoom={13} 
                                  style={{ height: '100%', width: '100%', zIndex: 0 }}
                                >
                                  <TileLayer
                                    url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                                    attribution="&copy; Google Maps"
                                  />
                                  <LocationMarker 
                                    position={{ lat: form.latitude, lng: form.longitude }} 
                                    setPosition={(pos) => setForm({ ...form, latitude: pos.lat, longitude: pos.lng })} 
                                  />
                                </MapContainer>
                              </div>
                              <div className="flex gap-4 mt-3">
                                <div className="flex-1 bg-white border border-black/10 rounded-lg p-3">
                                  <p className="text-xs text-text-muted uppercase font-bold mb-1">Latitude</p>
                                  <p className="font-mono text-sm">{form.latitude.toFixed(6)}</p>
                                </div>
                                <div className="flex-1 bg-white border border-black/10 rounded-lg p-3">
                                  <p className="text-xs text-text-muted uppercase font-bold mb-1">Longitude</p>
                                  <p className="font-mono text-sm">{form.longitude.toFixed(6)}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="pt-4 flex justify-end">
                          <Button type="submit" loading={loading} icon={Save} className="min-w-[200px] shadow-lg shadow-primary/20 py-3.5">
                            Simpan Perubahan
                          </Button>
                        </div>
                      </form>
                    </div>
                  </motion.div>
                )}

                {/* === TAB: KEAMANAN === */}
                {activeTab === 'security' && (
                  <motion.div
                    key="security"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    {/* Ganti Email Section */}
                    <div className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-black/5 overflow-hidden">
                      <div className="p-8 md:p-10">
                        <div className="mb-8">
                          <h2 className="text-2xl font-black text-text-primary">Pengaturan Email</h2>
                          <p className="text-text-secondary mt-1">Perbarui alamat email yang terhubung dengan akun Anda.</p>
                        </div>
                        
                        <div className="bg-gradient-to-r from-accent/10 to-transparent border border-accent/20 rounded-2xl p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Email Saat Ini</p>
                            <p className="text-lg font-bold text-text-primary">{currentUser?.email}</p>
                          </div>
                          <div className="p-3 bg-white/60 backdrop-blur-sm rounded-xl shrink-0">
                            <Mail className="w-6 h-6 text-primary" />
                          </div>
                        </div>

                        <form onSubmit={handleChangeEmail} className="space-y-5">
                          <Input
                            type="email"
                            label="Alamat Email Baru"
                            placeholder="Masukkan alamat email baru..."
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            icon={Mail}
                          />
                          <div className="bg-black/5 rounded-xl p-4 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-text-muted shrink-0 mt-0.5" />
                            <p className="text-sm text-text-secondary leading-relaxed">
                              Kami akan mengirimkan tautan verifikasi resmi ke email yang baru Anda masukkan. Pastikan email tersebut aktif dan dapat diakses.
                            </p>
                          </div>
                          <div className="pt-2 flex justify-end">
                            <Button type="submit" variant="secondary" loading={emailLoading} icon={CheckCircle2} className="min-w-[200px] shadow-lg shadow-accent/20 py-3.5">
                              Kirim Link Verifikasi
                            </Button>
                          </div>
                        </form>
                      </div>
                    </div>

                    {/* Reset Password Section */}
                    <div className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-black/5 overflow-hidden">
                      <div className="p-8 md:p-10">
                        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <h2 className="text-2xl font-black text-text-primary">Kata Sandi</h2>
                            <p className="text-text-secondary mt-1">Amankan akun Anda dengan mengganti kata sandi secara berkala.</p>
                          </div>
                          <div className="w-12 h-12 rounded-2xl bg-danger/10 flex items-center justify-center shrink-0">
                            <KeyRound className="w-6 h-6 text-primary" />
                          </div>
                        </div>
                        
                        <p className="text-sm text-text-secondary leading-relaxed mb-8 max-w-2xl">
                          Sistem akan mengirimkan instruksi perubahan kata sandi langsung ke email terdaftar Anda (<strong>{currentUser?.email}</strong>). Harap periksa folder kotak masuk atau spam Anda.
                        </p>

                        <div className="flex">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleResetPassword}
                            loading={resetLoading}
                            icon={KeyRound}
                            className="border-danger/30 text-danger hover:bg-danger/5 hover:border-danger transition-colors py-3.5"
                          >
                            Kirim Instruksi Ganti Sandi
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
