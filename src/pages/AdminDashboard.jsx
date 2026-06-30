import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Trash2, Star, MessageSquare, UtensilsCrossed,
  Upload, Image as ImageIcon, TrendingUp, Users, BarChart3, Link as LinkIcon,
  ChevronLeft, ChevronRight, Calendar,
} from 'lucide-react';
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
    { label: 'Statistik', value: 'Lihat', icon: BarChart3, color: 'text-success', bg: 'bg-success/10' },
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
    item: { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } },
  };

  return (
    <div className="page-mesh">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-12">
        <motion.div variants={stagger.container} initial="hidden" animate="show">
          {/* Header */}
          <motion.div variants={stagger.item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
                Dashboard <span className="gradient-text">Admin SPG</span>
              </h1>
              <p className="text-sm text-text-muted mt-1">Kelola menu dan pantau feedback — {userData?.instansi}</p>
            </div>
            <Button onClick={() => setShowAddModal(true)} icon={Plus} variant="primary" size="lg">
              Tambah Menu
            </Button>
          </motion.div>

          {/* Stats Grid */}
          <motion.div variants={stagger.item} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <Card key={stat.label} className="flex items-center gap-4" hover={false}>
                <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
                  <p className="text-xs text-text-muted">{stat.label}</p>
                </div>
              </Card>
            ))}
          </motion.div>

          {/* Menu List with Week Filter */}
          <motion.div variants={stagger.item}>
            <Card>
              {/* Week Filter Header */}
              <div className="flex flex-col gap-3 mb-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-text-primary">Daftar Menu</h2>
                  <Badge variant="neutral">{totalMenus} menu</Badge>
                </div>

                {/* Week Navigator */}
                <div className="glass rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="relative">
                      <button
                        onClick={() => setShowDatePicker(!showDatePicker)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/5 hover:bg-black/10 text-xs font-medium text-text-secondary transition-colors cursor-pointer"
                      >
                        <Calendar className="w-3.5 h-3.5" />
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
                      className="px-3 py-1.5 rounded-xl bg-primary/20 text-[10px] font-semibold text-primary-light hover:bg-primary/30 transition-colors cursor-pointer"
                    >
                      Minggu Ini
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <button onClick={prevWeek} className="p-1.5 rounded-lg hover:bg-black/10 transition-colors cursor-pointer">
                      <ChevronLeft className="w-4 h-4 text-text-secondary" />
                    </button>
                    <p className="text-xs font-bold text-text-primary">{weekLabel}</p>
                    <button onClick={nextWeek} className="p-1.5 rounded-lg hover:bg-black/10 transition-colors cursor-pointer">
                      <ChevronRight className="w-4 h-4 text-text-secondary" />
                    </button>
                  </div>
                </div>
              </div>

              {menusLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}
                </div>
              ) : menus.length === 0 ? (
                <div className="text-center py-12">
                  <UtensilsCrossed className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-40" />
                  <p className="text-text-muted">Belum ada menu untuk minggu ini.</p>
                  <p className="text-xs text-text-muted mt-1">Klik "Tambah Menu" untuk menambahkan.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {menus.map((menu, idx) => (
                    <MenuRow key={menu.id} menu={menu} index={idx} />
                  ))}
                </div>
              )}
            </Card>
          </motion.div>

          {/* Recent Feedbacks */}
          <motion.div variants={stagger.item} className="mt-6">
            <Card>
              <h2 className="text-lg font-bold text-text-primary mb-4">Feedback Terbaru</h2>
              {feedbacks.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-6">Belum ada feedback</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {feedbacks.slice(0, 20).map((fb) => (
                    <div key={fb.id} className="bg-black/5 rounded-xl p-3 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-primary-light">
                          {(fb.user_nip || '?').substring(0, 2)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-text-primary truncate">{fb.user_instansi || 'Instansi'}</p>
                          <StarRating value={fb.rating} readonly size={10} />
                        </div>
                        <p className="text-xs text-text-secondary mt-1 line-clamp-2">{fb.komentar}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
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
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-4 bg-black/5 rounded-2xl p-4 hover:bg-white/8 transition-colors"
    >
      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0">
        <img
          src={menu.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop'}
          alt={menu.nama_menu}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-text-primary truncate">{menu.nama_menu}</h3>
        <div className="flex items-center gap-3 text-[10px] text-text-muted mt-1">
          <span>{dateStr}</span>
          <span>{menu.kalori || 0} kkal</span>
          <span>{menu.protein || 0}g protein</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {menu.is_voting_option && <Badge variant="secondary">Voting</Badge>}
        <Button variant="danger" size="sm" onClick={handleDelete} loading={deleting} icon={Trash2}>
          Hapus
        </Button>
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
          <div className="mt-2 rounded-xl overflow-hidden border border-black/10">
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
        <span className="text-sm text-text-secondary">Jadikan opsi voting minggu depan</span>
      </label>

      <Button type="submit" loading={loading} icon={Plus} className="w-full" size="lg">
        Simpan Menu
      </Button>
    </form>
  );
}

