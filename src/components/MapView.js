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

const GOOGLE_MAPS_API_KEY = 'asdf';

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
  ) : <div style={{width: '100%', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f6fb'}}>
        로딩 중...
      </div>;
}

export default MapView; 
