const variants = {
  primary: 'bg-primary/10 text-primary-dark border-primary/30',
  secondary: 'bg-secondary/20 text-secondary border-secondary/30',
  accent: 'bg-accent/20 text-accent-light border-accent/30',
  success: 'bg-success/20 text-success border-success/30',
  warning: 'bg-warning/20 text-warning border-warning/30',
  danger: 'bg-danger/20 text-danger border-danger/30',
  neutral: 'bg-black/10 text-text-secondary border-black/10',
};

export default function Badge({ children, variant = 'primary', className = '' }) {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5
        text-[10px] font-bold uppercase tracking-widest
        rounded-full border
        ${variants[variant]} ${className}
      `}
    >
      {children}
    </span>
  );
}


