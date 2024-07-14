import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    sourcemapIgnoreList: (path) => {
      if (path.includes('bootstrap.min.css') || path.includes('bootstrap.min.js')) {
        return true;
      }
      return false;
    },
  },
});