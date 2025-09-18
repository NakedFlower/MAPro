import React, { useState, useEffect } from 'react';
import {
  Layout,
  Tabs,
  Avatar,
  Input,
  Button,
  Card,
  Badge,
  Typography,
  Row,
  Col,
  Space,
  Alert,
  Divider,
  message
} from 'antd';
import { UserOutlined, SafetyOutlined, BellOutlined, LogoutOutlined } from '@ant-design/icons';

import { useAuth, logout } from "../context/AuthContext";

const { Content, Header } = Layout;
const { Title, Text } = Typography;

const AccountSettings = () => {
  const { user, logout } = useAuth();

  // ✅ 항상 최상위에서 useState 호출
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    status: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // ✅ 항상 최상위에서 useEffect 호출
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        status: user.status || "",
      }));
    }
  }, [user]);

  const [activeTab, setActiveTab] = useState("profile");

  // ✅ 훅 호출 다 끝난 후 조건부 리턴
  if (!user) {
    return <div>Loading...</div>;
  }


  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleProfileSave = () => {
    message.success('프로필이 저장되었습니다.');
    console.log('Profile saved:', formData);
    // 실제 API 호출 로직 추가 가능
  };

  const handlePasswordChange = () => {
    if (formData.newPassword !== formData.confirmPassword) {
      message.error('비밀번호가 일치하지 않습니다!');
      return;
    }
    message.success('비밀번호가 변경되었습니다.');
    console.log('Password changed:', formData.newPassword);
    // 실제 API 호출 로직 추가 가능
  };

  // 📌 프로필 탭
  const ProfileTab = () => (
    <div style={{ padding: '24px 0' }}>
      <Card
        title={
          <Space>
            <UserOutlined style={{ color: '#722ed1' }} />
            <Text>개인 정보</Text>
          </Space>
        }
        style={{ marginBottom: 24 }}
      >
        <Card style={{ marginBottom: 24, backgroundColor: '#fafafa', borderRadius: 8 }}>
          <Row gutter={24} align="middle">
            <Col span={6}>
              <Avatar size={80} style={{ backgroundColor: '#d9d9d9' }} />
            </Col>
            <Col span={18}>
              <Title level={4} style={{ margin: 0 }}>{formData.name || "이름 없음"}</Title>
              <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                {formData.email || "이메일 없음"}
              </Text>
              <div>
                <Badge status="success" text="온라인" />
                <Divider type="vertical" />
                <Badge status="default" text="오프라인" />
              </div>
            </Col>
          </Row>
        </Card>

        <div style={{ marginBottom: 24 }}>
          <Text strong>이름 *</Text>
          <Input
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="이름을 입력하세요"
            style={{ marginTop: 8, marginBottom: 16 }}
          />

          <Text strong>이메일 *</Text>
          <Input
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="이메일을 입력하세요"
            style={{ marginTop: 8, marginBottom: 16 }}
          />

          <Text strong>전화번호</Text>
          <Input
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="전화번호를 입력하세요"
            style={{ marginTop: 8, marginBottom: 16 }}
          />
        </div>

        <Space>
          <Button type="primary" onClick={handleProfileSave}>
            저장
          </Button>
          <Button>취소</Button>
        </Space>
      </Card>
    </div>
  );

  // 📌 보안 탭
  const SecurityTab = () => (
    <div style={{ padding: '24px 0' }}>
      <Card
        title={
          <Space>
            <SafetyOutlined style={{ color: '#722ed1' }} />
            <Text>보안 설정</Text>
          </Space>
        }
        style={{ marginBottom: 24 }}
      >
        <Alert
          message="보안 상태: 우수"
          description="계정이 안전하게 보호되고 있습니다."
          type="success"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Title level={4}>비밀번호 변경</Title>

        <div style={{ paddingTop: 16 }}>
          <div style={{ marginBottom: 16 }}>
            <Text strong>현재 비밀번호 *</Text>
            <Input.Password
              value={formData.currentPassword}
              onChange={(e) => handleInputChange('currentPassword', e.target.value)}
              placeholder="현재 비밀번호를 입력하세요"
              style={{ marginTop: 8 }}
            />
          </div>

          <Row gutter={16}>
            <Col span={12}>
              <div style={{ marginBottom: 16 }}>
                <Text strong>새 비밀번호 *</Text>
                <Input.Password
                  value={formData.newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                  placeholder="새 비밀번호를 입력하세요"
                  style={{ marginTop: 8 }}
                />
              </div>
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: 16 }}>
                <Text strong>비밀번호 확인 *</Text>
                <Input.Password
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="새 비밀번호를 다시 입력하세요"
                  style={{ marginTop: 8 }}
                />
              </div>
            </Col>
          </Row>

          <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: 24 }}>
            8자 이상, 대소문자 포함, 숫자 포함, 특수문자 포함
          </Text>

          <Space>
            <Button type="primary" onClick={handlePasswordChange}>
              비밀번호 변경
            </Button>
            <Button>취소</Button>
          </Space>
        </div>
      </Card>

      <Card title="추가 보안 설정" style={{ marginBottom: 24 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Text strong>2단계 인증</Text>
              <br />
              <Text type="secondary">계정 보안을 강화하기 위해 2단계 인증을 설정하세요</Text>
            </div>
            <Button>설정</Button>
          </div>
          <Divider />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Text strong>로그인 알림</Text>
              <br />
              <Text type="secondary">새로운 기기에서 로그인할 때 알림을 받습니다</Text>
            </div>
            <Button>설정</Button>
          </div>
        </Space>
      </Card>
    </div>
  );

  // 📌 알림 탭
  const NotificationsTab = () => (
    <div style={{ padding: '24px 0' }}>
      <Card title="알림 설정">
        <Text>알림 설정 내용이 여기에 표시됩니다.</Text>
      </Card>
    </div>
  );

  const tabItems = [
    { key: 'profile', label: '프로필', content: <ProfileTab /> },
    { key: 'security', label: '보안', content: <SecurityTab /> },
    { key: 'notifications', label: '알림', content: <NotificationsTab /> }
  ];

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Header style={{ backgroundColor: 'white', padding: '12px 24px', borderBottom: '1px solid #e8e8e8', minHeight: '100px' }}>
        <Row justify="space-between" align="middle" style={{ height: '100%' }}>
          <Col>
            <Title level={3} style={{ margin: 0, color: '#722ed1' }}>계정 설정</Title>
            <Text type="secondary">프로필, 보안 및 알림 설정을 관리하세요</Text>
          </Col>
          <Col>
            <Space>
              <Badge dot>
                <Text>마지막 업데이트: 방금 전</Text>
              </Badge>
              <Button icon={<LogoutOutlined />} onClick={logout}>로그아웃</Button>
            </Space>
          </Col>
        </Row>
      </Header>

      <Content style={{ padding: '24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <Card style={{ borderRadius: '8px' }}>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              size="large"
              items={tabItems.map(item => ({
                key: item.key,
                label: (
                  <Space>
                    {item.key === 'profile' && <UserOutlined />}
                    {item.key === 'security' && <SafetyOutlined />}
                    {item.key === 'notifications' && <BellOutlined />}
                    {item.label}
                  </Space>
                ),
                children: item.content
              }))}
            />
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default AccountSettings;
