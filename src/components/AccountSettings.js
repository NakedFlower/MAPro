import React, { useState, useEffect, useCallback } from 'react';
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
  Spin,
  Alert,
  Divider,
  message,
  Timeline
} from 'antd';
import dayjs from "dayjs";

import { UserOutlined, SafetyOutlined, BellOutlined, LogoutOutlined } from '@ant-design/icons';

import { useAuth } from "../context/AuthContext";

const { Content } = Layout;
const { Title, Text } = Typography;

const AccountSettings = () => {
  const { user, updateUser, logout } = useAuth();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    phone: "",
    status: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        username: user.username || "",
        phone: user.phone || "",
        status: user.status || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [user]);

  if (!user) return <div>Loading...</div>;

  const handlePasswordChange = () => {
    if (formData.newPassword !== formData.confirmPassword) {
      message.error('비밀번호가 일치하지 않습니다!');
      return;
    }
    message.success('비밀번호가 변경되었습니다.');
    console.log('Password changed:', formData.newPassword);
  };

  const ProfileTab = () => {
    const [nameInput, setNameInput] = useState(formData.name);
    const [usernameInput, setUsernameInput] = useState(formData.username);
    const [phoneInput, setPhoneInput] = useState(formData.phone);

    useEffect(() => {
      setNameInput(formData.name);
      setUsernameInput(formData.username);
    }, [formData]);

    const handleProfileSave = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user"));
        const res = await fetch(`http://mapro.cloud:4000/api/user/${user.userId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: nameInput,
            username: usernameInput,
          }),
        });

        if (!res.ok) throw new Error("이름 수정 실패");

        const updatedUser = await res.json();
        updateUser(updatedUser);
        setFormData(prev => ({ ...prev, name: updatedUser.name }));
        message.success("이름이 수정되었습니다!");
      } catch (err) {
        console.error(err);
        message.error("이름 수정에 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    return (
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
                  {formData.username || "이메일 없음"}
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
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              placeholder="이름을 입력하세요"
              style={{ marginTop: 8, marginBottom: 16 }}
            />

            <Text strong>이메일 *</Text>
            <Input
              value={usernameInput}
              onChange={e => setUsernameInput(e.target.value)}
              placeholder="이메일을 입력하세요"
              style={{ marginTop: 8, marginBottom: 16 }}
              disabled
            />

            <Text strong>전화번호</Text>
            <Input
              value={phoneInput}
              onChange={e => setPhoneInput(e.target.value)}
              placeholder="전화번호를 입력하세요"
              style={{ marginTop: 8, marginBottom: 16 }}
            />
          </div>

          <Space>
            <Button type="primary" onClick={handleProfileSave} loading={loading}>저장</Button>
            <Button loading={loading}>취소</Button>
          </Space>
        </Card>
      </div>
    );
  };

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
              onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
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
                  onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
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
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
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
            <Button type="primary" onClick={handlePasswordChange}>비밀번호 변경</Button>
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

  // ----------------------- NotificationsTab 수정 -----------------------
  const NotificationsTab = () => {
    const [logs, setLogs] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loadingLogs, setLoadingLogs] = useState(false);

    const fetchLogs = useCallback(async (pageNumber = 0) => {
      try {
        setLoadingLogs(true);
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user"));

        const res = await fetch(`http://mapro.cloud:4000/api/user/logs/${user.userId}?page=${pageNumber}&size=10`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("로그 가져오기 실패");

        const data = await res.json();
        console.log(data)
        setLogs(data.content);
        setTotalPages(data.totalPages);
        setPage(data.number);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingLogs(false);
      }
    }, []);

    useEffect(() => { fetchLogs(0); }, [fetchLogs]);

      return (
    <div style={{ padding: "24px 0" }}>
      <Card title="사용자 활동 로그">
        <Spin spinning={loadingLogs}>
          <Timeline>
            {logs.map((log) => (
              <Timeline.Item key={log.id}>
                <Space direction="vertical" size={2}>
                  <Text strong>{log.username} {log.detail}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {dayjs(log.createdAt).format("YYYY-MM-DD HH:mm")}
                  </Text>
                  <Text>{log.description}</Text>
                </Space>
              </Timeline.Item>
            ))}
          </Timeline>

          <div style={{ marginTop: 16, textAlign: "center" }}>
            <Button
              disabled={page <= 0}
              onClick={() => fetchLogs(page - 1)}
              style={{ marginRight: 8 }}
            >
              이전
            </Button>
            <Button
              disabled={page >= totalPages - 1}
              onClick={() => fetchLogs(page + 1)}
            >
              다음
            </Button>
          </div>
        </Spin>
      </Card>
    </div>
  );
  };

  const tabItems = [
    { key: 'profile', label: '프로필', content: <ProfileTab /> },
    { key: 'security', label: '보안', content: <SecurityTab /> },
    { key: 'notifications', label: '알림', content: <NotificationsTab /> }
  ];

  return (
    <Layout style={{ backgroundColor: '#f5f5f5' }}>
      <Content style={{ padding: '24px', background: '#f5f5f5', display: 'flex', justifyContent: 'center' }}>
        <div
          style={{
            width: '100%',
            maxWidth: 1000,
            backgroundColor: '#fff',
            borderRadius: 12,
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            padding: '24px 32px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Title level={3} style={{ margin: 0, color: '#722ed1' }}>계정 설정</Title>
              <Text type="secondary">프로필, 보안 및 알림 설정을 관리하세요</Text>
            </div>
            <Button icon={<LogoutOutlined />} onClick={logout}>로그아웃</Button>
          </div>
        </div>
      </Content>

      <Content style={{ padding: '0 24px 24px 24px' }}>
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
