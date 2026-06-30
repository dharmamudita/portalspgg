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
                    <Card className="p-6 border-none shadow-lg shadow-black/5 hover:shadow-xl transition-all relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-2 h-full bg-danger"></div>
                      
                      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pl-4">
                        <div className="flex-1 w-full text-center md:text-left">
                          <h3 className="text-2xl font-bold text-text-primary mb-1">
                            {user.instansi}
                          </h3>
                          <div className="flex items-center justify-center md:justify-start gap-2 text-text-secondary mb-3">
                            <MapPin className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium">{user.kecamatan}, {user.kabupaten}, {user.provinsi}</span>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <div>
                              <p className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Penanggung Jawab</p>
                              <p className="font-semibold text-text-primary">{user.nama}</p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Kontak & NIP</p>
                              <p className="font-medium text-sm text-text-primary">{user.email} • {user.nip}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3 w-full md:w-48 shrink-0">
                          <button 
                            onClick={() => approveSpgUser(user.id)}
                            className="w-full py-3 rounded-xl bg-success text-white font-bold text-sm shadow-lg shadow-success/30 hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                          >
                            <CheckCircle className="w-5 h-5" /> Terima
                          </button>
                          <button 
                            onClick={() => rejectSpgUser(user.id)}
                            className="w-full py-3 rounded-xl bg-danger/10 text-danger font-bold text-sm hover:bg-danger hover:text-white transition-colors flex items-center justify-center gap-2"
                          >
                            <XCircle className="w-5 h-5" /> Tolak Pendaftaran
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
