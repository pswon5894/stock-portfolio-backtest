// client/src/components/PortfolioList.jsx
import React from 'react';

function PortfolioList({ portfolios, onSelect, onDelete, onCreateNew }) {
  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2>내 포트폴리오</h2>
        <button
          onClick={onCreateNew}
          className="button"
          style={{ width: 'auto', padding: '12px 24px' }}
        >
          + 새 포트폴리오 만들기
        </button>
      </div>

      {portfolios.length === 0 ? (
        <p className="empty" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          저장된 포트폴리오가 없습니다. 새 포트폴리오를 만들어보세요.
        </p>
      ) : (
        <div>
          {portfolios.map((p) => (
            <div
              key={p._id}
              className="holding-item"
              style={{ marginBottom: '15px' }}
            >
              <div>
                <h3 style={{ color: '#667eea', marginBottom: '5px', fontSize: '1.1rem' }}>{p.name}</h3>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>
                  종목 수: {p.holdings.length}개 | 
                  초기 자본: {p.initialCapital.toLocaleString()}원
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => onSelect(p._id)}
                  className="button"
                  style={{ width: 'auto', padding: '10px 20px', fontSize: '0.9rem' }}
                >
                  선택
                </button>
                <button
                  onClick={() => onDelete(p._id)}
                  className="remove-btn"
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PortfolioList;
