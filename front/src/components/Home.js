// Home.js
import React, { useState } from 'react';

function Home({ onOpenMap }) {
  const [active, setActive] = useState(true);

  const handleClick = () => {
    setActive(a => !a);
    if (onOpenMap) onOpenMap(); // 이제 /map 경로로 이동
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      background: '#fff'
    }}>
      {/* 프로필 섹션 */}
      <div style={{
        background: 'rgba(134, 168, 231, 0.02)',
        backdropFilter: 'blur(10px)',
        borderRadius: '24px',
        padding: '48px 40px',
        textAlign: 'center',
        boxShadow: '0 8px 32px rgba(134, 168, 231, 0.08)',
        border: '1px solid rgba(134, 168, 231, 0.1)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* 배경 장식 */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(134, 168, 231, 0.04) 0%, transparent 50%)',
          zIndex: -1
        }} />
        
        {/* 간단하고 자연스러운 지구본 */}
        <div
          onClick={handleClick}
          style={{
            width: active ? '160px' : '60px',
            height: active ? '160px' : '60px',
            borderRadius: '50%',
            background: active 
              ? `radial-gradient(circle at 30% 20%, 
                  #87CEEB 0%, 
                  #4682B4 30%, 
                  #1E90FF 60%, 
                  #0066CC 85%, 
                  #003d7a 100%)`
              : `radial-gradient(circle at 30% 20%, 
                  #B0E0E6 0%, 
                  #87CEEB 50%, 
                  #4682B4 100%)`,
            marginBottom: '36px',
            transition: 'all 0.5s cubic-bezier(.66,0,.36,1)',
            cursor: 'pointer',
            boxShadow: active 
              ? `0 12px 30px rgba(70, 130, 180, 0.3),
                 0 4px 15px rgba(70, 130, 180, 0.2)`
              : `0 6px 15px rgba(135, 206, 235, 0.25)`,
            position: 'relative',
            margin: '0 auto 36px auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: active ? '0px' : '28px'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.05)';
            e.target.style.boxShadow = active 
              ? `0 16px 40px rgba(70, 130, 180, 0.4),
                 0 6px 20px rgba(70, 130, 180, 0.3)`
              : `0 8px 20px rgba(135, 206, 235, 0.35)`;
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = active 
              ? `0 12px 30px rgba(70, 130, 180, 0.3),
                 0 4px 15px rgba(70, 130, 180, 0.2)`
              : `0 6px 15px rgba(135, 206, 235, 0.25)`;
          }}
        >
          {/* 지구본 활성 상태 - 간단한 대륙들 */}
          {active && (
            <>
              {/* 아프리카 대륙 */}
              <div style={{
                position: 'absolute',
                top: '35%',
                left: '48%',
                width: '16%',
                height: '28%',
                background: '#228B22',
                borderRadius: '50% 30% 60% 40%',
                opacity: 0.8
              }} />
              
              {/* 유럽 */}
              <div style={{
                position: 'absolute',
                top: '28%',
                left: '45%',
                width: '10%',
                height: '10%',
                background: '#32CD32',
                borderRadius: '50%',
                opacity: 0.7
              }} />
              
              {/* 아시아 */}
              <div style={{
                position: 'absolute',
                top: '30%',
                left: '60%',
                width: '20%',
                height: '25%',
                background: '#228B22',
                borderRadius: '60% 40% 50% 50%',
                opacity: 0.6
              }} />
              
              {/* 남미 */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '28%',
                width: '8%',
                height: '18%',
                background: '#32CD32',
                borderRadius: '40% 60% 30% 70%',
                opacity: 0.7
              }} />
              
              {/* 북미 일부 */}
              <div style={{
                position: 'absolute',
                top: '25%',
                left: '25%',
                width: '12%',
                height: '15%',
                background: '#228B22',
                borderRadius: '70% 30% 60% 40%',
                opacity: 0.6
              }} />
              
              {/* 하이라이트 효과 */}
              <div style={{
                position: 'absolute',
                top: '15%',
                left: '20%',
                width: '35%',
                height: '30%',
                background: 'radial-gradient(ellipse, rgba(255, 255, 255, 0.2) 0%, transparent 60%)',
                borderRadius: '50%'
              }} />
            </>
          )}
          
          {/* 작은 상태일 때 이모지 */}
          {!active && <span>🌍</span>}
        </div>
        
        {/* 환영 메시지 */}
        <div style={{
          fontSize: '24px', 
          color: '#333',
          fontWeight: 'bold',
          marginBottom: '12px',
          background: 'linear-gradient(135deg, #333 0%, #555 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          김동석 님, 반갑습니다.
        </div>
        
        {/* 안내 메시지 */}
        <div style={{
          marginTop: '18px', 
          color: '#888', 
          fontSize: '14px',
          padding: '12px 20px',
          background: 'rgba(134, 168, 231, 0.05)',
          borderRadius: '12px',
          border: '1px solid rgba(134, 168, 231, 0.1)',
          display: 'inline-block'
        }}>
          🌍 지구본을 클릭하면 지도 화면이 펼쳐집니다.
        </div>
      </div>
    </div>
  );
}

export default Home;