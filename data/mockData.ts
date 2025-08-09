export interface Place {
    id: string;
    name: string;
    address: string; // 주소 정보 추가
    imageUrl?: string; // 이미지 URL 추가
}

export const MOCK_PLACES: Place[] = [
    { 
        id: '1', 
        name: 'Gyeongbokgung', 
        address: '161 Sajik-ro, Jongno-gu, Seoul',
        imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop&q=80'
    },
    { 
        id: '2', 
        name: 'Bukchon Hanok Village', 
        address: 'Gyedong-gil, Jongno-gu, Seoul',
        imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=250&fit=crop&q=80'
    },
    { 
        id: '3', 
        name: 'N Seoul Tower', 
        address: '105 Namsangongwon-gil, Yongsan-gu, Seoul',
        imageUrl: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=400&h=250&fit=crop&q=80'
    },
    { 
        id: '4', 
        name: 'Myeongdong Shopping Street', 
        address: 'Myeongdong-gil, Jung-gu, Seoul',
        imageUrl: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=400&h=250&fit=crop&q=80'
    },
    { 
        id: '5', 
        name: 'Hongdae', 
        address: 'Hongik-ro, Mapo-gu, Seoul',
        imageUrl: 'https://images.unsplash.com/photo-1574594723019-f47c3cbb7d6e?w=400&h=250&fit=crop&q=80'
    },
    { 
        id: '6', 
        name: 'Gangnam District', 
        address: 'Gangnam-daero, Gangnam-gu, Seoul',
        imageUrl: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=400&h=250&fit=crop&q=80'
    },
    { 
        id: '7', 
        name: 'Itaewon', 
        address: 'Itaewon-ro, Yongsan-gu, Seoul',
        imageUrl: 'https://images.unsplash.com/photo-1525059696034-4967a729002e?w=400&h=250&fit=crop&q=80'
    },
    { 
        id: '8', 
        name: 'Dongdaemun Market', 
        address: '253 Jangchungdan-ro, Jung-gu, Seoul',
        imageUrl: 'https://images.unsplash.com/photo-1553570739-330b8db8d64e?w=400&h=250&fit=crop&q=80'
    },
    { 
        id: '9', 
        name: 'Insadong', 
        address: 'Insadong-gil, Jongno-gu, Seoul',
        imageUrl: 'https://images.unsplash.com/photo-1529590025858-c4259103b5a3?w=400&h=250&fit=crop&q=80'
    },
];
// ... (기존 Place 인터페이스 및 데이터)

export interface ChartDataPoint {
    day: number;
    level: number; // 0 ~ 100 사이의 혼잡도 레벨
}

// 30일간의 임시 혼잡도 데이터 생성
export const MOCK_CHART_DATA: ChartDataPoint[] = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    level: Math.random() * 70 + 15, // 15에서 85 사이의 랜덤 값
}));
