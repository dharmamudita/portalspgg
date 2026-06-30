import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SearchableSelect({ 
  id, 
  label, 
  options = [], 
  value, 
  onChange, 
  placeholder = 'Pilih...', 
  icon: Icon,
  error 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option => 
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative" ref={wrapperRef}>
      {label && (
        <label htmlFor={id} className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5 ml-1">
          {label}
        </label>
      )}
      
      {/* Selector Button */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-full flex items-center bg-black/5 border ${error ? 'border-danger/50 ring-1 ring-danger/20' : 'border-black/10 hover:border-primary/30'} rounded-xl px-4 py-3 cursor-pointer transition-all ${isOpen ? 'ring-2 ring-primary/20 border-primary' : ''}`}
      >
        {Icon && <Icon className={`w-5 h-5 mr-3 shrink-0 ${error ? 'text-danger' : value ? 'text-primary' : 'text-text-muted'}`} />}
        
        <div className={`flex-1 truncate ${!value ? 'text-text-muted' : 'text-text-primary font-medium text-sm'}`}>
          {value || placeholder}
        </div>
        
        <ChevronDown className={`w-5 h-5 text-text-muted transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
      </div>

      {error && (
        <p className="text-xs text-danger font-semibold mt-1 ml-1">{error}</p>
      )}

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-black/5 overflow-hidden flex flex-col max-h-[300px]"
          >
            {/* Search Input */}
            <div className="p-3 border-b border-black/5 flex items-center bg-surface shrink-0">
              <Search className="w-4 h-4 text-text-muted mr-2" />
              <input
                type="text"
                autoFocus
                placeholder="Cari sekolah..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-sm bg-transparent border-none focus:outline-none text-text-primary"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="p-1 hover:bg-black/5 rounded-md text-text-muted">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Options List */}
            <div className="overflow-y-auto overflow-x-hidden flex-1 p-2 custom-scrollbar">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      onChange(option);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`px-4 py-2.5 text-sm rounded-lg cursor-pointer transition-colors ${value === option ? 'bg-primary/10 text-primary font-bold' : 'text-text-secondary hover:bg-black/5'}`}
                  >
                    {option}
                  </div>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-sm text-text-muted">
                  Sekolah tidak ditemukan
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
