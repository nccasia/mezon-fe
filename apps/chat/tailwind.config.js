const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const { join } = require('path');
const Colors = require('../../libs/ui/src/lib/Variables/Colors');
const topBarHeight = '58px';
const chatBoxHeight = '52px';
const chatBoxHeightThread = '60px';
const clanWidth = '72px';
const channelListWidth = '272px';
const memberWidth = '268px';
const avatarWidth = '68px';
const iconWidth = '160px';

const plugin = require('tailwindcss/plugin');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(__dirname, '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}'),
    'node_modules/flowbite-react/lib/esm/**/*.js',
    ...createGlobPatternsForDependencies(__dirname),
  ],
  darkMode: 'class',

  theme: {
    extend: {
      typography: {
        sm: {
          css: {
            color: '#ccc',
            fontSize: '15px',
          },
        },
      },
      spacing: {
        px: '1px',
        0: '0',
        96: '96px',
        210: '210px',
        250: '250px',
      },
      width: {
        // widthWithoutServerWidth: `calc(100vw - ${topBarHeight})`,
        widthMessageViewChat: `calc(100vw - ${clanWidth} - ${channelListWidth} - ${memberWidth})`,
        widthMessageWithUser: `calc(100vw - ${clanWidth} - ${channelListWidth} - ${memberWidth} - ${avatarWidth})`,
        widChatBoxBreak: `calc(100vw - ${clanWidth} - ${channelListWidth} - ${memberWidth} - ${iconWidth})`,
        widthMessageTextChat: `calc(100% - 40px)`,
        widthChannelTypeText: `calc(100% - 10px)`,
        widthSideBar: `calc(100vw - 72px)`,
        widthHeader:`calc(100% - 344px)`,
        450: '450px',
        "4/5": "80%",
        "9/10": "90%",
      },
      height: {
        heightMessageViewChat: `calc(100vh - 72px)`,
        heightMessageViewChatThread: `calc(100vh - ${topBarHeight} - ${chatBoxHeightThread})`,
        heightWithoutTopBar: `calc(100vh - ${topBarHeight})`,
        heightTopBar: topBarHeight,
        heightChatBox: chatBoxHeight,
        heightHeader: "58px",
        "9/10": "90%",
      },

      maxWidth: {
        '9/10': '90%',
        '2/5': "40%",
      },

      maxHeight: {
        '4/5': '80%',
        '9/10': "90%",
        heightInBox: `calc(100vh - 168px)`,
      },

      minHeight: {
        600: '600px',
      },

      fontFamily: {
        notoSans: ['Noto Sans', 'sans-serif'],
      },
      screens: {
        'mobile-s': '320px',
        'mobile-l': '375px',
      },
      fontSize: {
        header: ['5rem', '5rem'],
        headerMobile: ['3.125rem', '3.75rem'],
        subHeaderMobile: '1.563rem',
        contentMobile: '1.25rem',
      },
      colors: Colors,
      transitionDuration: {
        3000: '3000ms',
      },
      keyframes: {
        rotation: {
          '0%': {
            transform: 'rotate3d(0, 1, 0, 0deg)',
          },
          '50%': {
            transform: 'rotate3d(0, 1, 0, 180deg)',
          },
          '100%': {
            transform: 'rotate3d(0, 1, 0, 360deg)',
          },
        },
      },
    },
    animation: {
      rotation: 'rotation 6s linear infinite',
    },
    screens: {
      ssm: "430px",
      sbm:"480px",
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      const newUtilities = {
        '.hide-scrollbar::-webkit-scrollbar': {
          display: 'none',
        },
      };
      addUtilities(newUtilities, ['responsive', 'hover']);
    }),
    require('@tailwindcss/typography'),
  ],
  //   plugins: [require('flowbite/plugin')],
};
