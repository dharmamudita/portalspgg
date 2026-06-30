import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Building2, Users, UtensilsCrossed, Star, TrendingUp, Calendar, MapPin, 
  ArrowUpRight, BarChart3, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMenusByDateRange, useAllFeedbacks, useAllSpgUsers } from '../hooks/useFirestore';
import { getSchoolWeekRange, formatDate } from '../lib/dateUtils';
import Navbar from '../components/layout/Navbar';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function SuperAdminDashboard() {
  const { userData } = useAuth();
  
  // Base date for filtering (current week)
  const [currentDate, setCurrentDate] = useState(new Date());
  const { start: weekStart, end: weekEnd } = useMemo(() => getSchoolWeekRange(currentDate), [currentDate]);

  // Fetch all menus (no spgUid filter for superadmin)
  const { menus, loading: menusLoading } = useMenusByDateRange(
    formatDate(weekStart), 
    formatDate(weekEnd), 
    undefined // Fetch all globally
  );

  // Fetch all feedbacks globally
  const { feedbacks, loading: feedbacksLoading } = useAllFeedbacks();

  // Fetch all SPG users globally for the map
  const { spgUsers, loading: spgLoading } = useAllSpgUsers();
  
  const loading = menusLoading || feedbacksLoading || spgLoading;

  // Compute Global Stats
  const globalStats = useMemo(() => {
    const totalMenus = menus.length;
    let totalTargetSiswa = 0;
    
    // In a real app, target_siswa would be tracked per menu or SPG
    menus.forEach(m => {
      totalTargetSiswa += (m.target_siswa || 500); 
    });

    const totalFeedbacks = feedbacks.length;
    const avgRating = totalFeedbacks > 0
      ? (feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / totalFeedbacks).toFixed(1)
      : '0.0';

    return {
      totalMenus,
      totalTargetSiswa,
      totalFeedbacks,
      avgRating,
      activeSPG: new Set(menus.map(m => m.spg_uid)).size || 0
    };
  }, [menus, feedbacks]);

  const stagger = {
    container: { animate: { transition: { staggerChildren: 0.1 } } },
    item: { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } },
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Memuat Ringkasan Nasional..." />;
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] font-sans pb-12 relative overflow-hidden">
      {/* Premium Background */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-indigo-900 via-primary to-indigo-800 z-0">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-[#f1f5f9] to-transparent"></div>
      </div>

      <div className="relative z-10">
        <Navbar />

        <main className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 border border-white/30 backdrop-blur-md mb-4 text-white text-sm font-semibold">
                <ShieldCheck className="w-4 h-4 text-primary" />
                Akses Pusat Nasional
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-md">
                Ringkasan Global
              </h1>
              <p className="text-white/80 mt-3 text-lg max-w-2xl font-medium">
                Pantau implementasi Program Makan Bergizi Gratis di seluruh wilayah secara real-time.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-xl flex items-center gap-4">
              <Calendar className="w-10 h-10 text-white/70" />
              <div>
                <p className="text-white/70 text-sm font-bold uppercase tracking-wider">Periode Aktif</p>
                <p className="text-white font-bold text-lg">
                  {formatDate(weekStart)} — {formatDate(weekEnd)}
                </p>
              </div>
            </div>
          </motion.div>

          {/* KPI Grid */}
          <motion.div 
            variants={stagger.container} 
            initial="initial" 
            animate="animate"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {[
              { label: 'Total SPPG Aktif', value: globalStats.activeSPG, suffix: ' Wilayah', icon: Building2, color: 'text-primary', bg: 'bg-primary/10' },
              { label: 'Menu Tersalurkan', value: globalStats.totalMenus, suffix: ' Menu', icon: UtensilsCrossed, color: 'text-primary', bg: 'bg-primary/10' },
              { label: 'Target Siswa (Estimasi)', value: globalStats.totalTargetSiswa.toLocaleString('id-ID'), suffix: ' Anak', icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
              { label: 'Rata-Rata Kepuasan', value: globalStats.avgRating, suffix: ' / 5.0', icon: Star, color: 'text-warning', bg: 'bg-warning/10' },
            ].map((stat, i) => (
              <motion.div key={i} variants={stagger.item}>
                <Card className="p-6 h-full border-none shadow-xl shadow-black/5 hover:shadow-2xl transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-2xl ${stat.bg}`}>
                      <stat.icon className={`w-7 h-7 ${stat.color}`} />
                    </div>
                    <span className="flex items-center text-xs font-bold text-success bg-success/10 px-2 py-1 rounded-full">
                      <TrendingUp className="w-3 h-3 mr-1" /> +Live
                    </span>
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-text-primary mb-1">
                      {stat.value}
                      <span className="text-base font-bold text-text-muted ml-1">{stat.suffix}</span>
                    </h3>
                    <p className="text-sm font-bold text-text-secondary uppercase tracking-wider">{stat.label}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>



          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div variants={stagger.item}>
               <Card className="p-8 border-none shadow-xl shadow-black/5 h-full">
                 <div className="flex items-center justify-between mb-6">
                   <h2 className="text-xl font-bold flex items-center gap-2">
                     <MapPin className="text-primary w-6 h-6" /> Peta Sebaran Implementasi
                   </h2>
                   <Link to="/superadmin/kinerja" className="text-sm font-bold text-primary hover:underline">
                     Lihat Detail
                   </Link>
                 </div>
                 <div className="bg-background rounded-2xl h-80 flex flex-col overflow-hidden border border-black/10 z-0 relative">
                   <MapContainer 
                     center={[-2.5489, 118.0149]} // Center of Indonesia
                     zoom={4} 
                     style={{ height: '100%', width: '100%', zIndex: 0 }}
                   >
                     <TileLayer
                       url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                       attribution="&copy; Google Maps"
                     />
                     {spgUsers.map(spg => {
                       if (spg.latitude && spg.longitude) {
                         return (
                           <Marker key={spg.uid} position={[spg.latitude, spg.longitude]}>
                             <Popup>
                               <div className="text-center font-sans">
                                 <p className="font-bold text-primary">{spg.nama}</p>
                                 <p className="text-xs text-text-secondary">{spg.instansi}</p>
                               </div>
                             </Popup>
                           </Marker>
                         );
                       }
                       return null;
                     })}
                   </MapContainer>
                 </div>
               </Card>
            </motion.div>

            <motion.div variants={stagger.item}>
               <Card className="p-8 border-none shadow-xl shadow-black/5 h-full">
                 <div className="flex items-center justify-between mb-6">
                   <h2 className="text-xl font-bold flex items-center gap-2">
                     <AlertTriangle className="text-warning w-6 h-6" /> Anomali & Peringatan Dini
                   </h2>
                 </div>
                 
                 {feedbacks.filter(f => f.rating <= 2).length > 0 ? (
                   <div className="space-y-4">
                     {feedbacks.filter(f => f.rating <= 2).slice(0, 3).map((f, i) => (
                       <div key={i} className="flex gap-4 p-4 rounded-xl bg-red-50 border border-red-100">
                         <div className="shrink-0 pt-1">
                           <AlertTriangle className="w-5 h-5 text-red-500" />
                         </div>
                         <div>
                           <p className="text-sm font-bold text-red-900">Ulasan Sangat Rendah ({f.rating} Bintang)</p>
                           <p className="text-xs text-red-700 mt-1 line-clamp-2">"{f.komentar}"</p>
                           <p className="text-xs font-medium text-red-400 mt-2">Oleh: {f.user_instansi || 'Anonim'} - {f.timestamp ? new Date(f.timestamp.seconds * 1000).toLocaleDateString('id-ID') : ''}</p>
                         </div>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="bg-success/10 rounded-2xl h-48 flex flex-col items-center justify-center border border-success/20 text-center p-6">
                     <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center mb-3">
                       <ShieldCheck className="w-6 h-6 text-success" />
                     </div>
                     <p className="text-success-dark font-bold">Semua Aman!</p>
                     <p className="text-success text-sm mt-1">Tidak ada anomali atau ulasan kritis yang membutuhkan perhatian segera pada periode ini.</p>
                   </div>
                 )}
               </Card>
            </motion.div>
          </div>
          
        </main>
      </div>
    </div>
  );
}
