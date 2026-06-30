import { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

const Input = forwardRef(function Input(
  { label, error, icon: Icon, type = 'text', className = '', id, ...props },
  ref
) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        )}
        <input
          ref={ref}
          id={id}
          type={type}
          className={`
            w-full px-4 py-3 rounded-xl
            bg-black/5 border border-black/10
            text-text-primary placeholder:text-text-muted
            focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50
            transition-all duration-200
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-danger/50 focus:ring-danger/50' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs font-semibold text-danger mt-1.5 flex items-center gap-1.5 ml-1">
          <AlertCircle className="w-3.5 h-3.5" /> {error}
        </p>
      )}
    </div>
  );
});

export default Input;

