import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

const fallbackPlans = [
  { day: 1, title: "Arrival + Signature Welcome", description: "Airport concierge, suite check-in, sunset lounge and welcome dinner." },
  { day: 2, title: "Exploration + Luxury Route", description: "Premium transport, guided highlights, artisanal lunch and skyline evening." },
  { day: 3, title: "Culture + Culinary Collection", description: "Museum curation, local dining trail and handcrafted shopping lanes." },
  { day: 4, title: "Leisure + Departure", description: "Spa brunch, final exploration block and seamless airport transfer." }
];

function DayPlanSection({ items }) {
  const plans = items?.length ? items : fallbackPlans;
  const [openDay, setOpenDay] = useState(plans[0]?.day || 1);

  return (
    <section className="app-container mt-14 pb-10">
      <h2 className="section-title">🗓️ What to do each day</h2>
      <p className="section-subtitle">Refined day-wise structure with elegant expandable timeline.</p>
      <div className="relative mt-7 space-y-4 border-l border-accent/40 pl-5">
        {plans.map((plan, index) => {
          const open = openDay === plan.day;
          return (
            <motion.article
              key={plan.day}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="glass rounded-2xl p-4"
            >
              <button className="flex w-full items-center justify-between text-left" onClick={() => setOpenDay(open ? 0 : plan.day)}>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Day {plan.day}</p>
                  <h3 className="mt-1 font-heading text-lg font-semibold text-white light:text-slate-900">{plan.title}</h3>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xl text-secondary">{open ? "−" : "+"}</span>
              </button>
              <AnimatePresence initial={false}>
                {open && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden pt-3 text-sm leading-7 text-slate-300 light:text-slate-600"
                  >
                    {plan.description}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}

export default DayPlanSection;
