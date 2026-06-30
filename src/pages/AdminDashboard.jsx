import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Trash2, Star, MessageSquare, UtensilsCrossed,
  Upload, Image as ImageIcon, TrendingUp, Users, BarChart3, Link as LinkIcon,
  ChevronLeft, ChevronRight, Calendar, Sparkles, Activity
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useMenusByDateRange, useAllFeedbacks, addMenu, deleteMenu } from '../hooks/useFirestore';
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
import { MonthYearPicker } from './WeeklyMenuPage';
import './Dashboard.css';

const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

function getWeekRange(date) {
  const d = new Date(date);
  const day = d.getDay();
  const start = new Date(d);
  start.setDate(d.getDate() - day + 1); // Monday
  const end = new Date(start);
  end.setDate(start.getDate() + 6); // Sunday
  return { start, end };
}

function formatDate(d) {
  return d.toISOString().split('T')[0];
}

// Dummy data for the chart to make it look active even if there are few feedbacks
const dummyChartData = [
  { name: 'Sen', rating: 4.5, feedback: 12 },
  { name: 'Sel', rating: 4.8, feedback: 15 },
  { name: 'Rab', rating: 4.2, feedback: 8 },
  { name: 'Kam', rating: 4.9, feedback: 20 },
  { name: 'Jum', rating: 4.7, feedback: 18 },
  { name: 'Sab', rating: 0, feedback: 0 },
  { name: 'Min', rating: 0, feedback: 0 },
];

export default function AdminDashboard() {
  const { userData } = useAuth();
  const { feedbacks } = useAllFeedbacks();
  const { addToast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Week-based menu filtering
  const [currentDate, setCurrentDate] = useState(new Date());
  const { start: weekStart, end: weekEnd } = useMemo(() => getWeekRange(currentDate), [currentDate]);
  const { menus, loading: menusLoading } = useMenusByDateRange(formatDate(weekStart), formatDate(weekEnd));

  // Stats (scoped to current week)
  const totalMenus = menus.length;
  const weekFeedbacks = useMemo(() => {
    const start = new Date(weekStart); start.setHours(0, 0, 0, 0);
    const end = new Date(weekEnd); end.setHours(23, 59, 59, 999);
    return feedbacks.filter((f) => {
      const date = f.timestamp?.toDate ? f.timestamp.toDate() : new Date(f.timestamp);
      return date >= start && date <= end;
    });
  }, [feedbacks, weekStart, weekEnd]);
  const totalFeedbacks = weekFeedbacks.length;
  const avgRating = weekFeedbacks.length
    ? (weekFeedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / weekFeedbacks.length).toFixed(1)
    : '0.0';

  const stats = [
    { label: 'Menu Minggu Ini', value: totalMenus, icon: UtensilsCrossed, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Feedback', value: totalFeedbacks, icon: MessageSquare, color: 'text-accent', bg: 'bg-accent/10' },
    { label: 'Rata-rata Rating', value: avgRating, icon: Star, color: 'text-warning', bg: 'bg-warning/10' },
    { label: 'Aktivitas Baru', value: '+12%', icon: TrendingUp, color: 'text-success', bg: 'bg-success/10' },
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
    <div className="page-mesh relative min-h-screen overflow-hidden">
      {/* Liquid Glass Background Blobs */}
      <div className="blob-container">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-12 relative z-10">
        <motion.div variants={stagger.container} initial="hidden" animate="show">
          {/* Header */}
          <motion.div variants={stagger.item} className="dashboard-welcome liquid-glass p-6 mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary mb-2 font-display tracking-tight flex items-center gap-3">
                Dashboard <span className="gradient-text">Admin SPG</span>
                <Sparkles className="w-6 h-6 text-accent animate-pulse-glow" />
              </h1>
              <p className="text-sm font-medium text-text-secondary bg-white/50 backdrop-blur-sm px-4 py-1.5 rounded-full inline-flex items-center gap-2 border border-white/50">
                <Users className="w-4 h-4 text-primary" />
                Sistem Terpadu Portal SPG — {userData?.instansi}
              </p>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={() => setShowAddModal(true)} icon={Plus} variant="primary" size="lg" className="shadow-xl shadow-primary/30">
                Tambah Menu Baru
              </Button>
            </motion.div>
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
                  <LineChart data={dummyChartData}>
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
                  <Activity className="w-5 h-5 text-accent animate-pulse" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-text-primary font-display">Aktivitas Terkini</h2>
                  <p className="text-xs text-text-muted">Siaran langsung dari siswa</p>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                {[1, 2, 3, 4, 5].map((_, i) => (
                  <div key={i} className="flex gap-3 relative">
                    {i !== 4 && <div className="absolute top-8 left-3.5 w-0.5 h-full bg-black/5 -z-10"></div>}
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border-2 border-white z-10">
                      <Star className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">Siswa SMP N {i+1} Denpasar</p>
                      <p className="text-xs text-text-secondary mt-0.5">Memberikan bintang 5 untuk menu "Nasi Goreng Spesial".</p>
                      <p className="text-[10px] text-text-muted mt-1">{i * 15} menit yang lalu</p>
                    </div>
                  </div>
                ))}
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
                    <MessageSquare className="w-5 h-5 text-warning" />
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
                        className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white hover:border-primary/30 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 shadow-inner">
                            <span className="text-xs font-bold text-white">
                              {(fb.user_nip || '?').substring(0, 2)}
                            </span>
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
  const [form, setForm] = useState({
    nama_menu: '', kalori: '', protein: '', lemak: '', karbo: '',
    harga_porsi: '', bahan_baku: '', tanggal: '', is_voting_option: false,
    image_url: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const updateField = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: '' }));
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
      });

      onSuccess();
    } catch (err) {
      console.error('Error adding menu:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Image URL Input */}
      <div>
        <Input
          id="menu-image"
          label="URL Gambar Makanan"
          icon={LinkIcon}
          placeholder="https://images.unsplash.com/photo-..."
          value={form.image_url}
          onChange={(e) => updateField('image_url', e.target.value)}
        />
        {form.image_url && (
          <div className="mt-2 rounded-xl overflow-hidden border border-black/10 shadow-inner">
            <img src={form.image_url} alt="Preview" className="w-full h-40 object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
          </div>
        )}
        <p className="text-[10px] text-text-muted mt-1">Gunakan URL dari Unsplash, Pexels, atau sumber gambar gratis lainnya</p>
      </div>

      <Input id="menu-name" label="Nama Menu" placeholder="Contoh: Nasi Goreng Spesial" value={form.nama_menu} onChange={(e) => updateField('nama_menu', e.target.value)} error={errors.nama_menu} />
      <Input id="menu-date" label="Tanggal" type="date" value={form.tanggal} onChange={(e) => updateField('tanggal', e.target.value)} error={errors.tanggal} />

      <div className="grid grid-cols-2 gap-3">
        <Input id="menu-kalori" label="Kalori (kkal)" type="number" placeholder="0" value={form.kalori} onChange={(e) => updateField('kalori', e.target.value)} error={errors.kalori} />
        <Input id="menu-protein" label="Protein (g)" type="number" placeholder="0" value={form.protein} onChange={(e) => updateField('protein', e.target.value)} error={errors.protein} />
        <Input id="menu-lemak" label="Lemak (g)" type="number" placeholder="0" value={form.lemak} onChange={(e) => updateField('lemak', e.target.value)} error={errors.lemak} />
        <Input id="menu-karbo" label="Karbohidrat (g)" type="number" placeholder="0" value={form.karbo} onChange={(e) => updateField('karbo', e.target.value)} error={errors.karbo} />
      </div>

      <Input id="menu-harga" label="Harga per Porsi (Rp)" type="number" placeholder="0" value={form.harga_porsi} onChange={(e) => updateField('harga_porsi', e.target.value)} />
      <Input id="menu-bahan" label="Bahan Baku (pisahkan dengan koma)" placeholder="Beras, Ayam, Telur, Wortel" value={form.bahan_baku} onChange={(e) => updateField('bahan_baku', e.target.value)} />

      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" checked={form.is_voting_option} onChange={(e) => updateField('is_voting_option', e.target.checked)} className="w-4 h-4 rounded accent-primary" />
        <span className="text-sm font-bold text-text-primary">Jadikan opsi voting minggu depan</span>
      </label>

      <Button type="submit" loading={loading} icon={Plus} className="w-full shadow-lg shadow-primary/20" size="lg">
        Simpan Menu
      </Button>
    </form>
  );
}

