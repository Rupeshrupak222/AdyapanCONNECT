import type { Config } from 'tailwindcss';
const config: Config = { darkMode: ['class'], content: ['./app/**/*.{ts,tsx}','./components/**/*.{ts,tsx}'], theme: { extend: { colors: { brand: { 600: '#16a34a', 700: '#15803d' } } } }, plugins: [require('tailwindcss-animate')] };
export default config;
