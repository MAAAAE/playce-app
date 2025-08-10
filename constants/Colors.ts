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
  // 이전 밝은 버전 참고: ['#0D1B2A', '#123A52', '#219EBC', '#F3A261', '#DA57B6', '#3A1F5D', '#171524']
  // 약 15% 어둡게 조정된 버전 (동일 톤 유지)
  backgroundGradient: ['#0B1723', '#0F3145', '#1C86A0', '#CE8952', '#B94A9B', '#311A4F', '#13121E'],
  background: '#0D0D12',
  text: '#FFFFFF',
  secondaryText: '#E8E8E8',
  logo: '#E8E8E8',
  searchBarBg: 'rgba(255, 255, 255, 0.16)',
  searchBarPlaceholder: '#E8E8E8',
  searchIcon: '#E8E8E8',
  cardBg: 'rgba(0, 0, 0, 0.8)',
  // 웨이브에 사용할 반투명 색상을 추가합니다.
  wave: {
    wave1: 'rgba(22, 33, 62, 0.5)', // #16213E의 반투명 버전
    wave2: 'rgba(15, 52, 96, 0.5)', // #0F3460의 반투명 버전
  }
} as const;
