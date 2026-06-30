import { motion } from 'framer-motion';

export default function Card({
  children,
  className = '',
  glass = true,
  glow = false,
  hover = true,
  padding = 'p-6',
  ...props
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      whileHover={hover ? { y: -2, transition: { duration: 0.2 } } : {}}
      className={`
        rounded-3xl ${padding}
        ${glass ? 'glass' : 'bg-surface'}
        ${glow ? 'glow-primary' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
}
