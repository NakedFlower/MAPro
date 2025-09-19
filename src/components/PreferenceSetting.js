// PreferenceSettings.js
import React, { useState } from "react";
import { Layout, Card, Typography, Checkbox, Button } from "antd";

const { Content } = Layout;
const { Title, Text } = Typography;

const categories = {
  음식점: ["유아의자", "혼밥", "새로오픈", "데이트", "노키즈존", "지역화폐", "주차", "인기많은"],
  카페: ["편한좌석", "카공", "노키즈존", "분위기좋은", "인테리어", "디저트", "조용한", "24시간"],
  편의점: ["야외좌석", "ATM", "취식공간"],
  약국: ["친절", "비처방의약품"],
  호텔: ["스파/월풀/욕조", "반려동물 동반", "주차가능", "전기차 충전", "객실금연", "OTT", "수영장", "객실내 PC", "바베큐", "조식"],
  헤어샵: ["인기많은", "쿠폰멤버십", "예약필수"],
  병원: ["응급실", "전문의", "야간진료"]
};

function PreferenceSettings() {
  const [selected, setSelected] = useState({
    음식점: [],
    카페: [],
    편의점: [],
    약국: [],
    호텔: [],
    헤어샵: [],
    병원: []
  });

  const handleChange = (category, checkedValues) => {
    setSelected((prev) => ({
      ...prev,
      [category]: checkedValues,
    }));
  };

  const handleSave = () => {
    console.log("저장된 성향:", selected);
    // 여기에 실제 저장 로직 추가
    alert("성향이 저장되었습니다!");
  };

  const getTotalSelected = () => {
    return Object.values(selected).reduce((total, items) => total + items.length, 0);
  };

  return (
    <Layout style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Content style={{ padding: '24px', background: '#f5f5f5', display: 'flex', justifyContent: 'center' }}>
        <div
          style={{
            width: '100%',
            maxWidth: 1000,
          }}
        >
          {/* 헤더 영역 */}
          <div style={{
            backgroundColor: '#fff',
            borderRadius: 12,
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            padding: '24px 32px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Title level={3} style={{ margin: 0, color: '#722ed1' }}>내 성향 설정</Title>
                <Text type="secondary" style={{ fontSize: '14px', marginTop: '4px', display: 'block' }}>
                  선호하는 매장 특징을 선택해주세요. (총 {getTotalSelected()}개 선택됨)
                </Text>
              </div>
            </div>
          </div>

          {/* 카테고리별 선택 영역 */}
          <Card style={{ borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            {Object.keys(categories).map((category, index) => (
              <div key={category} style={{ marginBottom: index === Object.keys(categories).length - 1 ? 0 : 32 }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: 16,
                  paddingBottom: 8,
                  borderBottom: '2px solid #f0f0f0'
                }}>
                  <Text style={{ 
                    fontSize: "18px", 
                    fontWeight: 600, 
                    color: '#722ed1'
                  }}>
                    {category}
                  </Text>
                  <Text style={{ 
                    marginLeft: 8, 
                    fontSize: '14px', 
                    color: '#8c8c8c',
                    backgroundColor: '#f5f5f5',
                    padding: '2px 8px',
                    borderRadius: '12px'
                  }}>
                    {selected[category].length}/{categories[category].length}
                  </Text>
                </div>
                
                <Checkbox.Group
                  style={{ 
                    display: "grid", 
                    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", 
                    gap: "4px 8px",
                    width: "100%",
                    justifyItems: "start"
                  }}
                  value={selected[category]}
                  onChange={(values) => handleChange(category, values)}
                >
                  {categories[category].map((option) => (
                    <Checkbox 
                      key={option} 
                      value={option} 
                      style={{ 
                        fontSize: '14px',
                        padding: '2px 0',
                        margin: 0
                      }}
                    >
                      {option}
                    </Checkbox>
                  ))}
                </Checkbox.Group>
              </div>
            ))}
            
            <div style={{ 
              textAlign: "center", 
              marginTop: 32,
              paddingTop: 24,
              borderTop: '1px solid #f0f0f0'
            }}>
              <Button 
                type="primary" 
                size="large"
                onClick={handleSave}
                style={{
                  backgroundColor: '#722ed1',
                  borderColor: '#722ed1',
                  borderRadius: '8px',
                  padding: '8px 32px',
                  height: 'auto',
                  fontSize: '16px'
                }}
              >
                성향 저장하기
              </Button>
            </div>
          </Card>
        </div>
      </Content>
    </Layout>
  );
}

export default PreferenceSettings;
