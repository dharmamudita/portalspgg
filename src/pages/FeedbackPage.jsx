import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Star, Filter, Calendar, Building2, Search, TrendingUp } from 'lucide-react';
import { useAllFeedbacks, useAllMenus } from '../hooks/useFirestore';
import Navbar from '../components/layout/Navbar';
import Card from '../components/ui/Card';
import StarRating from '../components/ui/StarRating';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function FeedbackPage() {
  const { feedbacks, loading } = useAllFeedbacks();
  const { menus } = useAllMenus();
  const [filterRange, setFilterRange] = useState('all');
  const [filterRating, setFilterRating] = useState(0); // 0 = all
  const [searchQuery, setSearchQuery] = useState('');

  // Build menu name map
  const menuMap = useMemo(() => {
    const map = {};
    menus.forEach((m) => { map[m.id] = m.nama_menu; });
    return map;
  }, [menus]);

  // Filter feedbacks
  const filteredFeedbacks = useMemo(() => {
    let filtered = [...feedbacks];

    // Date filter
    if (filterRange !== 'all') {
      const now = new Date();
      let startDate;
      switch (filterRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now); startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate = new Date(now); startDate.setMonth(now.getMonth() - 1);
          break;
        case '3months':
          startDate = new Date(now); startDate.setMonth(now.getMonth() - 3);
          break;
      }
      if (startDate) {
        filtered = filtered.filter((f) => {
          const date = f.timestamp?.toDate ? f.timestamp.toDate() : new Date(f.timestamp);
          return date >= startDate;
        });
      }
    }

    // Rating filter
    if (filterRating > 0) {
      filtered = filtered.filter((f) => f.rating === filterRating);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((f) =>
        f.komentar?.toLowerCase().includes(q) ||
        f.user_instansi?.toLowerCase().includes(q) ||
        menuMap[f.menu_id]?.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [feedbacks, filterRange, filterRating, searchQuery, menuMap]);

  // Stats
  const avgRating = filteredFeedbacks.length > 0
    ? (filteredFeedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / filteredFeedbacks.length).toFixed(1)
    : '0.0';

  const ratingDist = [5, 4, 3, 2, 1].map((r) => ({
    star: r,
    count: filteredFeedbacks.filter((f) => f.rating === r).length,
  }));
  const maxDist = Math.max(...ratingDist.map((r) => r.count), 1);

  const timeFilters = [
    { value: 'all', label: 'Semua' },
    { value: 'today', label: 'Hari Ini' },
    { value: 'week', label: '7 Hari' },
    { value: 'month', label: '1 Bulan' },
    { value: '3months', label: '3 Bulan' },
  ];

  const stagger = {
    container: { hidden: {}, show: { transition: { staggerChildren: 0.06 } } },
    item: { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } },
  };

  return (
    <div className="page-mesh">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-12">
        <motion.div variants={stagger.container} initial="hidden" animate="show">
          {/* Header */}
          <motion.div variants={stagger.item} className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-1">
              <span className="gradient-text">Feedback</span> Siswa 💬
            </h1>
            <p className="text-sm text-text-muted">Kelola dan pantau semua feedback yang masuk</p>
          </motion.div>

          {/* Stats + Distribution */}
          <motion.div variants={stagger.item} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card hover={false} className="text-center">
              <MessageSquare className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-3xl font-bold text-text-primary">{filteredFeedbacks.length}</p>
              <p className="text-xs text-text-muted">Total Feedback</p>
            </Card>
            <Card hover={false} className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Star className="w-6 h-6 text-warning fill-warning" />
              </div>
              <p className="text-3xl font-bold text-text-primary">{avgRating}</p>
              <p className="text-xs text-text-muted">Rata-rata Rating</p>
            </Card>
            <Card hover={false}>
              <p className="text-xs font-bold text-text-secondary mb-2">Distribusi Rating</p>
              <div className="space-y-1.5">
                {ratingDist.map((r) => (
                  <div key={r.star} className="flex items-center gap-2">
                    <span className="text-[10px] text-text-muted w-3">{r.star}★</span>
                    <div className="flex-1 h-2 bg-black/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-warning to-warning/50 transition-all duration-500"
                        style={{ width: `${(r.count / maxDist) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-text-muted w-5 text-right">{r.count}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Filters */}
          <motion.div variants={stagger.item} className="glass rounded-2xl p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="Cari komentar, instansi, atau menu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-black/5 border border-black/10 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/40 transition-colors"
                />
              </div>

              {/* Time Filter Pills */}
              <div className="flex gap-1.5 overflow-x-auto">
                {timeFilters.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setFilterRange(f.value)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                      filterRange === f.value
                        ? 'bg-primary/10 text-primary-dark border border-primary/30'
                        : 'bg-black/5 text-text-muted hover:bg-black/10'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating Filter */}
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs text-text-muted">Filter rating:</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setFilterRating(0)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer ${
                    filterRating === 0 ? 'bg-primary/10 text-primary-dark' : 'bg-black/5 text-text-muted hover:bg-black/10'
                  }`}
                >
                  Semua
                </button>
                {[5, 4, 3, 2, 1].map((r) => (
                  <button
                    key={r}
                    onClick={() => setFilterRating(r)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer ${
                      filterRating === r ? 'bg-warning/20 text-warning' : 'bg-black/5 text-text-muted hover:bg-black/10'
                    }`}
                  >
                    {r}★
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Feedback List */}
          {loading ? (
            <LoadingSpinner text="Memuat feedback..." />
          ) : filteredFeedbacks.length === 0 ? (
            <motion.div variants={stagger.item} className="glass rounded-3xl p-12 text-center">
              <MessageSquare className="w-16 h-16 text-text-muted mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-bold text-text-primary mb-2">Tidak Ada Feedback</h3>
              <p className="text-sm text-text-muted">Tidak ditemukan feedback sesuai filter yang dipilih</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {filteredFeedbacks.map((fb, idx) => {
                const date = fb.timestamp?.toDate ? fb.timestamp.toDate() : new Date(fb.timestamp);
                const nipMasked = fb.user_nip ? fb.user_nip.substring(0, 3) + '***' + fb.user_nip.slice(-2) : '***';
                return (
                  <motion.div
                    key={fb.id}
                    variants={stagger.item}
                    className="glass rounded-2xl p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-primary-light">
                          {nipMasked.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div>
                            <p className="text-sm font-semibold text-text-primary">NIP: {nipMasked}</p>
                            <div className="flex items-center gap-2 text-[10px] text-text-muted">
                              <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{fb.user_instansi}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                          <StarRating value={fb.rating} readonly size={12} />
                        </div>
                        <p className="text-xs text-accent mt-0.5 mb-2 font-medium">{menuMap[fb.menu_id] || 'Menu'}</p>
                        <p className="text-sm text-text-secondary leading-relaxed">{fb.komentar}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}


