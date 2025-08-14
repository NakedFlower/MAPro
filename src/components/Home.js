import React, { useState } from 'react';

function Profile({ onOpenMap }) {
  const [active, setActive] = useState(true);

  const handleClick = () => {
    setActive(a => !a);
    if (onOpenMap) onOpenMap();
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginTop: '120px'
    }}>
      <div
        onClick={handleClick}
        style={{
          width: active ? '160px' : '60px',
          height: active ? '160px' : '60px',
          borderRadius: '50%',
          background: active ? '#fc9090' : '#f5c2c2',
          marginBottom: '36px',
          transition: 'all 0.5s cubic-bezier(.66,0,.36,1)'
        }}
      />
      <div style={{fontSize: '22px', color: '#333'}}>
        김동석 님, 반갑습니다.
      </div>
      <div style={{marginTop: '18px', color:'#888', fontSize:'10px'}}>
        (원을 클릭하면 지도 화면이 펼쳐집니다.)
      </div>
    </div>
  );
}

export default Profile;
