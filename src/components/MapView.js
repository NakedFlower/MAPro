// MapView.js
import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100vh'
};

const center = {
  lat: 37.5665, // 서울 시청 위도
  lng: 126.9780 // 서울 시청 경도
};

// 환경변수에서 API 키 가져오기
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

function MapView() {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY
  });

  const [map, setMap] = useState(null);

  const onLoad = useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

  // API 키가 없을 때 에러 처리
  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div style={{
        width: '100%', 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: '#f3f6fb',
        color: '#333',
        fontSize: '18px'
      }}>
        Google Maps API 키가 설정되지 않았습니다.
      </div>
    );
  }

  return isLoaded ? (
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={15}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        { /* 자식 컴포넌트들을 여기에 추가할 수 있습니다. */ }
      </GoogleMap>
  ) : (
    <div style={{
      width: '100%', 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: '#f3f6fb'
    }}>
      로딩 중...
    </div>
  );
}

export default MapView;