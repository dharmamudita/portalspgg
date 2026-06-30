import { useState } from 'react';
import { motion } from 'framer-motion';
import { Vote, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { submitVote, useUserVotedMap } from '../hooks/useFirestore';
import { useToast } from './ui/Toast';
import Badge from './ui/Badge';

export default function VotingSlider({ menus }) {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const menuIds = menus.map((m) => m.id);
  const votedMenus = useUserVotedMap(menuIds, currentUser?.uid);
  const [voting, setVoting] = useState(null);
  const [scrollIndex, setScrollIndex] = useState(0);


  const handleVote = async (menuId) => {
    if (votedMenus[menuId] || voting) return;
    setVoting(menuId);
    try {
      await submitVote(menuId, currentUser.uid);
      addToast('Vote berhasil!', 'success');
    } catch (err) {
      addToast('Gagal melakukan vote', 'error');
    } finally {
      setVoting(null);
    }
  };

  if (!menus.length) return null;

  const canScrollLeft = scrollIndex > 0;
  const canScrollRight = scrollIndex < menus.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="glass rounded-3xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-text-primary">Voting Menu Minggu Depan</h3>
          <p className="text-xs text-text-muted">Pilih menu favoritmu</p>
        </div>
        <Badge variant="secondary">
          <Vote className="w-3 h-3 mr-1" /> Voting
        </Badge>
      </div>

      <div className="relative">
        {canScrollLeft && (
          <button
            onClick={() => setScrollIndex((p) => p - 1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-8 h-8 rounded-full bg-surface border border-black/10 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-black/10 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        <div className="overflow-hidden">
          <motion.div
            className="flex gap-4"
            animate={{ x: -scrollIndex * 280 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {menus.map((menu, idx) => {
              const voted = votedMenus[menu.id];
              const isVoting = voting === menu.id;
              const imageUrl = menu.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop';

              return (
                <motion.div
                  key={menu.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="min-w-[260px] bg-black/5 border border-black/10 rounded-2xl overflow-hidden flex-shrink-0"
                >
                  <div className="relative h-32 overflow-hidden">
                    <img src={imageUrl} alt={menu.nama_menu} className="w-full h-full object-cover" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <p className="absolute bottom-2 left-3 text-sm font-bold text-white">{menu.nama_menu}</p>
                  </div>

                  <div className="p-3">
                    <div className="flex gap-2 text-[10px] text-text-muted mb-3">
                      <span>{menu.kalori || 0} kkal</span>
                      <span>•</span>
                      <span>{menu.protein || 0}g protein</span>
                    </div>

                    <button
                      onClick={() => handleVote(menu.id)}
                      disabled={voted || isVoting}
                      className={`w-full py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer
                        ${voted
                          ? 'bg-success/20 text-success border border-success/30'
                          : 'bg-primary/10 text-primary-dark border border-primary/30 hover:bg-primary/30'
                        }
                        disabled:cursor-not-allowed
                      `}
                    >
                      {isVoting ? (
                        <span className="animate-pulse">Mengirim...</span>
                      ) : voted ? (
                        <span className="flex items-center justify-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Sudah Divote
                        </span>
                      ) : (
                        'Vote Menu Ini'
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {canScrollRight && (
          <button
            onClick={() => setScrollIndex((p) => p + 1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-8 h-8 rounded-full bg-surface border border-black/10 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-black/10 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}


