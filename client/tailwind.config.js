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
              300: '#6ee7b7',//emerald-300
              700: '#047857',//emerald-700
              800: '#065f46',//emerald-800
            },
            secondary: {
              400: '#a8a29e',
              600: '#57534e',
              800: '#292524',
              900: '#1c1917',
              'black': 'black'
            },
            white: 'white',
            black: 'black'
          }
        }
      },
      themes: [
        {
          name: 'theme-light',
          extend: {
            colors: {
              primary: {
                300: '#d1fae5',//emerald-100
                700: '#10b981',//emerald-500
                800: '#059669'//emerald-600
              },
              secondary: {
                400: '#4b5563',//gray-600
                600: '#5eead4',//teal-300
                800: '#2dd4bf',//teal-400
                900: '#14b8a6',//teal-500
                'black': '#ccfbf1'//teal-100
              },
              black: '#334155',
              white: '#020617'
            }
          }
        },
        {
          name: 'theme-red',
          extend: {
            colors: {
              primary: {
                300: '#fca5a5',
                700: '#b91c1c',
                800: '#991b1b'
              },
            }
          }
        },
        {
          name: 'theme-orange',
          extend: {
            colors: {
              primary: {
                300: '#fdba74',
                700: '#c2410c',
                800: '#7c2d12'
              },
            }
          }
        },
        {
          name: 'theme-yellow',
          extend: {
            colors: {
              primary: {
                300: '#fef08a',
                700: '#eab308',
                800: '#ca8a04'
              },
            }
          }
        }]
    })
  ],
}

