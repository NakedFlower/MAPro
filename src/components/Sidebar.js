// src/components/Sidebar.js
import React from 'react';

function Sidebar({ selected, setSelected, onOpenLogin, isCompact, showMenu, onIconClick, onMenuSelect }) {
  const menuList = ['홈', '개인 정보', '내 성향 설정'];
  if (isCompact) {
    return (
      <div style={{
        width: '64px',
        height: '100vh',
        background: 'rgba(255,255,255,0.7)',
        boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        zIndex: 100
      }}>
        {/* 상단 햄버거/메뉴 아이콘 */}
        <button
          onClick={onIconClick}
          style={{
            width: '44px', height: '44px', margin: '24px 0 18px 0', borderRadius: '12px', background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s'
          }}
        >
          {/* 햄버거 아이콘 */}
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect y="5" width="28" height="3" rx="1.5" fill="#6b7280"/><rect y="12.5" width="28" height="3" rx="1.5" fill="#6b7280"/><rect y="20" width="28" height="3" rx="1.5" fill="#6b7280"/></svg>
        </button>
        {/* 드롭다운 메뉴 */}
        {showMenu && (
          <div style={{position:'absolute', left:'64px', top:'24px', background:'#fff', borderRadius:'16px', boxShadow:'0 4px 16px rgba(0,0,0,0.10)', padding:'12px 0', minWidth:'160px', zIndex:200}}>
            {menuList.map((text, idx) => (
              <button
                key={text}
                onClick={() => onMenuSelect(idx)}
                style={{
                  display: 'block', width: '100%', background: 'transparent', color: selected === idx ? '#fc9090' : '#222', border: 'none', outline: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '1.06rem', padding: '14px 24px', fontWeight: selected === idx ? 'bold' : 'normal', borderLeft: selected === idx ? '4px solid #fc9090' : '4px solid transparent', transition: 'background 0.2s'
                }}
              >
                {text}
              </button>
            ))}
          </div>
        )}
        {/* 하단 로그인 버튼 */}
        <button
          onClick={onOpenLogin}
          title="로그인"
          style={{
            position: 'absolute', left: '8px', bottom: '24px', width: '40px', height: '40px', borderRadius: '50%', border: '1.5px solid #e1e1e8', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0
          }}
        >
          {/* 사람+자물쇠 SVG */}
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="14" cy="14" r="13" stroke="#fc9090" strokeWidth="2" fill="#fff"/>
            <ellipse cx="14" cy="12" rx="5" ry="5.5" fill="#fc9090"/>
            <rect x="8.5" y="18" width="11" height="5" rx="2.5" fill="#fc9090"/>
            <rect x="12.5" y="19.5" width="3" height="3" rx="1.5" fill="#fff"/>
          </svg>
        </button>
      </div>
    );
  }
  // 기존(넓은) 사이드바
  return (
    <div style={{
      width: '200px',
      height: '100vh',
      borderRight: '1px solid #eee',
      padding: '100px 0 0 0',
      background: '#fafafd',
      boxSizing: 'border-box',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      zIndex: 100
    }}>
      {menuList.map((text, idx) => (
        <button
          key={text}
          onClick={() => setSelected(idx)}
          style={{
            display: 'block', width: '100%', background: selected === idx ? '#fc9090' : 'transparent', color: selected === idx ? '#fff' : '#111', border: 'none', outline: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '1.06rem', padding: '16px 24px', margin: '0 0 8px 0', borderRadius: '0 16px 16px 0', fontWeight: 'bold', transition: 'background 0.2s'
          }}
        >
          {text}
        </button>
      ))}
      <button
        onClick={onOpenLogin}
        title="로그인"
        style={{
          position: 'absolute', left: '16px', bottom: '16px', width: '48px', height: '48px', borderRadius: '50%', border: '1.5px solid #e1e1e8', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0
        }}
      >
        {/* 사람+자물쇠 SVG */}
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="14" cy="14" r="13" stroke="#fc9090" strokeWidth="2" fill="#fff"/>
          <ellipse cx="14" cy="12" rx="5" ry="5.5" fill="#fc9090"/>
          <rect x="8.5" y="18" width="11" height="5" rx="2.5" fill="#fc9090"/>
          <rect x="12.5" y="19.5" width="3" height="3" rx="1.5" fill="#fff"/>
        </svg>
      </button>
    </div>
  );
}

export default Sidebar;
