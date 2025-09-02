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
        const response = await fetch('/api/map/init', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('지도 데이터를 불러올 수 없습니다.');
        }

        const data = await response.json();
        setMapData(data);
        setLoading(false);
      } catch (err) {
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
        alignItems: 'center', 
        justifyContent: 'center', 
        background: '#f3f6fb',
        color: '#e74c3c',
        fontSize: '18px'
      }}>
        오류: {error}
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h2>지도가 여기에 표시됩니다</h2>
      <p>현재 위치: {mapData?.location || '서울시청'}</p>
      {/* 실제 지도는 다음 단계에서 구현 */}
    </div>
  );
}

export default MapView;