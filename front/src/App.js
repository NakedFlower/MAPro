// App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './components/Home';
import ProfileInfo from './components/ProfileInfo';
import PreferenceSetting from './components/PreferenceSetting';
import MapView from './components/MapView';
import LoginPanel from './components/LoginPanel';
import ChatbotPanel from './components/ChatbotPanel';

// 메인 앱 컴포넌트 (라우터 내부)
function AppContent() {
  const [showLogin, setShowLogin] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  // 현재 경로에 따라 selected 상태 결정
  const getSelectedIndex = () => {
    switch (location.pathname) {
      case '/User/MyPage/Home': return 0;
      case '/User/MyPage/Private': return 1;
      case '/User/MyPage/Favorite': return 2;
      case '/map': return 3; // 지도는 기존 경로 유지
      default: return 0;
    }
  };

  // 메뉴 선택 시 네비게이션
  const handleMenuSelect = (index) => {
    switch (index) {
      case 0: navigate('/User/MyPage/Home'); break;
      case 1: navigate('/User/MyPage/Private'); break;
      case 2: navigate('/User/MyPage/Favorite'); break;
      case 3: navigate('/map'); break;
      default: navigate('/User/MyPage/Home');
    }
  };

  // 홈에서 지도로 이동
  const handleOpenMap = () => {
    navigate('/map');
  };

  // 사이드바 토글 함수
  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      background: '#fff'
    }}>
      <Sidebar
        selected={getSelectedIndex()}
        setSelected={handleMenuSelect}
        onOpenLogin={() => setShowLogin(true)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />
      
      {/* 메인 콘텐츠 영역 */}
      <div style={{ 
        flex: 1,
        background: '#fff', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'flex-start', 
        position: 'relative',
        minHeight: '100vh'
      }}>
        {/* 라우트 컴포넌트들 */}
        <Routes>
          {/* 기본 경로를 홈으로 리다이렉트 */}
          <Route path="/" element={<Home onOpenMap={handleOpenMap} />} />
          
          {/* 새로운 URL 구조 */}
          <Route path="/User/MyPage/Home" element={<Home onOpenMap={handleOpenMap} />} />
          <Route path="/User/MyPage/Private" element={<ProfileInfo />} />
          <Route path="/User/MyPage/Favorite" element={<PreferenceSetting />} />
          
          {/* 지도는 기존 경로 유지 */}
          <Route path="/map" element={<MapView />} />
        </Routes>
        
        {/* 로그인 패널 */}
        {showLogin && (
          <LoginPanel 
            onClose={() => setShowLogin(false)} 
            style={{ 
              position: 'fixed', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)', 
              zIndex: 1000 
            }} 
          />
        )}
        
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
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M8 8L24 24" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
              <path d="M24 8L8 24" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          ) : (
            // 말풍선 아이콘
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect x="4" y="6" width="24" height="16" rx="6" fill="#fff"/>
              <path d="M16 28c-2.5-2-8-2-8-6V12a6 6 0 016-6h8a6 6 0 016 6v6c0 4-5.5 4-8 6z" fill="#fff"/>
              <rect x="8" y="10" width="16" height="2.5" rx="1.25" fill="#fc9090"/>
              <rect x="8" y="15" width="10" height="2.5" rx="1.25" fill="#fc9090"/>
            </svg>
          )}
        </button>
        
        {/* 챗봇 패널 */}
        {showChatbot && <ChatbotPanel onClose={() => setShowChatbot(false)} />}
      </div>
    </div>
  );
}

// 메인 App 컴포넌트 (라우터 감싸기)
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;