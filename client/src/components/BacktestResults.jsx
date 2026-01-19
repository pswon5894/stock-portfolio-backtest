// client/src/components/BacktestResults.jsx
import React from 'react';

function BacktestResults({ result, onBack }) {
  if (!result) {
    return (
      <div className="card" style={{ textAlign: 'center' }}>
        <p>백테스트 결과가 없습니다.</p>
        <button
          onClick={onBack}
          className="button secondary"
          style={{ marginTop: '20px', width: 'auto' }}
        >
          돌아가기
        </button>
      </div>
    );
  }

  const { performance, portfolioName, holdings, settings } = result;

  return (
    <div className="card">
      <div className="result-header">
        <h3>백테스트 결과</h3>
      </div>
      
      <div className="summary">
        <h3>{portfolioName}</h3>
        <p>
          기간: {settings.startDate} ~ {settings.endDate} | 
          초기 자본: {settings.initialCapital.toLocaleString()}원
        </p>
      </div>

      <div className="metrics">
        <div className="metric">
          <div className="metric-label">총 수익률</div>
          <div className={`metric-value ${performance.totalReturn >= 0 ? 'positive' : 'negative'}`}>
            {performance.totalReturn.toFixed(2)}%
          </div>
        </div>
        <div className="metric">
          <div className="metric-label">연환산 수익률</div>
          <div className={`metric-value ${performance.annualizedReturn >= 0 ? 'positive' : 'negative'}`}>
            {performance.annualizedReturn.toFixed(2)}%
          </div>
        </div>
        <div className="metric">
          <div className="metric-label">샤프 비율</div>
          <div className="metric-value">{performance.sharpeRatio.toFixed(2)}</div>
        </div>
        <div className="metric">
          <div className="metric-label">최대 낙폭 (MDD)</div>
          <div className="metric-value negative">-{performance.maxDrawdown.toFixed(2)}%</div>
        </div>
        <div className="metric">
          <div className="metric-label">변동성</div>
          <div className="metric-value">{performance.volatility.toFixed(2)}%</div>
        </div>
      </div>
      
      <div className="holdings-summary">
        <h3>포트폴리오 구성</h3>
        <div>
          {holdings.map((holding) => (
            <div key={holding.ticker} className="holding-row">
              <span style={{ fontWeight: '600' }}>{holding.ticker} - {holding.name}</span>
              <span className="weight-badge">{holding.weight}%</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <button
          onClick={onBack}
          className="button secondary"
          style={{ width: 'auto', padding: '15px 40px' }}
        >
          포트폴리오 빌더로 돌아가기
        </button>
      </div>
    </div>
  );
}

export default BacktestResults;
