// App.js
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Home from './components/Home';
import ProfileInfo from './components/ProfileInfo';
import PreferenceSetting from './components/PreferenceSetting';
import MapView from './components/MapView';
import LoginPanel from './components/LoginPanel';
import ChatbotPanel from './components/ChatbotPanel';

function App() {
  const [selected, setSelected] = useState(0); // 0:'홈', 1:'개인 정보', 2:'내 성향 설정', 3:'지도'
  const [showLogin, setShowLogin] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [isSidebarCompact, setIsSidebarCompact] = useState(false);
  const [showSidebarMenu, setShowSidebarMenu] = useState(false);

  // 핑크색 원 클릭 시 지도화면 + compact 사이드바
  const handleOpenMap = () => {
    setSelected(3);
    setIsSidebarCompact(true);
    setShowSidebarMenu(false);
  };

  // compact 사이드바에서 아이콘 클릭 시 드롭다운 메뉴
  const handleSidebarIconClick = () => {
    setShowSidebarMenu(v => !v);
  };

  // 드롭다운 메뉴에서 항목 선택 시
  const handleSidebarMenuSelect = (idx) => {
    setSelected(idx);
    setIsSidebarCompact(false);
    setShowSidebarMenu(false);
  };

  let MainContent;
  if (selected === 0) MainContent = <Home onOpenMap={handleOpenMap} />;
  else if (selected === 1) MainContent = <ProfileInfo />;
  else if (selected === 2) MainContent = <PreferenceSetting />;
  else if (selected === 3) MainContent = <MapView />;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#fff' }}>
      <Sidebar
        selected={selected}
        setSelected={setSelected}
        onOpenLogin={() => setShowLogin(true)}
        isCompact={isSidebarCompact && selected === 3}
        showMenu={showSidebarMenu}
        onIconClick={handleSidebarIconClick}
        onMenuSelect={handleSidebarMenuSelect}
      />
      <div style={{ flex: 1, background: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', position: 'relative' }}>
        {MainContent}
        {showLogin && <LoginPanel onClose={() => setShowLogin(false)} style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1000 }} />}
        {/* 오른쪽 아래 챗봇 플로팅 버튼 */}
        <button
          onClick={() => setShowChatbot(v => !v)}
          style={{
            position: 'fixed',
            right: 32,
            bottom: 32,
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: '#fc9090',
            border: 'none',
            boxShadow: '0 4px 16px rgba(252,144,144,0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1200,
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
          aria-label="챗봇 열기"
        >
          {showChatbot ? (
            // X 아이콘
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M8 8L24 24" stroke="#fff" strokeWidth="3" strokeLinecap="round"/><path d="M24 8L8 24" stroke="#fff" strokeWidth="3" strokeLinecap="round"/></svg>
          ) : (
            // 말풍선 아이콘
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="4" y="6" width="24" height="16" rx="6" fill="#fff"/><path d="M16 28c-2.5-2-8-2-8-6V12a6 6 0 016-6h8a6 6 0 016 6v6c0 4-5.5 4-8 6z" fill="#fff"/><rect x="8" y="10" width="16" height="2.5" rx="1.25" fill="#fc9090"/><rect x="8" y="15" width="10" height="2.5" rx="1.25" fill="#fc9090"/></svg>
          )}
        </button>
        {/* 챗봇 패널 */}
        {showChatbot && <ChatbotPanel onClose={() => setShowChatbot(false)} />}
      </div>
    </div>
  );
}

export default App;
