export default {
  plugins: {
    // Tailwind v4 moved the PostCSS plugin to a separate package.
    // Use the new package name so PostCSS can find it when processing third-party CSS.
    "@tailwindcss/postcss": {},
    autoprefixer: {},
  },
}