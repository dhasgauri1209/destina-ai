import { AnimatePresence, motion } from "framer-motion";

function ToastStack({ toasts, onDismiss }) {
  return (
    <div className="fixed right-4 top-24 z-[90] space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            className="glass w-[280px] rounded-xl px-4 py-3"
          >
            <p className="text-sm font-semibold text-white light:text-slate-900">{toast.title}</p>
            <p className="mt-1 text-xs text-slate-300 light:text-slate-600">{toast.message}</p>
            <button onClick={() => onDismiss(toast.id)} className="mt-2 text-xs text-secondary">
              Dismiss
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default ToastStack;
