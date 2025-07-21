// postcss.config.cjs
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},    // ✅ NEW plugin
    autoprefixer: {},
    'postcss-nested': {},          // ✅ For SCSS-style nesting
  },
};
