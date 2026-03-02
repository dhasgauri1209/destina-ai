import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

const fallbackActivities = [
  { title: "Private Yacht Sunset", desc: "Sail through golden coastlines with curated fine dining onboard.", image: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=1500&q=80" },
  { title: "Alpine Helicopter Tour", desc: "Aerial mountain panoramas and premium valley landings.", image: "https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&w=1500&q=80" },
  { title: "Night City Art Walk", desc: "Guided architecture and art experience with local curation.", image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1500&q=80" }
];

function ActivitySection({ items }) {
  const [selected, setSelected] = useState(null);
  const activities = items?.length
    ? items.map((item, index) => ({
        title: item.title,
        desc: `${item.duration} · $${item.price}`,
        image: fallbackActivities[index % fallbackActivities.length].image
      }))
    : fallbackActivities;

  return (
    <section className="app-container mt-14">
      <h2 className="section-title">🎟️ What activities to do</h2>
      <p className="section-subtitle">Click cards to explore immersive activity highlights.</p>
      <div className="mt-7 grid gap-6 md:grid-cols-3">
        {activities.map((activity, index) => (
          <motion.button
            key={activity.title}
            onClick={() => setSelected(activity)}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            whileHover={{ y: -5 }}
            className="rounded-2xl bg-gradient-to-r from-primary via-secondary to-accent p-[1px] text-left"
          >
            <div className="h-full rounded-2xl bg-slate-900/90 p-4 light:bg-white/90">
              <img src={activity.image} alt={activity.title} className="h-56 w-full rounded-xl object-cover" loading="lazy" />
              <h3 className="mt-4 font-heading text-xl font-semibold text-white light:text-slate-900">{activity.title}</h3>
              <p className="mt-1 text-sm text-slate-300 light:text-slate-600">{activity.desc}</p>
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              className="glass w-full max-w-xl rounded-3xl p-5"
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              onClick={(event) => event.stopPropagation()}
            >
              <img src={selected.image} alt={selected.title} className="h-64 w-full rounded-2xl object-cover" />
              <h3 className="mt-4 font-heading text-2xl font-bold text-white light:text-slate-900">{selected.title}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-200 light:text-slate-600">{selected.desc}</p>
              <button onClick={() => setSelected(null)} className="mt-4 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white">
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default ActivitySection;
