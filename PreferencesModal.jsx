import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useI18n } from "../i18n";

function PreferencesModal({ open, onClose, initial, onSave }) {
  const { t } = useI18n();
  const [form, setForm] = useState(
    initial || {
      budget_style: "medium",
      interests: ["culture", "food"],
      hotel_type: "boutique",
      food_preferences: ["fusion"]
    }
  );

  const updateInterests = (value) => {
    setForm((prev) => ({ ...prev, interests: value.split(",").map((item) => item.trim()).filter(Boolean) }));
  };

  const updateFood = (value) => {
    setForm((prev) => ({ ...prev, food_preferences: value.split(",").map((item) => item.trim()).filter(Boolean) }));
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="glass w-full max-w-lg rounded-2xl p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="font-heading text-xl font-bold text-white light:text-slate-900">{t("preferences")}</h3>
            <div className="mt-4 space-y-3">
              <select
                value={form.budget_style}
                onChange={(event) => setForm((prev) => ({ ...prev, budget_style: event.target.value }))}
                className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white light:border-slate-300 light:bg-white light:text-slate-900"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <input
                value={form.hotel_type}
                onChange={(event) => setForm((prev) => ({ ...prev, hotel_type: event.target.value }))}
                placeholder="Hotel type"
                className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white light:border-slate-300 light:bg-white light:text-slate-900"
              />
              <input
                value={form.interests.join(", ")}
                onChange={(event) => updateInterests(event.target.value)}
                placeholder="Interests (comma separated)"
                className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white light:border-slate-300 light:bg-white light:text-slate-900"
              />
              <input
                value={form.food_preferences.join(", ")}
                onChange={(event) => updateFood(event.target.value)}
                placeholder="Food preferences (comma separated)"
                className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white light:border-slate-300 light:bg-white light:text-slate-900"
              />
            </div>
            <div className="mt-5 flex items-center gap-3">
              <button onClick={() => onSave(form)} className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white">
                {t("save")}
              </button>
              <button onClick={onClose} className="rounded-full border border-white/20 px-4 py-2 text-sm text-slate-200 light:text-slate-700">
                {t("close")}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default PreferencesModal;
