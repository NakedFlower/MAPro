//LoginPage.js mapro.cloud:3000/login
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
  Checkbox
} from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  GoogleOutlined,
  GithubOutlined,
  LinkedinOutlined,
  AppleOutlined,
  SafetyOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  CloudOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';

const { Title, Text, Link } = Typography;

const LoginPage = () => {
  const navigate = useNavigate();  // 이 줄 추가
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async () => {
  if (!email || !password) {
    message.error('이메일과 비밀번호를 모두 입력해주세요!');
    return;
  }

  if (!/\S+@\S+\.\S+/.test(email)) {
    message.error('올바른 이메일 형식을 입력해주세요!');
    return;
  }

  setLoading(true);
  
  try {
    // 백엔드 로그인 API 호출
    const response = await fetch('http://34.64.120.99:4000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: email,
        password: password,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      message.success('로그인이 성공적으로 완료되었습니다!');
      // 로그인 성공 후 토큰 저장 등 처리
      localStorage.setItem('token', data.token);
      navigate('/User/MyPage/Home'); // 로그인 후 메인 대시보드로 이동
    } else {
      message.error('이메일 또는 비밀번호가 잘못되었습니다.');
    }
  } catch (error) {
    message.error('로그인 중 오류가 발생했습니다.');
  } finally {
    setLoading(false);
  }
};

  const handleSocialLogin = (provider) => {
    message.info(`${provider}로 로그인 중...`);
  };

  const features = [
    {
      icon: <ThunderboltOutlined style={{ fontSize: '24px', color: '#ffffff' }} />,
      title: '개인 맞춤화',
      description: '취향을 반영한 매장 탐색'
    },
    {
      icon: <CloudOutlined style={{ fontSize: '24px', color: '#ffffff' }} />,
      title: '사용자 중심',
      description: '대화형 지도 어플'
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* 배경 장식 요소 */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        right: '-20%',
        width: '800px',
        height: '800px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '50%',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-30%',
        left: '-10%',
        width: '600px',
        height: '600px',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '50%',
        zIndex: 0
      }} />

      <Row style={{ width: '100%', minHeight: '100vh', zIndex: 1 }}>
        {/* 왼쪽 정보 섹션 */}
        <Col xs={0} lg={12} style={{
          padding: '80px 60px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          color: 'white'
        }}>
          <div style={{ maxWidth: '500px', margin: '0 auto' }}>
            <div style={{ marginBottom: '60px' }}>
              <Title level={1} style={{ 
                color: 'white', 
                fontSize: '48px', 
                fontWeight: '700',
                marginBottom: '24px',
                lineHeight: '1.2'
              }}>
                당신만의 매장을 <br />찾아보세요 
              </Title>
              <Text style={{ 
                color: 'rgba(255, 255, 255, 0.9)', 
                fontSize: '18px',
                lineHeight: '1.6'
              }}>
                지도 어플의 혁신을 경험하세요.<br />
              </Text>
            </div>


            <Row gutter={[32, 32]}>
              {features.map((feature, index) => (
                <Col span={12} key={index}>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    padding: '24px',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                    <div style={{ marginBottom: '12px' }}>
                      {feature.icon}
                    </div>
                    <Title level={5} style={{ color: 'white', marginBottom: '8px' }}>
                      {feature.title}
                    </Title>
                    <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '13px', whiteSpace: 'nowrap' }}>
                      {feature.description}
                    </Text>
                  </div>
                </Col>
              ))}
            </Row>
            {/* 
            <div style={{ 
              marginTop: '60px', 
              padding: '24px', 
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontStyle: 'italic' }}>
                "MaproCloud 덕분에 우리 팀의 생산성이 300% 향상되었습니다. 
                정말 혁신적인 플랫폼이에요!"
              </Text>
              <div style={{ marginTop: '12px' }}>
                <Text style={{ color: 'white', fontWeight: '600' }}>
                  김민수 CEO, 테크스타트업
                </Text>
              </div> 
            </div>
            */}
          </div>
        </Col>

        {/* 오른쪽 로그인 폼 섹션 */}
        <Col xs={24} lg={12} style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          background: 'rgba(255, 255, 255, 0.02)',
          backdropFilter: 'blur(10px)'
        }}>
          <Card
            style={{
              width: '100%',
              maxWidth: '440px',
              borderRadius: '24px',
              boxShadow: '0 32px 64px rgba(0, 0, 0, 0.2)',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)'
            }}
            bodyStyle={{ padding: '48px 40px' }}
          >
            {/* 로고 및 헤더 */}
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
              }}>
                <CloudOutlined style={{ fontSize: '32px', color: 'white' }} />
              </div>
              <Title level={2} style={{ 
                marginBottom: '8px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: '700'
              }}>
                MAPro
              </Title>
              <Text type="secondary" style={{ fontSize: '16px' }}>
                계정에 로그인하세요
              </Text>
            </div>

            {/* 소셜 로그인 버튼들 */}
            <Space direction="vertical" style={{ width: '100%', marginBottom: '32px' }} size="middle">
              <Button
                icon={<GoogleOutlined />}
                block
                size="large"
                style={{ 
                  height: '48px', 
                  borderRadius: '12px',
                  border: '1px solid #e8e8e8',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
                }}
                onClick={() => handleSocialLogin('Google')}
              >
                Google로 계속하기
              </Button>
              <Row gutter={12}>
                <Col span={12}>
                  <Button
                    icon={<GithubOutlined />}
                    block
                    size="large"
                    style={{ 
                      height: '48px', 
                      borderRadius: '12px',
                      border: '1px solid #e8e8e8',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
                    }}
                    onClick={() => handleSocialLogin('GitHub')}
                  >
                    GitHub
                  </Button>
                </Col>
                <Col span={12}>
                  <Button
                    icon={<AppleOutlined />}
                    block
                    size="large"
                    style={{ 
                      height: '48px', 
                      borderRadius: '12px',
                      border: '1px solid #e8e8e8',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
                    }}
                    onClick={() => handleSocialLogin('Apple')}
                  >
                    Apple
                  </Button>
                </Col>
              </Row>
            </Space>

            <Divider>
              <Text type="secondary" style={{ fontSize: '14px' }}>또는 이메일로</Text>
            </Divider>

            {/* 이메일 로그인 폼 */}
            <div style={{ marginTop: '32px' }}>
              <div style={{ marginBottom: '20px' }}>
                <Text style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '500',
                  color: '#333'
                }}>
                  이메일 주소
                </Text>
                <Input
                  prefix={<MailOutlined style={{ color: '#999' }} />}
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ 
                    borderRadius: '12px',
                    border: '1px solid #e8e8e8',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
                  }}
                  size="large"
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <Text style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '500',
                  color: '#333'
                }}>
                  비밀번호
                </Text>
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#999' }} />}
                  placeholder="비밀번호를 입력하세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                  style={{ 
                    borderRadius: '12px',
                    border: '1px solid #e8e8e8',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
                  }}
                  size="large"
                />
              </div>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '32px' 
              }}>
                <Checkbox 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                >
                  <Text style={{ fontSize: '14px' }}>로그인 상태 유지</Text>
                </Checkbox>
                <Link onClick={() => navigate('/find/account')} style={{ fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
                  비밀번호를 잊으셨나요?
                </Link>
              </div>

              <Button
                type="primary"
                onClick={handleLogin}
                loading={loading}
                block
                size="large"
                style={{ 
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: '600',
                  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
                }}
              >
                로그인
              </Button>

              <div style={{ textAlign: 'center', marginTop: '32px' }}>
                <Text type="secondary" style={{ fontSize: '14px' }}>
                  아직 계정이 없으신가요? {' '}
                </Text>
                <Link onClick={() => navigate('/register')} style={{ fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                  무료로 시작하기
                </Link>
              </div>

              {/* 보안 정보
              <div style={{
                marginTop: '32px',
                padding: '16px',
                background: '#f8f9ff',
                borderRadius: '12px',
                border: '1px solid #e6f0ff'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <SafetyOutlined style={{ color: '#667eea', marginRight: '8px' }} />
                  <Text style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
                    보안 로그인
                  </Text>
                </div>
                <Text style={{ fontSize: '13px', color: '#666' }}>
                  모든 데이터는 256비트 SSL 암호화로 보호됩니다.
                </Text>
              </div>
               */}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default LoginPage;