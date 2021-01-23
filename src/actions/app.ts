import '../variables.scss';
import { JdenticonConfigMap, ThemeMap } from '../types';

declare const window: any;

export const setTheme = (theme: string) => {
  localStorage.setItem('pairist-theme-selection', theme);

  const jdenticonConfigMap: JdenticonConfigMap = {
    light: {
      replaceMode: "observe",
      lightness: {grayscale: [0.30, 0.90]}
    },
    dark: {
      replaceMode: "observe",
      lightness: {grayscale: [0.60, 1.0]}
    }
  }

  const sharedColors: ThemeMap = {
    '--color-header-button': 'rgb(239, 246, 245)',
    '--color-tertiary': '#ebf4f7',
  };

  const lightThemeColors: ThemeMap = {
    ...sharedColors,
    '--color-text': '#000',
    '--color-primary': '#243640',
    '--color-secondary': '#23807a',
    '--color-danger': '#992916',
    '--color-theme': '#fff',
    '--color-border': 'rgb(212, 212, 212)',
    '--color-box-shadow': '0, 0, 0',
    '--color-app-background': '#f2f2f2',
  };

  const darkThemeColors: ThemeMap = {
    ...sharedColors,
    '--color-text': '#fff',
    '--color-primary': '#245057',
    '--color-secondary': '#05a39b',
    '--color-danger': '#ffcccb',
    '--color-theme': '#2a2c2d',
    '--color-border': 'rgb(150, 150, 150)',
    '--color-box-shadow': '255, 255, 255',
    '--color-app-background': '#0f0d13',
  };

  window.jdenticon_config = jdenticonConfigMap[theme];

  const themeColors = theme === 'dark' ? darkThemeColors : lightThemeColors;
  Object.keys(themeColors).forEach((key) => {
    document
      .documentElement
      .style
      .setProperty(key, themeColors[key]);
  });
}
