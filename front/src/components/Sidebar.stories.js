// src/components/Sidebar.stories.js
import Sidebar from './Sidebar';

export default {
  title: 'Components/Sidebar', // 좌측 트리 경로
  component: Sidebar,          // 미리보기 대상 컴포넌트
  tags: ['autodocs'],          // (선택) Docs 자동 생성
  parameters: {
    layout: 'fullscreen',      // (선택) 화면 꽉 채우기
  },
  argTypes: {
    onSelect: { action: 'select' }, // (선택) 클릭 이벤트 로깅
  },
};

// 스토리(케이스)들은 "이름있는 export"
export const Default = {
  args: {
    collapsed: false,
    items: [
      { id: 'home', label: 'Home' },
      { id: 'stats', label: 'Stats' },
      { id: 'settings', label: 'Settings' },
    ],
    activeId: 'home',
  },
};

export const Collapsed = {
  args: {
    ...Default.args,
    collapsed: true,
  },
};
