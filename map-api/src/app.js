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
const VWORLD_API_KEY = '898A5222-BC51-352A-83A6-AD43538E2D39'; // 국토교통부 지오코더 API 키

// 지오코딩 함수 - 주소를 위도경도로 변환
async function geocodeAddress(address) {
    if (!address) return null;
    
    try {
        // 국토교통부 VWorld 지오코더 API 사용
        const vworldResponse = await axios.get('http://api.vworld.kr/req/address', {
            params: {
                service: 'address',
                request: 'getCoord',
                version: '2.0',
                crs: 'epsg:4326',
                address: address,
                format: 'json',
                type: 'road',
                key: VWORLD_API_KEY
            },
            timeout: 5000
        });

        if (vworldResponse.data.response.status === 'OK' && 
            vworldResponse.data.response.result && 
            vworldResponse.data.response.result.point) {
            
            const point = vworldResponse.data.response.result.point;
            return {
                lat: parseFloat(point.y),
                lng: parseFloat(point.x),
                formatted_address: address
            };
        }

        // 대안: Nominatim (OpenStreetMap) - 무료 지오코딩 서비스
        const nominatimResponse = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: {
                q: address,
                format: 'json',
                limit: 1,
                'accept-language': 'ko'
            },
            timeout: 5000,
            headers: {
                'User-Agent': 'MAPro-App/1.0'
            }
        });

        if (nominatimResponse.data && nominatimResponse.data.length > 0) {
            const result = nominatimResponse.data[0];
            return {
                lat: parseFloat(result.lat),
                lng: parseFloat(result.lon),
                formatted_address: result.display_name
            };
        }

        // 지오코딩 실패시 null 반환
        return null;

    } catch (error) {
        console.error('지오코딩 오류:', error.message);
        return null;
    }
}

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
        timestamp: new Date().toISOString(),
        geocoding: GOOGLE_MAPS_API_KEY ? 'Google Maps' : 'Nominatim (OSM)'
    });
});

// 1. 경환이 챗봇에서 상호목록 받는 엔드포인트 (지오코딩 기능 추가)
app.post('/api/chat-places', async (req, res) => {
    try {
        const { places } = req.body;
        
        if (!places || !Array.isArray(places)) {
            return res.status(400).json({ 
                error: '상호목록이 올바르지 않습니다.' 
            });
        }

        console.log(`📍 ${places.length}개 장소의 지오코딩을 시작합니다...`);

        // 각 장소에 대해 지오코딩 수행 (병렬 처리)
        const geocodingPromises = places.map(async (place, index) => {
            const address = place.location || '주소 정보 없음';
            const name = place.name || '알 수 없는 장소';
            
            console.log(`🔍 지오코딩 중: ${name} - ${address}`);
            
            // 지오코딩 수행
            const geocodedLocation = await geocodeAddress(address);
            
            let coordinates;
            let finalAddress = address;
            
            if (geocodedLocation) {
                coordinates = {
                    lat: geocodedLocation.lat,
                    lng: geocodedLocation.lng
                };
                finalAddress = geocodedLocation.formatted_address || address;
                console.log(`✅ 지오코딩 성공: ${name} -> ${coordinates.lat}, ${coordinates.lng}`);
            } else {
                // 지오코딩 실패시 기본 좌표 (서울 시청 주변에 분산 배치)
                coordinates = {
                    lat: 37.5665 + (Math.random() - 0.5) * 0.02,
                    lng: 126.9780 + (Math.random() - 0.5) * 0.02
                };
                console.log(`⚠️ 지오코딩 실패: ${name} - 기본 좌표 사용`);
            }
            
            return {
                id: `chat-place-${index}`,
                name: name,
                location: place.location || '',
                address: finalAddress,
                coordinates: coordinates,
                category: place.category || '기타',
                // 핀 클릭 시 표시할 정보
                info: {
                    phone: place.phone || null,
                    rating: place.rating || null,
                    openHours: place.openHours || null,
                    description: place.description || `${name}에 대한 정보입니다.`,
                    features: place.feature ? place.feature.split(',').map(f => f.trim()).filter(f => f) : []
                },
                // 구글맵 연동
                googleMapsUrl: createGoogleMapsUrl(name, finalAddress, coordinates),
                // 핀 표시 옵션
                pinOptions: {
                    color: place.category === '음식점' ? '#FF6B6B' : 
                           place.category === '카페' ? '#4ECDC4' : 
                           place.category === '병원' ? '#45B7D1' : 
                           place.category === '편의점' ? '#96CEB4' :
                           place.category === '호텔' ? '#9B59B6' :
                           place.category === '헤어샵' ? '#F39C12' :
                           place.category === '약국' ? '#E74C3C' : '#95A5A6',
                    icon: place.category === '음식점' ? 'restaurant' : 
                          place.category === '카페' ? 'local_cafe' : 
                          place.category === '병원' ? 'local_hospital' : 
                          place.category === '편의점' ? 'store' :
                          place.category === '호텔' ? 'hotel' :
                          place.category === '헤어샵' ? 'content_cut' :
                          place.category === '약국' ? 'local_pharmacy' : 'place'
                }
            };
        });

        // 모든 지오코딩 작업 완료 대기
        const placeDetails = await Promise.all(geocodingPromises);

        console.log(`🎯 지오코딩 완료: ${placeDetails.length}개 장소`);

        res.json({
            success: true,
            places: placeDetails,
            count: placeDetails.length,
            source: 'chatbot',
            geocoding_info: {
                service: GOOGLE_MAPS_API_KEY ? 'Google Maps API' : 'Nominatim (OpenStreetMap)',
                success_count: placeDetails.filter(p => p.coordinates.lat !== 37.5665).length,
                failed_count: placeDetails.filter(p => Math.abs(p.coordinates.lat - 37.5665) < 0.01).length
            }
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
        const mockAddresses = [
            `${location || '서울특별시'} 강남구 테헤란로 427`,
            `${location || '서울특별시'} 서초구 서초대로 398`
        ];

        const geocodingPromises = mockAddresses.map(async (address, index) => {
            const geocoded = await geocodeAddress(address);
            const coordinates = geocoded ? 
                { lat: geocoded.lat, lng: geocoded.lng } : 
                { lat: 37.5665 + (index * 0.01), lng: 126.9780 + (index * 0.01) };

            return {
                id: `search-${index + 1}`,
                name: `${keyword} ${index + 1}호점`,
                category: keyword.includes('카페') ? '카페' : '음식점',
                location: location || '서울',
                address: geocoded ? geocoded.formatted_address : address,
                coordinates: coordinates,
                info: {
                    phone: `02-${1000 + index}${2000 + index}`,
                    rating: 4.2 + (index * 0.3),
                    openHours: index === 0 ? '09:00 - 22:00' : '08:00 - 23:00',
                    description: `${index === 0 ? '맛있는' : '분위기 좋은'} ${keyword}를 제공하는 곳입니다.`,
                    features: index === 0 ? ['WiFi', '주차가능', '포장가능'] : ['24시간', 'WiFi', '배달가능']
                },
                googleMapsUrl: createGoogleMapsUrl(`${keyword} ${index + 1}호점`, address, coordinates),
                pinOptions: {
                    color: keyword.includes('카페') ? '#4ECDC4' : '#FF6B6B',
                    icon: keyword.includes('카페') ? 'local_cafe' : 'restaurant'
                }
            };
        });

        const mockPlaces = await Promise.all(geocodingPromises);

        res.json({
            success: true,
            places: mockPlaces,
            count: mockPlaces.length,
            keyword: keyword,
            searchLocation: location,
            source: 'search',
            note: 'Mock data with real geocoding'
        });

    } catch (error) {
        console.error('지도 검색 오류:', error);
        res.status(500).json({ 
            error: '검색 중 오류가 발생했습니다.',
            details: error.message 
        });
    }
});

// 3. 단일 주소 지오코딩 엔드포인트
app.post('/api/geocoding', async (req, res) => {
    try {
        const { address } = req.body;
        
        if (!address) {
            return res.status(400).json({ 
                error: '주소가 필요합니다.' 
            });
        }

        const geocoded = await geocodeAddress(address);

        if (geocoded) {
            res.json({
                success: true,
                coordinates: {
                    lat: geocoded.lat,
                    lng: geocoded.lng
                },
                address: address,
                formatted_address: geocoded.formatted_address,
                googleMapsUrl: createGoogleMapsUrl('검색 위치', address, { lat: geocoded.lat, lng: geocoded.lng })
            });
        } else {
            res.json({
                success: false,
                error: '주소를 찾을 수 없습니다.',
                coordinates: null
            });
        }

    } catch (error) {
        console.error('지오코딩 오류:', error);
        res.status(500).json({ 
            error: '좌표 변환 중 오류가 발생했습니다.' 
        });
    }
});

// 4. Python에서 장소 데이터를 받는 엔드포인트 (지오코딩 적용)
app.post('/api/receive-places', async (req, res) => {
    try {
        const places = req.body;
        
        console.log('Python에서 받은 장소 데이터:', places);
        
        // 지오코딩 병렬 처리
        const geocodingPromises = places.map(async (place, index) => {
            const address = place.location || '주소 정보 없음';
            const name = place.name || '알 수 없는 장소';
            
            const geocoded = await geocodeAddress(address);
            
            const coordinates = geocoded ? 
                { lat: geocoded.lat, lng: geocoded.lng } : 
                { lat: 37.5665 + (index * 0.01), lng: 126.9780 + (index * 0.01) };
                
            const finalAddress = geocoded ? geocoded.formatted_address : address;
            
            return {
                id: `python-place-${index}`,
                name: name,
                location: place.location || '',
                address: finalAddress,
                coordinates: coordinates,
                category: place.category || '기타',
                info: {
                    phone: place.phone || null,
                    rating: place.rating || null,
                    openHours: place.openHours || null,
                    description: place.description || `${name}에 대한 정보입니다.`,
                    features: place.features || []
                },
                googleMapsUrl: createGoogleMapsUrl(name, finalAddress, coordinates),
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

        const formattedPlaces = await Promise.all(geocodingPromises);

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
        
        // 임시 상세 정보 반환
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
                photos: []
            },
            googleMapsUrl: createGoogleMapsUrl('상세 정보 테스트', '서울특별시 강남구 테헤란로 427', { lat: 37.5665, lng: 126.9780 }),
            reviews: []
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
    console.log(`📍 Geocoding: ${GOOGLE_MAPS_API_KEY ? 'Google Maps API' : 'Nominatim (OSM)'}`);
});