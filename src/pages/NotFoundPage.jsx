import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, AlertTriangle } from 'lucide-react';
import Button from '../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="page-mesh flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="w-20 h-20 mx-auto rounded-3xl bg-warning/10 flex items-center justify-center mb-6">
          <AlertTriangle className="w-10 h-10 text-warning" />
        </div>
        <h1 className="text-6xl font-black gradient-text mb-4">404</h1>
        <h2 className="text-xl font-bold text-text-primary mb-2">Halaman Tidak Ditemukan</h2>
        <p className="text-sm text-text-muted mb-8">
          Halaman yang Anda cari tidak tersedia atau sudah dipindahkan.
        </p>
        <Link to="/">
          <Button icon={Home} size="lg">
            Kembali ke Beranda
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
