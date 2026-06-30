import { motion } from 'framer-motion';
import { ShieldCheck, MapPin, CheckCircle, XCircle, Building2, User, Mail } from 'lucide-react';
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
                    <Card className="p-5 md:p-7 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_8px_40px_rgb(59,130,246,0.12)] bg-white rounded-3xl relative overflow-hidden transition-all duration-300">
                      
                      <div className="flex flex-col md:flex-row gap-6 relative z-10 items-start md:items-center">
                        {/* Left Icon */}
                        <div className="hidden md:flex w-16 h-16 rounded-2xl bg-blue-50 items-center justify-center shrink-0">
                          <Building2 className="w-8 h-8 text-blue-600" />
                        </div>

                        <div className="flex-1 w-full">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
                              {user.instansi}
                            </h3>
                            <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider hidden sm:block">
                              Baru
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1.5 text-gray-500 mb-5 font-medium text-sm">
                            <MapPin className="w-4 h-4 text-blue-500" />
                            {user.kecamatan}, {user.kabupaten}, {user.provinsi}
                          </div>
                          
                          <div className="flex flex-wrap gap-3">
                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                              <User className="w-4 h-4 text-gray-400" />
                              <span className="text-sm font-semibold text-gray-700">{user.nama}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span className="text-sm font-medium text-gray-600">{user.email}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto shrink-0 mt-4 md:mt-0">
                          <button 
                            onClick={() => approveSpgUser(user.id)}
                            className="flex-1 md:flex-none py-2.5 px-6 rounded-full bg-blue-600 text-white font-semibold text-sm shadow-md shadow-blue-600/20 hover:bg-blue-700 hover:-translate-y-0.5 transition-all duration-300 text-center"
                          >
                            Setujui
                          </button>
                          <button 
                            onClick={() => rejectSpgUser(user.id)}
                            className="flex-1 md:flex-none py-2.5 px-6 rounded-full bg-red-50 text-red-600 font-semibold text-sm hover:bg-red-100 transition-all duration-300 text-center"
                          >
                            Tolak
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
