import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { App as AntdApp, ConfigProvider, FloatButton } from 'antd';
import Sidebar from './components/Sidebar';
import Home from './components/Home';
import ProfileInfo from './components/ProfileInfo';
import PreferenceSetting from './components/PreferenceSetting';
import MapView from './components/MapView';
import LoginPanel from './components/LoginPanel';
import ChatbotPanel from './components/ChatbotPanel';
import Main from './components/Main';

import LoginPage from './components/LoginPage';
import ProfileSettingsPage from './components/ProfileSettingsPage';
import FindAccountPage from './components/FindAccountPage';



// 메인 앱 컴포넌트 (라우터 내부)
function AppContent() {
  const [showLogin, setShowLogin] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // 메인 페이지 여부 확인
  const isMainPage = location.pathname === '/main';

  // 현재 경로에 따라 selected 상태 결정
  const getSelectedIndex = () => {
    switch (location.pathname) {
      case '/User/MyPage/Home':
        return 0;
      case '/User/MyPage/Private':
        return 1;
      case '/User/MyPage/Favorite':
        return 2;
      case '/map':
        return 3;
      default:
        return 0;
    }
  };

  // 메뉴 선택 시 네비게이션
  const handleMenuSelect = (index) => {
    switch (index) {
      case 0:
        navigate('/User/MyPage/Home');
        break;
      case 1:
        navigate('/User/MyPage/Private');
        break;
      case 2:
        navigate('/User/MyPage/Favorite');
        break;
      case 3:
        navigate('/map');
        break;
      default:
        navigate('/User/MyPage/Home');
    }
  };

  // 홈에서 지도로 이동
  const handleOpenMap = () => {
    navigate('/map');
  };

  // 사이드바 토글 함수
  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  // 로그인 패널 닫기 함수
  const handleCloseLogin = () => {
    setShowLogin(false);
  };

  // 챗봇 패널 닫기 함수
  const handleCloseChatbot = () => {
    setShowChatbot(false);
  };

  // 메인 페이지면 Main 컴포넌트만 렌더링
  if (isMainPage) {
    return (
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#1890ff',
          },
        }}
      >
        <AntdApp>
          <Main />
        </AntdApp>
      </ConfigProvider>
    );
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
        },
        components: {
          Modal: {
            zIndexPopup: 1100,
          },
        },
      }}
    >
      <AntdApp>
        <div
          style={{
            display: 'flex',
            minHeight: '100vh',
            background: '#fff',
          }}
        >
          {/* 사이드바 */}
          <Sidebar
            selected={getSelectedIndex()}
            setSelected={handleMenuSelect}
            onOpenLogin={() => setShowLogin(true)}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={handleToggleSidebar}
          />

          {/* 메인 콘텐츠 */}
          <div
            style={{
              flex: 1,
              background: '#f5f7fa',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              position: 'relative',
              minHeight: '100vh',
              marginLeft: isSidebarCollapsed ? 64 : 244,
              transition: 'margin-left 0.3s ease',
            }}
          >
            <Routes>
              <Route path="/User/MyPage/Home" element={<Home onOpenMap={handleOpenMap} />} />
              <Route path="/User/MyPage/Private" element={<ProfileInfo />} />
              <Route path="/User/MyPage/Favorite" element={<PreferenceSetting />} />
              <Route path="/map" element={<MapView />} />
            </Routes>

            {/* 로그인 패널 */}
            {showLogin && (
              <LoginPanel onClose={handleCloseLogin} />
            )}

            {/* 챗봇 플로팅 버튼 */}
            <FloatButton
              icon={
                showChatbot ? (
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 32 32" 
                    fill="white"
                    style={{
                      transform: showChatbot ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
                    }}
                  >
                    <path d="M8 8L24 24" stroke="white" strokeWidth="3" strokeLinecap="round" />
                    <path d="M24 8L8 24" stroke="white" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 32 32" 
                    fill="white"
                    style={{
                      transform: showChatbot ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
                    }}
                  >
                    <rect x="4" y="6" width="24" height="16" rx="6" fill="white" />
                    <path d="M16 28c-2.5-2-8-2-8-6V12a6 6 0 016-6h8a6 6 0 016 6v6c0 4-5.5 4-8 6z" fill="white" />
                    <rect x="8" y="10" width="16" height="2.5" rx="1.25" fill="#1890ff" />
                    <rect x="8" y="15" width="10" height="2.5" rx="1.25" fill="#1890ff" />
                  </svg>
                )
              }
              style={{
                right: 24,
                bottom: 24,
                width: 64,
                height: 64,
                backgroundColor: '#1890ff',
                boxShadow: showChatbot 
                  ? '0 8px 30px rgba(24, 144, 255, 0.4)' 
                  : '0 4px 16px rgba(24, 144, 255, 0.2)',
                transform: showChatbot ? 'scale(1.1)' : 'scale(1)',
                transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
              }}
              onClick={() => setShowChatbot((v) => !v)}
              tooltip={
                <div style={{
                  transition: 'opacity 0.2s ease',
                  opacity: showChatbot ? 0.8 : 1
                }}>
                  {showChatbot ? '닫기' : '챗봇 열기'}
                </div>
              }
            />

            {/* 챗봇 패널 */}
            {showChatbot && (
              <ChatbotPanel onClose={handleCloseChatbot} />
            )}
          </div>
        </div>
      </AntdApp>
    </ConfigProvider>
  );
}

// 최상위 App 컴포넌트
function App() {
  return (
    <Router>
      <Routes>
        {/* 루트 경로(/)를 /main으로 리다이렉트 */}
        <Route path="/" element={<Navigate to="/main" replace />} />
        {/* 나머지 모든 경로는 AppContent에서 처리 */}
        <Route path="/*" element={<AppContent />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile/edit" element={<ProfileSettingsPage />} />
        <Route path="/find/account" element={<FindAccountPage/>}/>
      </Routes>
    </Router>
  );
}

export default App;