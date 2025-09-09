import React, { useState } from 'react';
import { 
  Input, 
  Button, 
  Card, 
  Typography, 
  Space, 
  Divider, 
  message,
  Row,
  Col,
  Avatar,
  Upload,
  Select,
  Switch,
  Badge,
  Tabs,
  Alert,
  Progress,
  Tag
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  CameraOutlined,
  SaveOutlined,
  SafetyCertificateOutlined,
  BellOutlined,
  TeamOutlined,
  CreditCardOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const ProfileSettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '김',
    lastName: '민수',
    email: 'minsu@company.com',
    phone: '+82 10-1234-5678',
    company: 'Tech Startup Inc.',
    position: 'Product Manager',
    department: 'Product',
    bio: '혁신적인 제품을 만들고 사용자 경험을 개선하는 것에 열정을 가지고 있습니다.',
    location: '서울, 대한민국',
    timezone: 'Asia/Seoul',
    language: 'ko'
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: true,
    loginNotifications: true
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    marketingEmails: false,
    weeklyReports: true,
    securityAlerts: true
  });

  const handleProfileUpdate = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success('프로필이 성공적으로 업데이트되었습니다!');
    }, 1500);
  };

  const handlePasswordChange = () => {
    if (!securityData.currentPassword || !securityData.newPassword || !securityData.confirmPassword) {
      message.error('모든 비밀번호 필드를 입력해주세요!');
      return;
    }
    
    if (securityData.newPassword !== securityData.confirmPassword) {
      message.error('새 비밀번호가 일치하지 않습니다!');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success('비밀번호가 성공적으로 변경되었습니다!');
      setSecurityData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    }, 1500);
  };

  const handleProfileInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSecurityInputChange = (field, value) => {
    setSecurityData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationChange = (field, value) => {
    setNotificationSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const ProfileTab = () => (
    <div>
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <UserOutlined style={{ marginRight: '8px', color: '#667eea' }} />
            개인 정보
          </div>
        }
        style={{ marginBottom: '24px' }}
        headStyle={{ borderBottom: '2px solid #f0f2f5' }}
      >
        {/* 프로필 사진 섹션 */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '32px',
          padding: '24px',
          background: '#fafbfc',
          borderRadius: '12px',
          border: '1px solid #e8e8e8'
        }}>
          <div style={{ position: 'relative', marginRight: '24px' }}>
            <Avatar 
              size={80} 
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
              style={{ border: '4px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Upload
              showUploadList={false}
              beforeUpload={() => {
                message.success('프로필 사진이 업데이트되었습니다!');
                return false;
              }}
            >
              <Button
                type="primary"
                size="small"
                icon={<CameraOutlined />}
                style={{
                  position: 'absolute',
                  bottom: -5,
                  right: -5,
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  background: '#667eea'
                }}
              />
            </Upload>
          </div>
          <div>
            <Title level={4} style={{ margin: 0, marginBottom: '4px' }}>
              {profileData.firstName} {profileData.lastName}
            </Title>
            <Text type="secondary">{profileData.position} at {profileData.company}</Text>
            <br />
            <Badge 
              status="success" 
              text="온라인" 
              style={{ marginTop: '8px' }}
            />
          </div>
        </div>

        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12}>
            <div style={{ marginBottom: '8px' }}>
              <Text strong>이름 *</Text>
            </div>
            <Input
              placeholder="이름"
              value={profileData.firstName}
              onChange={(e) => handleProfileInputChange('firstName', e.target.value)}
              size="large"
              style={{ borderRadius: '8px' }}
            />
          </Col>
          <Col xs={24} sm={12}>
            <div style={{ marginBottom: '8px' }}>
              <Text strong>성 *</Text>
            </div>
            <Input
              placeholder="성"
              value={profileData.lastName}
              onChange={(e) => handleProfileInputChange('lastName', e.target.value)}
              size="large"
              style={{ borderRadius: '8px' }}
            />
          </Col>
          <Col xs={24} sm={12}>
            <div style={{ marginBottom: '8px' }}>
              <Text strong>이메일 주소 *</Text>
            </div>
            <Input
              prefix={<MailOutlined />}
              placeholder="이메일"
              value={profileData.email}
              onChange={(e) => handleProfileInputChange('email', e.target.value)}
              size="large"
              style={{ borderRadius: '8px' }}
            />
          </Col>
          <Col xs={24} sm={12}>
            <div style={{ marginBottom: '8px' }}>
              <Text strong>전화번호</Text>
            </div>
            <Input
              prefix={<PhoneOutlined />}
              placeholder="전화번호"
              value={profileData.phone}
              onChange={(e) => handleProfileInputChange('phone', e.target.value)}
              size="large"
              style={{ borderRadius: '8px' }}
            />
          </Col>
          <Col xs={24} sm={12}>
            <div style={{ marginBottom: '8px' }}>
              <Text strong>회사명</Text>
            </div>
            <Input
              placeholder="회사명"
              value={profileData.company}
              onChange={(e) => handleProfileInputChange('company', e.target.value)}
              size="large"
              style={{ borderRadius: '8px' }}
            />
          </Col>
          <Col xs={24} sm={12}>
            <div style={{ marginBottom: '8px' }}>
              <Text strong>직책</Text>
            </div>
            <Input
              placeholder="직책"
              value={profileData.position}
              onChange={(e) => handleProfileInputChange('position', e.target.value)}
              size="large"
              style={{ borderRadius: '8px' }}
            />
          </Col>
          <Col xs={24} sm={12}>
            <div style={{ marginBottom: '8px' }}>
              <Text strong>부서</Text>
            </div>
            <Select
              placeholder="부서 선택"
              value={profileData.department}
              onChange={(value) => handleProfileInputChange('department', value)}
              size="large"
              style={{ width: '100%', borderRadius: '8px' }}
            >
              <Option value="Product">Product</Option>
              <Option value="Engineering">Engineering</Option>
              <Option value="Marketing">Marketing</Option>
              <Option value="Sales">Sales</Option>
              <Option value="HR">HR</Option>
              <Option value="Finance">Finance</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12}>
            <div style={{ marginBottom: '8px' }}>
              <Text strong>위치</Text>
            </div>
            <Input
              placeholder="위치"
              value={profileData.location}
              onChange={(e) => handleProfileInputChange('location', e.target.value)}
              size="large"
              style={{ borderRadius: '8px' }}
            />
          </Col>
          <Col xs={24}>
            <div style={{ marginBottom: '8px' }}>
              <Text strong>자기소개</Text>
            </div>
            <TextArea
              placeholder="자기소개를 입력해주세요"
              value={profileData.bio}
              onChange={(e) => handleProfileInputChange('bio', e.target.value)}
              rows={4}
              style={{ borderRadius: '8px' }}
            />
          </Col>
        </Row>

        <div style={{ marginTop: '32px', textAlign: 'right' }}>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            size="large"
            loading={loading}
            onClick={handleProfileUpdate}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '8px',
              minWidth: '140px'
            }}
          >
            저장하기
          </Button>
        </div>
      </Card>
    </div>
  );

  const SecurityTab = () => (
    <div>
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <SafetyCertificateOutlined style={{ marginRight: '8px', color: '#667eea' }} />
            보안 설정
          </div>
        }
        style={{ marginBottom: '24px' }}
        headStyle={{ borderBottom: '2px solid #f0f2f5' }}
      >
        {/* 보안 상태 */}
        <Alert
          message="보안 상태: 우수"
          description="계정이 안전하게 보호되고 있습니다. 2단계 인증이 활성화되어 있습니다."
          type="success"
          showIcon
          style={{ marginBottom: '24px', borderRadius: '8px' }}
        />

        {/* 비밀번호 변경 */}
        <div style={{ marginBottom: '32px' }}>
          <Title level={5} style={{ marginBottom: '16px' }}>비밀번호 변경</Title>
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <div style={{ marginBottom: '8px' }}>
                <Text strong>현재 비밀번호 *</Text>
              </div>
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="현재 비밀번호"
                value={securityData.currentPassword}
                onChange={(e) => handleSecurityInputChange('currentPassword', e.target.value)}
                size="large"
                style={{ borderRadius: '8px' }}
              />
            </Col>
            <Col xs={24} sm={12}>
              <div style={{ marginBottom: '8px' }}>
                <Text strong>새 비밀번호 *</Text>
              </div>
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="새 비밀번호"
                value={securityData.newPassword}
                onChange={(e) => handleSecurityInputChange('newPassword', e.target.value)}
                size="large"
                style={{ borderRadius: '8px' }}
              />
            </Col>
            <Col xs={24} sm={12}>
              <div style={{ marginBottom: '8px' }}>
                <Text strong>비밀번호 확인 *</Text>
              </div>
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="비밀번호 재입력"
                value={securityData.confirmPassword}
                onChange={(e) => handleSecurityInputChange('confirmPassword', e.target.value)}
                size="large"
                style={{ borderRadius: '8px' }}
              />
            </Col>
          </Row>

          {/* 비밀번호 강도 표시 */}
          <div style={{ marginTop: '16px' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>비밀번호 강도:</Text>
            <Progress 
              percent={75} 
              size="small" 
              strokeColor="#52c41a"
              showInfo={false}
              style={{ marginTop: '4px' }}
            />
            <div style={{ marginTop: '8px' }}>
              <Text style={{ fontSize: '12px', color: '#666' }}>
                • 8자 이상 • 대소문자 포함 • 숫자 포함 • 특수문자 포함
              </Text>
            </div>
          </div>

          <Button
            type="primary"
            onClick={handlePasswordChange}
            loading={loading}
            style={{
              marginTop: '16px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '8px'
            }}
          >
            비밀번호 변경
          </Button>
        </div>

        <Divider />

        {/* 2단계 인증 */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <Title level={5} style={{ margin: 0 }}>2단계 인증</Title>
              <Text type="secondary">계정 보안을 강화하기 위해 2단계 인증을 사용합니다</Text>
            </div>
            <Switch
              checked={securityData.twoFactorEnabled}
              onChange={(checked) => handleSecurityInputChange('twoFactorEnabled', checked)}
            />
          </div>
          {securityData.twoFactorEnabled && (
            <div style={{ 
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '8px',
              padding: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <CheckCircleOutlined style={{ color: '#0ea5e9', marginRight: '8px' }} />
                <Text strong>2단계 인증 활성화됨</Text>
              </div>
              <Text style={{ fontSize: '14px', color: '#666' }}>
                Google Authenticator 앱을 통해 2단계 인증이 설정되어 있습니다.
              </Text>
              <Button type="link" style={{ padding: 0, marginTop: '8px' }}>
                백업 코드 생성
              </Button>
            </div>
          )}
        </div>

        {/* 로그인 알림 */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Title level={5} style={{ margin: 0 }}>로그인 알림</Title>
              <Text type="secondary">새 기기에서 로그인할 때 이메일 알림 받기</Text>
            </div>
            <Switch
              checked={securityData.loginNotifications}
              onChange={(checked) => handleSecurityInputChange('loginNotifications', checked)}
            />
          </div>
        </div>
      </Card>

      {/* 최근 로그인 활동 */}
      <Card
        title="최근 로그인 활동"
        style={{ marginBottom: '24px' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { device: 'MacBook Pro', location: '서울, 대한민국', time: '2분 전', current: true },
            { device: 'iPhone 14', location: '서울, 대한민국', time: '1시간 전', current: false },
            { device: 'Chrome (Windows)', location: '부산, 대한민국', time: '3일 전', current: false }
          ].map((login, index) => (
            <div key={index} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px',
              background: login.current ? '#f0f9ff' : '#fafbfc',
              borderRadius: '8px',
              border: `1px solid ${login.current ? '#bae6fd' : '#e8e8e8'}`
            }}>
              <div>
                <Text strong>{login.device}</Text>
                {login.current && <Tag color="green" size="small" style={{ marginLeft: '8px' }}>현재</Tag>}
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {login.location} • {login.time}
                </Text>
              </div>
              {!login.current && (
                <Button type="text" danger size="small">
                  종료
                </Button>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const NotificationTab = () => (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <BellOutlined style={{ marginRight: '8px', color: '#667eea' }} />
          알림 설정
        </div>
      }
      headStyle={{ borderBottom: '2px solid #f0f2f5' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {[
          {
            key: 'emailNotifications',
            title: '이메일 알림',
            description: '중요한 업데이트와 활동에 대한 이메일 알림 받기',
            checked: notificationSettings.emailNotifications
          },
          {
            key: 'pushNotifications',
            title: '푸시 알림',
            description: '브라우저 푸시 알림으로 실시간 업데이트 받기',
            checked: notificationSettings.pushNotifications
          },
          {
            key: 'marketingEmails',
            title: '마케팅 이메일',
            description: '새로운 기능과 제품 업데이트에 대한 마케팅 이메일 받기',
            checked: notificationSettings.marketingEmails
          },
          {
            key: 'weeklyReports',
            title: '주간 리포트',
            description: '매주 활동 요약과 성과 리포트 받기',
            checked: notificationSettings.weeklyReports
          },
          {
            key: 'securityAlerts',
            title: '보안 알림',
            description: '보안 관련 중요한 알림 받기 (권장)',
            checked: notificationSettings.securityAlerts
          }
        ].map((item) => (
          <div key={item.key} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px',
            background: '#fafbfc',
            borderRadius: '8px',
            border: '1px solid #e8e8e8'
          }}>
            <div>
              <Text strong style={{ display: 'block', marginBottom: '4px' }}>
                {item.title}
              </Text>
              <Text type="secondary" style={{ fontSize: '14px' }}>
                {item.description}
              </Text>
            </div>
            <Switch
              checked={item.checked}
              onChange={(checked) => handleNotificationChange(item.key, checked)}
            />
          </div>
        ))}
      </div>

      <div style={{ marginTop: '32px', textAlign: 'right' }}>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          size="large"
          onClick={() => message.success('알림 설정이 저장되었습니다!')}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '8px',
            minWidth: '140px'
          }}
        >
          저장하기
        </Button>
      </div>
    </Card>
  );

  const tabItems = [
    {
      key: 'profile',
      label: (
        <span>
          <UserOutlined />
          프로필
        </span>
      ),
      children: <ProfileTab />
    },
    {
      key: 'security',
      label: (
        <span>
          <SafetyCertificateOutlined />
          보안
        </span>
      ),
      children: <SecurityTab />
    },
    {
      key: 'notifications',
      label: (
        <span>
          <BellOutlined />
          알림
        </span>
      ),
      children: <NotificationTab />
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* 헤더 */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '32px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid #e8e8e8'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <Title level={2} style={{ 
                margin: 0, 
                marginBottom: '8px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                계정 설정
              </Title>
              <Text type="secondary" style={{ fontSize: '16px' }}>
                프로필, 보안 및 알림 설정을 관리하세요
              </Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Badge status="success" />
              <Text type="secondary">마지막 업데이트: 방금 전</Text>
            </div>
          </div>
        </div>

        {/* 탭 컨텐츠 */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid #e8e8e8'
        }}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            size="large"
            style={{ minHeight: '600px' }}
            tabBarStyle={{
              padding: '0 32px',
              margin: 0,
              background: '#fafbfc',
              borderBottom: '1px solid #e8e8e8'
            }}
            tabPaneStyle={{ padding: '32px' }}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsPage;