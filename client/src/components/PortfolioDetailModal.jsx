// src/components/PortfolioDetailModal.jsx
import React from 'react';

function PortfolioDetailModal({ show, portfolioDetail, modalLoading, onClose }) {
// show prop이 false이면 아무것도 렌더링하지 않음
  if (!show) {
    return null;
  }
  
  // ==================== 안전한 데이터 접근 헬퍼 ====================
  const getSettingValue = (key, defaultValue = null) => {
    if (portfolioDetail && portfolioDetail.settings) {
      return portfolioDetail.settings[key] || defaultValue;
    }
    return defaultValue;
  };

  const getPerformanceValue = (key, defaultValue = '-') => {
    if (portfolioDetail && portfolioDetail.performance) {
      const value = portfolioDetail.performance[key];
      return value !== undefined && value !== null ? value : defaultValue;
    }
    return defaultValue;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={onClose}>✕</button>
              
              {modalLoading ? (
                <div className="modal-loading">
                  <div className="spinner"></div>
                  <p>로딩 중...</p>
                </div>
              ) : portfolioDetail ? (
                <div className="portfolio-detail">
                  <h2>{portfolioDetail.portfolioName || '포트폴리오'}</h2>
                  {/* <p className="detail-date">
                    {portfolioDetail.createdAt 
                      ? new Date(portfolioDetail.createdAt).toLocaleDateString('ko-KR')
                      : '생성일 미상'
                    }
                  </p> */}

                  {/* 성과 지표 */}
                  <div className="detail-section">
                    <h3>📊 성과 지표</h3>
                    <div className="metrics-grid">
                      <div className="metric-item">
                        <span className="metric-label">총 수익률</span>
                        <span className={`metric-value ${parseFloat(getPerformanceValue('totalReturn', 0)) >= 0 ? 'positive' : 'negative'}`}>
                          {parseFloat(getPerformanceValue('totalReturn', '0')).toFixed(2)}%
                        </span>
                      </div>
                      <div className="metric-item">
                        <span className="metric-label">연평균 수익률</span>
                        <span className={`metric-value ${parseFloat(getPerformanceValue('annualizedReturn', 0)) >= 0 ? 'positive' : 'negative'}`}>
                          {parseFloat(getPerformanceValue('annualizedReturn', '0')).toFixed(2)}%
                        </span>
                      </div>
                      <div className="metric-item">
                        <span className="metric-label">샤프 비율</span>
                        <span className="metric-value">
                          {parseFloat(getPerformanceValue('sharpeRatio', '0')).toFixed(2)}
                        </span>
                      </div>
                      <div className="metric-item">
                        <span className="metric-label">최대 낙폭</span>
                        <span className="metric-value negative">
                          -{parseFloat(getPerformanceValue('maxDrawdown', '0')).toFixed(2)}%
                        </span>
                      </div>
                      <div className="metric-item">
                        <span className="metric-label">변동성</span>
                        <span className="metric-value">
                          {parseFloat(getPerformanceValue('volatility', '0')).toFixed(2)}%
                        </span>
                      </div>
                      
                      <div className="metric-item">
                        <span className="metric-label">승률</span>
                        <span className="metric-value">
                          {parseFloat(getPerformanceValue('winRate', '0')).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 포트폴리오 구성 */}
                  <div className="detail-section">
                    <h3>💼 포트폴리오 구성</h3>
                    <div className="holdings-detail">
                      {portfolioDetail.holdings && portfolioDetail.holdings.length > 0 ? (
                        portfolioDetail.holdings.map(holding => (
                          <div key={holding.ticker} className="holding-detail-item">
                            <span className="holding-ticker">{holding.ticker}</span>
                            <span className="holding-name">{holding.name}</span>
                            <span className="holding-weight">{holding.weight}%</span>
                          </div>
                        ))
                      ) : (
                        <p className="empty-message">포트폴리오 구성 정보가 없습니다.</p>
                      )}
                    </div>
                  </div>

                  {/* 백테스트 설정 */}
                  <div className="detail-section">
                    <h3>⚙️ 백테스트 설정</h3>
                    <div className="settings-detail">
                      <div className="setting-item">
                        <span>기간:</span>
                        <strong>
                          {getSettingValue('startDate') 
                            ? new Date(getSettingValue('startDate')).toLocaleDateString() 
                            : '미설정'
                          }
                          {' '} ~ {' '}
                          {getSettingValue('endDate')
                            ? new Date(getSettingValue('endDate')).toLocaleDateString()
                            : '미설정'
                          }
                        </strong>
                      </div>
                      <div className="setting-item">
                        <span>초기 투자금:</span>
                        <strong>
                          {(parseInt(getPerformanceValue('finalAmount'))-parseInt(getPerformanceValue('profit'))).toLocaleString()}원
                        </strong>
                      </div>
                      {getPerformanceValue('finalAmount') && getPerformanceValue('finalAmount') !== '-' ? (
                        <>
                          <div className="setting-item">
                            <span>최종 자산:</span>
                            <strong className={getPerformanceValue('profit', 0) >= 0 ? 'positive' : 'negative'}>
                              {parseInt(getPerformanceValue('finalAmount')).toLocaleString()}원
                            </strong>
                          </div>
                          <div className="setting-item">
                            <span>수익금:</span>
                            <strong className={getPerformanceValue('profit', 0) >= 0 ? 'positive' : 'negative'}>
                              {parseInt(getPerformanceValue('profit')).toLocaleString()}원
                            </strong>
                          </div>
                        </>
                      ) : null}
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