import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, TrendingUp, AlertCircle, Search, Building2, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAllFeedbacks, useAllMenus, useAllSpgUsers } from '../hooks/useFirestore';
import Navbar from '../components/layout/Navbar';
import PageHeaderBg from '../components/ui/PageHeaderBg';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Input from '../components/ui/Input';
import { MOCK_WILAYAH } from '../lib/wilayah';

export default function KinerjaSPPGPage() {
  const { feedbacks, loading: feedbacksLoading } = useAllFeedbacks();
  const { menus, loading: menusLoading } = useAllMenus(undefined); // Fetch all globally
  const { spgUsers, loading: spgLoading, error: spgError } = useAllSpgUsers();
  const [searchQuery, setSearchQuery] = useState('');

  const loading = feedbacksLoading || menusLoading || spgLoading;

  // Process data to rank SPPGs
  const sppgRankings = useMemo(() => {
    if (!feedbacks || !menus) return [];

    const spgMap = {};

    // Map menus to SPPGs
    menus.forEach(menu => {
      if (!menu.spg_uid) return;
      if (!spgMap[menu.spg_uid]) {
        spgMap[menu.spg_uid] = {
          uid: menu.spg_uid,
          totalMenus: 0,
          totalFeedbacks: 0,
          sumRating: 0,
          negativeFeedbacks: 0,
        };
      }
      spgMap[menu.spg_uid].totalMenus += 1;
    });

    // Map feedbacks to SPPGs via menu_id
    feedbacks.forEach(f => {
      const menu = menus.find(m => m.id === f.menu_id);
      if (menu && menu.spg_uid && spgMap[menu.spg_uid]) {
        const spg = spgMap[menu.spg_uid];
        spg.totalFeedbacks += 1;
        spg.sumRating += (f.rating || 0);
        if (f.rating <= 2) spg.negativeFeedbacks += 1;
      }
    });

    // Convert map to array and calculate averages
    let rankings = Object.values(spgMap).map(spg => {
      const spgDoc = spgUsers.find(u => u.uid === spg.uid);
      return {
        ...spg,
        avgRating: spg.totalFeedbacks > 0 ? (spg.sumRating / spg.totalFeedbacks) : 0,
        name: spgDoc ? spgDoc.instansi || 'Dapur SPPG' : `Dapur SPPG UID: ${spg.uid.substring(0, 6)}...`,
        location: spgDoc?.latitude ? 'Lokasi Tersedia di Peta' : 'Lokasi Belum Diatur',
      };
    });

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      rankings = rankings.filter(r => r.name.toLowerCase().includes(q) || r.uid.toLowerCase().includes(q));
    }

    // Sort by rating desc
    return rankings.sort((a, b) => b.avgRating - a.avgRating);
  }, [menus, feedbacks, searchQuery, spgUsers]);

  const stagger = {
    container: { animate: { transition: { staggerChildren: 0.1 } } },
    item: { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } },
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Menganalisis Kinerja SPPG..." />;
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] font-sans pb-12 relative overflow-hidden">
      <PageHeaderBg />

      <div className="relative z-10">
        <Navbar />

        <main className="pt-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 pt-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 border border-white/30 backdrop-blur-md mb-4 text-white text-sm font-semibold">
              <Trophy className="w-4 h-4 text-primary" />
              Peringkat Nasional
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-md">
              Kinerja Dapur SPPG
            </h1>
            <p className="text-white/80 mt-2 text-lg">
              Bandingkan kualitas pelayanan gizi antar wilayah berdasarkan ulasan siswa.
            </p>
          </motion.div>

          <Card className="p-6 mb-8 border-none shadow-xl shadow-black/5 bg-white/90 backdrop-blur-xl">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="w-full md:w-96">
                <Input
                  icon={Search}
                  placeholder="Cari dapur SPPG..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-black/5 border-transparent focus:bg-white"
                />
              </div>
              
              <div className="flex items-center gap-3 bg-primary/10 px-4 py-2.5 rounded-xl border border-primary/20 shrink-0 w-full md:w-auto">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xl font-bold text-text-primary leading-none">{spgError ? 'ERR' : (spgUsers?.length || 0)}</p>
                  <p className="text-[10px] text-text-secondary uppercase font-bold tracking-wider mt-0.5">Dapur Terdaftar</p>
                </div>
              </div>
              {spgError && (
                <div className="text-xs text-red-500 max-w-xs">{spgError}</div>
              )}
            </div>
          </Card>

          <motion.div variants={stagger.container} initial="initial" animate="animate" className="space-y-4">
            {sppgRankings.length > 0 ? (
              sppgRankings.map((spg, index) => (
                <motion.div key={spg.uid} variants={stagger.item}>
                  <Card className="p-6 border-none shadow-lg shadow-black/5 hover:shadow-xl transition-all flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
                    {/* Rank Badge */}
                    <div className="absolute -left-6 -top-6 w-16 h-16 bg-primary/10 rounded-full flex items-end justify-end pr-3 pb-3">
                      <span className="text-xl font-black text-primary">#{index + 1}</span>
                    </div>

                    <div className="shrink-0 w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center ml-4 border border-black/5">
                      <Building2 className="w-8 h-8 text-gray-500" />
                    </div>
                    
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-xl font-bold text-text-primary mb-1">{spg.name}</h3>
                      <p className="text-sm text-text-secondary flex items-center justify-center md:justify-start gap-1">
                        <MapPin className="w-4 h-4" /> ID: {spg.uid}
                      </p>
                    </div>

                    <div className="flex flex-wrap justify-center md:justify-end gap-6 w-full md:w-auto">
                      <div className="text-center">
                        <p className="text-xs font-bold text-text-secondary uppercase">Rating</p>
                        <p className="text-xl font-black text-yellow-500 flex items-center justify-center gap-1 mt-1">
                          {spg.avgRating.toFixed(1)} <Star className="w-5 h-5 fill-yellow-500" />
                        </p>
                      </div>
                      
                      <div className="w-px h-12 bg-black/10 hidden md:block"></div>

                      <div className="text-center">
                        <p className="text-xs font-bold text-text-secondary uppercase">Total Ulasan</p>
                        <p className="text-xl font-black text-text-primary mt-1">{spg.totalFeedbacks}</p>
                      </div>

                      <div className="w-px h-12 bg-black/10 hidden md:block"></div>

                      <div className="text-center">
                        <p className="text-xs font-bold text-text-secondary uppercase">Anomali</p>
                        <p className={`text-xl font-black mt-1 ${spg.negativeFeedbacks > 0 ? 'text-red-500' : 'text-green-500'}`}>
                          {spg.negativeFeedbacks} <span className="text-xs font-medium text-text-muted">Keluhan</span>
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-3xl border border-black/5">
                <AlertCircle className="w-12 h-12 text-text-muted mx-auto mb-3" />
                <h3 className="text-lg font-bold text-text-primary">Tidak Ada Data SPPG</h3>
                <p className="text-text-secondary">Belum ada data kinerja yang dapat ditampilkan.</p>
              </div>
            )}
          </motion.div>

        </main>
      </div>
    </div>
  );
}
