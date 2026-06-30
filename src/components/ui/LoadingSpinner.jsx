import { motion } from 'framer-motion';

export default function LoadingSpinner({ size = 'md', text = 'Memuat...', fullScreen = false }) {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className={`${sizes[size]} rounded-full border-2 border-primary/20 border-t-primary`}
      />
      {text && (
        <p className="text-sm text-text-muted animate-pulse">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50" style={{ background: 'rgba(15, 23, 42, 0.8)' }}>
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      {spinner}
    </div>
  );
}
