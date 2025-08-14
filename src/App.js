// App.js
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Home from './components/Home';
import ProfileInfo from './components/ProfileInfo';
import PreferenceSetting from './components/PreferenceSetting';
import MapView from './components/MapView';
import LoginPanel from './components/LoginPanel';

function App() {
  const [selected, setSelected] = useState(0); // 0:'홈', 1:'개인 정보', 2:'내 성향 설정', 3:'지도'
  const [showLogin, setShowLogin] = useState(false);

  let MainContent;
  if (selected === 0) MainContent = <Home onOpenMap={() => setSelected(3)} />;
  else if (selected === 1) MainContent = <ProfileInfo />;
  else if (selected === 2) MainContent = <PreferenceSetting />;
  else if (selected === 3) MainContent = <MapView />;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#fff' }}>
      <Sidebar selected={selected} setSelected={setSelected} onOpenLogin={() => setShowLogin(true)} />
      <div style={{ flex: 1, background: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', position: 'relative' }}>
        {MainContent}
        {showLogin && <LoginPanel onClose={() => setShowLogin(false)} />}
      </div>
    </div>
  );
}

export default App;
