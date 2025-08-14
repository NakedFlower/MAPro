// src/components/Sidebar.js
import React from 'react';

const menuList = ['홈', '개인 정보', '내 성향 설정'];

function Sidebar({ selected, setSelected, onOpenLogin }) {
  return (
    <div style={{
      width: '200px',
      height: '100vh',
      borderRight: '1px solid #eee',
      padding: '100px 0 0 0',
      background: '#fafafd',
      boxSizing: 'border-box',
      position: 'relative'
    }}>
      {menuList.map((text, idx) => (
        <button
          key={text}
          onClick={() => setSelected(idx)}
          style={{
            display: 'block',
            width: '100%',
            background: selected === idx ? '#fc9090' : 'transparent',
            color: selected === idx ? '#fff' : '#111',
            border: 'none',
            outline: 'none',
            cursor: 'pointer',
            textAlign: 'left',
            fontSize: '1.06rem',
            padding: '16px 24px',
            margin: '0 0 8px 0',
            borderRadius: '0 16px 16px 0',
            fontWeight: 'bold',
            transition: 'background 0.2s'
          }}
        >
          {text}
        </button>
      ))}

      <button
        onClick={onOpenLogin}
        title="로그인"
        style={{
          position: 'absolute',
          left: '16px',
          bottom: '16px',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: '1px solid #e1e1e8',
          background: '#ffffff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }}
      >
        <span role="img" aria-label="login">🔑</span>
      </button>
    </div>
  );
}

export default Sidebar;
