// postcss.config.js
import autoprefixer from 'autoprefixer';
import tailwindPostcss from '@tailwindcss/postcss'; // new import

export default {
  plugins: [
    tailwindPostcss(),  // Use @tailwindcss/postcss instead of tailwindcss
    autoprefixer(),
  ],
};
