import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Plus, X, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateManagedSchools } from '../hooks/useFirestore';
import { getAllSchoolsFlatList } from '../lib/schools';
import SearchableSelect from './ui/SearchableSelect';
import { useToast } from './ui/Toast';
import Card from './ui/Card';
import Button from './ui/Button';

export default function ManagedSchoolsManager() {
  const { userData, updateUserData } = useAuth();
  const { addToast } = useToast();
  const [selectedSchool, setSelectedSchool] = useState('');
  const [loading, setLoading] = useState(false);

  const managedSchools = userData?.managed_schools || [];
  const allSchools = getAllSchoolsFlatList();
  
  // Filter out schools that are already managed
  const availableSchools = allSchools.filter(s => !managedSchools.includes(s));

  const handleAddSchool = async () => {
    if (!selectedSchool) return;
    
    setLoading(true);
    try {
      const newSchools = [...managedSchools, selectedSchool];
      await updateManagedSchools(userData.uid, newSchools);
      updateUserData({ managed_schools: newSchools });
      setSelectedSchool('');
      addToast('Sekolah berhasil ditambahkan ke daftar binaan.', 'success');
    } catch (error) {
      console.error(error);
      addToast('Gagal menambahkan sekolah.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSchool = async (schoolToRemove) => {
    setLoading(true);
    try {
      const newSchools = managedSchools.filter(s => s !== schoolToRemove);
      await updateManagedSchools(userData.uid, newSchools);
      updateUserData({ managed_schools: newSchools });
      addToast('Sekolah berhasil dihapus dari daftar binaan.', 'success');
    } catch (error) {
      console.error(error);
      addToast('Gagal menghapus sekolah.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-black/5">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-text-primary font-display">Kelola Sekolah Binaan</h2>
          <p className="text-xs text-text-muted">Tentukan sekolah mana saja yang dikelola oleh SPPG ini</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-end mb-6">
        <div className="flex-1 w-full">
          <SearchableSelect 
            id="add-school"
            label="Tambah Sekolah"
            icon={Building2}
            options={availableSchools}
            value={selectedSchool}
            onChange={setSelectedSchool}
            placeholder="Cari sekolah..."
          />
        </div>
        <Button 
          onClick={handleAddSchool} 
          disabled={!selectedSchool || loading}
          icon={Plus}
          className="w-full md:w-auto"
        >
          Tambahkan
        </Button>
      </div>

      <div>
        <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3 ml-1">
          Daftar Sekolah Binaan ({managedSchools.length})
        </h3>
        
        {managedSchools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <AnimatePresence>
              {managedSchools.map((school) => (
                <motion.div 
                  key={school}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center justify-between p-3 rounded-xl border border-black/10 bg-black/5"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <Building2 className="w-4 h-4 text-text-muted shrink-0" />
                    <span className="text-sm font-semibold text-text-primary truncate">{school}</span>
                  </div>
                  <button 
                    onClick={() => handleRemoveSchool(school)}
                    disabled={loading}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-danger/10 hover:text-danger transition-colors shrink-0"
                    title="Hapus"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="p-8 text-center bg-black/5 rounded-xl border border-black/10 border-dashed">
            <Building2 className="w-8 h-8 mx-auto text-text-muted mb-3 opacity-50" />
            <p className="text-sm font-medium text-text-secondary">Belum ada sekolah binaan.</p>
            <p className="text-xs text-text-muted mt-1">Siswa tidak akan dapat melihat menu dari SPPG Anda sampai sekolah mereka ditambahkan.</p>
          </div>
        )}
      </div>
    </Card>
  );
}
