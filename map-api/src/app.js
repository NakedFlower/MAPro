const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS 설정
app.use(cors({
    origin: [
        'http://34.64.120.99:3000',
        'http://localhost:3000',
        'http://127.0.0.1:3000'
    ],
    credentials: true
}));

app.use(express.json());

// 환경변수 설정
const PYTHON_CHAT_API = process.env.PYTHON_CHAT_API || 'http://34.64.120.99:8000';
const JAVA_BACKEND_API = process.env.JAVA_BACKEND_API || 'http://34.64.120.99:4000';

// 구글맵 URL 생성 헬퍼 함수
const createGoogleMapsUrl = (name, address, coordinates) => {
    if (coordinates && coordinates.lat && coordinates.lng) {
        return `https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`;
    }
    const query = encodeURIComponent(`${name} ${address}`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
};

// 헬스체크
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        service: 'map-api',
        timestamp: new Date().toISOString()
    });
});

// 1. 경환이 챗봇에서 상호목록 받는 엔드포인트
app.post('/api/chat-places', async (req, res) => {
    try {
        const { places } = req.body;
        
        if (!places || !Array.isArray(places)) {
            return res.status(400).json({ 
                error: '상호목록이 올바르지 않습니다.' 
            });
        }

        // 핀 정보창과 구글맵 연동을 위한 상세 정보 포함
        const placeDetails = places.map((place, index) => {
            const coordinates = place.coordinates || { lat: 37.5665 + (index * 0.01), lng: 126.9780 + (index * 0.01) };
            const address = place.address || place.location || '주소 정보 없음';
            
            return {
                id: `chat-place-${index}`,
                name: place.name || '알 수 없는 장소',
                location: place.location || '',
                address: address,
                coordinates: coordinates,
                category: place.category || '기타',
                // 핀 클릭 시 표시할 정보
                info: {
                    phone: place.phone || null,
                    rating: place.rating || null,
                    openHours: place.openHours || null,
                    description: place.description || `${place.name || '장소'}에 대한 정보입니다.`,
                    features: place.features || []
                },
                // 구글맵 연동
                googleMapsUrl: createGoogleMapsUrl(place.name, address, coordinates),
                // 핀 표시 옵션
                pinOptions: {
                    color: place.category === '음식점' ? '#FF6B6B' : 
                           place.category === '카페' ? '#4ECDC4' : 
                           place.category === '병원' ? '#45B7D1' : '#96CEB4',
                    icon: place.category === '음식점' ? 'restaurant' : 
                          place.category === '카페' ? 'local_cafe' : 
                          place.category === '병원' ? 'local_hospital' : 'place'
                }
            };
        });

        res.json({
            success: true,
            places: placeDetails,
            count: placeDetails.length,
            source: 'chatbot'
        });

    } catch (error) {
        console.error('챗봇 상호목록 처리 오류:', error);
        res.status(500).json({ 
            error: '서버 오류가 발생했습니다.',
            details: error.message 
        });
    }
});

// 2. 지도 검색 기능 (독립적인 검색창용)
app.get('/api/places/search', async (req, res) => {
    try {
        const { keyword, location } = req.query;
        
        if (!keyword) {
            return res.status(400).json({ 
                error: '검색 키워드가 필요합니다.' 
            });
        }

        // 임시 모의 데이터 (실제 검색 결과와 유사한 형태)
        const mockPlaces = [
            {
                id: 'search-1',
                name: `${keyword} 1호점`,
                category: keyword.includes('카페') ? '카페' : '음식점',
                location: location || '서울',
                address: `${location || '서울특별시'} 강남구 테헤란로 427`,
                coordinates: { lat: 37.5665, lng: 126.9780 },
                info: {
                    phone: '02-1234-5678',
                    rating: 4.2,
                    openHours: '09:00 - 22:00',
                    description: `맛있는 ${keyword}를 제공하는 곳입니다.`,
                    features: ['WiFi', '주차가능', '포장가능']
                },
                googleMapsUrl: createGoogleMapsUrl(`${keyword} 1호점`, `${location || '서울특별시'} 강남구 테헤란로 427`, { lat: 37.5665, lng: 126.9780 }),
                pinOptions: {
                    color: keyword.includes('카페') ? '#4ECDC4' : '#FF6B6B',
                    icon: keyword.includes('카페') ? 'local_cafe' : 'restaurant'
                }
            },
            {
                id: 'search-2',
                name: `${keyword} 2호점`,
                category: keyword.includes('카페') ? '카페' : '음식점',
                location: location || '서울',
                address: `${location || '서울특별시'} 서초구 서초대로 398`,
                coordinates: { lat: 37.5645, lng: 126.9751 },
                info: {
                    phone: '02-8765-4321',
                    rating: 4.5,
                    openHours: '08:00 - 23:00',
                    description: `분위기 좋은 ${keyword} 전문점입니다.`,
                    features: ['24시간', 'WiFi', '배달가능']
                },
                googleMapsUrl: createGoogleMapsUrl(`${keyword} 2호점`, `${location || '서울특별시'} 서초구 서초대로 398`, { lat: 37.5645, lng: 126.9751 }),
                pinOptions: {
                    color: keyword.includes('카페') ? '#4ECDC4' : '#FF6B6B',
                    icon: keyword.includes('카페') ? 'local_cafe' : 'restaurant'
                }
            }
        ];

        res.json({
            success: true,
            places: mockPlaces,
            count: mockPlaces.length,
            keyword: keyword,
            searchLocation: location,
            source: 'search',
            note: 'Mock data - 실제 검색 기능은 추후 구현'
        });

    } catch (error) {
        console.error('지도 검색 오류:', error);
        res.status(500).json({ 
            error: '검색 중 오류가 발생했습니다.',
            details: error.message 
        });
    }
});

// 3. 좌표 변환 서비스
app.post('/api/geocoding', async (req, res) => {
    try {
        const { address } = req.body;
        
        if (!address) {
            return res.status(400).json({ 
                error: '주소가 필요합니다.' 
            });
        }

        // 임시 모의 좌표 반환
        res.json({
            success: true,
            coordinates: { lat: 37.5665, lng: 126.9780 },
            address: address,
            googleMapsUrl: createGoogleMapsUrl('검색 위치', address, { lat: 37.5665, lng: 126.9780 }),
            note: 'Mock coordinates - 실제 지오코딩은 추후 구현'
        });

    } catch (error) {
        console.error('지오코딩 오류:', error);
        res.status(500).json({ 
            error: '좌표 변환 중 오류가 발생했습니다.' 
        });
    }
});

// 4. Python에서 장소 데이터를 받는 엔드포인트
app.post('/api/receive-places', (req, res) => {
    try {
        const places = req.body;
        
        console.log('Python에서 받은 장소 데이터:', places);
        
        // 핀 정보창과 구글맵 연동을 위한 상세 정보 포함
        const formattedPlaces = places.map((place, index) => {
            const coordinates = place.coordinates || { lat: 37.5665 + (index * 0.01), lng: 126.9780 + (index * 0.01) };
            const address = place.address || place.location || '주소 정보 없음';
            const name = place.name || '알 수 없는 장소';
            
            return {
                id: `python-place-${index}`,
                name: name,
                location: place.location || '',
                address: address,
                coordinates: coordinates,
                category: place.category || '기타',
                // 핀 클릭 시 표시할 정보
                info: {
                    phone: place.phone || null,
                    rating: place.rating || null,
                    openHours: place.openHours || null,
                    description: place.description || `${name}에 대한 정보입니다.`,
                    features: place.features || []
                },
                // 구글맵 연동
                googleMapsUrl: createGoogleMapsUrl(name, address, coordinates),
                // 핀 표시 옵션
                pinOptions: {
                    color: place.category === '음식점' ? '#FF6B6B' : 
                           place.category === '카페' ? '#4ECDC4' : 
                           place.category === '병원' ? '#45B7D1' : '#96CEB4',
                    icon: place.category === '음식점' ? 'restaurant' : 
                          place.category === '카페' ? 'local_cafe' : 
                          place.category === '병원' ? 'local_hospital' : 'place'
                }
            };
        });

        res.json({
            success: true,
            places: formattedPlaces,
            count: formattedPlaces.length,
            source: 'python'
        });

    } catch (error) {
        console.error('장소 데이터 처리 오류:', error);
        res.status(500).json({ 
            error: '장소 데이터 처리 중 오류가 발생했습니다.',
            details: error.message 
        });
    }
});

// 5. 특정 장소 상세 정보 조회
app.get('/api/place/:id', (req, res) => {
    try {
        const { id } = req.params;
        
        // 임시 상세 정보 반환 (실제로는 데이터베이스에서 조회)
        const placeDetail = {
            id: id,
            name: '상세 정보 테스트',
            address: '서울특별시 강남구 테헤란로 427',
            coordinates: { lat: 37.5665, lng: 126.9780 },
            category: '음식점',
            info: {
                phone: '02-1234-5678',
                rating: 4.3,
                openHours: '10:00 - 22:00',
                description: '맛있는 음식을 제공하는 레스토랑입니다.',
                features: ['WiFi', '주차가능', '포장가능', '배달가능'],
                photos: [] // 추후 이미지 URL 배열
            },
            googleMapsUrl: createGoogleMapsUrl('상세 정보 테스트', '서울특별시 강남구 테헤란로 427', { lat: 37.5665, lng: 126.9780 }),
            reviews: [] // 추후 리뷰 데이터
        };

        res.json({
            success: true,
            place: placeDetail
        });

    } catch (error) {
        console.error('장소 상세 정보 조회 오류:', error);
        res.status(500).json({ 
            error: '장소 정보를 가져올 수 없습니다.' 
        });
    }
});

// 에러 핸들링 미들웨어
app.use((error, req, res, next) => {
    console.error('서버 오류:', error);
    res.status(500).json({ 
        error: '내부 서버 오류',
        timestamp: new Date().toISOString()
    });
});

// 404 핸들링
app.use('*', (req, res) => {
    res.status(404).json({ 
        error: '엔드포인트를 찾을 수 없습니다.',
        path: req.originalUrl
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🗺️  Map API Server running on port ${PORT}`);
    console.log(`🔗 Python Chat API: ${PYTHON_CHAT_API}`);
    console.log(`🔗 Java Backend API: ${JAVA_BACKEND_API}`);
});