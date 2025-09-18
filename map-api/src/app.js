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

        // 받은 상호들의 주소 정보를 자바 백엔드에서 조회
        const placeDetails = await Promise.all(
            places.map(async (place) => {
                try {
                    // 자바 백엔드 API 호출하여 주소 정보 가져오기
                    const response = await axios.get(`${JAVA_BACKEND_API}/api/places/search`, {
                        params: { name: place.name, location: place.location }
                    });
                    
                    return {
                        ...place,
                        address: response.data.address,
                        coordinates: response.data.coordinates
                    };
                } catch (error) {
                    console.error(`주소 조회 실패 - ${place.name}:`, error.message);
                    return {
                        ...place,
                        address: place.location,
                        coordinates: null
                    };
                }
            })
        );

        res.json({
            success: true,
            places: placeDetails,
            count: placeDetails.length
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

        // 자바 백엔드 API 호출
        const response = await axios.get(`${JAVA_BACKEND_API}/api/places/search`, {
            params: { 
                keyword, 
                location: location || '' 
            },
            timeout: 5000
        });

        const places = response.data.map(place => ({
            id: place.place_id,
            name: place.name,
            category: place.category,
            location: place.location,
            address: place.address || place.location,
            coordinates: place.coordinates || null,
            features: place.feature ? place.feature.split(',') : []
        }));

        res.json({
            success: true,
            places: places,
            count: places.length,
            keyword: keyword,
            searchLocation: location
        });

    } catch (error) {
        console.error('지도 검색 오류:', error);
        
        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({ 
                error: '백엔드 서버에 연결할 수 없습니다.' 
            });
        }

        res.status(500).json({ 
            error: '검색 중 오류가 발생했습니다.',
            details: error.message 
        });
    }
});

// 3. 좌표 변환 서비스 (필요시)
app.post('/api/geocoding', async (req, res) => {
    try {
        const { address } = req.body;
        
        if (!address) {
            return res.status(400).json({ 
                error: '주소가 필요합니다.' 
            });
        }

        // 여기서는 자바 백엔드의 지오코딩 서비스 호출
        // 또는 직접 구글/네이버 지도 API 호출
        const response = await axios.post(`${JAVA_BACKEND_API}/api/geocoding`, {
            address: address
        });

        res.json({
            success: true,
            coordinates: response.data.coordinates,
            address: response.data.formattedAddress || address
        });

    } catch (error) {
        console.error('지오코딩 오류:', error);
        res.status(500).json({ 
            error: '좌표 변환 중 오류가 발생했습니다.' 
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

// 모든 라우트 뒤에 추가
// 404 핸들링 (맨 마지막에)
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