export interface Place {
    id: string;
    name: string;
    address: string; // 주소 정보 추가
}

export const MOCK_PLACES: Place[] = [
    { id: '1', name: 'Gyeongbokgung', address: '161 Sajik-ro, Jongno-gu, Seoul' },
    { id: '2', name: 'Bukchon Hanok Village', address: 'Gyedong-gil, Jongno-gu, Seoul' },
    { id: '3', name: 'N Seoul Tower', address: '105 Namsangongwon-gil, Yongsan-gu, Seoul' },
    { id: '4', name: 'Myeongdong Shopping Street', address: 'Myeongdong-gil, Jung-gu, Seoul' },
    { id: '5', name: 'Hongdae', address: 'Hongik-ro, Mapo-gu, Seoul' },
    { id: '6', name: 'Gangnam District', address: 'Gangnam-daero, Gangnam-gu, Seoul' },
    { id: '7', name: 'Itaewon', address: 'Itaewon-ro, Yongsan-gu, Seoul' },
    { id: '8', name: 'Dongdaemun Market', address: '253 Jangchungdan-ro, Jung-gu, Seoul' },
    { id: '9', name: 'Insadong', address: 'Insadong-gil, Jongno-gu, Seoul' },
];
