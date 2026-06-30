import { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, MessageSquare, UtensilsCrossed, Sparkles, Flame, Droplets, Wheat } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTodayMenu, useVotingMenus, useMenuFeedbacks } from '../hooks/useFirestore';
import Navbar from '../components/layout/Navbar';
import MenuCard from '../components/MenuCard';
import NutriFact from '../components/NutriFact';
import VotingSlider from '../components/VotingSlider';
import FeedbackList from '../components/FeedbackList';
import FeedbackForm from '../components/FeedbackForm';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import './Dashboard.css';

export default function StudentDashboard() {
  const { userData } = useAuth();
  const { menu: todayMenu, loading: menuLoading } = useTodayMenu();
  const { menus: votingMenus } = useVotingMenus();
  const { feedbacks, loading: feedbackLoading } = useMenuFeedbacks(todayMenu?.id);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const stagger = {
    container: { hidden: {}, show: { transition: { staggerChildren: 0.1 } } },
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
          
          {/* Premium Welcome Banner */}
          <motion.div variants={stagger.item} className="dashboard-welcome liquid-glass p-6 mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary mb-2 font-display tracking-tight flex items-center gap-3">
                {getGreeting()}, <span className="gradient-text">{userData?.nama || 'Siswa'}</span>
                <Sparkles className="w-6 h-6 text-warning animate-pulse-glow" />
              </h1>
              <div className="flex items-center gap-2 text-sm font-medium text-text-secondary bg-white/50 backdrop-blur-sm px-4 py-1.5 rounded-full inline-flex border border-white/50">
                <CalendarDays className="w-4 h-4 text-primary" />
                <span>{today}</span>
              </div>
            </div>
            
            {/* Quick Nutrition Highlights */}
            {todayMenu && (
              <div className="flex items-center gap-4 mt-4 md:mt-0">
                <div className="bg-white/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/50 shadow-sm flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-danger/10 flex items-center justify-center">
                    <Flame className="w-4 h-4 text-danger" />
                  </div>
                  <div>
                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Kalori</p>
                    <p className="text-sm font-extrabold text-text-primary font-display">{todayMenu.kalori} <span className="text-[10px] text-text-muted font-normal">kcal</span></p>
                  </div>
                </div>
                <div className="bg-white/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/50 shadow-sm flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Droplets className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Protein</p>
                    <p className="text-sm font-extrabold text-text-primary font-display">{todayMenu.protein} <span className="text-[10px] text-text-muted font-normal">g</span></p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {menuLoading ? (
            <LoadingSpinner text="Memuat menu hari ini..." />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Menu Card + Voting */}
              <div className="lg:col-span-8 space-y-8">
                <motion.div variants={stagger.item}>
                  <div className="flex items-center justify-between mb-4 px-1">
                    <h2 className="text-xl font-bold font-display text-text-primary">Menu Utama Hari Ini</h2>
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">Siap Dinikmati</span>
                  </div>
                  
                  {todayMenu ? (
                    <motion.div whileHover={{ y: -4, scale: 1.01 }} transition={{ type: 'spring', stiffness: 400 }}>
                      <MenuCard menu={todayMenu} onRate={() => setShowFeedbackModal(true)} />
                    </motion.div>
                  ) : (
                    <div className="liquid-glass flex-col justify-center text-center py-16">
                      <div className="w-20 h-20 rounded-full bg-black/5 flex items-center justify-center mx-auto mb-4 border-2 border-white/50">
                        <UtensilsCrossed className="w-10 h-10 text-text-muted opacity-50" />
                      </div>
                      <h3 className="text-lg font-bold text-text-primary mb-2 font-display">Belum Ada Menu Hari Ini</h3>
                      <p className="text-sm text-text-muted max-w-xs mx-auto">Menu bergizi akan ditampilkan di sini setelah admin sekolah memasukkan data untuk hari ini.</p>
                    </div>
                  )}
                </motion.div>

                {/* Voting Section */}
                {votingMenus.length > 0 && (
                  <motion.div variants={stagger.item}>
                    <div className="flex items-center justify-between mb-4 px-1">
                      <h2 className="text-xl font-bold font-display text-text-primary">Tentukan Menu Depan</h2>
                      <span className="text-xs font-semibold text-accent bg-accent/10 px-3 py-1 rounded-full border border-accent/20">Partisipasi Aktif</span>
                    </div>
                    <VotingSlider menus={votingMenus} />
                  </motion.div>
                )}
              </div>

              {/* Right Column: NutriFact + Progress + Feedbacks */}
              <div className="lg:col-span-4 space-y-8">
                
                {/* Asupan Kalori Panel (Liquid Glass) */}
                <motion.div variants={stagger.item}>
                  <div className="liquid-glass p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                        <Flame className="w-4 h-4 text-success" />
                      </div>
                      <h3 className="text-base font-bold text-text-primary font-display">Target Kalori Harian</h3>
                    </div>
                    
                    <div className="mb-2 flex justify-between items-end">
                      <span className="text-2xl font-extrabold text-text-primary font-display">{todayMenu?.kalori || 0} <span className="text-sm font-medium text-text-muted">/ 2200 kcal</span></span>
                      <span className="text-xs font-bold text-success">
                        {todayMenu ? Math.round((todayMenu.kalori / 2200) * 100) : 0}%
                      </span>
                    </div>
                    
                    <div className="nutrition-progress">
                      <motion.div 
                        className="nutrition-bar"
                        initial={{ width: 0 }}
                        animate={{ width: `${todayMenu ? Math.min((todayMenu.kalori / 2200) * 100, 100) : 0}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                      />
                    </div>
                    
                    <p className="text-[10px] text-text-muted mt-3">Kebutuhan kalori dapat bervariasi tergantung usia dan aktivitas fisik.</p>
                  </div>
                </motion.div>

                {todayMenu && (
                  <motion.div variants={stagger.item}>
                    <div className="liquid-glass p-1 block">
                      <NutriFact menu={todayMenu} />
                    </div>
                  </motion.div>
                )}

                {/* Feedback Section in Premium Glass Card */}
                <motion.div variants={stagger.item} className="liquid-glass flex flex-col items-stretch p-6">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-black/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-text-primary font-display">Ulasan Menu</h3>
                        <p className="text-xs text-text-muted">Apa kata teman-temanmu?</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg border border-primary/20">{feedbacks.length}</span>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    <FeedbackList feedbacks={feedbacks} loading={feedbackLoading} />
                  </div>
                </motion.div>
              </div>
            </div>
          )}
        </motion.div>
      </main>

      {/* Feedback Modal */}
      <Modal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        title="Beri Rating & Komentar"
      >
        {todayMenu && (
          <FeedbackForm
            menuId={todayMenu.id}
            onSubmitted={() => setShowFeedbackModal(false)}
          />
        )}
      </Modal>
    </div>
  );
}
