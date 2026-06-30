import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { History, Calendar, Star, MessageCircle, Filter, ChevronDown, Award, Medal, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useUserFeedbackHistory, useMenuDetails } from '../hooks/useFirestore';
import Navbar from '../components/layout/Navbar';
import PageHeaderBg from '../components/ui/PageHeaderBg';
import StarRating from '../components/ui/StarRating';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { MonthYearPicker } from './WeeklyMenuPage';

export default function HistoryPage() {
  const { currentUser, userData } = useAuth();
  const { feedbacks, loading } = useUserFeedbackHistory(currentUser?.uid);
  const feedbackMenuIds = useMemo(() => feedbacks.map((f) => f.menu_id), [feedbacks]);
  const menuDetails = useMenuDetails(feedbackMenuIds);
  const [filterRange, setFilterRange] = useState('all');
  const [showFilter, setShowFilter] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [customMonth, setCustomMonth] = useState(null); // { month, year }

  // Filter feedbacks by date range
  const filteredFeedbacks = useMemo(() => {
    // Custom month filter
    if (filterRange === 'custom' && customMonth) {
      const start = new Date(customMonth.year, customMonth.month, 1);
      const end = new Date(customMonth.year, customMonth.month + 1, 0, 23, 59, 59);
      return feedbacks.filter((f) => {
        const date = f.timestamp?.toDate ? f.timestamp.toDate() : new Date(f.timestamp);
        return date >= start && date <= end;
      });
    }

    if (filterRange === 'all') return feedbacks;

    const now = new Date();
    let startDate;

    switch (filterRange) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '3months':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 3);
        break;
      default:
        return feedbacks;
    }

    return feedbacks.filter((f) => {
      const date = f.timestamp?.toDate ? f.timestamp.toDate() : new Date(f.timestamp);
      return date >= startDate;
    });
  }, [feedbacks, filterRange]);

  // Stats
  const avgRating = filteredFeedbacks.length > 0
    ? (filteredFeedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / filteredFeedbacks.length).toFixed(1)
    : '0';
  const totalFeedbacks = filteredFeedbacks.length;
  const ratingDist = [1, 2, 3, 4, 5].map((r) =>
    filteredFeedbacks.filter((f) => f.rating === r).length
  );

  // Gamification Badge (Based on total historical feedbacks, not filtered)
  const overallFeedbacks = feedbacks.length;
  let badge = { title: 'Taster Pemula', icon: Star, color: 'text-text-muted', bg: 'bg-black/5' };
  if (overallFeedbacks >= 16) {
    badge = { title: 'Zero-Waste Hero', icon: Trophy, color: 'text-warning', bg: 'bg-warning/10', glow: 'shadow-[0_0_15px_rgba(234,179,8,0.3)]' };
  } else if (overallFeedbacks >= 6) {
    badge = { title: 'Silver Critic', icon: Medal, color: 'text-secondary', bg: 'bg-secondary/10', glow: 'shadow-[0_0_15px_rgba(168,162,158,0.3)]' };
  } else if (overallFeedbacks >= 1) {
    badge = { title: 'Bronze Taster', icon: Award, color: 'text-accent', bg: 'bg-accent/10', glow: 'shadow-[0_0_15px_rgba(249,115,22,0.3)]' };
  }

  const filterOptions = [
    { value: 'all', label: 'Semua Waktu' },
    { value: 'today', label: 'Hari Ini' },
    { value: 'week', label: '7 Hari Terakhir' },
    { value: 'month', label: '1 Bulan Terakhir' },
    { value: '3months', label: '3 Bulan Terakhir' },
    { value: 'custom', label: customMonth ? `${['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][customMonth.month]} ${customMonth.year}` : 'Pilih Bulan...' },
  ];

  const stagger = {
    container: { hidden: {}, show: { transition: { staggerChildren: 0.06 } } },
    item: { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } },
  };

  return (
    <div className="bg-[#f1f5f9] relative min-h-screen overflow-hidden font-sans pb-12">
      <PageHeaderBg />
      <div className="relative z-10">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-12">
          <motion.div variants={stagger.container} initial="hidden" animate="show">
            {/* Header */}
            <motion.div variants={stagger.item} className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md mb-2 flex items-center gap-3">
                <span className="text-accent-light">Riwayat</span> Feedback
                <History className="w-8 h-8 text-white" />
              </h1>
              <p className="text-sm font-medium text-white/90">Lihat kembali ulasan dan penilaian yang telah Anda berikan</p>
            </motion.div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            {/* Filters Row */}
            <div className="flex items-center gap-2">
              {/* Quick Filter Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowFilter(!showFilter)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass text-sm font-medium text-text-secondary hover:bg-black/10 transition-colors cursor-pointer"
                >
                  <Filter className="w-4 h-4" />
                  {filterOptions.find((o) => o.value === filterRange)?.label}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFilter ? 'rotate-180' : ''}`} />
                </button>
                {showFilter && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-48 bg-surface border border-black/10 rounded-2xl shadow-2xl p-1.5 z-20"
                  >
                    {filterOptions.filter(o => o.value !== 'custom').map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setFilterRange(opt.value); setShowFilter(false); }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors cursor-pointer ${
                          filterRange === opt.value
                            ? 'bg-primary/10 text-primary-dark'
                            : 'text-text-secondary hover:bg-black/5'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Month/Year Picker */}
              <div className="relative">
                <button
                  onClick={() => setShowMonthPicker(!showMonthPicker)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass text-sm font-medium text-text-secondary hover:bg-black/10 transition-colors cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  {customMonth ? `${['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][customMonth.month]} ${customMonth.year}` : 'Bulan'}
                </button>
                {showMonthPicker && (
                  <MonthYearPicker
                    currentMonth={customMonth?.month ?? new Date().getMonth()}
                    currentYear={customMonth?.year ?? new Date().getFullYear()}
                    onSelect={(month, year) => {
                      setCustomMonth({ month, year });
                      setFilterRange('custom');
                      setShowMonthPicker(false);
                    }}
                    onClose={() => setShowMonthPicker(false)}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Stats & Badge Cards */}
          <motion.div variants={stagger.item} className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <div className={`liquid-glass rounded-2xl p-4 text-center border ${badge.glow ? badge.glow : ''}`}>
              <div className="flex justify-center mb-1">
                <div className={`p-2 rounded-xl ${badge.bg}`}>
                  <badge.icon className={`w-6 h-6 ${badge.color}`} />
                </div>
              </div>
              <p className={`text-sm font-bold ${badge.color}`}>{badge.title}</p>
              <p className="text-[10px] text-text-muted mt-1">{overallFeedbacks} Total Kontribusi</p>
            </div>
            <div className="liquid-glass rounded-2xl p-4 text-center flex flex-col justify-center">
              <div className="flex items-center justify-center gap-1">
                <Star className="w-4 h-4 text-warning fill-warning" />
                <p className="text-2xl font-bold text-text-primary">{avgRating}</p>
              </div>
              <p className="text-[10px] text-text-muted mt-1">Rata-rata Rating</p>
            </div>
            <div className="liquid-glass rounded-2xl p-4 text-center">
              {/* Mini rating distribution */}
              <div className="flex items-end justify-center gap-0.5 h-8 mb-1">
                {ratingDist.map((count, i) => (
                  <div
                    key={i}
                    className="w-3 rounded-sm bg-gradient-to-t from-primary to-accent"
                    style={{ height: `${Math.max(count / Math.max(...ratingDist, 1) * 100, 8)}%` }}
                  />
                ))}
              </div>
              <p className="text-[10px] text-text-muted">Distribusi</p>
            </div>
          </motion.div>

          {/* Feedback List */}
          {loading ? (
            <LoadingSpinner text="Memuat riwayat..." />
          ) : filteredFeedbacks.length === 0 ? (
            <motion.div variants={stagger.item} className="glass rounded-3xl p-12 text-center">
              <History className="w-16 h-16 text-text-muted mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-bold text-text-primary mb-2">Belum Ada Riwayat</h3>
              <p className="text-sm text-text-muted">Kamu belum memberikan feedback untuk rentang waktu ini</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {filteredFeedbacks.map((fb, idx) => {
                const date = fb.timestamp?.toDate ? fb.timestamp.toDate() : new Date(fb.timestamp);
                const menuData = menuDetails[fb.menu_id];
                const menuName = menuData?.nama_menu || 'Memuat menu...';
                const menuImg = menuData?.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop';
                
                // Color code sentiment
                let sentimentClass = 'border-black/5';
                if (fb.rating >= 4) sentimentClass = 'border-l-4 border-l-primary bg-primary/5';
                if (fb.rating <= 2) sentimentClass = 'border-l-4 border-l-danger bg-danger/5';
                
                return (
                  <motion.div
                    key={fb.id}
                    variants={stagger.item}
                    className={`liquid-glass rounded-2xl p-4 transition-all duration-300 hover:shadow-lg flex flex-col sm:flex-row gap-4 ${sentimentClass}`}
                  >
                    {/* Menu Thumbnail */}
                    <div className="w-full sm:w-24 h-32 sm:h-24 rounded-xl overflow-hidden shrink-0">
                      <img src={menuImg} alt={menuName} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0 pr-4">
                            <h4 className="text-base font-bold text-text-primary truncate">{menuName}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Calendar className="w-3.5 h-3.5 text-text-muted" />
                              <span className="text-xs text-text-muted">
                                {date.toLocaleDateString('id-ID', {
                                  weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
                                })}
                              </span>
                            </div>
                          </div>
                          <StarRating value={fb.rating} readonly size={14} />
                        </div>
                        <div className="flex items-start gap-2 mt-3 bg-white/50 p-3 rounded-xl">
                          <MessageCircle className="w-4 h-4 text-text-muted shrink-0 mt-0.5" />
                          <p className="text-sm text-text-secondary leading-relaxed italic">"{fb.komentar}"</p>
                        </div>
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
    </div>
  );
}


