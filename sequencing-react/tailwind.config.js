/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fiori: {
          primary: '#0A6ED1',      // Vibrant SAP Blue
          primaryDark: '#0854A1',
          orange: '#E06B00',       // KD color
          cyan: '#00857A',         // TVL color / Teal
          success: '#2B7D2B',      // Clean SAP Success Green
          warning: '#E9730C',      // Alert Amber
          error: '#BB0000',        // Alert Red
          bgLight: '#EFF3F6',      // SAP Shell Background
          textDark: '#32363A',     // Fiori main text
          textMuted: '#6A6D70',    // Secondary text
          borderLight: '#CAD8E2',  // Shell Borders
        }
      }
    },
  },
  plugins: [],
}
