// MapView.js - 개선된 버전
import React, { useState, useEffect, useRef } from 'react';

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
  const mapContainerRef = useRef(null);

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        console.log('🔍 API 호출 시작...');
        const response = await fetch('http://34.64.120.99:4000/api/map/init', {
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
        console.log('✅ API 응답 데이터:', data);
        console.log('🗺️ mapHtml 길이:', data.mapHtml?.length);
        console.log('📝 mapHtml 내용 (처음 200자):', data.mapHtml?.substring(0, 200));
        
        setMapData(data);
        setLoading(false);
      } catch (err) {
        console.error('❌ API 오류:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchMapData();
  }, []);

  // mapData가 업데이트될 때마다 HTML을 안전하게 삽입
  useEffect(() => {
    if (mapData?.mapHtml && mapContainerRef.current) {
      console.log('🔧 지도 HTML 삽입 시작...');
      
      // 기존 내용 정리
      mapContainerRef.current.innerHTML = '';
      
      // HTML 삽입
      mapContainerRef.current.innerHTML = mapData.mapHtml;
      
      // 스크립트 태그들을 다시 실행 가능하게 만들기
      const scripts = mapContainerRef.current.querySelectorAll('script');
      scripts.forEach((oldScript) => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach(attr => 
          newScript.setAttribute(attr.name, attr.value)
        );
        newScript.appendChild(document.createTextNode(oldScript.innerHTML));
        oldScript.parentNode.replaceChild(newScript, oldScript);
      });
      
      console.log('✅ 지도 HTML 삽입 완료');
      
      // Google Maps API 로드 상태 체크
      const checkGoogleMaps = setInterval(() => {
        if (window.google && window.google.maps) {
          console.log('✅ Google Maps API 로드됨');
          clearInterval(checkGoogleMaps);
        }
      }, 100);
      
      // 10초 후 체크 중단
      setTimeout(() => {
        clearInterval(checkGoogleMaps);
        if (!window.google || !window.google.maps) {
          console.error('❌ Google Maps API 로드 실패 (타임아웃)');
        }
      }, 10000);
    }
  }, [mapData]);

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
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>🔄</div>
          <div>지도를 불러오는 중...</div>
        </div>
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
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>❌</div>
          <div>오류: {error}</div>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              background: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* 헤더 */}
      <div style={{ 
        padding: '20px', 
        background: '#fff', 
        borderBottom: '1px solid #ddd', 
        textAlign: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>
          🗺️ MAPro - 안전한 지도 서비스
        </h1>
        <p style={{ margin: '5px 0', fontSize: '16px', fontWeight: 'bold' }}>
          현재 위치: {mapData?.location}
        </p>
        <p style={{ margin: '5px 0', fontSize: '14px', color: '#7f8c8d' }}>
          🔒 API 키가 백엔드에서 안전하게 관리됩니다
        </p>
        {mapData && (
          <div style={{ fontSize: '12px', color: '#95a5a6', marginTop: '10px' }}>
            <span>좌표: {mapData.latitude}, {mapData.longitude}</span>
            <span style={{ marginLeft: '20px' }}>상태: {mapData.status}</span>
          </div>
        )}
      </div>

      {/* 지도 영역 */}
      <div style={{ 
        flex: 1, 
        padding: '20px',
        background: '#f8f9fa',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          flex: 1,
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          minHeight: '400px'
        }}>
          {mapData?.mapHtml ? (
            <div 
              ref={mapContainerRef}
              style={{ width: '100%', height: '100%' }}
            />
          ) : (
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              textAlign: 'center',
              color: '#6c757d'
            }}>
              <div>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔄</div>
                <div>지도 데이터를 불러오는 중입니다...</div>
              </div>
            </div>
          )}
        </div>
        
        {/* 디버그 정보 (개발용) */}
        {mapData && process.env.NODE_ENV === 'development' && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            background: '#e9ecef',
            borderRadius: '5px',
            fontSize: '12px',
            fontFamily: 'monospace'
          }}>
            <strong>🐛 디버그 정보:</strong><br/>
            맵 데이터 존재: {mapData ? '✅' : '❌'}<br/>
            HTML 길이: {mapData?.mapHtml?.length || 0}자<br/>
            상태: {mapData?.status}<br/>
            Google Maps 로드됨: {window.google?.maps ? '✅' : '❌'}
          </div>
        )}
      </div>
    </div>
  );
}

export default MapView;