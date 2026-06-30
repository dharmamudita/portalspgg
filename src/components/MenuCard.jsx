import { motion } from 'framer-motion';
import { Star, Flame, Droplets, Wheat } from 'lucide-react';
import Badge from './ui/Badge';

/**
 * MenuCard — Premium glassmorphism card showing today's menu
 * Displays food image, nutrition info, and average rating
 */
export default function MenuCard({ menu, onRate, showRateButton = true }) {
  if (!menu) return null;

  const avgRating = menu.avgRating || 0;
  const imageUrl = menu.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="glass rounded-3xl overflow-hidden shadow-2xl"
    >
      {/* Food Image */}
      <div className="relative h-52 sm:h-64 overflow-hidden">
        <img
          src={imageUrl}
          alt={menu.nama_menu}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

        {/* Rating Badge */}
        <div className="absolute top-4 right-4">
          <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <Star className="w-3.5 h-3.5 text-warning fill-warning" />
            <span className="text-sm font-bold text-white">{avgRating.toFixed(1)}</span>
          </div>
        </div>

        {/* Date Badge */}
        <div className="absolute top-4 left-4">
          <Badge variant="accent">Menu Hari Ini</Badge>
        </div>

        {/* Menu Name Overlay */}
        <div className="absolute bottom-4 left-6 right-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
            {menu.nama_menu}
          </h2>
          {menu.harga_porsi && (
            <p className="text-sm text-text-secondary mt-1">
              Rp {menu.harga_porsi.toLocaleString('id-ID')} / porsi
            </p>
          )}
        </div>
      </div>

      {/* Nutrition Grid */}
      <div className="p-6">
        <div className="grid grid-cols-4 gap-3">
          <NutritionItem
            icon={Flame}
            label="Kalori"
            value={menu.kalori}
            unit="kkal"
            color="text-danger"
            bgColor="bg-danger/10"
          />
          <NutritionItem
            icon={Droplets}
            label="Protein"
            value={menu.protein}
            unit="g"
            color="text-accent"
            bgColor="bg-accent/10"
          />
          <NutritionItem
            icon={Wheat}
            label="Karbo"
            value={menu.karbo}
            unit="g"
            color="text-warning"
            bgColor="bg-warning/10"
          />
          <NutritionItem
            icon={Droplets}
            label="Lemak"
            value={menu.lemak}
            unit="g"
            color="text-secondary"
            bgColor="bg-secondary/10"
          />
        </div>

        {/* Rate Button */}
        {showRateButton && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onRate}
            className="w-full mt-5 py-3.5 rounded-2xl bg-gradient-to-r from-primary to-accent
              text-white font-semibold text-sm
              shadow-lg shadow-primary/25
              hover:shadow-xl hover:shadow-primary/30
              transition-shadow duration-300 cursor-pointer"
          >
            <Star className="inline-block w-4 h-4 mr-1.5 -mt-0.5 fill-current" /> Beri Rating & Komentar
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

function NutritionItem({ icon: Icon, label, value, unit, color, bgColor }) {
  return (
    <div className="text-center">
      <div className={`w-10 h-10 mx-auto rounded-xl ${bgColor} flex items-center justify-center mb-2`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <p className="text-lg font-bold text-text-primary">{value || 0}</p>
      <p className="text-[10px] text-text-muted uppercase tracking-wider">{unit}</p>
      <p className="text-[10px] text-text-secondary mt-0.5">{label}</p>
    </div>
  );
}
