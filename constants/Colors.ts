const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

export default {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
  },
};

export const Colors = {
  backgroundGradient: ['#1A1A2E', '#16213E', '#0F3460'],
  text: '#FFFFFF',
  logo: '#FFFFFF',
  searchBarBg: 'rgba(255, 255, 255, 0.1)',
  searchBarPlaceholder: '#A9A9A9',
  searchIcon: '#E94560',
} as const; // 이 부분을 추가해 주세요.
