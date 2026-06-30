import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Trophy, Vote, TrendingUp, Flame, Droplets, Wheat, ChevronLeft, ChevronRight, Calendar, Medal, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMenusByDateRange, useVoteCounts } from '../hooks/useFirestore';
import Navbar from '../components/layout/Navbar';
import PageHeaderBg from '../components/ui/PageHeaderBg';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { MonthYearPicker } from './WeeklyMenuPage';
import { getSchoolWeekRange, formatDate, MONTHS } from '../lib/dateUtils';

export default function VotingResultsPage() {
  const { userData } = useAuth();
  const [baseDate, setBaseDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Get next week's range (voting is always for next week)
  const { start: weekStart, end: weekEnd } = useMemo(() => {
    const nextWeekDate = new Date(baseDate);
    nextWeekDate.setDate(nextWeekDate.getDate() + 7);
    return getSchoolWeekRange(nextWeekDate);
  }, [baseDate]);

  // Fetch menus for that week, filter only voting options
  const { menus: allMenus, loading: menusLoading } = useMenusByDateRange(
    formatDate(weekStart), 
    formatDate(weekEnd), 
    userData?.role === 'superadmin' ? undefined : (userData?.spg_uid || userData?.uid)
  );
  const votingMenus = useMemo(() => allMenus.filter((m) => m.is_voting_option), [allMenus]);

  const menuIds = useMemo(() => votingMenus.map((m) => m.id), [votingMenus]);
  const { counts, loading: countsLoading } = useVoteCounts(menuIds);

  const totalVotes = Object.values(counts).reduce((a, b) => a + b, 0);

  // Sort by vote count descending
  const sortedMenus = useMemo(() => {
    return [...votingMenus].sort((a, b) => (counts[b.id] || 0) - (counts[a.id] || 0));
  }, [votingMenus, counts]);

  // Week navigation
  const prevWeek = () => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - 7);
    setBaseDate(d);
  };
  const nextWeek = () => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + 7);
    setBaseDate(d);
  };
  const goToThisWeek = () => setBaseDate(new Date());
  const jumpToDate = (month, year) => {
    setBaseDate(new Date(year, month, 1));
    setShowDatePicker(false);
  };

  const weekLabel = `${weekStart.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} — ${weekEnd.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`;

  const stagger = {
    container: { hidden: {}, show: { transition: { staggerChildren: 0.1 } } },
    item: { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } },
  };

  const medalBg = ['bg-warning/10', 'bg-black/5', 'bg-amber-900/10'];

  return (
    <div className="bg-[#f1f5f9] relative min-h-screen overflow-hidden font-sans pb-12">
      <PageHeaderBg />
      <div className="relative z-10">
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-12">
          <motion.div variants={stagger.container} initial="hidden" animate="show">
            {/* Header */}
            <motion.div variants={stagger.item} className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md mb-2">
                Hasil Voting
              </h1>
              <p className="text-sm font-medium text-white/90">Hasil pemilihan menu oleh siswa untuk periode berikutnya</p>
            </motion.div>

          {/* Week Filter */}
          <motion.div variants={stagger.item} className="glass rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="relative">
                <button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/5 hover:bg-black/10 text-sm font-medium text-text-secondary transition-colors cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
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
                className="px-3 py-1.5 rounded-xl bg-primary/20 text-xs font-semibold text-primary-light hover:bg-primary/30 transition-colors cursor-pointer"
              >
                Minggu Ini
              </button>
            </div>
            <div className="flex items-center justify-between">
              <button onClick={prevWeek} className="p-2 rounded-xl hover:bg-black/10 transition-colors cursor-pointer">
                <ChevronLeft className="w-5 h-5 text-text-secondary" />
              </button>
              <p className="text-xs font-bold text-text-primary">Voting untuk: {weekLabel}</p>
              <button onClick={nextWeek} className="p-2 rounded-xl hover:bg-black/10 transition-colors cursor-pointer">
                <ChevronRight className="w-5 h-5 text-text-secondary" />
              </button>
            </div>
          </motion.div>

          {/* Stats Row */}
          <motion.div variants={stagger.item} className="grid grid-cols-3 gap-4 mb-8">
            <Card hover={false} className="text-center">
              <Vote className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-text-primary">{totalVotes}</p>
              <p className="text-xs text-text-muted">Total Vote</p>
            </Card>
            <Card hover={false} className="text-center">
              <Trophy className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-text-primary">{votingMenus.length}</p>
              <p className="text-xs text-text-muted">Kandidat Menu</p>
            </Card>
            <Card hover={false} className="text-center">
              <TrendingUp className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-text-primary">
                {totalVotes > 0 && sortedMenus[0] ? Math.round(((counts[sortedMenus[0].id] || 0) / totalVotes) * 100) : 0}%
              </p>
              <p className="text-xs text-text-muted">Vote Tertinggi</p>
            </Card>
          </motion.div>

          {menusLoading || countsLoading ? (
            <LoadingSpinner text="Memuat data voting..." />
          ) : sortedMenus.length === 0 ? (
            <motion.div variants={stagger.item} className="glass rounded-3xl p-12 text-center">
              <BarChart3 className="w-16 h-16 text-text-muted mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-bold text-text-primary mb-2">Belum Ada Voting</h3>
              <p className="text-sm text-text-muted">Tidak ada menu voting untuk periode ini</p>
            </motion.div>
          ) : (
            <>
              {/* Bar Chart Visual */}
              <motion.div variants={stagger.item}>
                <Card className="mb-6">
                  <h2 className="text-lg font-bold text-text-primary mb-6">Grafik Voting</h2>
                  <div className="space-y-4">
                    {sortedMenus.map((menu, idx) => {
                      const voteCount = counts[menu.id] || 0;
                      const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
                      const menuDate = menu.tanggal?.toDate ? menu.tanggal.toDate() : new Date(menu.tanggal);
                      return (
                        <div key={menu.id}>
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2 min-w-0">
                              {idx < 3 && (
                                <span className={`flex items-center justify-center w-6 h-6 rounded-full bg-white shadow-sm ${idx === 0 ? 'text-warning' : idx === 1 ? 'text-gray-400' : 'text-amber-600'}`}>
                                  <Medal className="w-4 h-4" />
                                </span>
                              )}
                              <span className="text-sm font-semibold text-text-primary truncate">{menu.nama_menu}</span>
                              <span className="text-[10px] text-text-muted shrink-0">
                                ({menuDate.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })})
                              </span>
                            </div>
                            <span className="text-sm font-bold text-text-secondary shrink-0 ml-2">
                              {voteCount} <span className="text-[10px] font-normal text-text-muted">({percentage}%)</span>
                            </span>
                          </div>
                          <div className="h-4 bg-black/5 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 1, ease: 'easeOut', delay: idx * 0.15 }}
                              className={`h-full rounded-full ${
                                idx === 0
                                  ? 'bg-gradient-to-r from-warning to-warning/50'
                                  : idx === 1
                                    ? 'bg-gradient-to-r from-primary to-primary/50'
                                    : 'bg-gradient-to-r from-accent to-accent/50'
                              }`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </motion.div>

              {/* Ranking Detail */}
              <motion.div variants={stagger.item}>
                <Card>
                  <h2 className="text-lg font-bold text-text-primary mb-4">Detail Kandidat</h2>
                  <div className="space-y-3">
                    {sortedMenus.map((menu, idx) => {
                      const voteCount = counts[menu.id] || 0;
                      const menuDate = menu.tanggal?.toDate ? menu.tanggal.toDate() : new Date(menu.tanggal);
                      return (
                        <div
                          key={menu.id}
                          className={`flex items-center gap-4 rounded-2xl p-3 ${idx < 3 ? medalBg[idx] : 'bg-black/5'}`}
                        >
                          <div className={`text-2xl font-black w-8 flex items-center justify-center shrink-0 ${idx === 0 ? 'text-warning' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-amber-600' : 'text-text-muted'}`}>
                            {idx < 3 ? <Award className="w-6 h-6" /> : `#${idx + 1}`}
                          </div>
                          <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                            <img
                              src={menu.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop'}
                              alt={menu.nama_menu}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-text-primary truncate">{menu.nama_menu}</h4>
                            <div className="flex items-center gap-3 text-[10px] text-text-muted mt-1">
                              <span>{menuDate.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                              <span><Flame className="w-3 h-3 text-primary inline mr-0.5" />{menu.kalori} kkal</span>
                              <span><Droplets className="w-3 h-3 text-primary inline mr-0.5" />{menu.protein}g</span>
                              <span><Wheat className="w-3 h-3 text-primary inline mr-0.5" />{menu.karbo}g</span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-lg font-bold text-text-primary">{voteCount}</p>
                            <p className="text-[10px] text-text-muted">vote</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </motion.div>
            </>
          )}
        </motion.div>
      </main>
    </div>
    </div>
  );
}

