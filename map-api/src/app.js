const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS 설정
app.use(cors({
    origin: [
        'http://mapro.cloud:3000',
        'http://localhost:3000',
        'http://127.0.0.1:3000'
    ],
    credentials: true
}));

app.use(express.json());

// 환경변수 설정
const PYTHON_CHAT_API = process.env.PYTHON_CHAT_API || 'http://mapro.cloud:8000';
const JAVA_BACKEND_API = process.env.JAVA_BACKEND_API || 'http://mapro.cloud:4000';
const VWORLD_API_KEY = '898A5222-BC51-352A-83A6-AD43538E2D39'; // 국토교통부 지오코더 API 키

// 주소 전처리 함수
function preprocessAddress(address) {
    if (!address) return address;
    
    // "대한민국" 제거 및 한국 주소 형식으로 변환
    let cleaned = address
        .replace(/^대한민국\s*/, '')  // "대한민국" 제거
        .replace(/경기도\s*성남시\s*분당구/, '경기 성남시 분당구')  // 지역 형식 통일
        .replace(/경기도\s*/, '경기 ')  // 경기도 → 경기
        .trim();
    
    return cleaned;
}

// 지오코딩 함수 - 주소를 위도경도로 변환
async function geocodeAddress(address) {
    if (!address) {
        return null;
    }
    
    // 주소 전처리
    const cleanedAddress = preprocessAddress(address);
    
    try {
        // 국토교통부 VWorld 지오코더 API 사용
        const vworldResponse = await axios.get('http://api.vworld.kr/req/address', {
            params: {
                service: 'address',
                request: 'getCoord',
                version: '2.0',
                crs: 'epsg:4326',
                address: cleanedAddress,
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
            const result = {
                lat: parseFloat(point.y),
                lng: parseFloat(point.x),
                formatted_address: cleanedAddress
            };
            return result;
        }

        // 대안: Nominatim (OpenStreetMap) - 무료 지오코딩 서비스
        const nominatimResponse = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: {
                q: cleanedAddress,
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
            const geocoded = {
                lat: parseFloat(result.lat),
                lng: parseFloat(result.lon),
                formatted_address: result.display_name
            };
            return geocoded;
        }

        // 지오코딩 실패시 null 반환
        return null;

    } catch (error) {
        console.error(`지오코딩 오류 (${cleanedAddress}):`, error.message);
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
        geocoding: 'VWorld (국토교통부) + Nominatim (OSM)'
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

        console.log(`📍 ${places.length}개 장소 지오코딩 시작`);

        // 각 장소에 대해 지오코딩 수행 (병렬 처리)
        const geocodingPromises = places.map(async (place, index) => {
            const address = place.location || '주소 정보 없음';
            const name = place.name || '알 수 없는 장소';
            
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
            } else {
                // 지오코딩 실패시 해당 장소 제외
                return null;
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
                // 구글맵 연동 제거
                // googleMapsUrl: createGoogleMapsUrl(name, finalAddress, coordinates),
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
        const placeDetails = (await Promise.all(geocodingPromises)).filter(place => place !== null);

        const totalRequested = places.length;
        const successCount = placeDetails.length;
        const failedCount = totalRequested - successCount;
        
        console.log(`🎯 지오코딩 완료: 성공 ${successCount}개, 실패 ${failedCount}개`);
        
        // 성공한 장소들의 좌표 정보 로그 출력 (프론트엔드 디버깅용)
        placeDetails.forEach((place, index) => {
            console.log(`📍 ${index + 1}. ${place.name}: ${place.coordinates.lat}, ${place.coordinates.lng}`);
        });

        // 실패한 장소가 있으면 클라이언트에 알림
        if (failedCount > 0) {
            const response = {
                success: false,
                error: `${failedCount}개 장소의 위도경도 추출에 실패했습니다. 핀을 찍을 수 없습니다.`,
                places: placeDetails,
                count: placeDetails.length,
                failed_count: failedCount,
                source: 'chatbot'
            };
            return res.json(response);
        }

        const response = {
            success: true,
            places: placeDetails,
            count: placeDetails.length,
            source: 'chatbot',
            geocoding_info: {
                service: 'VWorld (국토교통부) + Nominatim (OpenStreetMap)',
                success_count: successCount,
                failed_count: failedCount
            }
        };
        
        res.json(response);

    } catch (error) {
        console.error('챗봇 상호목록 처리 오류:', error);
        res.status(500).json({ 
            error: '서버 오류가 발생했습니다.',
            details: error.message 
        });
    }
});

// 2. 단일 주소 지오코딩 엔드포인트
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
                formatted_address: geocoded.formatted_address
                // googleMapsUrl: createGoogleMapsUrl('검색 위치', address, { lat: geocoded.lat, lng: geocoded.lng })
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

// 3. Python에서 장소 데이터를 받는 엔드포인트 (지오코딩 적용)
app.post('/api/receive-places', async (req, res) => {
    try {
        const places = req.body;
        
        console.log(`📍 Python에서 ${places.length}개 장소 데이터 수신`);
        
        // 지오코딩 병렬 처리
        const geocodingPromises = places.map(async (place, index) => {
            const address = place.location || '주소 정보 없음';
            const name = place.name || '알 수 없는 장소';
            
            const geocoded = await geocodeAddress(address);
            
            const coordinates = geocoded ? 
                { lat: geocoded.lat, lng: geocoded.lng } : 
                null; // 지오코딩 실패시 null
                
            const finalAddress = geocoded ? geocoded.formatted_address : address;
            
            // 지오코딩 실패시 해당 장소 제외
            if (!coordinates) {
                return null;
            }
            
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
                // googleMapsUrl: createGoogleMapsUrl(name, finalAddress, coordinates),
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

        const formattedPlaces = (await Promise.all(geocodingPromises)).filter(place => place !== null);
        const totalRequested = places.length;
        const successCount = formattedPlaces.length;
        const failedCount = totalRequested - successCount;
        
        console.log(`🎯 Python 데이터 처리 완료: 성공 ${successCount}개, 실패 ${failedCount}개`);

        // 실패한 장소가 있으면 클라이언트에 알림
        if (failedCount > 0) {
            return res.json({
                success: false,
                error: `${failedCount}개 장소의 위도경도 추출에 실패했습니다. 핀을 찍을 수 없습니다.`,
                places: formattedPlaces,
                count: formattedPlaces.length,
                failed_count: failedCount,
                source: 'python'
            });
        }

        res.json({
            success: true,
            places: formattedPlaces,
            count: formattedPlaces.length,
            source: 'python'
        });

    } catch (error) {
        console.error('Python 장소 데이터 처리 오류:', error);
        res.status(500).json({ 
            error: '장소 데이터 처리 중 오류가 발생했습니다.',
            details: error.message 
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
    console.log(`📍 Geocoding: VWorld (국토교통부) + Nominatim (OSM)`);
});