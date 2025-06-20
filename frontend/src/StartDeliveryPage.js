import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const StartDeliveryPage = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('전체');
  const navigate = useNavigate();
  const driverName = localStorage.getItem('driverName') || '기사';
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

  useEffect(() => {
    const name = localStorage.getItem('driverName');
    if (!name) {
      navigate('/driver');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/deliveries?driver=${driverName}`);
        const data = await res.json();
        setDeliveries(data);
      } catch (error) {
        console.error('배송 데이터 불러오기 실패:', error);
      }
    };

    fetchDeliveries();
  }, [driverName, API_BASE_URL]);

  const handleStart = async (id) => {
    const selected = deliveries.find((item) => item.id === id);
    if (!selected || selected.driver_status !== '미완료') return;

    const updated = deliveries.map((item) =>
      item.id === id ? { ...item, driver_status: '배송중' } : item
    );
    setDeliveries(updated);

    try {
      await fetch(`${API_BASE_URL}/deliveries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driver_status: '배송중' }),
      });

      // ✅ 이메일 알림 전송
      await fetch(`${API_BASE_URL}/deliveries/${id}/start`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('배송 시작 저장 실패:', error);
    }
  };

  const handleCheck = async (id) => {
    const selected = deliveries.find((item) => item.id === id);
    if (!selected || selected.driver_status !== '배송중') return;

    const confirmResult = window.confirm(
      '✅ 정말로 이 배송을 완료 처리하시겠습니까?\n※ 한 번 완료하면 되돌릴 수 없습니다.'
    );
    if (!confirmResult) return;

    const updated = deliveries.map((item) =>
      item.id === id ? { ...item, driver_status: '완료' } : item
    );
    setDeliveries(updated);

    try {
      await fetch(`${API_BASE_URL}/deliveries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driver_status: '완료' }),
      });
    } catch (error) {
      console.error('배송 완료 저장 실패:', error);
    }
  };

  const handleDetail = (item) => {
    alert(`📦 배송지 상세 정보\n\n주소: ${item.address}\n상태: ${item.driver_status}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('driverName');
    navigate('/driver');
  };

  const completed = deliveries.filter(d => d.driver_status === '완료');
  const progress = deliveries.length > 0
    ? Math.round((completed.length / deliveries.length) * 100)
    : 0;

  const filteredDeliveries = deliveries.filter((item) => {
    const matchSearch = item.address.includes(searchTerm);
    const matchFilter = filter === '전체' ? true : item.driver_status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      padding: '40px 20px',
      fontFamily: 'sans-serif',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <button onClick={handleLogout} style={{
        alignSelf: 'flex-end',
        marginBottom: 10,
        padding: '6px 12px',
        border: 'none',
        borderRadius: 8,
        backgroundColor: '#e53935',
        color: 'white',
        fontWeight: 'bold',
        cursor: 'pointer'
      }}>
        로그아웃
      </button>

      <h1>배달을 시작합니다 🚚</h1>
      <p>{driverName} 기사님, 오늘도 안전 운전하세요!</p>
      <div style={{ marginTop: 20, textAlign: 'center' }}>
        <h2>📦 오늘 배송 건수: <b>{deliveries.length}건</b></h2>
        <p>✅ 완료된 배송: <b>{completed.length}건</b></p>

        <div style={{ width: 300, height: 16, backgroundColor: '#ddd', borderRadius: 8, marginTop: 8 }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: '#4caf50',
            borderRadius: 8,
            transition: 'width 0.3s'
          }} />
        </div>
        <p style={{ fontSize: 14, marginTop: 4 }}>{progress}% 완료됨</p>
      </div>

      <div style={{ margin: '30px 0 10px' }}>
        {['전체', '미완료', '배송중', '완료'].map((label) => (
          <button
            key={label}
            onClick={() => setFilter(label)}
            style={{
              padding: '6px 12px',
              margin: '0 6px',
              borderRadius: 8,
              border: '1px solid #888',
              backgroundColor: filter === label ? '#4caf50' : 'white',
              color: filter === label ? 'white' : 'black',
              cursor: 'pointer'
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <input
        type="text"
        placeholder="배송지 검색 (주소)"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          padding: '10px 14px',
          width: '300px',
          borderRadius: 8,
          border: '1px solid #ccc',
          marginBottom: 20
        }}
      />

      <div style={{ width: '100%', maxWidth: '1000px', overflowX: 'auto' }}>
        <table
          border="1"
          cellPadding="8"
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 'clamp(12px, 2.5vw, 16px)',
            textAlign: 'center',
          }}
        >
          <thead style={{ backgroundColor: '#f0f0f0' }}>
            <tr>
              <th>번호</th>
              <th>배송지</th>
              <th>상태</th>
              <th>시작 체크</th>
              <th>완료 체크</th>
              <th>상세 정보</th>
            </tr>
          </thead>
          <tbody>
            {filteredDeliveries.map((item) => {
              const rowColor = item.driver_status === '완료' ? '#e0e0e0' : '#fffde7';
              return (
                <tr key={item.id} style={{ backgroundColor: rowColor, height: '48px' }}>
                  <td>{item.id}</td>
                  <td>{item.address}</td>
                  <td>{item.driver_status}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={item.driver_status === '배송중' || item.driver_status === '완료'}
                      onChange={() => handleStart(item.id)}
                      disabled={item.driver_status !== '미완료'}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={item.driver_status === '완료'}
                      onChange={() => handleCheck(item.id)}
                      disabled={item.driver_status !== '배송중'}
                    />
                  </td>
                  <td>
                    <button onClick={() => handleDetail(item)}>상세 정보</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StartDeliveryPage;
