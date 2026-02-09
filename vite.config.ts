import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: [
        'react',
        'react/jsx-runtime',
        'react-dom',
        'react-dom/client',
        'react-router-dom',
        'lucide-react',
        'date-fns',
        'date-fns/locale',
        'recharts',
        'firebase/app',
        'firebase/auth',
        'firebase/firestore'
      ]
    }
  }
});