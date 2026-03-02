import { motion } from "framer-motion";
import { useEffect, useState } from "react";

function DayPlannerDnd({ itineraryId, items, onSave }) {
  const [list, setList] = useState(items || []);
  const [dragIndex, setDragIndex] = useState(null);

  useEffect(() => {
    setList(items || []);
  }, [items]);

  const onDrop = (dropIndex) => {
    if (dragIndex === null || dragIndex === dropIndex) return;
    const next = [...list];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(dropIndex, 0, moved);
    setDragIndex(null);
    setList(next);
    onSave(itineraryId, next);
  };

  if (!itineraryId || list.length === 0) {
    return null;
  }

  return (
    <section className="glass mt-6 rounded-2xl p-4">
      <h3 className="font-heading text-lg font-semibold text-white light:text-slate-900">Drag & Drop Day Planner</h3>
      <div className="mt-3 space-y-2">
        {list.map((item, index) => (
          <motion.div
            key={`${item.day}-${index}`}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => onDrop(index)}
            whileHover={{ scale: 1.01 }}
            className="rounded-xl border border-white/15 bg-white/5 px-3 py-3"
          >
            <p className="text-xs uppercase tracking-wider text-secondary">Day {item.day}</p>
            <p className="mt-1 text-sm font-semibold text-white light:text-slate-900">{item.title}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export default DayPlannerDnd;
