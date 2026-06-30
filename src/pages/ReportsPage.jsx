import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Calendar, TrendingUp, Star, Flame, Droplets, Wheat,
  UtensilsCrossed, MessageSquare, DollarSign, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import { useMenusByDateRange, useFeedbacksByDateRange } from '../hooks/useFirestore';
import Navbar from '../components/layout/Navbar';
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
  const defaultRange = useMemo(() => getDefaultRange(), []);
  const [startDate, setStartDate] = useState(defaultRange.start);
  const [endDate, setEndDate] = useState(defaultRange.end);

  const { menus, loading: menusLoading } = useMenusByDateRange(startDate, endDate);
  const { feedbacks, loading: feedbacksLoading } = useFeedbacksByDateRange(startDate, endDate);

  const loading = menusLoading || feedbacksLoading;

  // ── Computed Stats ──
  const stats = useMemo(() => {
    const totalMenus = menus.length;
    const totalFeedbacks = feedbacks.length;
    const avgRating = totalFeedbacks > 0
      ? (feedbacks.reduce((s, f) => s + (f.rating || 0), 0) / totalFeedbacks).toFixed(1)
      : '0.0';

    const totalKalori = menus.reduce((s, m) => s + (m.kalori || 0), 0);
    const avgKalori = totalMenus > 0 ? Math.round(totalKalori / totalMenus) : 0;
    const totalProtein = menus.reduce((s, m) => s + (m.protein || 0), 0);
    const avgProtein = totalMenus > 0 ? Math.round(totalProtein / totalMenus) : 0;
    const totalKarbo = menus.reduce((s, m) => s + (m.karbo || 0), 0);
    const avgKarbo = totalMenus > 0 ? Math.round(totalKarbo / totalMenus) : 0;
    const totalLemak = menus.reduce((s, m) => s + (m.lemak || 0), 0);
    const avgLemak = totalMenus > 0 ? Math.round(totalLemak / totalMenus) : 0;

    const totalBiaya = menus.reduce((s, m) => s + (m.harga_porsi || 0), 0);
    const avgBiaya = totalMenus > 0 ? Math.round(totalBiaya / totalMenus) : 0;

    // Rating distribution
    const ratingDist = [5, 4, 3, 2, 1].map((r) => ({
      star: r,
      count: feedbacks.filter((f) => f.rating === r).length,
    }));

    // Top-rated menu
    const menuRatings = {};
    feedbacks.forEach((f) => {
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
    feedbacks.forEach((f) => {
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
      totalBiaya, avgBiaya,
      ratingDist, topMenu, topMenuId, menuRatings,
      mostFbMenu, mostFbId,
      instansiBreakdown,
    };
  }, [menus, feedbacks]);

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
    <div className="page-mesh">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-12">
        <motion.div variants={stagger.container} initial="hidden" animate="show">
          {/* Header */}
          <motion.div variants={stagger.item} className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-1">
              <span className="gradient-text">Laporan</span> & Statistik
            </h1>
            <p className="text-sm text-text-muted">Analisis data gizi, biaya, dan feedback dalam periode tertentu</p>
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
                  <MessageSquare className="w-5 h-5 text-accent mx-auto mb-2" />
                  <p className="text-2xl font-bold text-text-primary">{stats.totalFeedbacks}</p>
                  <p className="text-[10px] text-text-muted">Total Feedback</p>
                </Card>
                <Card hover={false} className="text-center">
                  <Star className="w-5 h-5 text-warning fill-warning mx-auto mb-2" />
                  <p className="text-2xl font-bold text-text-primary">{stats.avgRating}</p>
                  <p className="text-[10px] text-text-muted">Rata-rata Rating</p>
                </Card>
                <Card hover={false} className="text-center">
                  <DollarSign className="w-5 h-5 text-success mx-auto mb-2" />
                  <p className="text-2xl font-bold text-text-primary">Rp {stats.avgBiaya.toLocaleString('id-ID')}</p>
                  <p className="text-[10px] text-text-muted">Rata-rata Biaya/Porsi</p>
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
                      <NutriStat icon={Flame} label="Kalori" value={stats.avgKalori} unit="kkal" color="text-danger" bg="bg-danger/10" />
                      <NutriStat icon={Droplets} label="Protein" value={stats.avgProtein} unit="g" color="text-accent" bg="bg-accent/10" />
                      <NutriStat icon={Wheat} label="Karbohidrat" value={stats.avgKarbo} unit="g" color="text-warning" bg="bg-warning/10" />
                      <NutriStat icon={Droplets} label="Lemak" value={stats.avgLemak} unit="g" color="text-secondary" bg="bg-secondary/10" />
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
                          <span className="text-sm font-bold text-text-secondary w-5">{r.star}★</span>
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
                    <h3 className="text-base font-bold text-text-primary mb-4 flex items-center gap-2">
                      🏆 Menu Terbaik
                    </h3>
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
                    <h3 className="text-base font-bold text-text-primary mb-4 flex items-center gap-2">
                      🏫 Feedback per Instansi
                    </h3>
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

              {/* Total Cost */}
              <motion.div variants={stagger.item} className="mt-6">
                <Card>
                  <h3 className="text-base font-bold text-text-primary mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-success" /> Ringkasan Biaya
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/5 rounded-xl p-4 text-center">
                      <p className="text-[10px] text-text-muted mb-1">Total Biaya Semua Menu</p>
                      <p className="text-xl font-bold text-success">Rp {stats.totalBiaya.toLocaleString('id-ID')}</p>
                    </div>
                    <div className="bg-black/5 rounded-xl p-4 text-center">
                      <p className="text-[10px] text-text-muted mb-1">Rata-rata per Porsi</p>
                      <p className="text-xl font-bold text-text-primary">Rp {stats.avgBiaya.toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </>
          )}
        </motion.div>
      </main>
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

