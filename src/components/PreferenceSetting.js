// src/components/PreferenceSetting.js
import React, { useState } from 'react';

const categories = [
  {
    label: '음식점',
    options: ['유아의자', '새로오픈', '데이트', '노키즈존', '지역화폐', '주차', '인기많은']
  },
  {
    label: '카페',
    options: ['편한좌석', '카공', '노키즈존', '분위기 좋은', '인테리어', '디저트', '조용한', '24시간']
  },
  {
    label: '편의점',
    options: ['야외좌석', 'ATM', '취식공간']
  },
  {
    label: '약국',
    options: ['친절', '비처방 의약품']
  },
  {
    label: '펜션',
    options: ['수영장', '스파', '인기 많은', '애완동물 동반', '조식', '바비큐']
  },
  {
    label: '헤어샵',
    options: ['인기 많은', '쿠폰/멤버십', '예약필수']
  },
  {
    label: '병원',
    options: ['응급실', '전문의', '야간진료']
  }
];

const initialChecked = categories.map(cat => Array(cat.options.length).fill(0));

function PreferenceSetting() {
  const [checked, setChecked] = useState(initialChecked);

  const handleToggle = (catIdx, optIdx) => {
    setChecked(prev =>
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
    <div
      style={{
        minWidth: '540px',
        height: '650px', 
        borderRadius: '24px',
        marginTop: '80px',
        background: '#fff',
        boxShadow: '0 0 16px #eaeaea',
        padding: '54px 0 54px 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <div style={{
        fontSize: '22px',
        fontWeight: 'bold',
        marginBottom: '6px',
        alignSelf: 'flex-start',
        marginLeft: '50px'
      }}>
        내 성향 설정
      </div>
      <div style={{
        color: '#bcbcbc',
        fontSize: '15px',
        marginBottom: '32px',
        alignSelf: 'flex-start',
        marginLeft: '50px'
      }}>
      </div>
      {/* 항목이 많으면 스크롤 되는 영역 */}
      <div
        style={{
          width: '92%',
          display: 'flex',
          flexDirection: 'column',
          gap: '33px',
          // 스크롤영역! (중앙 기준 오른쪽에 스크롤바)
          maxHeight: '500px',
          overflowY: 'auto',
          paddingRight: '10px'
        }}
      >
        {categories.map((cat, idx) => (
          <div key={cat.label}>
            <div style={{
              fontSize: '17px',
              fontWeight: '600',
              marginBottom: '10px',
              position: 'sticky',
              top: 0,
              zIndex: 1,
              background: "#fff"
            }}>{cat.label}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
              {cat.options.map((opt, jdx) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleToggle(idx, jdx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: checked[idx][jdx] ? '#257dcc' : '#f5f5f5',
                    color: checked[idx][jdx] ? '#fff' : '#666',
                    padding: '8px 18px',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '15px',
                    border: checked[idx][jdx] ? 'none' : '1.6px solid #e0e0e0',
                    outline: 'none',
                    transition: 'all 0.18s'
                  }}
                >
                  {/* 체크박스 아이콘 */}
                  <span
                    style={{
                      marginRight: '6px',
                      width: '15px',
                      height: '15px',
                      display: 'inline-block',
                      borderRadius: '4px',
                      border: checked[idx][jdx] ? '1.7px solid #fff' : '1.6px solid #aaa',
                      background: checked[idx][jdx] ? '#fff' : 'transparent',
                      boxSizing: 'border-box',
                      position: 'relative'
                    }}>
                    {checked[idx][jdx] ? (
                      <svg width="15" height="14" style={{position:'absolute',top:0,left:0}}><polyline points="2,8 6,12 13,3" style={{fill:'none',stroke:'#257dcc',strokeWidth:2}}/></svg>
                    ) : null}
                  </span>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{width: '92%', display: 'flex', justifyContent: 'flex-end', marginTop: '24px'}}>
        <button
          onClick={handleSave}
          style={{
            background: '#2357dd',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            padding: '10px 36px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          저장
        </button>
      </div>
    </div>
  );
}

export default PreferenceSetting;
