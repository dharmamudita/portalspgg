import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'btn-premium bg-primary text-white border-none',
  secondary: 'bg-secondary/20 hover:bg-secondary/30 text-secondary border border-secondary/30',
  accent: 'btn-premium bg-accent text-white border-none',
  danger: 'bg-danger/20 hover:bg-danger/30 text-danger border border-danger/30',
  ghost: 'bg-transparent hover:bg-black/5 text-text-secondary',
  glass: 'glass hover:bg-black/10 text-text-primary',
  success: 'bg-success/20 hover:bg-success/30 text-success border border-success/30',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-7 py-3.5 text-base rounded-2xl',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  icon: Icon,
  ...props
}) {
  const isPremium = variant === 'primary' || variant === 'accent';

  return (
    <motion.button
      whileHover={isPremium ? undefined : { scale: disabled ? 1 : 1.02 }}
      whileTap={isPremium ? undefined : { scale: disabled ? 1 : 0.98 }}
      className={`
        inline-flex items-center justify-center gap-2 font-semibold
        transition-all duration-200 cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
    </motion.button>
  );
}

