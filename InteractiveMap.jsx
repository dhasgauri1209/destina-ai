import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";

function InteractiveMap({ points }) {
  const [selectedPin, setSelectedPin] = useState(null);

  const mapCenter = useMemo(() => {
    if (!points || points.length === 0) return { lat: 48.8566, lng: 2.3522 };
    return { lat: points[0].lat, lng: points[0].lng };
  }, [points]);

  if (!points || points.length === 0) return null;

  const mapUrl = `https://www.google.com/maps?q=${mapCenter.lat},${mapCenter.lng}&z=11&output=embed`;

  return (
    <section className="glass mt-6 overflow-hidden rounded-2xl p-4">
      <h3 className="font-heading text-lg font-semibold text-white light:text-slate-900">Interactive Map</h3>
      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <iframe title="Destination map" src={mapUrl} className="h-[320px] w-full rounded-xl border border-white/20" loading="lazy" />
        </div>
        <div className="space-y-2">
          {points.slice(0, 8).map((point, index) => (
            <button
              key={`${point.name}-${index}`}
              onClick={() => setSelectedPin(point)}
              className="block w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-left text-sm text-slate-100 light:text-slate-700"
            >
              <p className="font-semibold">{point.name}</p>
              <p className="text-xs uppercase tracking-wide text-secondary">{point.category}</p>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedPin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[85] flex items-center justify-center bg-black/70 p-4"
            onClick={() => setSelectedPin(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onClick={(event) => event.stopPropagation()}
              className="glass w-full max-w-md rounded-2xl p-5"
            >
              <h4 className="font-heading text-xl font-bold text-white light:text-slate-900">{selectedPin.name}</h4>
              <p className="mt-1 text-sm text-slate-300 light:text-slate-600">Category: {selectedPin.category}</p>
              <p className="mt-1 text-xs text-slate-400">Lat: {selectedPin.lat}, Lng: {selectedPin.lng}</p>
              <button onClick={() => setSelectedPin(null)} className="mt-4 rounded-full bg-primary px-4 py-2 text-sm text-white">
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default InteractiveMap;
