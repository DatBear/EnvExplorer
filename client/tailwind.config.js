/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [
    require('@headlessui/tailwindcss'),
    require('tailwindcss-themer')({
      defaultTheme: {
        extend: {
          colors: {
            primary: {
              300: 'rgb(110 231 183)',
              700: 'rgb(4 120 87)',
              800: 'rgb(6 95 70)'
            },
            secondary: {
              400: 'rgb(168 162 158)',
              600: 'rgb(87 83 78)',
              800: 'rgb(41 37 36)',
              900: 'rgb(28 25 23)',
            }
          }
        }
      },
      themes: [{
        name: 'theme-red',
        extend: {
          colors: {
            primary: {
              300: '#fca5a5',
              700: '#b91c1c',
              800: '#991b1b'
            },
            secondary: {
              400: 'rgb(168 162 158)',
              600: 'rgb(87 83 78)',
              800: 'rgb(41 37 36)',
              900: 'rgb(28 25 23)',
            }
          }
        }
      }]
    })
  ],
}

