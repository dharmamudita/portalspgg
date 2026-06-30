import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Trash2, Star, MessageSquare, UtensilsCrossed,
  Upload, Image as ImageIcon, TrendingUp, Users, BarChart3, Link as LinkIcon,
  ChevronLeft, ChevronRight, Calendar, Sparkles, Activity, Flame, CheckCircle2, User
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useMenusByDateRange, useAllFeedbacks, addMenu, deleteMenu } from '../hooks/useFirestore';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import PageHeaderBg from '../components/ui/PageHeaderBg';
import { useToast } from '../components/ui/Toast';
import { sanitizeInput } from '../lib/sanitize';
import { validateMenuName, validateNutrition } from '../lib/validators';
import Navbar from '../components/layout/Navbar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import StarRating from '../components/ui/StarRating';
import ManagedSchoolsManager from '../components/ManagedSchoolsManager';
import { MonthYearPicker } from './WeeklyMenuPage';
import './Dashboard.css';

import { getSchoolWeekRange, formatDate, MONTHS, DAYS } from '../lib/dateUtils';

export default function AdminDashboard() {
  const { userData } = useAuth();
  const { feedbacks } = useAllFeedbacks();
  const { addToast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Week-based menu filtering
  const [currentDate, setCurrentDate] = useState(new Date());
  const { start: weekStart, end: weekEnd } = useMemo(() => getSchoolWeekRange(currentDate), [currentDate]);
  const { menus, loading: menusLoading } = useMenusByDateRange(
    formatDate(weekStart), 
    formatDate(weekEnd), 
    userData?.role === 'superadmin' ? undefined : userData?.uid
  );

  // Stats (scoped to current week)
  const totalMenus = menus.length;
  const weekFeedbacks = useMemo(() => {
    const start = new Date(weekStart); start.setHours(0, 0, 0, 0);
    const end = new Date(weekEnd); end.setHours(23, 59, 59, 999);
    
    // Also filter feedbacks to only those belonging to menus of this SPG (if menus are loaded)
    const spgMenuIds = menus.map(m => m.id);
    
    return feedbacks.filter((f) => {
      if (!spgMenuIds.includes(f.menu_id)) return false;
      const date = f.timestamp?.toDate ? f.timestamp.toDate() : new Date(f.timestamp);
      return date >= start && date <= end;
    });
  }, [feedbacks, weekStart, weekEnd, menus]);
  
  const totalFeedbacks = weekFeedbacks.length;
  const avgRating = weekFeedbacks.length
    ? (weekFeedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / weekFeedbacks.length).toFixed(1)
    : '0.0';

  // Dynamic Chart Data based on weekFeedbacks
  const chartData = useMemo(() => {
    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const dataMap = {};
    days.forEach(d => dataMap[d] = { name: d, ratingSum: 0, feedback: 0 });

    weekFeedbacks.forEach(f => {
      const date = f.timestamp?.toDate ? f.timestamp.toDate() : new Date(f.timestamp);
      const dayName = days[date.getDay()];
      dataMap[dayName].feedback += 1;
      dataMap[dayName].ratingSum += (f.rating || 0);
    });

    // Reorder to match typical school week (Sen-Min)
    const orderedDays = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
    return orderedDays.map(d => ({
      name: d,
      rating: dataMap[d].feedback > 0 ? Number((dataMap[d].ratingSum / dataMap[d].feedback).toFixed(1)) : 0,
      feedback: dataMap[d].feedback
    }));
  }, [weekFeedbacks]);

  const stats = [
    { label: 'Menu Minggu Ini', value: totalMenus, icon: UtensilsCrossed, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Feedback', value: totalFeedbacks, icon: MessageSquare, color: 'text-accent', bg: 'bg-accent/10' },
    { label: 'Rata-rata Rating', value: avgRating, icon: Star, color: 'text-warning', bg: 'bg-warning/10' },
    { label: 'Aktivitas Baru', value: '+12%', icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10' },
  ];

  const prevWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  };
  const nextWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  };
  const goToThisWeek = () => setCurrentDate(new Date());
  const jumpToDate = (month, year) => {
    setCurrentDate(new Date(year, month, 1));
    setShowDatePicker(false);
  };

  const weekLabel = `${weekStart.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} — ${weekEnd.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`;

  const stagger = {
    container: { hidden: {}, show: { transition: { staggerChildren: 0.08 } } },
    item: { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } },
  };

  return (
    <div className="bg-[#f1f5f9] relative min-h-screen overflow-hidden font-sans pb-12">
      <PageHeaderBg />

      <div className="relative z-10">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-12">
          <motion.div variants={stagger.container} initial="hidden" animate="show">
            {/* Header */}
            <motion.div variants={stagger.item} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-md flex items-center gap-3">
                  Dashboard <span className="text-accent-light">Admin SPG</span>
                  <Sparkles className="w-8 h-8 text-yellow-300 animate-pulse-glow" />
                </h1>
                <p className="text-sm font-medium text-white/90 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full inline-flex items-center gap-2 border border-white/30 mt-4">
                  <Users className="w-4 h-4 text-white" />
                  Sistem Terpadu Portal SPG — {userData?.instansi}
                </p>
              </div>
            {userData?.role !== 'superadmin' && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button onClick={() => setShowAddModal(true)} icon={Plus} variant="primary" size="lg" className="shadow-xl shadow-primary/30">
                  Tambah Menu Baru
                </Button>
              </motion.div>
            )}
          </motion.div>

          {/* Premium Stats Grid */}
          <motion.div variants={stagger.item} className="stats-grid">
            {stats.map((stat, idx) => (
              <motion.div 
                key={stat.label} 
                className="liquid-glass p-5 cursor-pointer flex items-center gap-4"
                whileHover={{ y: -5, transition: { type: 'spring', stiffness: 400 } }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center shrink-0 shadow-inner`}>
                  <stat.icon className={`w-7 h-7 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-text-primary font-display drop-shadow-sm">{stat.value}</p>
                  <p className="text-xs font-semibold text-text-muted mt-1 uppercase tracking-wider">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Managed Schools Section */}
          {userData?.role !== 'superadmin' && (
            <motion.div variants={stagger.item} className="mt-8">
              <ManagedSchoolsManager />
            </motion.div>
          )}

          {/* Charts & Analytics Section */}
          <motion.div variants={stagger.item} className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            <div className="lg:col-span-2 liquid-glass p-6">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-black/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-text-primary font-display">Tren Feedback & Rating</h2>
                    <p className="text-xs text-text-muted">Pergerakan data 7 hari terakhir</p>
                  </div>
                </div>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8b9d90' }} dy={10} />
                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8b9d90' }} dx={-10} />
                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8b9d90' }} dx={10} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                      itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    />
                    <Line yAxisId="left" type="monotone" dataKey="rating" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, fill: '#3B82F6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} name="Rata-rata Rating" />
                    <Line yAxisId="right" type="monotone" dataKey="feedback" stroke="#1C4F87" strokeWidth={3} dot={{ r: 4, fill: '#1C4F87', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} name="Total Ulasan" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Live Activity Feed */}
            <div className="liquid-glass p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-black/5">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-primary animate-pulse" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-text-primary font-display">Aktivitas Terkini</h2>
                  <p className="text-xs text-text-muted">Siaran langsung dari siswa</p>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                {weekFeedbacks.length > 0 ? weekFeedbacks.slice(0, 5).map((f, i) => {
                  const date = f.timestamp?.toDate ? f.timestamp.toDate() : new Date(f.timestamp);
                  // find the menu name
                  const menuObj = menus.find(m => m.id === f.menu_id);
                  const menuName = menuObj ? menuObj.nama_menu : 'Menu';
                  return (
                    <div key={f.id || i} className="flex gap-3 relative">
                      {i !== Math.min(weekFeedbacks.length, 5) - 1 && <div className="absolute top-8 left-3.5 w-0.5 h-full bg-black/5 -z-10"></div>}
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border-2 border-white z-10">
                        <Star className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-primary">Siswa {f.user_instansi || 'Anonim'}</p>
                        <p className="text-xs text-text-secondary mt-0.5">Memberikan bintang {f.rating} untuk menu "{menuName}".</p>
                        <p className="text-[10px] text-text-muted mt-1">{date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="text-center py-8">
                    <MessageSquare className="w-8 h-8 text-text-muted opacity-50 mx-auto mb-2" />
                    <p className="text-xs text-text-muted">Belum ada aktivitas minggu ini.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            {/* Menu List with Week Filter */}
            <motion.div variants={stagger.item} className="lg:col-span-2">
              <div className="liquid-glass flex flex-col items-stretch p-6">
                {/* Week Filter Header */}
                <div className="flex flex-col gap-4 mb-6">
                  <div className="flex items-center justify-between pb-4 border-b border-black/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <UtensilsCrossed className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-text-primary font-display">Manajemen Menu Mingguan</h2>
                        <p className="text-xs text-text-muted">Jadwalkan makanan sehat</p>
                      </div>
                    </div>
                    <Badge variant="primary">{totalMenus} menu</Badge>
                  </div>

                  {/* Week Navigator */}
                  <div className="bg-white/40 backdrop-blur-md rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/50">
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <button
                          onClick={() => setShowDatePicker(!showDatePicker)}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white shadow-sm hover:shadow-md text-sm font-bold text-text-primary transition-all cursor-pointer"
                        >
                          <Calendar className="w-4 h-4 text-primary" />
                          {MONTHS[weekStart.getMonth()]} {weekStart.getFullYear()}
                        </button>
                        {showDatePicker && (
                          <MonthYearPicker
                            currentMonth={weekStart.getMonth()}
                            currentYear={weekStart.getFullYear()}
                            onSelect={jumpToDate}
                            onClose={() => setShowDatePicker(false)}
                          />
                        )}
                      </div>
                      <button
                        onClick={goToThisWeek}
                        className="px-3 py-2 rounded-xl bg-primary/10 text-xs font-bold text-primary hover:bg-primary/20 transition-colors cursor-pointer"
                      >
                        Minggu Ini
                      </button>
                    </div>
                    <div className="flex items-center justify-center gap-3 bg-white px-3 py-1.5 rounded-xl shadow-sm">
                      <button onClick={prevWeek} className="p-1.5 rounded-lg hover:bg-black/5 transition-colors cursor-pointer">
                        <ChevronLeft className="w-4 h-4 text-text-secondary" />
                      </button>
                      <p className="text-xs font-bold text-text-primary whitespace-nowrap">{weekLabel}</p>
                      <button onClick={nextWeek} className="p-1.5 rounded-lg hover:bg-black/5 transition-colors cursor-pointer">
                        <ChevronRight className="w-4 h-4 text-text-secondary" />
                      </button>
                    </div>
                  </div>
                </div>

                {menusLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
                  </div>
                ) : menus.length === 0 ? (
                  <div className="text-center py-16 bg-black/5 rounded-2xl border border-dashed border-black/10">
                    <UtensilsCrossed className="w-16 h-16 text-text-muted mx-auto mb-4 opacity-30" />
                    <p className="text-base font-bold text-text-secondary">Belum ada menu</p>
                    <p className="text-sm text-text-muted mt-1">Klik "Tambah Menu Baru" di atas untuk menjadwalkan.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {menus.map((menu, idx) => (
                      <MenuRow key={menu.id} menu={menu} index={idx} />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Recent Feedbacks */}
            <motion.div variants={stagger.item}>
              <div className="liquid-glass flex flex-col items-stretch p-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-black/5">
                  <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-text-primary font-display">Ulasan Masuk</h2>
                    <p className="text-xs text-text-muted">Feedback dari siswa</p>
                  </div>
                </div>
                
                {feedbacks.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-30" />
                    <p className="text-sm text-text-muted text-center">Belum ada feedback</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {feedbacks.slice(0, 20).map((fb, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={fb.id} 
                        className="glass p-4"
                      >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center shrink-0 shadow-inner overflow-hidden">
                              <User className="w-6 h-6 text-text-muted mt-1" />
                            </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-bold text-text-primary truncate">{fb.user_instansi || 'Instansi'}</p>
                              <StarRating value={fb.rating} readonly size={12} />
                            </div>
                            <p className="text-xs text-text-secondary line-clamp-3 leading-relaxed">{fb.komentar}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>

      {/* Add Menu Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Tambah Menu Baru" size="lg">
        <AddMenuForm onSuccess={() => { setShowAddModal(false); addToast('Menu berhasil ditambahkan!', 'success'); }} />
      </Modal>
      </div>
    </div>
  );
}

function MenuRow({ menu, index }) {
  const { addToast } = useToast();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Yakin ingin menghapus menu ini?')) return;
    setDeleting(true);
    try {
      await deleteMenu(menu.id);
      addToast('Menu berhasil dihapus', 'success');
    } catch {
      addToast('Gagal menghapus menu', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const dateStr = menu.tanggal?.toDate
    ? menu.tanggal.toDate().toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
    : '-';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 300 }}
      whileHover={{ scale: 1.01, x: 4 }}
      className="flex items-center gap-4 bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-white hover:border-primary/30 transition-all cursor-default"
    >
      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow-inner">
        <img
          src={menu.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop'}
          alt={menu.nama_menu}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-bold text-text-primary truncate font-display">{menu.nama_menu}</h3>
        <div className="flex items-center gap-3 text-xs text-text-muted mt-1.5 font-medium">
          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {dateStr}</span>
          <span className="w-1 h-1 rounded-full bg-black/20"></span>
          <span>{menu.kalori || 0} kkal</span>
          <span className="w-1 h-1 rounded-full bg-black/20"></span>
          <span>{menu.protein || 0}g pro</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {menu.is_voting_option && <Badge variant="accent">Opsi Voting</Badge>}
        <button 
          onClick={handleDelete} 
          disabled={deleting}
          className="w-10 h-10 rounded-xl bg-danger/10 text-danger hover:bg-danger hover:text-white flex items-center justify-center transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
          title="Hapus Menu"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

function AddMenuForm({ onSuccess }) {
  const { userData } = useAuth();
  const [form, setForm] = useState({
    nama_menu: '', kalori: '', protein: '', lemak: '', karbo: '',
    harga_porsi: '', bahan_baku: '', tanggal: '', is_voting_option: false,
    image_url: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const updateField = (field, value) => {
    setForm((p) => {
      const next = { ...p, [field]: value };
      // Auto calculate calories
      if (['protein', 'lemak', 'karbo'].includes(field)) {
        const pro = parseFloat(next.protein) || 0;
        const lem = parseFloat(next.lemak) || 0;
        const kar = parseFloat(next.karbo) || 0;
        next.kalori = Math.round((pro * 4) + (kar * 4) + (lem * 9)).toString();
      }
      return next;
    });
    setErrors((p) => ({ ...p, [field]: '' }));
  };

  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      alert("Cloudinary belum dikonfigurasi di file .env");
      return;
    }

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url) {
        updateField('image_url', data.secure_url);
      } else {
        alert("Gagal mengunggah gambar: " + (data.error?.message || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat mengunggah gambar.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    const nameCheck = validateMenuName(form.nama_menu);
    if (!nameCheck.valid) newErrors.nama_menu = nameCheck.message;
    if (!form.tanggal) newErrors.tanggal = 'Tanggal wajib diisi';

    ['kalori', 'protein', 'lemak', 'karbo'].forEach((field) => {
      const val = parseFloat(form[field]);
      const check = validateNutrition(val, field);
      if (!check.valid) newErrors[field] = check.message;
    });

    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setLoading(true);
    try {
      const cleanName = sanitizeInput(form.nama_menu);
      const bahanArray = form.bahan_baku
        .split(',')
        .map((b) => sanitizeInput(b))
        .filter((b) => b.length > 0);

      await addMenu({
        nama_menu: cleanName,
        kalori: parseFloat(form.kalori),
        protein: parseFloat(form.protein),
        lemak: parseFloat(form.lemak),
        karbo: parseFloat(form.karbo),
        harga_porsi: parseFloat(form.harga_porsi) || 0,
        bahan_baku: bahanArray,
        image_url: sanitizeInput(form.image_url),
        tanggal: form.tanggal,
        is_voting_option: form.is_voting_option,
        spg_uid: userData?.spg_uid || userData?.uid,
      });

      onSuccess();
    } catch (err) {
      console.error('Error adding menu:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* SECTION 1: GAMBAR & NAMA */}
      <div className="bg-black/5 p-4 rounded-2xl space-y-4 border border-black/5">
        <h3 className="text-sm font-bold text-text-primary flex items-center gap-2 mb-2">
          <UtensilsCrossed className="w-4 h-4 text-primary" /> Informasi Dasar
        </h3>
        
        <div>
          <label className="block text-xs font-bold text-text-primary mb-1.5 ml-1">Gambar Makanan</label>
          <div className="flex flex-col gap-3">
            {/* Upload Button */}
            <div className="relative">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                disabled={uploadingImage}
              />
              <div className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-colors ${uploadingImage ? 'border-primary/50 bg-primary/5' : 'border-primary/30 bg-white hover:bg-primary/5 hover:border-primary'}`}>
                {uploadingImage ? (
                  <>
                    <Upload className="w-6 h-6 text-primary mb-2 animate-bounce" />
                    <span className="text-sm font-semibold text-primary">Mengunggah...</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-6 h-6 text-primary mb-2" />
                    <span className="text-sm font-semibold text-primary">Klik atau seret gambar ke sini</span>
                    <span className="text-[10px] text-text-muted mt-1">Mendukung JPG, PNG (Max 5MB)</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-px bg-black/10 flex-1"></div>
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">ATAU</span>
              <div className="h-px bg-black/10 flex-1"></div>
            </div>

            <Input
              id="menu-image"
              icon={LinkIcon}
              placeholder="Gunakan URL gambar..."
              value={form.image_url}
              onChange={(e) => updateField('image_url', e.target.value)}
            />
          </div>

          {form.image_url && (
            <div className="mt-3 rounded-xl overflow-hidden border-2 border-white shadow-md relative group">
              <img src={form.image_url} alt="Preview" className="w-full h-40 object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
              <button 
                type="button"
                onClick={() => updateField('image_url', '')}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-danger text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        
        <Input id="menu-name" label="Nama Menu" placeholder="Contoh: Nasi Goreng Spesial" value={form.nama_menu} onChange={(e) => updateField('nama_menu', e.target.value)} error={errors.nama_menu} />
        <Input id="menu-date" label="Tanggal Disajikan" type="date" value={form.tanggal} onChange={(e) => updateField('tanggal', e.target.value)} error={errors.tanggal} />
      </div>

      {/* SECTION 2: GIZI */}
      <div className="bg-primary/5 p-4 rounded-2xl space-y-4 border border-primary/10">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-primary flex items-center gap-2">
            <Flame className="w-4 h-4" /> Kandungan Gizi
          </h3>
          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">Otomatis Kalkulasi Kalori</span>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <Input id="menu-protein" label="Protein (g)" type="number" placeholder="0" value={form.protein} onChange={(e) => updateField('protein', e.target.value)} error={errors.protein} />
          <Input id="menu-lemak" label="Lemak (g)" type="number" placeholder="0" value={form.lemak} onChange={(e) => updateField('lemak', e.target.value)} error={errors.lemak} />
          <Input id="menu-karbo" label="Karbohidrat (g)" type="number" placeholder="0" value={form.karbo} onChange={(e) => updateField('karbo', e.target.value)} error={errors.karbo} />
        </div>
        
        <div className="relative">
          <Input 
            id="menu-kalori" 
            label="Total Kalori (kkal)" 
            type="number" 
            placeholder="0" 
            value={form.kalori} 
            onChange={(e) => updateField('kalori', e.target.value)} 
            error={errors.kalori} 
            className="bg-black/5 font-bold text-lg text-primary pointer-events-none"
            readOnly
          />
        </div>
      </div>

      {/* SECTION 3: HARGA & BAHAN */}
      <div className="bg-accent/5 p-4 rounded-2xl space-y-4 border border-accent/10">
        <h3 className="text-sm font-bold text-accent flex items-center gap-2 mb-2">
          <Star className="w-4 h-4" /> Detail & Harga
        </h3>
        <Input id="menu-bahan" label="Bahan Baku Utama (pisahkan koma)" placeholder="Beras, Ayam, Telur, Sayuran" value={form.bahan_baku} onChange={(e) => updateField('bahan_baku', e.target.value)} />
        <Input id="menu-harga" label="Estimasi Harga per Porsi (Rp)" type="number" placeholder="Contoh: 15000" value={form.harga_porsi} onChange={(e) => updateField('harga_porsi', e.target.value)} />
        
        <label className="flex items-center gap-3 cursor-pointer p-3 bg-white rounded-xl border border-black/5 hover:border-accent/30 transition-colors mt-2">
          <div className="relative flex items-center justify-center">
            <input type="checkbox" checked={form.is_voting_option} onChange={(e) => updateField('is_voting_option', e.target.checked)} className="peer w-5 h-5 opacity-0 absolute cursor-pointer" />
            <div className="w-5 h-5 rounded border-2 border-accent/50 peer-checked:bg-accent peer-checked:border-accent flex items-center justify-center transition-colors">
              <CheckCircle2 className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-text-primary">Jadikan Opsi Voting</span>
            <span className="text-[10px] text-text-muted">Centang jika menu ini untuk dipilih minggu depan</span>
          </div>
        </label>
      </div>

      <Button type="submit" loading={loading} icon={Plus} className="w-full shadow-xl shadow-primary/30" size="lg">
        Simpan Menu
      </Button>
    </form>
  );
}

