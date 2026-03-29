/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warna kustom dari desain Anda (opsional, bisa ditambahkan nanti)
        primary: "#003f87",
        "primary-container": "#0056b3",
        surface: "#f8f9fa",
        "on-surface": "#191c1d",
        // tambahkan warna lain sesuai kebutuhan
      },
      fontFamily: {
        headline: ["Manrope", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
}
