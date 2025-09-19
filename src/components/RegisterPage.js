// components/RegisterPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Checkbox,
  Progress,
  Alert
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  GoogleOutlined,
  GithubOutlined,
  AppleOutlined,
  SafetyOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  CloudOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
//import { authAPI } from '../services/apiService';

const { Title, Text, Link } = Typography;

const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 12.5;
    if (/[^A-Za-z0-9]/.test(password)) strength += 12.5;
    return Math.min(100, strength);
  };

  const getPasswordStrengthText = (strength) => {
    if (strength < 25) return { text: '매우 약함', color: '#ff4d4f' };
    if (strength < 50) return { text: '약함', color: '#faad14' };
    if (strength < 75) return { text: '보통', color: '#faad14' };
    if (strength < 90) return { text: '강함', color: '#52c41a' };
    return { text: '매우 강함', color: '#52c41a' };
  };

  const handleRegister = async () => {
    // 유효성 검사
    if (!formData.name.trim()) {
      message.error('이름을 입력해주세요!');
      return;
    }

    if (formData.name.trim().length < 2 || formData.name.trim().length > 50) {
      message.error('이름은 2자 이상 50자 이하로 입력해주세요!');
      return;
    }

    if (!validateEmail(formData.email)) {
      message.error('올바른 이메일 형식을 입력해주세요!');
      return;
    }

    if (!validatePassword(formData.password)) {
      message.error('비밀번호는 6자 이상이어야 합니다!');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      message.error('비밀번호가 일치하지 않습니다!');
      return;
    }

    if (!agreeTerms || !agreePrivacy) {
      message.error('필수 약관에 동의해주세요!');
      return;
    }

    setLoading(true);

    try {
        const response = await fetch('http://34.64.120.99:4000/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: formData.name.trim(),
                username: formData.email.toLowerCase().trim(),  // email → username으로 변경
                password: formData.password
            }),
            });

      if (response.success) {
        message.success('회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        message.error(response.message || '회원가입에 실패했습니다.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = '회원가입 중 오류가 발생했습니다.';
      
      if (error.message) {
        // 백엔드 에러 코드에 따른 메시지 처리
        if (error.message.includes('VALID001')) {
          errorMessage = '올바른 이메일 형식을 입력해주세요.';
        } else if (error.message.includes('VALID002')) {
          errorMessage = '비밀번호는 6자 이상 20자 이하로 입력해주세요.';
        } else if (error.message.includes('VALID003')) {
          errorMessage = '이름은 2자 이상 50자 이하로 입력해주세요.';
        } else if (error.message.includes('VALID004')) {
          errorMessage = '필수 항목을 모두 입력해주세요.';
        } else if (error.message.includes('이미 존재')) {
          errorMessage = '이미 가입된 이메일입니다.';
        } else {
          errorMessage = error.message;
        }
      }
      
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialRegister = (provider) => {
    message.info(`${provider}를 통한 회원가입 기능은 준비 중입니다.`);
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const passwordStrengthInfo = getPasswordStrengthText(passwordStrength);

  const features = [
    {
      icon: <ThunderboltOutlined style={{ fontSize: '24px', color: 'white' }} />,
      title: '개인 맞춤화',
      description: '취향을 반영한 매장 탐색'
    },
    {
      icon: <CloudOutlined style={{ fontSize: '24px', color: 'white' }} />,
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
                무료로 시작하여 지도 어플의 혁신을 경험해보세요.<br />
              </Text>
            </div>

            <Row gutter={[24, 24]}>
              {features.map((feature, index) => (
                <Col span={24} key={index}>
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

            <div style={{ 
              marginTop: '60px', 
              padding: '24px', 
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '12px', fontSize: '20px' }} />
                <Text style={{ color: 'white', fontWeight: '600', fontSize: '16px' }}>
                  무료 체험 혜택
                </Text>
              </div>
              <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px' }}>
                • 30일 무료 체험<br />
                • 모든 프리미엄 기능 이용<br />
                • 24/7 고객 지원<br />
                • 언제든 취소 가능
              </Text>
            </div>
          </div>
        </Col>

        {/* 오른쪽 회원가입 폼 섹션 */}
        <Col xs={24} lg={12} style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          background: 'rgba(255, 255, 255, 0.02)',
          backdropFilter: 'blur(10px)',
          overflowY: 'auto'
        }}>
          <Card
            style={{
              width: '100%',
              maxWidth: '440px',
              borderRadius: '24px',
              boxShadow: '0 32px 64px rgba(0, 0, 0, 0.2)',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              marginTop: '20px',
              marginBottom: '20px'
            }}
            bodyStyle={{ padding: '48px 40px' }}
          >
            {/* 로고 및 헤더 */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
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
                무료로 계정을 만들어보세요
              </Text>
            </div>

            {/* 소셜 회원가입 버튼들 */}
            <Space direction="vertical" style={{ width: '100%', marginBottom: '24px' }} size="middle">
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
                onClick={() => handleSocialRegister('Google')}
              >
                Google로 가입하기
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
                    onClick={() => handleSocialRegister('GitHub')}
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
                    onClick={() => handleSocialRegister('Apple')}
                  >
                    Apple
                  </Button>
                </Col>
              </Row>
            </Space>

            <Divider>
              <Text type="secondary" style={{ fontSize: '14px' }}>또는 이메일로</Text>
            </Divider>

            {/* 이메일 회원가입 폼 */}
            <div style={{ marginTop: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <Text style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '500',
                  color: '#333'
                }}>
                  이름 *
                </Text>
                <Input
                  prefix={<UserOutlined style={{ color: '#999' }} />}
                  placeholder="이름을 입력하세요"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  style={{ 
                    borderRadius: '12px',
                    border: '1px solid #e8e8e8',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
                  }}
                  size="large"
                  maxLength={50}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <Text style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '500',
                  color: '#333'
                }}>
                  이메일 주소 *
                </Text>
                <Input
                  prefix={<MailOutlined style={{ color: '#999' }} />}
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  style={{ 
                    borderRadius: '12px',
                    border: '1px solid #e8e8e8',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
                  }}
                  size="large"
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <Text style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '500',
                  color: '#333'
                }}>
                  비밀번호 *
                </Text>
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#999' }} />}
                  placeholder="비밀번호를 입력하세요"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                  style={{ 
                    borderRadius: '12px',
                    border: '1px solid #e8e8e8',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
                  }}
                  size="large"
                  maxLength={20}
                />
                {formData.password && (
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <Text style={{ fontSize: '12px', color: '#666' }}>비밀번호 강도</Text>
                      <Text style={{ fontSize: '12px', color: passwordStrengthInfo.color, fontWeight: '500' }}>
                        {passwordStrengthInfo.text}
                      </Text>
                    </div>
                    <Progress
                      percent={passwordStrength}
                      size="small"
                      strokeColor={passwordStrengthInfo.color}
                      showInfo={false}
                    />
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '24px' }}>
                <Text style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '500',
                  color: '#333'
                }}>
                  비밀번호 확인 *
                </Text>
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#999' }} />}
                  placeholder="비밀번호를 다시 입력하세요"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                  style={{ 
                    borderRadius: '12px',
                    border: '1px solid #e8e8e8',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
                  }}
                  size="large"
                  maxLength={20}
                />
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <Text type="danger" style={{ fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    비밀번호가 일치하지 않습니다.
                  </Text>
                )}
              </div>
              
              <div style={{ marginBottom: '24px' }}>
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                  <Checkbox 
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                  >
                    <Text style={{ fontSize: '14px' }}>
                      <Text strong style={{ color: '#ff4d4f' }}>*</Text>
                      {' '}이용약관에 동의합니다 
                      <Link href="#" style={{ fontSize: '14px' }}>(보기)</Link>
                    </Text>
                  </Checkbox>
                  {/* 
                  <Checkbox 
                    checked={agreePrivacy}
                    onChange={(e) => setAgreePrivacy(e.target.checked)}
                  >
                    <Text style={{ fontSize: '14px' }}>
                      <Text strong style={{ color: '#ff4d4f' }}>*</Text>
                      {' '}개인정보 처리방침에 동의합니다 
                      <Link href="#" style={{ fontSize: '14px' }}>(보기)</Link>
                    </Text>
                  </Checkbox>
                  <Checkbox 
                    checked={agreeMarketing}
                    onChange={(e) => setAgreeMarketing(e.target.checked)}
                  >
                    <Text style={{ fontSize: '14px' }}>
                      마케팅 정보 수신에 동의합니다 (선택)
                    </Text>
                  </Checkbox>
                  */} 
                </Space>
              </div>

              <Button
                type="primary"
                onClick={handleRegister}
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
                  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                  marginBottom: '24px'
                }}
              >
                무료로 시작하기
              </Button>

              <div style={{ textAlign: 'center' }}>
                <Text type="secondary" style={{ fontSize: '14px' }}>
                  이미 계정이 있으신가요? {' '}
                </Text>
                <Link 
                  onClick={() => navigate('/login')} 
                  style={{ fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                >
                  로그인하기
                </Link>
              </div>

              {/* 보안 정보 
              <div style={{
                marginTop: '24px',
                padding: '16px',
                background: '#f8f9ff',
                borderRadius: '12px',
                border: '1px solid #e6f0ff'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <SafetyOutlined style={{ color: '#667eea', marginRight: '8px' }} />
                  <Text style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
                    안전한 회원가입
                  </Text>
                </div>
                <Text style={{ fontSize: '13px', color: '#666' }}>
                  모든 데이터는 256비트 SSL 암호화로 보호되며,<br />
                  개인정보는 철저히 보안이 유지됩니다.
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

export default RegisterPage;