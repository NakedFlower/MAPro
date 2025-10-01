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

// 헬스체크
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        service: 'map-api',
        timestamp: new Date().toISOString(),
        data_source: 'Python DB (직접 위도/경도 사용)'
    });
});

// 1. 경환이 챗봇에서 상호목록 받는 엔드포인트 (파이썬 위도/경도 직접 사용)
app.post('/api/chat-places', async (req, res) => {
    try {
        const { places } = req.body;
        
        if (!places || !Array.isArray(places)) {
            return res.status(400).json({ 
                error: '상호목록이 올바르지 않습니다.' 
            });
        }

        console.log(`📍 ${places.length}개 장소 데이터 처리 시작 (파이썬 DB에서 위도/경도 직접 사용)`);

        // 파이썬에서 받은 위도/경도를 직접 사용
        const placeDetails = places.map((place, index) => {
            const name = place.name || '알 수 없는 장소';
            const latitude = place.latitude;
            const longitude = place.longitude;
            
            // 위도/경도가 없는 장소는 제외
            if (!latitude || !longitude || latitude === 0 || longitude === 0) {
                console.warn(`⚠️ ${name}: 위도/경도 정보 없음 (lat: ${latitude}, lng: ${longitude})`);
                return null;
            }

            return {
                id: `chat-place-${place.place_id || index}`,
                name: name,
                location: place.location || '',
                address: place.location || '주소 정보 없음',
                coordinates: {
                    lat: parseFloat(latitude),
                    lng: parseFloat(longitude)
                },
                category: place.category || '기타',
                // 핀 클릭 시 표시할 정보
                info: {
                    place_id: place.place_id,
                    phone: place.phone || null,
                    rating: place.rating || null,
                    openHours: place.openHours || null,
                    description: place.description || `${name}에 대한 정보입니다.`,
                    features: place.feature ? place.feature.split(',').map(f => f.trim()).filter(f => f) : []
                },
                // 핀 표시 옵션 (카테고리별 아이콘 + 상호명 라벨)
                pinOptions: {
                    // 일반 핀 디자인 (네이버 스타일 제거)
                    style: 'default', // 기본 핀 스타일
                    color: '#4285F4', // 구글맵 스타일 파란색으로 통일
                    size: {
                        width: 40,
                        height: 40
                    },
                    // 카테고리별 아이콘 표시
                    icon: {
                        type: place.category === '음식점' ? '🍽️' : 
                              place.category === '카페' ? '☕' : 
                              place.category === '병원' ? '🏥' : 
                              place.category === '편의점' ? '🏪' :
                              place.category === '호텔' ? '🏨' :
                              place.category === '헤어샵' ? '✂️' :
                              place.category === '약국' ? '💊' : '📍',
                        size: 20,
                        color: '#FFFFFF'
                    },
                    // 🏷️ 핀 위에 상호명 라벨 표시 (항상 보이게)
                    label: {
                        text: name,
                        visible: true, // 항상 표시
                        position: 'top', // 핀 위쪽에 표시
                        alwaysShow: true, // 강제로 항상 표시
                        style: {
                            fontSize: '12px',
                            fontWeight: '600',
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            color: '#333333',
                            backgroundColor: '#FFFFFF',
                            padding: '6px 10px',
                            borderRadius: '16px',
                            border: '1px solid #DDDDDD',
                            boxShadow: '0 3px 8px rgba(0,0,0,0.15)',
                            whiteSpace: 'nowrap',
                            maxWidth: '150px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            zIndex: 1000
                        },
                        offset: { 
                            x: 0, 
                            y: -55 // 핀 위쪽으로 충분히 멀리
                        },
                        animation: {
                            appear: 'fadeInUp',
                            duration: 400
                        }
                    },
                    // 핀 클릭 시 동작 설정
                    onClick: {
                        action: 'openGoogleMaps', // 구글맵 열기
                        url: `https://www.google.com/maps/search/?api=1&query=${parseFloat(latitude)},${parseFloat(longitude)}`
                    }
                },
                // 구글지도 연동 URL 추가
                googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${parseFloat(latitude)},${parseFloat(longitude)}`
            };
        }).filter(place => place !== null);

        const totalRequested = places.length;
        const successCount = placeDetails.length;
        const failedCount = totalRequested - successCount;
        
        console.log(`🎯 장소 데이터 처리 완료: 성공 ${successCount}개, 실패 ${failedCount}개`);
        
        // 성공한 장소들의 좌표 정보 로그 출력
        placeDetails.forEach((place, index) => {
            console.log(`📍 ${index + 1}. ${place.name}: ${place.coordinates.lat}, ${place.coordinates.lng}`);
        });

        // 실패한 장소가 있으면 클라이언트에 알림
        if (failedCount > 0) {
            const response = {
                success: false,
                error: `${failedCount}개 장소의 위도경도 정보가 없습니다. 핀을 찍을 수 없습니다.`,
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
            data_info: {
                source: 'Python DB (직접 위도/경도)',
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

// 2. Python에서 장소 데이터를 받는 엔드포인트 (파이썬 위도/경도 직접 사용)
app.post('/api/receive-places', async (req, res) => {
    try {
        const places = req.body;
        
        console.log(`📍 Python에서 ${places.length}개 장소 데이터 수신`);
        
        // 파이썬에서 받은 위도/경도 직접 사용
        const formattedPlaces = places.map((place, index) => {
            const name = place.name || '알 수 없는 장소';
            const latitude = place.latitude;
            const longitude = place.longitude;
            
            // 위도/경도가 없는 장소는 제외
            if (!latitude || !longitude || latitude === 0 || longitude === 0) {
                console.warn(`⚠️ ${name}: 위도/경도 정보 없음 (lat: ${latitude}, lng: ${longitude})`);
                return null;
            }
            
            return {
                id: `python-place-${place.place_id || index}`,
                name: name,
                location: place.location || '',
                address: place.location || '주소 정보 없음',
                coordinates: {
                    lat: parseFloat(latitude),
                    lng: parseFloat(longitude)
                },
                category: place.category || '기타',
                info: {
                    place_id: place.place_id,
                    phone: place.phone || null,
                    rating: place.rating || null,
                    openHours: place.openHours || null,
                    description: place.description || `${name}에 대한 정보입니다.`,
                    features: place.features || []
                },
                pinOptions: {
                    // 일반 핀 디자인
                    style: 'default',
                    color: '#4285F4', // 구글맵 스타일 파란색
                    size: {
                        width: 40,
                        height: 40
                    },
                    // 카테고리별 아이콘 표시
                    icon: {
                        type: place.category === '음식점' ? '🍽️' : 
                              place.category === '카페' ? '☕' : 
                              place.category === '병원' ? '🏥' : 'default',
                        size: 20,
                        color: '#FFFFFF'
                    },
                    // 🏷️ 핀 위에 상호명 라벨 표시
                    label: {
                        text: name,
                        visible: true,
                        position: 'top',
                        alwaysShow: true,
                        style: {
                            fontSize: '12px',
                            fontWeight: '600',
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            color: '#333333',
                            backgroundColor: '#FFFFFF',
                            padding: '6px 10px',
                            borderRadius: '16px',
                            border: '1px solid #DDDDDD',
                            boxShadow: '0 3px 8px rgba(0,0,0,0.15)',
                            whiteSpace: 'nowrap',
                            maxWidth: '150px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            zIndex: 1000
                        },
                        offset: { x: 0, y: -55 },
                        animation: {
                            appear: 'fadeInUp',
                            duration: 400
                        }
                    },
                    // 핀 클릭 시 구글맵 열기
                    onClick: {
                        action: 'openGoogleMaps',
                        url: `https://www.google.com/maps/search/?api=1&query=${parseFloat(latitude)},${parseFloat(longitude)}`
                    }
                },
                // 구글지도 연동 URL 추가
                googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${parseFloat(latitude)},${parseFloat(longitude)}`
            };
        }).filter(place => place !== null);

        const totalRequested = places.length;
        const successCount = formattedPlaces.length;
        const failedCount = totalRequested - successCount;
        
        console.log(`🎯 Python 데이터 처리 완료: 성공 ${successCount}개, 실패 ${failedCount}개`);

        // 실패한 장소가 있으면 클라이언트에 알림
        if (failedCount > 0) {
            return res.json({
                success: false,
                error: `${failedCount}개 장소의 위도경도 정보가 없습니다. 핀을 찍을 수 없습니다.`,
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

// 3. 테스트용 엔드포인트 - 샘플 데이터로 핀 테스트
app.get('/api/test-pins', (req, res) => {
    const testPlaces = [
        {
            id: 'test-1',
            name: '테스트 카페',
            location: '판교',
            address: '경기 성남시 분당구 판교역로',
            coordinates: { lat: 37.3951, lng: 127.1116 },
            category: '카페',
            info: { description: '테스트용 카페입니다.' },
            pinOptions: {
                color: '#4285F4',
                style: 'default',
                size: { width: 40, height: 40 },
                icon: { type: '☕', size: 20, color: '#FFFFFF' },
                label: {
                    text: '테스트 카페',
                    visible: true,
                    position: 'top',
                    alwaysShow: true,
                    style: {
                        fontSize: '12px',
                        fontWeight: '600',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        color: '#333333',
                        backgroundColor: '#FFFFFF',
                        padding: '6px 10px',
                        borderRadius: '16px',
                        border: '1px solid #DDDDDD',
                        boxShadow: '0 3px 8px rgba(0,0,0,0.15)',
                        whiteSpace: 'nowrap',
                        zIndex: 1000
                    },
                    offset: { x: 0, y: -55 }
                },
                onClick: {
                    action: 'openGoogleMaps',
                    url: 'https://www.google.com/maps/search/?api=1&query=37.3951,127.1116'
                }
            },
            googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=37.3951,127.1116'
        }
    ];

    res.json({
        success: true,
        places: testPlaces,
        count: testPlaces.length,
        source: 'test'
    });
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
    console.log(`📍 Data Source: Python DB (직접 위도/경도 사용)`);
});


app.get('/api/places/search', async (req, res) => {
    try {
        const { keyword, location } = req.query;
        
        if (!keyword) {
            return res.status(400).json({ 
                success: false,
                error: '검색 키워드가 필요합니다.' 
            });
        }

        console.log(`🔍 주소 검색 프록시: "${keyword}" in ${location || '서울'}`);

        // Java 백엔드의 /api/map/places/search로 프록시
        const response = await axios.get(`${JAVA_BACKEND_API}/api/map/places/search`, {
            params: { 
                keyword, 
                location: location || '서울' 
            },
            timeout: 10000
        });

        console.log(`✅ 검색 결과: ${response.data.count}개`);
        res.json(response.data);

    } catch (error) {
        console.error('❌ 주소 검색 프록시 오류:', error.message);
        res.status(500).json({ 
            success: false,
            error: '주소 검색 중 오류가 발생했습니다.',
            details: error.message 
        });
    }
});