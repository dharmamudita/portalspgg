import { useState } from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StarRating({
  value = 0,
  onChange,
  readonly = false,
  size = 20,
  className = '',
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = readonly ? star <= value : star <= (hovered || value);
        return (
          <motion.button
            key={star}
            type="button"
            whileHover={readonly ? {} : { scale: 1.2 }}
            whileTap={readonly ? {} : { scale: 0.9 }}
            className={`
              ${readonly ? 'cursor-default' : 'cursor-pointer'}
              transition-colors duration-150
            `}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(0)}
            onClick={() => !readonly && onChange?.(star)}
            aria-label={`Rating ${star} dari 5`}
            disabled={readonly}
          >
            <Star
              size={size}
              className={
                filled
                  ? 'text-warning fill-warning'
                  : 'text-text-muted'
              }
            />
          </motion.button>
        );
      })}
    </div>
  );
}
