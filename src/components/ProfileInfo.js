// ProfileInfo.js
import React, { useState } from 'react';
import { Card, Typography, Avatar, Button, Upload, message } from 'antd';
import { UploadOutlined, UserOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

function ProfileInfo() {
  const [imageUrl, setImageUrl] = useState(
    'https://via.placeholder.com/150/337ab7/FFFFFF?text=DS' // 예: 김동석님 프로필 사진
  );

  // 업로드 핸들러 (옵션)
  const handleUpload = (file) => {
    if (!file.url && !file.preview) {
      message.error('이미지 업로드에 실패했습니다.');
      return false;
    }

    setImageUrl(file.url || file.preview);
    message.success('프로필 사진이 변경되었습니다.');
    return false; // prevent auto-upload
  };

  return (
    <Card
      style={{ maxWidth: 800, margin: '80px auto', borderRadius: '24px' }}
      bodyStyle={{ padding: '50px' }}
      bordered={false}
    >
      {/* 제목 */}
      <Title level={3} style={{ marginBottom: 8, fontWeight: 'bold' }}>
        내 정보
      </Title>
      <Paragraph type="secondary" style={{ marginBottom: 32 }}>
        일부 정보는 다른 사람에게 표시될 수 있습니다.
      </Paragraph>

      {/* 정보 리스트 */}
      <div style={{ background: '#fafbfc', borderRadius: '20px', border: '1px solid #e8e8e8' }}>
        {/* 프로필 사진 */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '28px 36px', borderBottom: '1px solid #e8e8e8' }}>
          <Text strong style={{ width: 110, fontSize: 16 }}>
            프로필 사진
          </Text>
          <div style={{ marginLeft: 34, display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* 아바타 + 업로드 버튼 */}
            <Upload
              accept="image/*"
              beforeUpload={handleUpload}
              showUploadList={false}
            >
              <Avatar
                size={58}
                src={imageUrl}
                icon={<UserOutlined />}
                alt="프로필 사진"
                style={{ border: '2px solid #fff', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}
              />
            </Upload>
            <Button type="default" icon={<UploadOutlined />} size="small">
              변경
            </Button>
          </div>
        </div>

        {/* 이름 */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '22px 36px', borderBottom: '1px solid #e8e8e8' }}>
          <Text strong style={{ width: 110, fontSize: 16 }}>
            이름
          </Text>
          <Text style={{ marginLeft: 34, fontSize: 16 }}>김동석</Text>
        </div>

        {/* 이메일 */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '22px 36px', borderBottom: '1px solid #e8e8e8' }}>
          <Text strong style={{ width: 110, fontSize: 16 }}>
            이메일
          </Text>
          <Button
            type="link"
            style={{ padding: 0, height: 'auto', fontSize: 16 }}
            href="mailto:kim.dong@naver.com"
          >
            kim.dong@naver.com
          </Button>
        </div>

        {/* 비밀번호 */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '22px 36px' }}>
          <Text strong style={{ width: 110, fontSize: 16 }}>
            비밀번호
          </Text>
          <Button type="link" style={{ padding: 0, height: 'auto', color: '#257dcc', fontSize: 15 }}>
            비밀번호 변경하기
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default ProfileInfo;