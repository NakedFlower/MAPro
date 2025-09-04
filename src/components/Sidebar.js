// Sidebar.js
import React from 'react';
import { Layout, Menu, Button, Tooltip } from 'antd';
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  HomeOutlined,
  UserOutlined,
  SettingOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

const menuItems = [
  { key: 'home', icon: <HomeOutlined />, label: '홈' },
  { key: 'profile', icon: <UserOutlined />, label: '내 정보' },
  { key: 'settings', icon: <SettingOutlined />, label: '성향 설정' },
];

function Sidebar({ selected, setSelected, onOpenLogin, isCollapsed, onToggleCollapse }) {
  const handleMenuClick = ({ key }) => {
    const indexMap = { home: 0, profile: 1, settings: 2 };
    setSelected(indexMap[key]);
  };

  return (
    <Sider
      width={244}
      collapsedWidth={64}
      collapsed={isCollapsed}
      theme="light"
      style={{
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 9, // ✅ 중요: 너무 높지 않게 (Content: ~1, Modal: 1000+)
        display: 'flex',
        flexDirection: 'column',
      }}
      breakpoint="lg"
      onBreakpoint={(broken) => {
        if (broken && !isCollapsed) {
          onToggleCollapse();
        }
      }}
      trigger={null}
    >
      {/* 상단 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px 16px 8px', justifyContent: 'space-between' }}>
        {!isCollapsed && (
          <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#1f1f1f' }}>메뉴</span>
        )}
        <Button
          type="text"
          icon={isCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggleCollapse}
          style={{ width: 40, height: 40 }}
        />
      </div>

      {/* 메뉴 (남은 공간 차지) */}
      <Menu
        mode="inline"
        selectedKeys={[menuItems[selected]?.key]}
        items={menuItems}
        onClick={handleMenuClick}
        style={{ flex: 1, borderRight: 0 }}
      />

      {/* 로그인 버튼 - 절대 위치로 하단 고정 */}
      <div
        style={{
          position: 'absolute',
          bottom: 24,
          left: isCollapsed ? 20 : 16,
          zIndex: 1, // ✅ 사이드바 내에서만 유효한 z-index
          transition: 'all 0.3s ease',
        }}
      >
        <Tooltip title="로그인" placement="right">
          <Button
            type="primary"
            shape="circle"
            icon={<UserOutlined />}
            size="large"
            onClick={onOpenLogin}
            style={{
              width: 48,
              height: 48,
              background: '#1890ff',
              border: 'none',
            }}
          />
        </Tooltip>
      </div>
    </Sider>
  );
}

export default Sidebar;