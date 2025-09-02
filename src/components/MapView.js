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
    // 백엔드에서 지도 데이터를 가져오는 함수
    const fetchMapData = async () => {
      try {
        // Google Cloud 백엔드 서버 URL로 변경
        const response = await fetch('http://34.22.81.216:4000/api/map/init', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`지도 데이터를 불러올 수 없습니다. (Status: ${response.status})`);
        }

        const data = await response.json();
        console.log('✅ 백엔드에서 받은 데이터:', data); // 디버그용 로그
        setMapData(data);
        setLoading(false);
      } catch (err) {
        console.error('❌ API 호출 오류:', err); // 디버그용 로그
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
          백엔드 서버: http://34.22.81.216:4000
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h2>지도가 여기에 표시됩니다</h2>
      <p>현재 위치: {mapData?.location || '서울시청'}</p>
      <div style={{marginTop: '20px', padding: '10px', background: '#f0f0f0', borderRadius: '5px'}}>
        <h3>백엔드 응답 데이터:</h3>
        <pre>{JSON.stringify(mapData, null, 2)}</pre>
      </div>
      {/* 실제 지도는 다음 단계에서 구현 */}
    </div>
  );
}

export default MapView;