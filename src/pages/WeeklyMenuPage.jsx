import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, ChevronLeft, ChevronRight, Flame, Droplets, Wheat, UtensilsCrossed, Calendar } from 'lucide-react';
import { useMenusByDateRange } from '../hooks/useFirestore';
import Navbar from '../components/layout/Navbar';
import NutriFact from '../components/NutriFact';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';

const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const DAYS_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
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

export default function WeeklyMenuPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [nutriModal, setNutriModal] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { start: weekStart, end: weekEnd } = useMemo(() => getWeekRange(currentDate), [currentDate]);
  const { menus, loading } = useMenusByDateRange(formatDate(weekStart), formatDate(weekEnd));

  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      days.push(d);
    }
    return days;
  }, [weekStart]);

  const filteredMenus = useMemo(() => {
    if (selectedDay === -1) return menus;
    return menus.filter((m) => {
      const menuDate = m.tanggal?.toDate ? m.tanggal.toDate() : new Date(m.tanggal);
      return menuDate.getDay() === selectedDay;
    });
  }, [menus, selectedDay]);

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

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDay(new Date().getDay());
  };

  // Jump to specific month/year
  const jumpToDate = (month, year) => {
    const d = new Date(year, month, 1);
    setCurrentDate(d);
    setSelectedDay(-1);
    setShowDatePicker(false);
  };

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const weekLabel = `${weekStart.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} — ${weekEnd.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`;

  const stagger = {
    container: { hidden: {}, show: { transition: { staggerChildren: 0.08 } } },
    item: { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } },
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
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-12 relative z-10">
        <motion.div variants={stagger.container} initial="hidden" animate="show">
          {/* Header */}
          <motion.div variants={stagger.item} className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-1 flex items-center gap-3">
              <span className="gradient-text">Menu Mingguan</span>
              <CalendarDays className="w-8 h-8 text-primary" />
            </h1>
            <p className="text-sm text-text-muted">Lihat jadwal menu makan bergizi gratis selama satu minggu</p>
          </motion.div>

          {/* Month/Year Picker + Week Navigator */}
          <motion.div variants={stagger.item} className="liquid-glass p-6 mb-8">
            {/* Top row: Month/Year jump + Today button */}
            <div className="flex items-center justify-between mb-3">
              <div className="relative">
                <button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/5 hover:bg-black/10 text-sm font-medium text-text-secondary transition-colors cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  {MONTHS[currentMonth]} {currentYear}
                  <ChevronLeft className={`w-3 h-3 transition-transform ${showDatePicker ? 'rotate-90' : '-rotate-90'}`} />
                </button>

                {showDatePicker && (
                  <MonthYearPicker
                    currentMonth={currentMonth}
                    currentYear={currentYear}
                    onSelect={jumpToDate}
                    onClose={() => setShowDatePicker(false)}
                  />
                )}
              </div>
              <button
                onClick={goToToday}
                className="px-3 py-1.5 rounded-xl bg-primary/20 text-xs font-semibold text-primary-light hover:bg-primary/30 transition-colors cursor-pointer"
              >
                Hari Ini
              </button>
            </div>

            {/* Week arrow navigation */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevWeek} className="p-2 rounded-xl hover:bg-black/10 transition-colors cursor-pointer">
                <ChevronLeft className="w-5 h-5 text-text-secondary" />
              </button>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-text-primary">{weekLabel}</p>
                {weekEnd < new Date(new Date().setHours(0,0,0,0)) && (
                  <span className="px-2 py-0.5 rounded-full bg-warning/10 text-[10px] font-bold text-warning border border-warning/20">Sudah Lewat</span>
                )}
              </div>
              <button onClick={nextWeek} className="p-2 rounded-xl hover:bg-black/10 transition-colors cursor-pointer">
                <ChevronRight className="w-5 h-5 text-text-secondary" />
              </button>
            </div>

            {/* Day Selector */}
            <div className="grid grid-cols-8 gap-1.5">
              <button
                onClick={() => setSelectedDay(-1)}
                className={`py-2 px-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedDay === -1
                    ? 'bg-primary/10 text-primary-dark border border-primary/30'
                    : 'bg-black/5 text-text-muted hover:bg-black/10'
                }`}
              >
                Semua
              </button>
              {weekDays.map((day, i) => {
                const dayNum = day.getDay();
                const isToday = formatDate(day) === formatDate(new Date());
                const hasMenu = menus.some((m) => {
                  const md = m.tanggal?.toDate ? m.tanggal.toDate() : new Date(m.tanggal);
                  return formatDate(md) === formatDate(day);
                });
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDay(dayNum)}
                    className={`py-2 px-1 rounded-xl text-xs font-semibold transition-all cursor-pointer relative ${
                      selectedDay === dayNum
                        ? 'bg-primary/10 text-primary-dark border border-primary/30'
                        : isToday
                          ? 'bg-accent/10 text-accent-light border border-accent/20'
                          : 'bg-black/5 text-text-muted hover:bg-black/10'
                    }`}
                  >
                    <span className="block">{DAYS_SHORT[dayNum]}</span>
                    <span className="block text-[10px] opacity-60">{day.getDate()}</span>
                    {hasMenu && (
                      <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-success" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Menu Cards Grid */}
          {loading ? (
            <LoadingSpinner text="Memuat menu mingguan..." />
          ) : filteredMenus.length === 0 ? (
            <motion.div variants={stagger.item} className="liquid-glass p-12 text-center border-dashed">
              <UtensilsCrossed className="w-16 h-16 text-text-muted mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-bold text-text-primary mb-2">Belum Ada Menu</h3>
              <p className="text-sm text-text-muted">
                {selectedDay === -1
                  ? 'Tidak ada menu untuk minggu ini'
                  : `Tidak ada menu untuk hari ${DAYS[selectedDay]}`}
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMenus.map((menu) => {
                const menuDate = menu.tanggal?.toDate ? menu.tanggal.toDate() : new Date(menu.tanggal);
                return (
                  <motion.div
                    key={menu.id}
                    variants={stagger.item}
                    className="liquid-glass overflow-hidden flex flex-col"
                  >
                    <div className="relative h-48 overflow-hidden group">
                      <img
                        src={menu.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop'}
                        alt={menu.nama_menu}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm text-[10px] font-bold text-white">
                          {DAYS[menuDate.getDay()]}, {menuDate.getDate()}/{menuDate.getMonth() + 1}
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-4 right-4">
                        <h3 className="text-lg font-bold text-white leading-tight">{menu.nama_menu}</h3>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-4 gap-2 mb-3">
                        <NutriPill icon={Flame} label="Kalori" value={menu.kalori} unit="kkal" color="text-danger" />
                        <NutriPill icon={Droplets} label="Protein" value={menu.protein} unit="g" color="text-accent" />
                        <NutriPill icon={Wheat} label="Karbo" value={menu.karbo} unit="g" color="text-warning" />
                        <NutriPill icon={Droplets} label="Lemak" value={menu.lemak} unit="g" color="text-secondary" />
                      </div>
                      <button
                        onClick={() => setNutriModal(menu)}
                        className="w-full py-2 rounded-xl bg-black/5 text-xs font-medium text-text-secondary hover:bg-black/10 transition-colors cursor-pointer"
                      >
                        Lihat Detail Gizi
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </main>

      <Modal isOpen={!!nutriModal} onClose={() => setNutriModal(null)} title="Informasi Gizi">
        {nutriModal && <NutriFact menu={nutriModal} />}
      </Modal>
    </div>
  );
}

/* ── Reusable MonthYearPicker ── */
export function MonthYearPicker({ currentMonth, currentYear, onSelect, onClose }) {
  const [viewYear, setViewYear] = useState(currentYear);
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();

  return (
    <motion.div
      initial={{ opacity: 0, y: -5, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="absolute left-0 top-full mt-2 w-64 bg-surface border border-black/10 rounded-2xl shadow-2xl p-4 z-30"
    >
      {/* Year nav */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setViewYear(viewYear - 1)} className="p-1 rounded-lg hover:bg-black/10 cursor-pointer">
          <ChevronLeft className="w-4 h-4 text-text-secondary" />
        </button>
        <span className="text-sm font-bold text-text-primary">{viewYear}</span>
        <button onClick={() => setViewYear(viewYear + 1)} className="p-1 rounded-lg hover:bg-black/10 cursor-pointer">
          <ChevronRight className="w-4 h-4 text-text-secondary" />
        </button>
      </div>
      {/* Month grid */}
      <div className="grid grid-cols-3 gap-1.5">
        {MONTHS.map((name, idx) => {
          const isCurrent = idx === currentMonth && viewYear === currentYear;
          const isThisMonth = idx === thisMonth && viewYear === thisYear;
          return (
            <button
              key={idx}
              onClick={() => onSelect(idx, viewYear)}
              className={`py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                isCurrent
                  ? 'bg-primary/10 text-primary-dark border border-primary/30'
                  : isThisMonth
                    ? 'bg-accent/10 text-accent-light'
                    : 'text-text-muted hover:bg-black/10'
              }`}
            >
              {name.substring(0, 3)}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

function NutriPill({ icon: Icon, label, value, unit, color }) {
  return (
    <div className="text-center bg-black/5 rounded-xl py-2">
      <Icon className={`w-3.5 h-3.5 mx-auto mb-1 ${color}`} />
      <p className="text-xs font-bold text-text-primary">{value || 0}<span className="text-[9px] font-normal text-text-muted ml-0.5">{unit}</span></p>
      <p className="text-[9px] text-text-muted">{label}</p>
    </div>
  );
}


