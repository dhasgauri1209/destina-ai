import { motion } from "framer-motion";

const fallbackTravelModes = [
  { icon: "✈️", title: "Flight", text: "Fast premium hops" },
  { icon: "🚆", title: "Train", text: "Elegant scenic routes" },
  { icon: "🚌", title: "Bus", text: "Reliable city mobility" },
  { icon: "🚗", title: "Car", text: "Private flexibility" }
];

const modeIcon = {
  Flight: "✈️",
  Train: "🚆",
  Bus: "🚌",
  "Rental Car": "🚗"
};

function TravelSection({ items }) {
  const travelModes = items?.length
    ? items.map((item) => ({
        icon: modeIcon[item.mode] || "🧭",
        title: item.mode,
        text: `${item.eta} · $${item.estimated_cost}`
      }))
    : fallbackTravelModes;

  return (
    <section className="app-container mt-14">
      <h2 className="section-title">🚆 How to travel</h2>
      <p className="section-subtitle">Choose movement style by speed, comfort, and flexibility.</p>
      <div className="relative mt-7 grid gap-4 md:grid-cols-4">
        <div className="absolute left-8 right-8 top-1/2 hidden h-0.5 -translate-y-1/2 bg-gradient-to-r from-secondary via-primary to-accent md:block" />
        {travelModes.map((mode, index) => (
          <motion.article
            key={mode.title}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.35, delay: index * 0.08 }}
            whileHover={{ y: -5 }}
            className="glass relative rounded-2xl p-5 text-center"
          >
            <motion.p className="text-4xl" animate={{ y: [0, -6, 0] }} transition={{ duration: 2.4, repeat: Infinity, delay: index * 0.2 }}>
              {mode.icon}
            </motion.p>
            <h3 className="mt-3 font-heading text-xl font-semibold text-white light:text-slate-900">{mode.title}</h3>
            <p className="text-sm text-slate-300 light:text-slate-600">{mode.text}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

export default TravelSection;
