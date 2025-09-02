// MapView.js
import React, { useState, useEffect } from 'react';

const containerStyle = {
  width: '100%',
  height: '100vh'
};

function MapView() {
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        console.log('🚀 API 호출 시작: http://34.22.81.216:4000/api/map/init');
        
        const response = await fetch('http://34.22.81.216:4000/api/map/init', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          mode: 'cors', // CORS 모드 명시
        });

        console.log('📡 Response status:', response.status);
        console.log('📡 Response headers:', response.headers);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Response error:', errorText);
          throw new Error(`API 오류 (Status: ${response.status}): ${errorText}`);
        }

        const data = await response.json();
        console.log('✅ 받은 데이터:', data);
        
        setMapData(data);
        setLoading(false);
      } catch (err) {
        console.error('❌ Fetch 오류:', err);
        console.error('❌ 오류 상세:', err.message);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchMapData();
  }, []);

  if (loading) {
    return (
      <div style={{
        width: '100%', 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: '#f3f6fb'
      }}>
        지도를 불러오는 중...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        width: '100%', 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        background: '#f3f6fb',
        color: '#e74c3c',
        fontSize: '18px',
        padding: '20px'
      }}>
        <div>오류: {error}</div>
        <div style={{marginTop: '10px', fontSize: '14px', color: '#666'}}>
          브라우저 개발자 도구(F12)에서 더 자세한 정보를 확인하세요.
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h2>지도가 여기에 표시됩니다</h2>
      <p>현재 위치: {mapData?.location || mapData?.위치 || '서울시청'}</p>
      <div style={{marginTop: '20px', padding: '10px', background: '#f0f0f0', borderRadius: '5px'}}>
        <h3>백엔드 응답 데이터:</h3>
        <pre>{JSON.stringify(mapData, null, 2)}</pre>
      </div>
    </div>
  );
}

export default MapView;