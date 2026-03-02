import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";

function Hero() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 90]);

  return (
    <section className="relative overflow-hidden pb-10 pt-10 md:pb-16 md:pt-16">
      <motion.div style={{ y }} className="absolute inset-0 -z-10">
        <img
          src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=2000&q=80"
          alt="Luxury mountain travel"
          className="h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy/65 via-slate-900/55 to-slate-950/85 light:from-indigo-100/65 light:via-white/55 light:to-slate-100/75" />
      </motion.div>

      <div className="app-container relative">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="max-w-4xl"
        >
          <p className="mb-4 inline-flex rounded-full border border-accent/50 bg-accent/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Premium AI Trip Architect
          </p>
          <h1 className="font-heading text-4xl font-bold leading-tight text-white md:text-6xl light:text-slate-900">
            Elegant travel planning for remarkable journeys.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-200 md:text-lg light:text-slate-600">
            Destina AI crafts itinerary intelligence with luxury aesthetics, personalized routes, and effortless travel execution.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <motion.div whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/register"
                className="rounded-full bg-gradient-to-r from-primary via-secondary to-accent px-6 py-3 text-sm font-semibold text-white shadow-glow"
              >
                Start Planning
              </Link>
            </motion.div>
            <motion.div whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/dashboard"
                className="glass rounded-full px-6 py-3 text-sm font-semibold text-white light:text-slate-800"
              >
                Explore Dashboard
              </Link>
            </motion.div>
          </div>
        </motion.div>

        <motion.div className="absolute -left-8 top-8 h-28 w-28 rounded-full bg-primary/35 blur-2xl" animate={{ y: [0, -14, 0] }} transition={{ duration: 6, repeat: Infinity }} />
        <motion.div className="absolute right-6 top-20 h-24 w-24 rounded-full bg-secondary/35 blur-2xl" animate={{ y: [0, 12, 0] }} transition={{ duration: 5, repeat: Infinity }} />
        <motion.div className="absolute bottom-0 right-16 h-20 w-20 rounded-full bg-accent/30 blur-xl" animate={{ y: [0, -10, 0] }} transition={{ duration: 4.8, repeat: Infinity }} />
      </div>
    </section>
  );
}

export default Hero;
