import React from 'react';

function MapView() {
  return (
    <div style={{
      width: '100%',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f3f6fb'
    }}>
      <img
        src="/images/map-preview.png"
        alt="지도 미리보기"
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain'
        }}
      />
    </div>
  );
}

export default MapView; 