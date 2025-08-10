export interface Place {
    id: string;
    name: string;
    address: string; // 주소 정보 추가
}

export interface ChartDataPoint {
    day: number;
    level: number; // 0 ~ 100 사이의 혼잡도 레벨
}

// 30일간의 임시 혼잡도 데이터 생성
export const MOCK_CHART_DATA: ChartDataPoint[] = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    level: Math.random() * 70 + 15, // 15에서 85 사이의 랜덤 값
}));
