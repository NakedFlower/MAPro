// Sidebar.js
import React from 'react';

function Sidebar({ 
  selected, 
  setSelected, 
  onOpenLogin, 
  isCollapsed = false, 
  onToggleCollapse 
}) {
  const menuList = ['홈','내 정보', '성향 설정'];

  return (
    <div style={{ position: 'relative', zIndex: 100 }}>
      {/* 기본 사이드바 (항상 표시) */}
      <div style={{
        width: '64px',
        height: '100vh',
        background: '#fafafd',
        borderRight: '1px solid #eee',
        boxShadow: '2px 0 8px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative'
      }}>
        {/* 햄버거 메뉴 버튼 */}
        <button
          onClick={onToggleCollapse}
          style={{
            width: '44px', 
            height: '44px', 
            margin: '24px 0', 
            borderRadius: '12px', 
            background: isCollapsed ? 'rgba(252, 144, 144, 0.1)' : 'rgba(252, 144, 144, 0.2)', 
            border: '1px solid rgba(252, 144, 144, 0.2)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            cursor: 'pointer', 
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(252, 144, 144, 0.3)';
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = isCollapsed ? 'rgba(252, 144, 144, 0.1)' : 'rgba(252, 144, 144, 0.2)';
            e.target.style.transform = 'scale(1)';
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M2 10h16" stroke="#fc9090" strokeWidth="2" strokeLinecap="round"/>
            <path d="M2 5h16" stroke="#fc9090" strokeWidth="2" strokeLinecap="round"/>
            <path d="M2 15h16" stroke="#fc9090" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        {/* 로그인 버튼 */}
        <button
          onClick={onOpenLogin}
          title="로그인"
          style={{
            position: 'absolute', 
            left: '8px', 
            bottom: '24px', 
            width: '48px', 
            height: '48px', 
            borderRadius: '50%', 
            border: '1.5px solid #e1e1e8', 
            background: '#fff', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            cursor: 'pointer', 
            padding: 0,
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#fc9090';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#fff';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="14" cy="14" r="13" stroke="#fc9090" strokeWidth="2" fill="#fff"/>
            <ellipse cx="14" cy="12" rx="5" ry="5.5" fill="#fc9090"/>
            <rect x="8.5" y="18" width="11" height="5" rx="2.5" fill="#fc9090"/>
            <rect x="12.5" y="19.5" width="3" height="3" rx="1.5" fill="#fff"/>
          </svg>
        </button>
      </div>

      {/* 확장 메뉴 패널 */}
      <div style={{
        position: 'absolute',
        left: '64px',
        top: 0,
        width: isCollapsed ? '0px' : '180px',
        height: '100vh',
        background: '#fafafd',
        borderRight: isCollapsed ? 'none' : '1px solid #eee',
        boxShadow: isCollapsed ? 'none' : '2px 0 8px rgba(0,0,0,0.06)',
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* 메뉴 헤더 */}
        <div style={{
          padding: '32px 16px 24px 0',
          display: 'flex',
          justifyContent: 'flex-end',
          borderBottom: '1px solid rgba(252, 144, 144, 0.1)',
          minHeight: '80px',
          boxSizing: 'border-box'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#333',
            margin: 0,
            marginRight: '16px',
            background: 'linear-gradient(135deg, #fc9090 0%, #ff7b7b 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            opacity: isCollapsed ? 0 : 1,
            transform: isCollapsed ? 'translateX(20px)' : 'translateX(0)',
            transition: 'all 0.3s ease',
            transitionDelay: isCollapsed ? '0s' : '0.2s',
            whiteSpace: 'nowrap'
          }}>
            메뉴
          </h2>
        </div>

        {/* 메뉴 리스트 */}
        <div style={{ 
          flex: 1, 
          padding: '40px 0 0 0',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          minWidth: '180px'
        }}>
          {menuList.map((text, idx) => {
            const icons = ['🏠', '👤', '⚙️'];
            return (
              <div
                key={text}
                style={{
                  overflow: 'hidden',
                  opacity: isCollapsed ? 0 : 1,
                  transform: isCollapsed ? 'translateX(-30px)' : 'translateX(0)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transitionDelay: isCollapsed ? '0s' : `${idx * 0.05 + 0.15}s`
                }}
              >
                <button
                  onClick={() => setSelected(idx)}
                  style={{
                    display: 'flex', 
                    alignItems: 'center',
                    width: '100%', 
                    background: selected === idx ? '#fc9090' : 'transparent', 
                    color: selected === idx ? '#fff' : '#111', 
                    border: 'none', 
                    outline: 'none', 
                    cursor: 'pointer', 
                    textAlign: 'left', 
                    fontSize: '1rem', 
                    padding: '14px 12px', 
                    margin: '0', 
                    borderRadius: selected === idx ? '0 16px 16px 0' : '0',
                    fontWeight: '600',
                    transition: 'all 0.2s ease',
                    gap: '12px', // 아이콘과 텍스트 간격 고정
                    whiteSpace: 'nowrap',
                    minWidth: '168px'
                  }}
                  onMouseEnter={(e) => {
                    if (selected !== idx) {
                      e.target.style.background = 'rgba(252, 144, 144, 0.1)';
                      e.target.style.color = '#fc9090';
                      e.target.style.paddingLeft = '16px';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selected !== idx) {
                      e.target.style.background = 'transparent';
                      e.target.style.color = '#111';
                      e.target.style.paddingLeft = '12px';
                    }
                  }}
                >
                  {/* 아이콘 컨테이너 - 고정 너비로 정렬 */}
                  <span style={{ 
                    fontSize: '16px', 
                    width: '20px', // 고정 너비로 아이콘 정렬
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0 // 아이콘이 줄어들지 않도록
                  }}>
                    {icons[idx]}
                  </span>
                  {/* 텍스트 */}
                  <span style={{ 
                    whiteSpace: 'nowrap',
                    overflow: 'visible',
                    flex: 1 // 남은 공간을 모두 사용
                  }}>
                    {text}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;