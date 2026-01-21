// src/components/PortfolioDetailModal.jsx
import React, { useState, useEffect } from 'react';

function PortfolioDetailModal({ portfolioId, onClose }) {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (portfolioId) {
      fetchPortfolioDetail();
    }
  }, [portfolioId]);

  const fetchPortfolioDetail = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/backtest/results/${portfolioId}`);
      if (response.ok) {
        const data = await response.json();
        setPortfolio(data);
      }
    } catch (error) {
      console.error('포트폴리오 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!portfolioId) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        
        {loading ? (
          <div className="modal-loading">
            <div className="spinner"></div>
            <p>로딩 중...</p>
          </div>
        ) : portfolio ? (
          <div className="portfolio-detail">
            <h2>{portfolio.portfolioName}</h2>
            <p className="detail-date">
              {new Date(portfolio.createdAt).toLocaleDateString()} 생성
            </p>

            {/* 성과 지표 */}
            <div className="detail-section">
              <h3>📊 성과 지표</h3>
              <div className="metrics-grid">
                <div className="metric-item">
                  <span className="metric-label">총 수익률</span>
                  <span className={`metric-value ${portfolio.performance.totalReturn >= 0 ? 'positive' : 'negative'}`}>
                    {parseFloat(portfolio.performance.totalReturn).toFixed(2)}%
                  </span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">연평균 수익률</span>
                  <span className={`metric-value ${portfolio.performance.annualizedReturn >= 0 ? 'positive' : 'negative'}`}>
                    {parseFloat(portfolio.performance.annualizedReturn).toFixed(2)}%
                  </span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">샤프 비율</span>
                  <span className="metric-value">
                    {parseFloat(portfolio.performance.sharpeRatio).toFixed(2)}
                  </span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">최대 낙폭</span>
                  <span className="metric-value negative">
                    -{parseFloat(portfolio.performance.maxDrawdown).toFixed(2)}%
                  </span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">변동성</span>
                  <span className="metric-value">
                    {parseFloat(portfolio.performance.volatility).toFixed(2)}%
                  </span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">승률</span>
                  <span className="metric-value">
                    {parseFloat(portfolio.performance.winRate).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            {/* 포트폴리오 구성 */}
            <div className="detail-section">
              <h3>💼 포트폴리오 구성</h3>
              <div className="holdings-detail">
                {portfolio.holdings.map(holding => (
                  <div key={holding.ticker} className="holding-detail-item">
                    <span className="holding-ticker">{holding.ticker}</span>
                    <span className="holding-name">{holding.name}</span>
                    <span className="holding-weight">{holding.weight}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 백테스트 설정 */}
            <div className="detail-section">
              <h3>⚙️ 백테스트 설정</h3>
              <div className="settings-detail">
                <div className="setting-item">
                  <span>기간:</span>
                  <strong>
                    {new Date(portfolio.settings.startDate).toLocaleDateString()} ~ {' '}
                    {new Date(portfolio.settings.endDate).toLocaleDateString()}
                  </strong>
                </div>
                <div className="setting-item">
                  <span>초기 투자금:</span>
                  <strong>{portfolio.settings.initialCapital.toLocaleString()}원</strong>
                </div>
                {portfolio.performance.finalAmount && (
                  <>
                    <div className="setting-item">
                      <span>최종 자산:</span>
                      <strong className={portfolio.performance.profit >= 0 ? 'positive' : 'negative'}>
                        {parseInt(portfolio.performance.finalAmount).toLocaleString()}원
                      </strong>
                    </div>
                    <div className="setting-item">
                      <span>수익금:</span>
                      <strong className={portfolio.performance.profit >= 0 ? 'positive' : 'negative'}>
                        {parseInt(portfolio.performance.profit).toLocaleString()}원
                      </strong>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="modal-error">
            <p>포트폴리오를 불러올 수 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PortfolioDetailModal;