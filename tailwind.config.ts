import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        stock: {
          ink: '#201a14',
          muted: '#6f6255',
          paper: '#fffaf2',
          line: '#e3d5c3',
          accent: '#8a4f22',
          ok: '#2f6c46',
          warn: '#a4421f'
        }
      }
    }
  },
  plugins: []
};
export default config;
