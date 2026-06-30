import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Calendar, TrendingUp, Star, Flame, Droplets, Wheat,
  UtensilsCrossed, MessageSquare, DollarSign, ArrowUpRight, ArrowDownRight, Trophy, Building2,
  Wallet, AlertTriangle, TrendingDown, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMenusByDateRange, useFeedbacksByDateRange } from '../hooks/useFirestore';
import Navbar from '../components/layout/Navbar';
import PageHeaderBg from '../components/ui/PageHeaderBg';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';

function formatDateISO(d) { return d.toISOString().split('T')[0]; }

function getDefaultRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 30);
  return { start: formatDateISO(start), end: formatDateISO(end) };
}

export default function ReportsPage() {
  const { userData } = useAuth();
  const defaultRange = useMemo(() => getDefaultRange(), []);
  const [startDate, setStartDate] = useState(defaultRange.start);
  const [endDate, setEndDate] = useState(defaultRange.end);

  const { menus, loading: menusLoading } = useMenusByDateRange(
    startDate, 
    endDate, 
    userData?.role === 'superadmin' ? undefined : userData?.uid
  );
  const { feedbacks, loading: feedbacksLoading } = useFeedbacksByDateRange(startDate, endDate);

  const loading = menusLoading || feedbacksLoading;

  // Filter feedbacks to only those belonging to menus managed by this SPPG
  const filteredFeedbacks = useMemo(() => {
    const spgMenuIds = menus.map(m => m.id);
    return feedbacks.filter(f => spgMenuIds.includes(f.menu_id));
  }, [menus, feedbacks]);

  // ── Computed Stats ──
  const stats = useMemo(() => {
    const totalMenus = menus.length;
    const totalFeedbacks = filteredFeedbacks.length;
    const avgRating = totalFeedbacks > 0
      ? (filteredFeedbacks.reduce((s, f) => s + (f.rating || 0), 0) / totalFeedbacks).toFixed(1)
      : '0.0';

    const totalKalori = menus.reduce((s, m) => s + (m.kalori || 0), 0);
    const avgKalori = totalMenus > 0 ? Math.round(totalKalori / totalMenus) : 0;
    const totalProtein = menus.reduce((s, m) => s + (m.protein || 0), 0);
    const avgProtein = totalMenus > 0 ? Math.round(totalProtein / totalMenus) : 0;
    const totalKarbo = menus.reduce((s, m) => s + (m.karbo || 0), 0);
    const avgKarbo = totalMenus > 0 ? Math.round(totalKarbo / totalMenus) : 0;
    const totalLemak = menus.reduce((s, m) => s + (m.lemak || 0), 0);
    const avgLemak = totalMenus > 0 ? Math.round(totalLemak / totalMenus) : 0;

    // Kalkulasi Anggaran & Food Waste
    const menuPrices = {};
    menus.forEach(m => { menuPrices[m.id] = m.harga_porsi || 0; });

    let totalSpent = 0;
    let totalWasted = 0;

    filteredFeedbacks.forEach(f => {
      const price = menuPrices[f.menu_id] || 0;
      totalSpent += price;
      
      let wasteRatio = 0;
      if (f.rating === 1) wasteRatio = 1.0;
      else if (f.rating === 2) wasteRatio = 0.75;
      else if (f.rating === 3) wasteRatio = 0.50;
      else if (f.rating === 4) wasteRatio = 0.25;
      else wasteRatio = 0; // 5 stars
      
      totalWasted += price * wasteRatio;
    });

    const totalSaved = totalSpent - totalWasted;
    const efficiencyRate = totalSpent > 0 ? (totalSaved / totalSpent) * 100 : 0;

    // Rating distribution
    const ratingDist = [5, 4, 3, 2, 1].map((r) => ({
      star: r,
      count: filteredFeedbacks.filter((f) => f.rating === r).length,
    }));

    // Top-rated menu
    const menuRatings = {};
    filteredFeedbacks.forEach((f) => {
      if (!menuRatings[f.menu_id]) menuRatings[f.menu_id] = { sum: 0, count: 0 };
      menuRatings[f.menu_id].sum += f.rating || 0;
      menuRatings[f.menu_id].count += 1;
    });

    const topMenuId = Object.entries(menuRatings)
      .sort((a, b) => (b[1].sum / b[1].count) - (a[1].sum / a[1].count))[0]?.[0];
    const topMenu = menus.find((m) => m.id === topMenuId);

    // Most feedbacks menu
    const mostFbId = Object.entries(menuRatings)
      .sort((a, b) => b[1].count - a[1].count)[0]?.[0];
    const mostFbMenu = menus.find((m) => m.id === mostFbId);

    // Instansi breakdown
    const instansiMap = {};
    filteredFeedbacks.forEach((f) => {
      const inst = f.user_instansi || 'Lainnya';
      if (!instansiMap[inst]) instansiMap[inst] = 0;
      instansiMap[inst]++;
    });
    const instansiBreakdown = Object.entries(instansiMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      totalMenus, totalFeedbacks, avgRating,
      avgKalori, avgProtein, avgKarbo, avgLemak,
      totalSpent, totalWasted, totalSaved, efficiencyRate,
      ratingDist, topMenu, topMenuId, menuRatings,
      mostFbMenu, mostFbId,
      instansiBreakdown,
    };
  }, [menus, filteredFeedbacks]);

  const quickRanges = [
    { label: '7 Hari', days: 7 },
    { label: '30 Hari', days: 30 },
    { label: '90 Hari', days: 90 },
    { label: '1 Tahun', days: 365 },
  ];

  const setQuickRange = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setStartDate(formatDateISO(start));
    setEndDate(formatDateISO(end));
  };

  const stagger = {
    container: { hidden: {}, show: { transition: { staggerChildren: 0.06 } } },
    item: { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } },
  };

  const maxDist = Math.max(...stats.ratingDist.map((r) => r.count), 1);

  return (
    <div className="bg-[#f1f5f9] relative min-h-screen overflow-hidden font-sans pb-12">
      <PageHeaderBg />
      <div className="relative z-10">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-12">
          <motion.div variants={stagger.container} initial="hidden" animate="show">
            {/* Header */}
            <motion.div variants={stagger.item} className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md mb-2">
                Laporan & Statistik
              </h1>
              <p className="text-sm font-medium text-white/90">Analisis data gizi, biaya, dan feedback dalam periode tertentu</p>
            </motion.div>

          {/* Date Range Picker */}
          <motion.div variants={stagger.item} className="glass rounded-2xl p-4 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-text-muted" />
                <span className="text-xs text-text-secondary font-medium">Periode:</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-black/5 border border-black/10 text-sm text-text-primary focus:outline-none focus:border-primary/40"
                />
                <span className="text-text-muted text-xs">s/d</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-black/5 border border-black/10 text-sm text-text-primary focus:outline-none focus:border-primary/40"
                />
              </div>
              <div className="flex gap-1.5">
                {quickRanges.map((r) => (
                  <button
                    key={r.days}
                    onClick={() => setQuickRange(r.days)}
                    className="px-3 py-2 rounded-xl bg-black/5 text-xs text-text-muted hover:bg-black/10 transition-colors cursor-pointer"
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {loading ? (
            <LoadingSpinner text="Menghitung laporan..." />
          ) : (
            <>
              {/* Summary Row */}
              <motion.div variants={stagger.item} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card hover={false} className="text-center">
                  <UtensilsCrossed className="w-5 h-5 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-text-primary">{stats.totalMenus}</p>
                  <p className="text-[10px] text-text-muted">Total Menu</p>
                </Card>
                <Card hover={false} className="text-center">
                  <MessageSquare className="w-5 h-5 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-text-primary">{stats.totalFeedbacks}</p>
                  <p className="text-[10px] text-text-muted">Total Feedback</p>
                </Card>
                <Card hover={false} className="text-center">
                  <Star className="w-5 h-5 text-warning fill-warning mx-auto mb-2" />
                  <p className="text-2xl font-bold text-text-primary">{stats.avgRating}</p>
                  <p className="text-[10px] text-text-muted">Rata-rata Rating</p>
                </Card>
                <Card hover={false} className="text-center">
                  <Wallet className="w-5 h-5 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-text-primary">
                    <span className="text-sm text-text-secondary">Rp</span>{stats.totalSpent > 1000000 ? (stats.totalSpent / 1000000).toFixed(1) + 'M' : (stats.totalSpent / 1000).toFixed(0) + 'K'}
                  </p>
                  <p className="text-[10px] text-text-muted">Total Anggaran</p>
                </Card>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Nutrition Averages */}
                <motion.div variants={stagger.item}>
                  <Card>
                    <h3 className="text-base font-bold text-text-primary mb-4 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" /> Rata-rata Gizi per Porsi
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <NutriStat icon={Flame} label="Kalori" value={stats.avgKalori} unit="kkal" color="text-primary" bg="bg-primary/10" />
                      <NutriStat icon={Droplets} label="Protein" value={stats.avgProtein} unit="g" color="text-primary" bg="bg-primary/10" />
                      <NutriStat icon={Wheat} label="Karbohidrat" value={stats.avgKarbo} unit="g" color="text-primary" bg="bg-primary/10" />
                      <NutriStat icon={Droplets} label="Lemak" value={stats.avgLemak} unit="g" color="text-primary" bg="bg-primary/10" />
                    </div>
                  </Card>
                </motion.div>

                {/* Rating Distribution */}
                <motion.div variants={stagger.item}>
                  <Card>
                    <h3 className="text-base font-bold text-text-primary mb-4 flex items-center gap-2">
                      <Star className="w-4 h-4 text-warning" /> Distribusi Rating
                    </h3>
                    <div className="space-y-3">
                      {stats.ratingDist.map((r) => (
                        <div key={r.star} className="flex items-center gap-3">
                          <span className="text-sm font-bold text-text-secondary flex items-center gap-1 w-8">{r.star}<Star className="w-3 h-3 text-warning fill-warning" /></span>
                          <div className="flex-1 h-3 bg-black/5 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(r.count / maxDist) * 100}%` }}
                              transition={{ duration: 0.6 }}
                              className="h-full rounded-full bg-gradient-to-r from-warning to-warning/50"
                            />
                          </div>
                          <span className="text-xs text-text-muted w-8 text-right">{r.count}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>

                {/* Top Menu */}
                <motion.div variants={stagger.item}>
                  <Card>
                    <h2 className="text-lg font-bold text-text-primary flex items-center gap-2 mb-4">
                      <Trophy className="w-5 h-5 text-primary" /> Menu Terbaik
                    </h2>
                    {stats.topMenu ? (
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                          <img
                            src={stats.topMenu.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop'}
                            alt={stats.topMenu.nama_menu}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-text-primary">{stats.topMenu.nama_menu}</h4>
                          <p className="text-xs text-text-muted mt-1">
                            <Star className="w-3 h-3 text-warning inline mr-1 fill-current" /> {(stats.menuRatings[stats.topMenuId].sum / stats.menuRatings[stats.topMenuId].count).toFixed(1)} rata-rata
                            ({stats.menuRatings[stats.topMenuId].count} ulasan)
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-text-muted">Belum ada data</p>
                    )}
                  </Card>
                </motion.div>

                {/* Instansi Breakdown */}
                <motion.div variants={stagger.item}>
                  <Card>
                    <h2 className="text-lg font-bold text-text-primary flex items-center gap-2 mb-4">
                      <Building2 className="w-5 h-5 text-primary" /> Feedback per Instansi
                    </h2>
                    {stats.instansiBreakdown.length > 0 ? (
                      <div className="space-y-2.5">
                        {stats.instansiBreakdown.map(([name, count]) => (
                          <div key={name} className="flex items-center justify-between bg-black/5 rounded-xl p-3">
                            <span className="text-sm text-text-secondary">{name}</span>
                            <span className="text-sm font-bold text-text-primary">{count} feedback</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-text-muted">Belum ada data</p>
                    )}
                  </Card>
                </motion.div>
              </div>

              {/* Financial Impact Board */}
              <motion.div variants={stagger.item} className="mt-6">
                <div className="liquid-glass p-6 rounded-3xl relative overflow-hidden">
                  {/* Subtle Glow Background */}
                  <div className={`absolute top-0 right-0 w-64 h-64 opacity-20 blur-[80px] rounded-full mix-blend-screen pointer-events-none ${stats.efficiencyRate >= 70 ? 'bg-success' : 'bg-danger'}`} />
                  
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 rounded-2xl bg-black/5 backdrop-blur-md">
                      <TrendingUp className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold font-display text-text-primary">Dampak Finansial & Food Waste</h2>
                      <p className="text-sm text-text-muted">Analisis berbasis rating kepuasan (1 bintang = 100% terbuang)</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Efficiency Rate Card */}
                    <div className="glass p-6 relative group">
                      <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                        {stats.efficiencyRate >= 70 ? <CheckCircle2 className="w-32 h-32 text-success" /> : <AlertTriangle className="w-32 h-32 text-danger" />}
                      </div>
                      <p className="text-sm font-semibold text-text-secondary mb-2 flex items-center gap-2">
                        {stats.efficiencyRate >= 70 ? <CheckCircle2 className="w-4 h-4 text-success" /> : <AlertTriangle className="w-4 h-4 text-danger" />}
                        Tingkat Efisiensi
                      </p>
                      <p className="text-4xl font-bold font-display text-text-primary">
                        {stats.efficiencyRate.toFixed(1)}<span className="text-2xl text-text-muted">%</span>
                      </p>
                      <div className="mt-4 w-full h-2 bg-black/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${stats.efficiencyRate}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                          className={`h-full rounded-full ${stats.efficiencyRate >= 70 ? 'bg-success' : 'bg-danger'}`}
                        />
                      </div>
                    </div>

                    {/* Total Saved Card */}
                    <div className="glass p-6 relative group">
                      <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                        <Wallet className="w-32 h-32 text-success" />
                      </div>
                      <p className="text-sm font-semibold text-text-secondary mb-2 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-success" />
                        Anggaran Tepat Sasaran
                      </p>
                      <p className="text-3xl font-bold font-display text-success">
                        <span className="text-lg opacity-70">Rp</span> {stats.totalSaved.toLocaleString('id-ID')}
                      </p>
                      <p className="text-xs text-text-muted mt-2">Porsi yang dihabiskan siswa</p>
                    </div>

                    {/* Total Wasted Card */}
                    <div className="glass p-6 relative group">
                      <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                        <TrendingDown className="w-32 h-32 text-danger" />
                      </div>
                      <p className="text-sm font-semibold text-text-secondary mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-danger" />
                        Estimasi Kerugian (Waste)
                      </p>
                      <p className="text-3xl font-bold font-display text-danger">
                        <span className="text-lg opacity-70">Rp</span> {stats.totalWasted.toLocaleString('id-ID')}
                      </p>
                      <p className="text-xs text-text-muted mt-2">Akibat rating rendah (makanan sisa)</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </motion.div>
      </main>
    </div>
    </div>
  );
}

function NutriStat({ icon: Icon, label, value, unit, color, bg }) {
  return (
    <div className={`${bg} rounded-xl p-4 flex items-center gap-3`}>
      <Icon className={`w-6 h-6 ${color}`} />
      <div>
        <p className="text-lg font-bold text-text-primary">{value}<span className="text-xs font-normal text-text-muted ml-1">{unit}</span></p>
        <p className="text-[10px] text-text-muted">{label}</p>
      </div>
    </div>
  );
}

