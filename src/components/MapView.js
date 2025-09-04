// MapView.js
import React, { useState, useEffect } from 'react';

const containerStyle = {
  width: '100%',
  height: '100vh',
  display: 'flex',
  flexDirection: 'column'
};

function MapView() {
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const response = await fetch('http://34.64.120.99/:4000/api/map/init', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          mode: 'cors',
        });

        if (!response.ok) {
          throw new Error(`API 오류 (Status: ${response.status})`);
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
      {/* 헤더 */}
      <div style={{ padding: '20px', background: '#fff', borderBottom: '1px solid #ddd', textAlign: 'center' }}>
        <h1>🗺️ MAPro - 안전한 지도 서비스</h1>
        <p>현재 위치: {mapData?.location}</p>
        <p><small>🔒 API 키가 백엔드에서 안전하게 관리됩니다</small></p>
      </div>

      {/* 지도 영역 */}
      <div style={{ flex: 1, padding: '20px' }}>
        {mapData?.mapHtml ? (
          <div dangerouslySetInnerHTML={{ __html: mapData.mapHtml }} />
        ) : (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            지도 데이터를 불러오는 중입니다...
          </div>
        )}
      </div>
    </div>
  );
}

export default MapView;