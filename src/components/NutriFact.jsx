import { motion } from 'framer-motion';

export default function NutriFact({ menu }) {
  if (!menu) return null;

  const calcAKG = (value, daily) => {
    if (!value || !daily) return 0;
    return Math.round((value / daily) * 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="glass rounded-3xl p-6"
    >
      <div className="nutri-fact rounded-2xl p-4 bg-white max-w-sm mx-auto">
        <h3 className="text-2xl font-black leading-none mb-1">Informasi Nilai Gizi</h3>
        <p className="text-xs text-gray-600 mb-1">Nutrition Facts</p>
        <div className="thick-line mb-1" />

        <div className="flex justify-between text-xs mb-0.5">
          <span className="font-bold">Takaran Saji</span>
          <span>1 Porsi</span>
        </div>
        <div className="medium-line mb-1" />

        <div className="flex justify-between items-end mb-1">
          <div>
            <p className="text-xs font-bold">Energi / Kalori</p>
            <p className="text-3xl font-black leading-none">{menu.kalori || 0}</p>
          </div>
          <span className="text-lg font-bold">kkal</span>
        </div>
        <div className="medium-line mb-2" />

        <p className="text-right text-[10px] font-bold mb-1">% AKG*</p>
        <div className="thin-line mb-1" />

        {[
          { label: 'Protein', value: menu.protein, unit: 'g', daily: 65 },
          { label: 'Lemak Total', value: menu.lemak, unit: 'g', daily: 67 },
          { label: 'Karbohidrat Total', value: menu.karbo, unit: 'g', daily: 325 },
        ].map((item) => (
          <div key={item.label}>
            <div className="flex justify-between text-xs py-0.5">
              <span className="font-bold">{item.label} <span className="font-normal">{item.value || 0}{item.unit}</span></span>
              <span className="font-bold">{calcAKG(item.value, item.daily)}%</span>
            </div>
            <div className="thin-line" />
          </div>
        ))}

        <div className="medium-line mt-2 mb-2" />
        <p className="text-[9px] text-gray-500 leading-tight">
          *Persen AKG berdasarkan kebutuhan energi 2150 kkal.
        </p>

        {menu.bahan_baku && menu.bahan_baku.length > 0 && (
          <div className="mt-3 pt-2 border-t border-gray-300">
            <p className="text-[10px] font-bold mb-1">BAHAN BAKU:</p>
            <p className="text-[9px] text-gray-600">{menu.bahan_baku.join(', ')}</p>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-text-secondary">
        <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
        <span>Sumber bahan baku terverifikasi</span>
      </div>
    </motion.div>
  );
}
