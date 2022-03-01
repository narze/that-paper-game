const config = {
  content: ["./src/**/*.{html,js,svelte,ts}"],

  theme: {
    extend: {},
  },

  plugins: [require("daisyui")],

  daisyui: {
    // themes: ["light", "dark"],
    themes: false,
  },
};

module.exports = config;
