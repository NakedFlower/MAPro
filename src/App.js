// App.js
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Home from './components/Home';
import ProfileInfo from './components/ProfileInfo';
import PreferenceSetting from './components/PreferenceSetting';

function App() {
  const [selected, setSelected] = useState(0); // 0:'홈', 1:'개인 정보', 2:'내 성향 설정'

  let MainContent;
  if (selected === 0) MainContent = <Home />;
  else if (selected === 1) MainContent = <ProfileInfo />;
  else if (selected === 2) MainContent = <PreferenceSetting />;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#fff' }}>
      <Sidebar selected={selected} setSelected={setSelected} />
      <div style={{ flex: 1, background: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
        {MainContent}
      </div>
    </div>
  );
}

export default App;
