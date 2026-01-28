// client/src/components/BacktestResults.jsx
import React from 'react';

function BacktestResults({ backtestResult, resetBacktest, initialCapital }) {
  if (!backtestResult) {
    return null; // 결과가 없으면 아무것도 렌더링하지 않음
  }

  const { performance, portfolioName, holdings, settings } = backtestResult;

  return (
    <div className="card result">
      <h2>5️⃣ 백테스트 결과</h2>
      
      <div className="result-header">
        <h3>{portfolioName}</h3>
        <p>{settings.startDate} ~ {settings.endDate}</p>
      </div>

      <div className="metrics">
        <div className="metric">
          <div className="metric-label">총 수익률</div>
          <div className={`metric-value ${performance.totalReturn >= 0 ? 'positive' : 'negative'}`}>
            {performance.totalReturn}%
          </div>
        </div>

        <div className="metric">
          <div className="metric-label">연환산 수익률</div>
          <div className={`metric-value ${performance.annualizedReturn >= 0 ? 'positive' : 'negative'}`}>
            {performance.annualizedReturn}%
          </div>
        </div>

        <div className="metric">
          <div className="metric-label">샤프 비율</div>
          <div className="metric-value">{performance.sharpeRatio}</div>
        </div>

        <div className="metric">
          <div className="metric-label">최대 낙폭</div>
          <div className="metric-value negative">
            -{performance.maxDrawdown}%
          </div>
        </div>

        <div className="metric">
          <div className="metric-label">변동성</div>
          <div className="metric-value">{performance.volatility}%</div>
        </div>

        <div className="metric">
          <div className="metric-label">승률</div>
          <div className="metric-value">{performance.winRate}%</div>
        </div>
      </div>

      {performance.finalAmount && (
        <div className="amount-summary">
          <div className="amount-item">
            <span>초기 투자금:</span>
            <strong>{settings.initialCapital.toLocaleString()}원</strong>
          </div>
          <div className="amount-item">
            <span>최종 자산:</span>
            <strong className={performance.profit >= 0 ? 'positive' : 'negative'}>
              {parseInt(performance.finalAmount).toLocaleString()}원
            </strong>
          </div>
          <div className="amount-item">
            <span>수익금:</span>
            <strong className={performance.profit >= 0 ? 'positive' : 'negative'}>
              {parseInt(performance.profit).toLocaleString()}원
            </strong>
          </div>
        </div>
      )}

      <div className="holdings-summary">
        <h3>포트폴리오 구성</h3>
        {holdings.map(h => (
          <div key={h.ticker} className="holding-row">
            <span>{h.ticker} - {h.name}</span>
            <span className="weight-badge">{h.weight}%</span>
          </div>
        ))}
      </div>

      <button onClick={resetBacktest} className="button">
        새로운 백테스트 시작
      </button>
    </div>
  );
}

export default BacktestResults;