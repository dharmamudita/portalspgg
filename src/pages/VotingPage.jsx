import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Vote, CheckCircle2, Trophy, Flame, Droplets, Wheat, ChevronRight, ChevronLeft, Calendar, Lock, TriangleAlert, Radio } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMenusByDateRange, useVoteCounts, useUserVotedMap, submitVote } from '../hooks/useFirestore';
import { getSchoolWeekRange, formatDate } from '../lib/dateUtils';
import Navbar from '../components/layout/Navbar';
import PageHeaderBg from '../components/ui/PageHeaderBg';
import { useToast } from '../components/ui/Toast';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { MonthYearPicker } from './WeeklyMenuPage';
import { DAYS, DAYS_SHORT, MONTHS } from '../lib/dateUtils';

export default function VotingPage() {
  const { currentUser, userData } = useAuth();
  const { addToast } = useToast();

  const [baseDate, setBaseDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(-1); // -1 = all
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { start: weekStart, end: weekEnd } = useMemo(() => {
    // We want NEXT week for voting
    const nextWeekDate = new Date(baseDate);
    nextWeekDate.setDate(nextWeekDate.getDate() + 7);
    return getSchoolWeekRange(nextWeekDate);
  }, [baseDate]);

  // Fetch voting menus for that week
  const { menus: allMenus, loading: menusLoading } = useMenusByDateRange(formatDate(weekStart), formatDate(weekEnd), userData?.spg_uid);
  const votingMenus = useMemo(() => allMenus.filter((m) => m.is_voting_option), [allMenus]);

  const menuIds = useMemo(() => votingMenus.map((m) => m.id), [votingMenus]);
  const { counts, loading: countsLoading } = useVoteCounts(menuIds);

  const votedMap = useUserVotedMap(menuIds, currentUser?.uid);
  const [votingId, setVotingId] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);

  // Mock allergies if user has none for the sake of demo
  const userAllergies = currentUser?.alergi || ['Kacang Tanah', 'Seafood'];

  // Filter by selected day
  const filteredMenus = useMemo(() => {
    if (selectedDay === -1) return votingMenus;
    return votingMenus.filter((m) => {
      const d = m.tanggal?.toDate ? m.tanggal.toDate() : new Date(m.tanggal);
      return d.getDay() === selectedDay;
    });
  }, [votingMenus, selectedDay]);

  const weekDays = useMemo(() => {
    const days = [];
    // 5 days: Monday to Friday
    for (let i = 0; i < 5; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      days.push(d);
    }
    return days;
  }, [weekStart]);

  const totalVotes = Object.values(counts).reduce((a, b) => a + b, 0);
  const maxVotes = Math.max(...Object.values(counts), 1);

  // Check if voting period has passed
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isClosed = weekEnd < today;

  const handleVote = async (menuId) => {
    if (votedMap[menuId] || votingId || isClosed) return;
    setVotingId(menuId);
    try {
      await submitVote(menuId, currentUser.uid);
      addToast('Vote berhasil dikirim!', 'success');
    } catch {
      addToast('Gagal mengirim vote', 'error');
    } finally {
      setVotingId(null);
    }
  };

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

  const jumpToDate = (month, year) => {
    setBaseDate(new Date(year, month, 1));
    setSelectedDay(-1);
    setShowDatePicker(false);
  };

  const weekLabel = `${weekStart.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} — ${weekEnd.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`;

  const stagger = {
    container: { hidden: {}, show: { transition: { staggerChildren: 0.1 } } },
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
            <motion.div variants={stagger.item} className="mb-8 text-center relative">
              <div className="flex justify-center mb-4">
                {isClosed ? (
                  <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-danger/20 border border-danger/30 backdrop-blur-md">
                    <Lock className="w-4 h-4 text-white" />
                    <span className="text-xs font-bold text-white">Pemungutan Suara Ditutup</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-success/20 border border-success/30 backdrop-blur-md">
                    <Radio className="w-4 h-4 text-white animate-pulse" />
                    <span className="text-xs font-bold text-white">Live Polling Aktif</span>
                  </div>
                )}
              </div>
              
              <div className="w-16 h-16 mx-auto rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center mb-4 shadow-xl">
                <Vote className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md mb-3">
                <span className="text-accent-light">Voting Menu</span> Favorit
              </h1>
              
              {/* Impact Banner */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 max-w-xl mx-auto mb-4">
                <p className="text-sm font-medium text-white/90 leading-relaxed">
                  <strong className="text-white font-bold">Suara Anda menentukan kebijakan!</strong> Menu yang menang akan diprioritaskan untuk dihidangkan bulan depan dan direkomendasikan kepada Pemerintah Daerah.
                </p>
              </div>

              {totalVotes > 0 && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/5 border border-black/10">
                <Trophy className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-text-secondary">{totalVotes} total suara masuk</span>
              </div>
            )}
          </motion.div>

          {/* Week + Day Filter */}
          <motion.div variants={stagger.item} className="glass rounded-2xl p-4 mb-6">
            {/* Month/Year jump */}
            <div className="flex items-center justify-between mb-3">
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
                onClick={() => { setBaseDate(new Date()); setSelectedDay(-1); }}
                className="px-3 py-1.5 rounded-xl bg-primary/20 text-xs font-semibold text-primary-light hover:bg-primary/30 transition-colors cursor-pointer"
              >
                Minggu Ini
              </button>
            </div>

            {/* Week navigation */}
            <div className="flex items-center justify-between mb-3">
              <button onClick={prevWeek} className="p-2 rounded-xl hover:bg-black/10 transition-colors cursor-pointer">
                <ChevronLeft className="w-5 h-5 text-text-secondary" />
              </button>
              <p className="text-xs font-bold text-text-primary">Voting untuk: {weekLabel}</p>
              <button onClick={nextWeek} className="p-2 rounded-xl hover:bg-black/10 transition-colors cursor-pointer">
                <ChevronRight className="w-5 h-5 text-text-secondary" />
              </button>
            </div>

            {/* Day filter pills */}
            <div className="flex gap-2 overflow-x-auto sm:justify-center pb-2 px-1 custom-scrollbar w-full">
              <button
                onClick={() => setSelectedDay(-1)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedDay === -1 ? 'bg-primary/10 text-primary-dark border border-primary/30' : 'bg-black/5 text-text-muted hover:bg-black/10'
                }`}
              >
                Semua Hari
              </button>
              {weekDays.map((day, i) => {
                const dayNum = day.getDay();
                const hasMenu = votingMenus.some((m) => {
                  const md = m.tanggal?.toDate ? m.tanggal.toDate() : new Date(m.tanggal);
                  return md.getDay() === dayNum;
                });
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDay(dayNum)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer relative ${
                      selectedDay === dayNum
                        ? 'bg-primary/10 text-primary-dark border border-primary/30'
                        : 'bg-black/5 text-text-muted hover:bg-black/10'
                    }`}
                  >
                    {DAYS_SHORT[dayNum]} {day.getDate()}/{day.getMonth() + 1}
                    {hasMenu && <span className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-success" />}
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Voting Cards */}
          {menusLoading ? (
            <LoadingSpinner text="Memuat kandidat menu..." />
          ) : filteredMenus.length === 0 ? (
            <motion.div variants={stagger.item} className="glass rounded-3xl p-12 text-center">
              <Vote className="w-16 h-16 text-text-muted mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-bold text-text-primary mb-2">Belum Ada Voting</h3>
              <p className="text-sm text-text-muted">
                {selectedDay === -1
                  ? 'Tidak ada menu voting untuk periode ini'
                  : `Tidak ada menu voting untuk hari ${DAYS[selectedDay]}`}
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {filteredMenus.map((menu, idx) => {
                const menuDate = menu.tanggal?.toDate ? menu.tanggal.toDate() : new Date(menu.tanggal);
                const voteCount = counts[menu.id] || 0;
                const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
                const isVoted = votedMap[menu.id];
                const isLoading = votingId === menu.id;
                const isLeading = voteCount === maxVotes && voteCount > 0;
                
                const menuAllergens = menu.bahan_baku?.filter(b => userAllergies.includes(b)) || [];
                const hasAllergy = menuAllergens.length > 0;

                return (
                  <motion.div
                    key={menu.id}
                    variants={stagger.item}
                    className={`liquid-glass overflow-hidden transition-all duration-300 group ${isLeading ? 'border-warning/30 shadow-warning/10 shadow-xl' : ''} ${hasAllergy ? 'opacity-80' : ''}`}
                  >
                    <div className="flex flex-col sm:flex-row">
                      <div className="relative w-full sm:w-48 h-48 sm:h-auto shrink-0 overflow-hidden">
                        <img
                          src={menu.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop'}
                          alt={menu.nama_menu}
                          className={`w-full h-full object-cover transition-transform duration-1000 ${hasAllergy ? 'grayscale opacity-80' : 'group-hover:scale-110'}`}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent sm:hidden" />
                        <div className="absolute top-3 left-3 flex items-center gap-1">
                          <span className="bg-black/50 backdrop-blur-sm text-[10px] font-bold text-white px-2 py-1 rounded-lg">
                            {DAYS[menuDate.getDay()]}, {menuDate.getDate()}/{menuDate.getMonth() + 1}
                          </span>
                        </div>
                        {isLeading && (
                          <div className="absolute top-2 right-2 flex items-center gap-1 bg-warning/90 text-white px-2 py-1 rounded-lg text-[10px] font-bold">
                            <Trophy className="w-3 h-3" /> Terdepan
                          </div>
                        )}
                      </div>

                      <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between">
                        <div className="w-full">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-xl font-bold font-display text-text-primary line-clamp-2 leading-tight pr-4">{menu.nama_menu}</h3>
                              <div className="flex items-center gap-3 mt-1 text-[10px] text-text-muted">
                                <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-primary" />{menu.kalori} kkal</span>
                                <span className="flex items-center gap-1"><Droplets className="w-3 h-3 text-primary" />{menu.protein}g protein</span>
                                <span className="flex items-center gap-1"><Wheat className="w-3 h-3 text-primary" />{menu.karbo}g karbo</span>
                              </div>
                            </div>
                            <button
                              onClick={() => setSelectedDetail(selectedDetail === menu.id ? null : menu.id)}
                              className="p-1.5 rounded-lg hover:bg-black/10 transition-colors cursor-pointer"
                            >
                              <ChevronRight className={`w-4 h-4 text-text-muted transition-transform ${selectedDetail === menu.id ? 'rotate-90' : ''}`} />
                            </button>
                          </div>
                        </div>

                        {/* Allergy Warning */}
                        {hasAllergy && (
                          <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-100">
                            <TriangleAlert className="w-4 h-4 text-red-500 shrink-0" />
                            <p className="text-xs text-red-700 font-semibold">Bahaya Alergi: <span className="font-bold">{menuAllergens.join(', ')}</span></p>
                          </div>
                        )}

                        {/* Vote Bar */}
                        <div className="mb-4 mt-auto pt-4">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-text-muted">{voteCount} vote</span>
                            <span className="text-[10px] font-bold text-text-secondary">{percentage}%</span>
                          </div>
                          <div className="h-2 bg-black/5 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.8, ease: 'easeOut', delay: idx * 0.1 }}
                              className={`h-full rounded-full ${isLeading ? 'bg-gradient-to-r from-warning to-warning/60' : 'bg-gradient-to-r from-primary to-accent'}`}
                            />
                          </div>
                        </div>

                        {/* Vote Button */}
                        <motion.button
                          whileHover={!isVoted && !isClosed && !hasAllergy ? { scale: 1.02 } : {}}
                          whileTap={!isVoted && !isClosed && !hasAllergy ? { scale: 0.98 } : {}}
                          onClick={() => handleVote(menu.id)}
                          disabled={isVoted || isLoading || isClosed || hasAllergy}
                          className={`w-full py-3 rounded-xl text-sm font-bold transition-all cursor-pointer shadow-sm ${
                            hasAllergy 
                              ? 'bg-red-100 text-red-500 border border-red-200 cursor-not-allowed opacity-70'
                              : isClosed
                                ? 'bg-black/5 text-text-muted border border-black/5 cursor-not-allowed'
                                : isVoted
                                  ? 'bg-success/10 text-success border border-success/20 ring-1 ring-success/30'
                                  : isLoading
                                    ? 'bg-black/5 text-text-muted'
                                    : 'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/30 hover:shadow-primary/40'
                          }`}
                        >
                          {hasAllergy ? (
                            <span className="flex items-center justify-center gap-2"><TriangleAlert className="w-4 h-4" /> Berbahaya Untuk Anda</span>
                          ) : isClosed ? (
                            <span className="flex items-center justify-center gap-2"><Lock className="w-4 h-4" /> Voting Ditutup</span>
                          ) : isVoted ? (
                            <span className="flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4" /> Sudah Vote</span>
                          ) : isLoading ? 'Mengirim vote...' : (
                            <span className="flex items-center justify-center gap-2"><Vote className="w-4 h-4" /> Vote Menu Ini</span>
                          )}
                        </motion.button>

                        <AnimatePresence>
                          {selectedDetail === menu.id && menu.bahan_baku && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden mt-3 pt-3 border-t border-black/5"
                            >
                              <p className="text-[10px] font-bold text-text-secondary mb-1">BAHAN BAKU:</p>
                              <div className="flex flex-wrap gap-1.5">
                                {menu.bahan_baku.map((b, i) => (
                                  <span key={i} className="px-2 py-0.5 rounded-full bg-black/5 text-[10px] text-text-muted">{b}</span>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
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


