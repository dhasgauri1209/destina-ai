/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        heading: ["Poppins", "sans-serif"]
      },
      colors: {
        primary: "#6366F1",
        secondary: "#0EA5E9",
        accent: "#F59E0B",
        navy: "#0b1225",
        silver: "#cbd5e1"
      },
      boxShadow: {
        glass: "0 20px 60px rgba(2, 6, 23, 0.35)",
        glow: "0 0 32px rgba(245, 158, 11, 0.26)",
        soft: "0 12px 28px rgba(15, 23, 42, 0.18)"
      },
      backgroundImage: {
        metallic: "linear-gradient(110deg, rgba(245,158,11,0.2), rgba(203,213,225,0.14), rgba(99,102,241,0.2))"
      },
      keyframes: {
        floatSlow: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-16px)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "100% 50%" }
        }
      },
      animation: {
        floatSlow: "floatSlow 6s ease-in-out infinite",
        shimmer: "shimmer 3s linear infinite"
      }
    }
  },
  plugins: [
    function ({ addVariant }) {
      addVariant("light", "html.light &");
    }
  ]
};
