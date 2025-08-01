import React from 'react';

function ProfileInfo() {
  return (
    <div
      style={{
        minWidth: '800px',
        borderRadius: '24px',
        marginTop: '80px',
        background: '#fff',
        boxShadow: '0 0 16px #eaeaea',
        padding: '50px 0 50px 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      {/* 상단: 기본 정보 라벨 */}
      <div style={{
        fontSize: '22px',
        fontWeight: 'bold',
        marginBottom: '5px',
        alignSelf: 'flex-start',
        marginLeft: '56px'
      }}>
        기본 정보
      </div>
      {/* 안내 문구 */}
      <div style={{
        color: '#bcbcbc',
        fontSize: '15px',
        marginBottom: '32px',
        alignSelf: 'flex-start',
        marginLeft: '56px'
      }}>
        일부 정보는 다른 사람에게 표시될 수 있습니다.
      </div>
      {/* 표 형태 영역 */}
      <div style={{
        width: '90%',
        borderRadius: '20px',
        border: '1px solid #eee',
        background: '#fafbfc'
      }}>
        {/* 프로필 사진 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            borderBottom: '1px solid #eee',
            padding: '28px 36px'
          }}
        >
          <span style={{ width: '110px', fontWeight: '500', fontSize: '16px' }}>프로필 사진</span>
          <div style={{
            width: '58px',
            height: '58px',
            borderRadius: '50%',
            background: '#fc9090',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: '34px'
          }}>
            {/* 업로드 아이콘 (▲ 형태) */}
            <span style={{
              display: 'block',
              fontSize: '30px',
              color: '#fff',
              transform: 'rotate(180deg)'
            }}>♢</span>
          </div>
        </div>
        {/* 이름 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid #eee',
          padding: '22px 36px'
        }}>
          <span style={{ width: '110px', fontWeight: '500', fontSize: '16px' }}>이름</span>
          <span style={{ marginLeft: '34px', fontSize: '16px', letterSpacing: '-0.3px' }}>김동석</span>
        </div>
        {/* 이메일 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid #eee',
          padding: '22px 36px'
        }}>
          <span style={{ width: '110px', fontWeight: '500', fontSize: '16px' }}>이메일</span>
          <span style={{
            marginLeft: '34px',
            fontSize: '16px',
            color: '#257dcc',
            textDecoration: 'underline',
            cursor: 'pointer'
          }}>
            kim.dong@naver.com
          </span>
        </div>
        {/* 비밀번호 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '22px 36px'
        }}>
          <span style={{ width: '110px', fontWeight: '500', fontSize: '16px' }}>비밀번호</span>
          <span style={{ marginLeft: '34px' }}>
            <span style={{ color: '#257dcc', fontSize: '15px', cursor: 'pointer' }}>
              비밀번호 변경하기
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default ProfileInfo;
