//App.js
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
import RegisterPage from './components/RegisterPage'; // 새로 추가
import ProfileSettingsPage from './components/ProfileSettingsPage';
import FindAccountPage from './components/FindAccountPage';
import AccountSettings from './components/AccountSettings';


import { AuthProvider } from './context/AuthContext';

// 메인 앱 컴포넌트 (라우터 내부)
function AppContent() {
  const [showLogin, setShowLogin] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mapPlaces, setMapPlaces] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // 독립 페이지들 (사이드바 없는 페이지)
  const isStandalonePage = ['/main', '/login', '/register', '/find/account', '/profile/edit'].includes(location.pathname);

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
// 홈에서 지도로 이동
  const handleOpenMap = () => {
    navigate('/map');
  };

  // 챗봇에서 장소 데이터를 받아서 지도로 이동
  const handleShowPlacesOnMap = (places) => {
    setMapPlaces(places);
    setShowChatbot(false); // 챗봇 닫기
    navigate('/map'); // 지도 페이지로 이동
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





  // 독립 페이지들은 각각의 컴포넌트만 렌더링
  if (isStandalonePage) {
    return (
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#6c5ce7',
          },
        }}
      >
        <AntdApp>
          <Routes>
            <Route path="/main" element={<Main />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/find/account" element={<FindAccountPage />} />
            <Route path="/profile/edit" element={<ProfileSettingsPage />} />
          </Routes>
        </AntdApp>
      </ConfigProvider>
    );
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#6c5ce7',
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
              <Route path="/User/MyPage/Private" element={<AccountSettings />} />
              <Route path="/User/MyPage/Favorite" element={<PreferenceSetting />} />
              <Route path="/map" element={<MapView places={mapPlaces} onPlacesDisplayed={() => setMapPlaces(null)} />} />            </Routes>

            {/* 로그인 패널 */}
            {showLogin && (
              <LoginPanel onClose={handleCloseLogin} />
            )}

            {/* 챗봇 플로팅 버튼 */}
            <div
              style={{
                position: 'fixed',
                right: 24,
                bottom: 24,
                width: 48,
                height: 48,
                borderRadius: '50%',
                backgroundColor: '#6c5ce7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 1000,
                // 항상 강화된 hover 스타일 적용
                boxShadow: '0 12px 40px rgba(108, 92, 231, 0.5), 0 4px 20px rgba(108, 92, 231, 0.3)',
                transform: 'scale(1.15)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                background: 'linear-gradient(135deg, #6c5ce7 0%, #764ba2 100%)',
                transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
              }}
              onClick={() => setShowChatbot((v) => !v)}
              onMouseEnter={(e) => {
                // hover 시에도 동일한 스타일 유지 (약간만 더 강화)
                e.currentTarget.style.transform = 'scale(1.18)';
                e.currentTarget.style.boxShadow = '0 16px 50px rgba(108, 92, 231, 0.6), 0 6px 25px rgba(108, 92, 231, 0.4)';
              }}
              onMouseLeave={(e) => {
                // 원래 강화된 상태로 복귀
                e.currentTarget.style.transform = 'scale(1.15)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(108, 92, 231, 0.5), 0 4px 20px rgba(108, 92, 231, 0.3)';
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(1.12)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'scale(1.18)';
              }}
              title={showChatbot ? '닫기' : '챗봇 열기'}
            >
              {showChatbot ? (
                <svg 
                  width="20" 
                  height="20"
                  viewBox="0 0 32 32" 
                  fill="white"
                  style={{
                    transform: 'rotate(0deg)',
                    transition: 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
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
                    transform: 'rotate(0deg)',
                    transition: 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                  }}
                >
                  <rect x="4" y="6" width="24" height="16" rx="6" fill="white" />
                  <path d="M16 28c-2.5-2-8-2-8-6V12a6 6 0 016-6h8a6 6 0 016 6v6c0 4-5.5 4-8 6z" fill="white" />
                  <rect x="8" y="10" width="16" height="2.5" rx="1.25" fill="#6c5ce7" />
                  <rect x="8" y="15" width="10" height="2.5" rx="1.25" fill="#6c5ce7" />
                </svg>
              )}
            </div>

            {/* 챗봇 패널 */}
            {showChatbot && (
              <ChatbotPanel 
                onClose={handleCloseChatbot} 
                onShowPlacesOnMap={handleShowPlacesOnMap}
              />
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
    <AuthProvider>
    <Router>
      <Routes>
        {/* 루트 경로(/)를 /main으로 리다이렉트 */}
        <Route path="/" element={<Navigate to="/main" replace />} />
        {/* 나머지 모든 경로는 AppContent에서 처리 */}
        <Route path="/*" element={<AppContent />} />
      </Routes>
    </Router>
    </AuthProvider>
  );
}

export default App;
