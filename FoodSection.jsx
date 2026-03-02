import { motion } from "framer-motion";

const fallbackFoodSpots = [
  { title: "The Gold Table", image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1500&q=80" },
  { title: "Salt & Ember", image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1500&q=80" },
  { title: "Noir Sushi Lounge", image: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=1500&q=80" },
  { title: "Rooftop Brasserie", image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1500&q=80" }
];

function FoodSection({ items }) {
  const foodSpots = items?.length
    ? items.map((item, index) => ({
        title: item.name,
        image: fallbackFoodSpots[index % fallbackFoodSpots.length].image
      }))
    : fallbackFoodSpots;

  return (
    <section className="app-container mt-14">
      <h2 className="section-title">🍽️ Where to eat</h2>
      <p className="section-subtitle">Signature restaurants arranged in a smooth horizontal gallery.</p>
      <motion.div
        initial={{ opacity: 0, x: 18 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.4 }}
        className="no-scrollbar mt-7 flex snap-x gap-4 overflow-x-auto pb-2"
      >
        {foodSpots.map((spot) => (
          <article key={spot.title} className="group relative min-w-[280px] snap-center overflow-hidden rounded-2xl border border-white/20 md:min-w-[340px]">
            <img src={spot.image} alt={spot.title} loading="lazy" className="h-72 w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-45 transition-opacity group-hover:opacity-100" />
            <p className="absolute bottom-4 left-4 translate-y-2 text-lg font-semibold text-white opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">{spot.title}</p>
          </article>
        ))}
      </motion.div>
    </section>
  );
}

export default FoodSection;
