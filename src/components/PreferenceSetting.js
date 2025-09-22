import React, { useState, useEffect } from "react";
import { Layout, Card, Typography, Checkbox, Button, message, Spin, Modal } from "antd";
import axios from "axios";

const { Content } = Layout;
const { Title, Text } = Typography;

function PreferenceSettings() {
  const [categories, setCategories] = useState({});
  const [selected, setSelected] = useState({});
  const [loading, setLoading] = useState(false); // 로딩 상태
  const [saving, setSaving] = useState(false);   // 저장 상태

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://mapro.cloud:4000/api/user/pfr", {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
      });

      const cats = {};
      res.data.forEach(cat => {
        cats[cat.name] = cat.options.map(o => ({ id: o.id, name: o.name }));
      });
      setCategories(cats);

      const sel = {};
      Object.keys(cats).forEach(cat => sel[cat] = []);
      setSelected(sel);
    } catch (err) {
      console.error("카테고리 로딩 실패", err);
      Modal.error({ title: "데이터 로딩 실패", content: "카테고리를 불러오지 못했습니다." });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPreferences = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("http://mapro.cloud:4000/api/user/pfr", null, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
      });

      const optionIds = res.data.data;
      const newSelected = {};
      Object.keys(categories).forEach(cat => {
        newSelected[cat] = categories[cat].filter(opt => optionIds.includes(opt.id));
      });
      setSelected(newSelected);
    } catch (err) {
      console.error("성향 불러오기 실패", err);
      Modal.error({ title: "성향 조회 실패", content: "사용자 성향을 불러오지 못했습니다." });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (category, checkedOptions) => {
    setSelected(prev => ({ ...prev, [category]: checkedOptions }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const optionIds = Object.values(selected).flat().map(o => o.id);
      await axios.post("http://mapro.cloud:4000/api/user/pfr/save", optionIds, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
      });
      message.success("성향이 저장되었습니다!");
    } catch (err) {
      console.error("성향 저장 실패", err);
      Modal.error({ title: "성향 저장 실패", content: "성향 저장에 실패했습니다." });
    } finally {
      setSaving(false);
    }
  };

  const getTotalSelected = () => Object.values(selected).reduce((total, arr) => total + arr.length, 0);

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { if (Object.keys(categories).length) fetchUserPreferences(); }, [categories]);

  return (
    <Layout style={{ backgroundColor:'#f5f5f5', minHeight:'100vh' }}>
      <Content style={{ padding:'24px', display:'flex', justifyContent:'center' }}>
        <div style={{ width:'100%', maxWidth:1000 }}>
          <Spin spinning={loading} tip="불러오는 중...">
            {/* 헤더 */}
            <div style={{
              backgroundColor:'#fff', borderRadius:12, boxShadow:'0 4px 20px rgba(0,0,0,0.05)',
              padding:'24px 32px', marginBottom:'24px'
            }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <Title level={3} style={{ margin:0, color:'#722ed1' }}>내 성향 설정</Title>
                  <Text type="secondary" style={{ fontSize:14, marginTop:4, display:'block' }}>
                    선호하는 매장 특징을 선택해주세요. (총 {getTotalSelected()}개 선택됨)
                  </Text>
                </div>
              </div>
            </div>

            {/* 카테고리 카드 */}
            <Card style={{ borderRadius:12, boxShadow:'0 4px 20px rgba(0,0,0,0.05)' }}>
              {Object.keys(categories).map((cat, index) => (
                <div key={cat} style={{ marginBottom: index === Object.keys(categories).length - 1 ? 0 : 32 }}>
                  <div style={{
                    display:'flex', alignItems:'center', marginBottom:16, paddingBottom:8,
                    borderBottom:'2px solid #f0f0f0'
                  }}>
                    <Text style={{ fontSize:18, fontWeight:600, color:'#722ed1' }}>{cat}</Text>
                    <Text style={{
                      marginLeft:8, fontSize:14, color:'#8c8c8c',
                      backgroundColor:'#f5f5f5', padding:'2px 8px', borderRadius:12
                    }}>
                      {selected[cat]?.length}/{categories[cat]?.length}
                    </Text>
                  </div>

                  <Checkbox.Group
                    style={{ display:'flex', flexWrap:'wrap', gap:'4px 16px', width:'100%' }}
                    value={selected[cat]?.map(o => o.id)}
                    onChange={ids => handleChange(cat, categories[cat].filter(o => ids.includes(o.id)))}
                  >
                    {categories[cat]?.map(opt => (
                      <Checkbox key={opt.id} value={opt.id} style={{ minWidth:120, padding:'2px 0', fontSize:14 }}>
                        {opt.name}
                      </Checkbox>
                    ))}
                  </Checkbox.Group>
                </div>
              ))}

              <div style={{ textAlign:'center', marginTop:32, paddingTop:24, borderTop:'1px solid #f0f0f0' }}>
                <Button
                  type="primary"
                  size="large"
                  onClick={handleSave}
                  loading={saving} // 저장 중 스피너
                  style={{
                    backgroundColor:'#722ed1', borderColor:'#722ed1', borderRadius:8,
                    padding:'8px 32px', height:'auto', fontSize:16
                  }}
                >
                  성향 저장하기
                </Button>
              </div>
            </Card>
          </Spin>
        </div>
      </Content>
    </Layout>
  );
}

export default PreferenceSettings;
