// PreferenceSettings.js
import React, { useState } from "react";
import { Layout, Card, Typography, Checkbox, Divider, Button } from "antd";

const { Content } = Layout;
const { Title, Text } = Typography;

const categories = {
  음식점: ["혼밥", "새로오픈", "데이트", "노키즈존", "주차가능", "인기많은", "유아의자", "지역화폐"],
  카페: ["카공", "노키즈존", "지역화폐", "주차가능", "편한 좌석", "분위기좋은", "디저트"],
  편의점: ["카공", "노키즈존", "지역화폐", "주차가능", "편한 좌석", "분위기좋은", "디저트"],
  약국: ["카공", "노키즈존", "지역화폐", "주차가능", "편한 좌석", "분위기좋은", "디저트"],
};

function PreferenceSettings() {
  const [selected, setSelected] = useState({
    음식점: ["혼밥", "인기많은", "유아의자", "지역화폐"],
    카페: ["카공", "노키즈존", "분위기좋은", "디저트"],
    편의점: ["카공", "분위기좋은", "디저트"],
    약국: ["카공", "분위기좋은", "디저트"],
  });

  const handleChange = (category, checkedValues) => {
    setSelected((prev) => ({
      ...prev,
      [category]: checkedValues,
    }));
  };

  const handleSave = () => {
    console.log("저장된 성향:", selected);
  };

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
          {/* 헤더 영역 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Title level={3} style={{ margin: 0, color: '#722ed1' }}>내 성향 설정</Title>
              <Text type="secondary">일부 정보는 다른 사람에게 표시될 수 있습니다.</Text>
            </div>
          </div>
        </div>
      </Content>

      <Content style={{ padding: '24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <Card style={{ borderRadius: '8px' }}>
            {Object.keys(categories).map((category) => (
              <div key={category} style={{ marginBottom: 24 }}>
                <Text style={{fontSize: "20px"}}strong>{category}</Text>
                <Checkbox.Group
                  style={{ display: "flex", flexWrap: "wrap", marginTop: 8 }}
                  value={selected[category]}
                  onChange={(values) => handleChange(category, values)}
                >
                  {categories[category].map((option) => (
                    <Checkbox key={option} value={option} style={{ width: "25%" }}>
                      {option}
                    </Checkbox>
                  ))}
                </Checkbox.Group>
              </div>
            ))}
            <div style={{ textAlign: "right" }}>
              <Button type="primary" onClick={handleSave}>
                저장
              </Button>
            </div>
          </Card>
        </div>
      </Content>
    </Layout>





    //   <Card style={{ maxWidth: 1000, margin: "24px auto", borderRadius: 12 }}>
    //     <Title level={4} style={{ color: "rgb(114, 46, 209)" }}>
    //       내 성향 설정
    //     </Title>
    //     <Text type="secondary">
    //       일부 정보는 다른 사람에게 표시될 수 있습니다.
    //     </Text>

    //     <Divider />

    //     {Object.keys(categories).map((category) => (
    //       <div key={category} style={{ marginBottom: 24 }}>
    //         <Text strong>{category}</Text>
    //         <Checkbox.Group
    //           style={{ display: "flex", flexWrap: "wrap", marginTop: 8 }}
    //           value={selected[category]}
    //           onChange={(values) => handleChange(category, values)}
    //         >
    //           {categories[category].map((option) => (
    //             <Checkbox key={option} value={option} style={{ width: "25%" }}>
    //               {option}
    //             </Checkbox>
    //           ))}
    //         </Checkbox.Group>
    //       </div>
    //     ))}

    //     <div style={{ textAlign: "right" }}>
    //       <Button type="primary" onClick={handleSave}>
    //         저장
    //       </Button>
    //     </div>
    //   </Card>
  );
}

export default PreferenceSettings;
