import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, MapPin, CheckCircle, XCircle, Building2, User, Mail, History, Clock } from 'lucide-react';
import { useAllSpgUsers, approveSpgUser, rejectSpgUser } from '../hooks/useFirestore';
import Navbar from '../components/layout/Navbar';
import PageHeaderBg from '../components/ui/PageHeaderBg';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function ApprovalPage() {
  const { spgUsers, loading } = useAllSpgUsers();
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'history'

  const pendingUsers = spgUsers?.filter(u => u.status === 'pending_approval') || [];
  const activeUsers = spgUsers?.filter(u => u.status === 'active') || [];
  const rejectedUsers = spgUsers?.filter(u => u.status === 'rejected') || [];
  const historyUsers = [...activeUsers, ...rejectedUsers];

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

          <div className="flex justify-center mb-6 md:mb-8">
            <div className="bg-white/50 backdrop-blur-md p-1.5 rounded-full border border-white/40 shadow-sm inline-flex w-full md:w-auto overflow-hidden">
              <button
                onClick={() => setActiveTab('pending')}
                className={`flex-1 md:flex-none px-3 sm:px-6 py-2 md:py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 ${
                  activeTab === 'pending'
                    ? 'bg-primary text-white shadow-md'
                    : 'text-text-secondary hover:text-primary hover:bg-white/60'
                }`}
              >
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Menunggu</span> <span className="sm:hidden">({pendingUsers.length})</span><span className="hidden sm:inline">({pendingUsers.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 md:flex-none px-3 sm:px-6 py-2 md:py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 ${
                  activeTab === 'history'
                    ? 'bg-primary text-white shadow-md'
                    : 'text-text-secondary hover:text-primary hover:bg-white/60'
                }`}
              >
                <History className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Riwayat</span> <span className="sm:hidden">({historyUsers.length})</span><span className="hidden sm:inline">({historyUsers.length})</span>
              </button>
            </div>
          </div>

          <motion.div variants={stagger.container} initial="initial" animate="animate">
            {activeTab === 'pending' ? (
              pendingUsers.length === 0 ? (
                <motion.div variants={stagger.item}>
                  <Card className="p-12 border-none shadow-xl shadow-black/5 bg-white/90 backdrop-blur-xl text-center">
                    <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-6">
                      <ShieldCheck className="w-10 h-10 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-text-primary mb-2">Semua Bersih!</h2>
                    <p className="text-text-secondary text-lg">Tidak ada pendaftaran Dapur SPPG yang menunggu persetujuan saat ini.</p>
                  </Card>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  {pendingUsers.map(user => (
                    <motion.div key={user.uid || user.id} variants={stagger.item}>
                      <Card className="p-5 md:p-7 border border-primary/20 shadow-[0_8px_30px_rgba(28,79,135,0.08)] hover:shadow-[0_8px_40px_rgba(28,79,135,0.15)] bg-white rounded-3xl relative overflow-hidden transition-all duration-300">
                        <div className="flex flex-col md:flex-row gap-6 relative z-10 items-start md:items-center">
                          {/* Left Icon */}
                          <div className="hidden md:flex w-16 h-16 rounded-2xl bg-primary/10 items-center justify-center shrink-0">
                            <Building2 className="w-8 h-8 text-primary" />
                          </div>

                          <div className="flex-1 w-full">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight">
                                {user.instansi}
                              </h3>
                              <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary-dark text-[10px] font-bold uppercase tracking-wider hidden sm:block">
                                Baru
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-1.5 text-text-secondary mb-5 font-medium text-sm">
                              <MapPin className="w-4 h-4 text-primary-light" />
                              {user.kecamatan}, {user.kabupaten}, {user.provinsi}
                            </div>
                            
                            <div className="flex flex-wrap gap-3">
                              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-black/5">
                                <User className="w-4 h-4 text-text-muted" />
                                <span className="text-sm font-semibold text-text-primary">{user.nama}</span>
                              </div>
                              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-black/5">
                                <Mail className="w-4 h-4 text-text-muted" />
                                <span className="text-sm font-medium text-text-secondary">{user.email}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto shrink-0 mt-4 md:mt-0">
                            <button 
                              onClick={() => approveSpgUser(user.uid || user.id)}
                              className="flex-1 md:flex-none py-2.5 px-6 rounded-full bg-primary text-white font-semibold text-sm shadow-md shadow-primary/30 hover:bg-primary-dark hover:-translate-y-0.5 transition-all duration-300 text-center"
                            >
                              Setujui
                            </button>
                            <button 
                              onClick={() => rejectSpgUser(user.uid || user.id)}
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
              )
            ) : (
              historyUsers.length === 0 ? (
                <motion.div variants={stagger.item}>
                  <Card className="p-12 border-none shadow-xl shadow-black/5 bg-white/90 backdrop-blur-xl text-center">
                    <div className="w-20 h-20 mx-auto rounded-full bg-black/5 flex items-center justify-center mb-6">
                      <History className="w-10 h-10 text-text-muted" />
                    </div>
                    <h2 className="text-2xl font-bold text-text-primary mb-2">Belum Ada Riwayat</h2>
                    <p className="text-text-secondary text-lg">Anda belum melakukan verifikasi pada akun manapun.</p>
                  </Card>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  {historyUsers.map(user => {
                    const isApproved = user.status === 'active';
                    return (
                      <motion.div key={user.uid || user.id} variants={stagger.item}>
                        <Card className={`p-5 md:p-7 border ${isApproved ? 'border-primary/20 shadow-[0_8px_30px_rgba(28,79,135,0.08)]' : 'border-red-200 shadow-[0_8px_30px_rgb(239,68,68,0.08)]'} bg-white rounded-3xl relative overflow-hidden transition-all duration-300`}>
                          <div className="flex flex-col md:flex-row gap-6 relative z-10 items-start md:items-center">
                            {/* Left Icon */}
                            <div className={`hidden md:flex w-16 h-16 rounded-2xl ${isApproved ? 'bg-primary/10' : 'bg-red-50'} items-center justify-center shrink-0`}>
                              <Building2 className={`w-8 h-8 ${isApproved ? 'text-primary' : 'text-red-600'}`} />
                            </div>

                            <div className="flex-1 w-full">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight">
                                  {user.instansi}
                                </h3>
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider hidden sm:block ${isApproved ? 'bg-primary/10 text-primary-dark' : 'bg-red-50 text-red-700'}`}>
                                  {isApproved ? 'Disetujui' : 'Ditolak'}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-1.5 text-text-secondary mb-5 font-medium text-sm">
                                <MapPin className={`w-4 h-4 ${isApproved ? 'text-primary-light' : 'text-red-500'}`} />
                                {user.kecamatan}, {user.kabupaten}, {user.provinsi}
                              </div>
                              
                              <div className="flex flex-wrap gap-3">
                                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-black/5">
                                  <User className="w-4 h-4 text-text-muted" />
                                  <span className="text-sm font-semibold text-text-primary">{user.nama}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-black/5">
                                  <Mail className="w-4 h-4 text-text-muted" />
                                  <span className="text-sm font-medium text-text-secondary">{user.email}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex justify-center md:justify-end shrink-0 w-full md:w-auto mt-4 md:mt-0">
                              {isApproved ? (
                                <div className="flex items-center gap-2 text-primary bg-primary/10 px-5 py-2.5 rounded-full font-bold">
                                  <CheckCircle className="w-5 h-5" />
                                  <span>Aktif</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-red-600 bg-red-50 px-5 py-2.5 rounded-full font-bold">
                                  <XCircle className="w-5 h-5" />
                                  <span>Ditolak</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
