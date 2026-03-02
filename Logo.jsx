import { motion } from "framer-motion";

function Logo() {
  return (
    <motion.svg
      whileHover={{ scale: 1.08, rotate: -4 }}
      whileTap={{ scale: 0.96 }}
      width="34"
      height="34"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-[0_0_12px_rgba(245,158,11,0.35)]"
      aria-hidden="true"
    >
      <circle cx="32" cy="32" r="30" fill="url(#destinaGradient)" fillOpacity="0.9" />
      <path d="M19 38.5L32 14L45 38.5H38.5L32 26L25.5 38.5H19Z" fill="white" fillOpacity="0.95" />
      <path d="M19 43.5H45" stroke="#FCD34D" strokeWidth="3.4" strokeLinecap="round" />
      <defs>
        <linearGradient id="destinaGradient" x1="8" y1="8" x2="54" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366F1" />
          <stop offset="0.55" stopColor="#0EA5E9" />
          <stop offset="1" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
    </motion.svg>
  );
}

export default Logo;
