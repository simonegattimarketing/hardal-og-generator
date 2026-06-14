import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#141020",
        purple: "#A082FF",
        green: "#E1FF82",
        muted: "#A99FC0",
      },
    },
  },
  plugins: [],
};
export default config;
