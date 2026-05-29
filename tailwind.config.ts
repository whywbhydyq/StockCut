import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx,mdx}', './src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: '#142033',
        muted: '#5a6878',
        panel: '#ffffff',
        line: '#d9e2ec'
      }
    }
  },
  plugins: []
};

export default config;
