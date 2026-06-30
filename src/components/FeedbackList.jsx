import { motion } from 'framer-motion';
import { MessageCircle, Building2, User } from 'lucide-react';
import StarRating from './ui/StarRating';

export default function FeedbackList({ feedbacks, loading }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-24 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (feedbacks.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageCircle className="w-8 h-8 text-text-muted mx-auto mb-3 opacity-50" />
        <p className="text-sm text-text-muted">Belum ada feedback untuk menu ini.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
      {feedbacks.map((fb, idx) => {
        const nipMasked = fb.user_nip 
          ? fb.user_nip.substring(0, 4) + '***'
          : '***';

        return (
          <motion.div
            key={fb.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className="bg-black/5 border border-black/5 rounded-2xl p-4"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center overflow-hidden">
                  <User className="w-5 h-5 text-text-muted mt-1" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-text-primary">NIP: {nipMasked}</p>
                  <div className="flex items-center gap-1 text-[10px] text-text-muted">
                    <Building2 className="w-3 h-3" />
                    {fb.user_instansi || 'Instansi'}
                  </div>
                </div>
              </div>
              <StarRating value={fb.rating} readonly size={12} />
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">{fb.komentar}</p>
            {fb.timestamp && (
              <p className="text-[10px] text-text-muted mt-2">
                {fb.timestamp.toDate ? fb.timestamp.toDate().toLocaleDateString('id-ID', {
                  day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                }) : ''}
              </p>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

