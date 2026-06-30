import { motion } from 'framer-motion';
import { ShieldCheck, MapPin, CheckCircle, XCircle } from 'lucide-react';
import { usePendingSpgUsers, approveSpgUser, rejectSpgUser } from '../hooks/useFirestore';
import Navbar from '../components/layout/Navbar';
import PageHeaderBg from '../components/ui/PageHeaderBg';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function ApprovalPage() {
  const { pendingUsers, loading } = usePendingSpgUsers();

  const stagger = {
    container: { animate: { transition: { staggerChildren: 0.1 } } },
    item: { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } },
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Memuat Data Pendaftar..." />;
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] font-sans pb-12 relative overflow-hidden">
      <PageHeaderBg />
      
      <div className="relative z-10">
        <Navbar />

        <main className="pt-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 text-center"
          >
            <div className="w-16 h-16 mx-auto rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center mb-4 shadow-xl">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-md mb-2">
              <span className="text-accent-light">Verifikasi</span> Dapur SPPG
            </h1>
            <p className="text-white/80 text-sm md:text-base max-w-2xl mx-auto">
              Tinjau dan setujui pendaftaran dapur baru dari seluruh Indonesia untuk memperluas jangkauan Program Makan Bergizi Gratis.
            </p>
          </motion.div>

          <motion.div variants={stagger.container} initial="initial" animate="animate">
            {pendingUsers.length === 0 ? (
              <motion.div variants={stagger.item}>
                <Card className="p-12 border-none shadow-xl shadow-black/5 bg-white/90 backdrop-blur-xl text-center">
                  <div className="w-20 h-20 mx-auto rounded-full bg-success/10 flex items-center justify-center mb-6">
                    <CheckCircle className="w-10 h-10 text-success" />
                  </div>
                  <h2 className="text-2xl font-bold text-text-primary mb-2">Semua Bersih!</h2>
                  <p className="text-text-secondary text-lg">Tidak ada pendaftaran Dapur SPPG yang menunggu persetujuan saat ini.</p>
                </Card>
              </motion.div>
            ) : (
              <div className="space-y-6">
                <motion.div variants={stagger.item} className="flex items-center justify-between px-2">
                  <h3 className="text-lg font-bold text-text-primary">
                    <span className="text-danger mr-2">{pendingUsers.length}</span> Menunggu Persetujuan
                  </h3>
                </motion.div>
                
                {pendingUsers.map(user => (
                  <motion.div key={user.id} variants={stagger.item}>
                    <Card className="p-6 border border-amber-200/60 shadow-xl shadow-amber-500/5 bg-white/90 backdrop-blur-xl relative overflow-hidden group hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-500">
                      <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl group-hover:bg-amber-400/20 transition-all"></div>
                      
                      <div className="flex flex-col md:flex-row gap-6 relative z-10">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-inner">
                              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                              Menunggu Verifikasi
                            </span>
                          </div>
                          
                          <h3 className="text-2xl md:text-3xl font-black text-slate-800 mb-2 tracking-tight">
                            {user.instansi}
                          </h3>
                          <div className="flex items-center gap-2 text-slate-500 mb-6 font-medium">
                            <MapPin className="w-4 h-4 text-primary" />
                            {user.kecamatan}, {user.kabupaten}, {user.provinsi}
                          </div>
                          
                          <div className="flex flex-wrap sm:flex-nowrap gap-4 sm:gap-6 bg-slate-50/80 rounded-2xl p-4 border border-slate-100/80 shadow-sm">
                            <div className="flex-1">
                              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Penanggung Jawab</p>
                              <p className="font-bold text-slate-700">{user.nama}</p>
                            </div>
                            <div className="w-full sm:w-px h-px sm:h-auto bg-slate-200"></div>
                            <div className="flex-1">
                              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Kontak & Identitas</p>
                              <p className="font-bold text-slate-700">{user.email} <span className="text-slate-400 font-normal mx-1">•</span> {user.nip}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-row md:flex-col gap-3 justify-center md:justify-center md:w-44 shrink-0 pt-2">
                          <button 
                            onClick={() => approveSpgUser(user.id)}
                            className="flex-1 md:flex-none py-3 px-4 rounded-xl bg-gradient-to-r from-success to-emerald-400 text-white font-bold text-sm shadow-lg shadow-success/30 hover:shadow-success/50 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
                          >
                            <CheckCircle className="w-5 h-5" /> Setujui
                          </button>
                          <button 
                            onClick={() => rejectSpgUser(user.id)}
                            className="flex-1 md:flex-none py-3 px-4 rounded-xl bg-white border-2 border-danger/20 text-danger font-bold text-sm hover:bg-danger/5 hover:border-danger transition-all duration-300 flex items-center justify-center gap-2"
                          >
                            <XCircle className="w-5 h-5" /> Tolak
                          </button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
