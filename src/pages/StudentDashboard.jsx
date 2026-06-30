import { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, MessageSquare, UtensilsCrossed } from 'lucide-react';
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
    item: { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } },
  };

  return (
    <div className="page-mesh">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-12">
        <motion.div variants={stagger.container} initial="hidden" animate="show">
          {/* Header */}
          <motion.div variants={stagger.item} className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-1">
              {getGreeting()}, <span className="gradient-text">{userData?.nama || 'Siswa'}</span>
            </h1>
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <CalendarDays className="w-4 h-4" />
              <span>{today}</span>
            </div>
          </motion.div>

          {menuLoading ? (
            <LoadingSpinner text="Memuat menu hari ini..." />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Menu Card + Voting */}
              <div className="lg:col-span-2 space-y-6">
                <motion.div variants={stagger.item}>
                  {todayMenu ? (
                    <MenuCard menu={todayMenu} onRate={() => setShowFeedbackModal(true)} />
                  ) : (
                    <div className="glass rounded-3xl p-12 text-center">
                      <UtensilsCrossed className="w-16 h-16 mx-auto mb-4 text-text-muted opacity-50" />
                      <h3 className="text-lg font-bold text-text-primary mb-2">Belum Ada Menu Hari Ini</h3>
                      <p className="text-sm text-text-muted">Menu akan ditampilkan setelah admin menginput data</p>
                    </div>
                  )}
                </motion.div>

                {/* Voting */}
                {votingMenus.length > 0 && (
                  <motion.div variants={stagger.item}>
                    <VotingSlider menus={votingMenus} />
                  </motion.div>
                )}
              </div>

              {/* Right Column: NutriFact + Feedbacks */}
              <div className="space-y-6">
                {todayMenu && (
                  <motion.div variants={stagger.item}>
                    <NutriFact menu={todayMenu} />
                  </motion.div>
                )}

                {/* Feedback Section */}
                <motion.div variants={stagger.item} className="glass rounded-3xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-primary" />
                      <h3 className="text-sm font-bold text-text-primary">Feedback Hari Ini</h3>
                    </div>
                    <span className="text-[10px] text-text-muted">{feedbacks.length} ulasan</span>
                  </div>
                  <FeedbackList feedbacks={feedbacks} loading={feedbackLoading} />
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
