import { motion } from "framer-motion";

const fallbackDestinations = [
  { name: "Amalfi Coast", info: "Seaside luxury and cliff villages", image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1500&q=80" },
  { name: "Swiss Alps", info: "Panoramic peaks and scenic rails", image: "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1500&q=80" },
  { name: "Bali Retreat", info: "Private villas and lush escapes", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1500&q=80" }
];

function DestinationSection({ items, weatherByDestination }) {
  const destinations = items?.length ? items : fallbackDestinations;

  return (
    <section className="app-container mt-14">
      <h2 className="section-title">📍 Where to go</h2>
      <p className="section-subtitle">Curated destinations with cinematic visuals and premium detail.</p>
      <div className="mt-7 grid gap-6 md:grid-cols-3">
        {destinations.map((item, index) => {
          const weather = weatherByDestination?.[item.name];
          return (
            <motion.article
              key={item.name}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: index * 0.08, ease: "easeInOut" }}
              whileHover={{ y: -4 }}
              className="group relative overflow-hidden rounded-3xl border border-white/20"
            >
              <img src={item.image} alt={item.name} className="h-80 w-full object-cover transition duration-500 group-hover:scale-110" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <h3 className="font-heading text-2xl font-semibold text-white">{item.name}</h3>
                <p className="text-sm text-slate-200">{item.info}</p>
                {weather && (
                  <p className="mt-1 rounded-full bg-black/35 px-2 py-1 text-xs text-slate-100">
                    {weather.temperature_c ?? "--"}°C · {weather.weather_label}
                  </p>
                )}
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}

export default DestinationSection;
