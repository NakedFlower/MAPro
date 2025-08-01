// src/components/Sidebar.js
import React from 'react';

const menuList = ['홈', '개인 정보', '내 성향 설정'];

function Sidebar({ selected, setSelected }) {
  return (
    <div style={{
      width: '200px',
      height: '100vh',
      borderRight: '1px solid #eee',
      padding: '100px 0 0 0',
      background: '#fafafd',
      boxSizing: 'border-box'
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
    </div>
  );
}

export default Sidebar;
