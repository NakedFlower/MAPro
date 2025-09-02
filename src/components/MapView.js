// MapView.js - API 키 없는 버전
import React, { useState, useEffect } from 'react';

const containerStyle = {
  width: '100%',
  height: '100vh'
};

function MapView() {
  const [mapData, setMapData] = useState(null);
  const [mapHtml, setMapHtml] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        // 백엔드에서 지도 HTML을 받아옴
        const response = await fetch('http://34.22.81.216:4000/api/map/render', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`지도를 불러올 수 없습니다. (Status: ${response.status})`);
        }

        const data = await response.json();
        setMapData(data);
        setMapHtml(data.mapHtml); // 백엔드에서 렌더링된 지도 HTML
        setLoading(false);
      } catch (err) {
        console.error('❌ API 호출 오류:', err);
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
        fontSize: '18px'
      }}>
        오류: {error}
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {mapHtml ? (
        <div dangerouslySetInnerHTML={{ __html: mapHtml }} />
      ) : (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          backgroundColor: '#f0f0f0'
        }}>
          <div>
            <h2>지도 서비스</h2>
            <p>위치: {mapData?.location}</p>
            <p>위도: {mapData?.latitude}</p>
            <p>경도: {mapData?.longitude}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default MapView;