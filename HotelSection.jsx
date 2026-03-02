import { motion } from "framer-motion";

const fallbackHotels = [
  { name: "Velora Grand", rating: "4.9", price: "$320/night", image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1500&q=80" },
  { name: "Azure Meridian", rating: "4.8", price: "$280/night", image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1500&q=80" },
  { name: "Noir Palazzo", rating: "4.7", price: "$260/night", image: "https://images.unsplash.com/photo-1549294413-26f195200c16?auto=format&fit=crop&w=1500&q=80" }
];

function HotelSection({ items }) {
  const hotels = items?.length
    ? items.map((item, index) => ({
        ...item,
        image: fallbackHotels[index % fallbackHotels.length].image,
        price: item.price || `$${Math.round(item.price_per_night || 220)}/night`
      }))
    : fallbackHotels;

  return (
    <section className="app-container mt-14">
      <h2 className="section-title">🏨 Where to stay</h2>
      <p className="section-subtitle">Luxury accommodations with transparent pricing and trusted reviews.</p>
      <div className="mt-7 grid gap-6 md:grid-cols-3">
        {hotels.map((hotel, index) => (
          <motion.article
            key={hotel.name}
            initial={{ opacity: 0, x: -22 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, delay: index * 0.1, ease: "easeInOut" }}
            className="glass group rounded-3xl p-4 hover:border-accent/50 hover:shadow-glow"
          >
            <img src={hotel.image} alt={hotel.name} className="h-60 w-full rounded-2xl object-cover" loading="lazy" />
            <div className="mt-4 flex items-start justify-between">
              <div>
                <h3 className="font-heading text-xl font-semibold text-white light:text-slate-900">{hotel.name}</h3>
                <p className="mt-1 text-sm text-slate-300 light:text-slate-600">⭐ {hotel.rating}</p>
              </div>
              <span className="rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold text-accent">{hotel.price}</span>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

export default HotelSection;
