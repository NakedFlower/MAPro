// Sidebar.js
import React, { useContext, useMemo } from 'react';
import { Layout, Menu, Button, Tooltip, Avatar, Typography } from 'antd';
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  HomeOutlined,
  UserOutlined,
  SettingOutlined,
} from '@ant-design/icons';

import { useAuth } from "../context/AuthContext";

const { Sider } = Layout;

const menuItems = [
  { key: 'home', icon: <HomeOutlined />, label: '홈' },
  { key: 'profile', icon: <UserOutlined />, label: '내 정보' },
  { key: 'settings', icon: <SettingOutlined />, label: '성향 설정' },
];

function Sidebar({ selected, setSelected, onOpenLogin, isCollapsed, onToggleCollapse }) {
  const { user } = useAuth();

    // 메뉴 배열을 로그인 상태에 따라 동적으로 생성
  const menuItems = useMemo(() => {
    const baseMenu = [
      { key: 'home', icon: <HomeOutlined />, label: '홈' },
    ];

    if (user) {
      baseMenu.push(
        { key: 'profile', icon: <UserOutlined />, label: '내 정보' },
        { key: 'settings', icon: <SettingOutlined />, label: '성향 설정' }
      );
    }

    return baseMenu;
  }, [user]);

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
        zIndex: 9,
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
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
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        padding: '16px 16px 8px', 
        justifyContent: 'space-between',
        minHeight: '64px' // 고정 높이로 안정성 확보
      }}>
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

      {/* 메뉴 (남은 공간 차지, 하단 여백 확보) */}
      <Menu
        mode="inline"
        selectedKeys={[menuItems[selected]?.key]}
        items={menuItems}
        onClick={handleMenuClick}
        style={{ 
          flex: 1, 
          borderRight: 0,
          paddingBottom: '80px', // 로그인 버튼 공간 확보
          overflow: 'auto'
        }}
      />

      {/* 로그인 버튼 - 반응형 크기 및 위치 조정 */}
      {/* <div
        style={{
          position: 'absolute',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)', // 중앙 정렬
          width: isCollapsed ? '48px' : 'calc(100% - 32px)', // 너비 반응형 조정
          maxWidth: isCollapsed ? '48px' : '212px', // 최대 너비 제한
          transition: 'all 0.3s ease',
          zIndex: 1,
        }}
      >
        {isCollapsed ? (
          // 접힌 상태: 원형 아이콘 버튼
          <Tooltip title="로그인" placement="right">
            <Button
              type="primary"
              shape="circle"
              icon={<UserOutlined />}
              size="large"
              onClick={onOpenLogin}
              style={{
                width: '48px',
                height: '48px',
                background: '#6c5ce7',
                border: 'none',
                boxShadow: '0 2px 8px rgba(108, 92, 231, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            />
          </Tooltip>
        ) : (
          // 펼쳐진 상태: 전체 너비 텍스트 버튼
          <Button
            type="primary"
            icon={<UserOutlined />}
            onClick={onOpenLogin}
            style={{
              width: '100%',
              height: '44px',
              background: '#6c5ce7',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 2px 8px rgba(108, 92, 231, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            로그인
          </Button>
        )}
      </div> */}
      <div
        style={{
          position: 'absolute',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)', // 중앙 정렬
          width: isCollapsed ? '48px' : 'calc(100% - 32px)', // 너비 반응형 조정
          maxWidth: isCollapsed ? '48px' : '212px', // 최대 너비 제한
          transition: 'all 0.3s ease',
          zIndex: 1,
        }}
      >
      {user ? (
          // 로그인 상태: 사용자 정보 카드
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px',
              // background: '#f5f5f5',
              borderRadius: '8px',
            }}
          >
            <Avatar icon={<UserOutlined />} size={40} />
            {!isCollapsed && (
              <div>
                <Typography.Text strong>{user.name}님</Typography.Text>
                <br />
                <Typography.Text type="secondary">{user.username}</Typography.Text>
              </div>
            )}
          </div>
        ) : (
          // 비로그인 상태: 로그인 버튼
          <Button
            type="primary"
            icon={<UserOutlined />}
            onClick={onOpenLogin}
            block={!isCollapsed}
            shape={isCollapsed ? 'circle' : 'default'}
            size="large"
            style={{
              width: isCollapsed ? '48px' : '100%',  // 접혔을 때 고정 너비
              height: '48px',   
              background: '#6c5ce7',
              border: 'none',
              borderRadius: isCollapsed ? '50%' : '8px', // 접혔을 때 원형
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {!isCollapsed && '로그인'}
          </Button>
        )}
      </div>

    </Sider>
  );
}

export default Sidebar;