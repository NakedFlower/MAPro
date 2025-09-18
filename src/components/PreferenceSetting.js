// PreferenceSetting.js
import React, { useState } from 'react';
import {
  Card,
  Typography,
  Tag,
  Button,
  Flex,
} from 'antd';

const { Title, Text } = Typography;

const categories = [
  {
    label: '음식점',
    options: ['유아의자', '새로오픈', '데이트', '노키즈존', '지역화폐', '주차', '인기많은'],
  },
  {
    label: '카페',
    options: ['편한좌석', '카공', '노키즈존', '분위기 좋은', '인테리어', '디저트', '조용한', '24시간'],
  },
  {
    label: '편의점',
    options: ['야외좌석', 'ATM', '취식공간'],
  },
  {
    label: '약국',
    options: ['친절', '비처방 의약품'],
  },
  {
    label: '호텔',
    options: [
      '스파/월풀/욕조',
      '반려동물 동반',
      '주차가능',
      '전기차 충전',
      '객실금연',
      'OTT',
      '수영장',
      '객실내 PC',
      '바베큐',
      '조식',
    ],
  },
  {
    label: '헤어샵',
    options: ['인기 많은', '쿠폰/멤버십', '예약필수'],
  },
  {
    label: '병원',
    options: ['응급실', '전문의', '야간진료'],
  },
];

const initialChecked = categories.map((cat) => Array(cat.options.length).fill(0));

function PreferenceSetting() {
  const [checked, setChecked] = useState(initialChecked);

  const handleToggle = (catIdx, optIdx) => {
    setChecked((prev) =>
      prev.map((row, i) =>
        i === catIdx
          ? row.map((val, j) => (j === optIdx ? (val ? 0 : 1) : val))
          : row
      )
    );
  };

  const handleSave = () => {
    alert('저장되었습니다!');
  };

  return (
    <Card
      style={{
        minWidth: 540,
        // height: 550,
        borderRadius: '24px',
        marginTop: '80px',
        marginBottom: '80px',
        boxShadow: '0 0 16px rgba(0,0,0,0.08)',
      }}
      bodyStyle={{
        padding: '24px 24px 16px', 
      }}
    >
      {/* 제목 (마진 줄임) */}
      <Title
        level={3}
        style={{
          fontWeight: 'bold',
          margin: '0 0 8px 0', 
        }}
      >
        내 성향 설정
      </Title>
      <Text type="secondary" style={{ marginBottom: 24, display: 'block' }}>
        선호하는 항목을 선택해주세요.
      </Text>

      {/* 스크롤 가능한 영역 (넘침 방지) */}
      <div
        style={{
          maxHeight: 'calc(100% - 110px)', // 🔽 제목 + 버튼 공간 고려
          overflowY: 'auto',
          paddingRight: 8,
          scrollbarWidth: 'thin', // 부드러운 스크롤 (Firefox)
        }}
      >
        {categories.map((cat, idx) => (
          <div key={cat.label} style={{ marginBottom: 20 }}>
            {/* 카테고리 제목 */}
            <div
              style={{
                fontSize: 17,
                fontWeight: 600,
                marginBottom: 10,
                position: 'sticky',
                top: 0,
                background: '#fff',
                zIndex: 1,
                padding: '4px 0',
              }}
            >
              {cat.label}
            </div>

            {/* 옵션 목록 */}
            <Flex wrap="wrap" gap="small">
              {cat.options.map((opt, jdx) => (
                <Tag
                  key={opt}
                  icon={checked[idx][jdx] ? <span style={{ color: '#6c5ce7' }}>✓</span> : null}
                  color={checked[idx][jdx] ? 'purple' : 'default'}
                  style={{
                    padding: '6px 12px',
                    fontSize: 15,
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                  onClick={() => handleToggle(idx, jdx)}
                >
                  {opt}
                </Tag>
              ))}
            </Flex>
          </div>
        ))}
      </div>

      {/* 저장 버튼 (고정 아님, 자연스럽게 아래 배치) */}
      <Flex justify="flex-end" style={{ marginTop: 16 }}>
        <Button type="primary" size="large" onClick={handleSave}>
          저장
        </Button>
      </Flex>
    </Card>
  );
}

export default PreferenceSetting;