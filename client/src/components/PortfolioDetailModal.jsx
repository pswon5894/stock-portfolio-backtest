// src/components/PortfolioDetailModal.jsx
import React from 'react';
import { useThemeStore } from "../theme/themeStore";

function PortfolioDetailModal({ show, portfolioDetail, modalLoading, onClose }) {
  const darkMode = useThemeStore((state) => state.darkMode);
// show prop이 false이면 아무것도 렌더링하지 않음
  if (!show) {
    return null;
  }
  
  // ==================== 안전한 데이터 접근 헬퍼 함수====================  //- 안전한 접근: 객체가 없을 때 에러가 나는 걸 막음.
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
    <div className={`modal-overlay${darkMode ? 'dark' : ''}`} onClick={onClose}>
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
                  
                  {/* 성과 지표 */}
                  <div className="metrics">
                    <div className="metric">
                      <div className="metric-label">총 수익률</div>
                      <div className={`metric-value ${parseFloat(getPerformanceValue('totalReturn', 0)) >= 0 ? 'positive' : 'negative'}`}>
                        {parseFloat(getPerformanceValue('totalReturn', 0)).toFixed(2)}%
                      </div>
                    </div>

                    <div className="metric">
                      <div className="metric-label">연평균 수익률</div>
                      <div className={`metric-value ${parseFloat(getPerformanceValue('annualizedReturn', 0)) >= 0 ? 'positive' : 'negative'}`}>
                        {parseFloat(getPerformanceValue('annualizedReturn', 0)).toFixed(2)}%
                      </div>
                    </div>

                    <div className="metric">
                      <div className="metric-label">샤프 비율</div>
                      <div className="metric-value">
                        {parseFloat(getPerformanceValue('sharpeRatio', 0)).toFixed(2)}
                      </div>
                    </div>

                    <div className="metric">
                      <div className="metric-label">최대 낙폭</div>
                      <div className="metric-value negative">
                        -{parseFloat(getPerformanceValue('maxDrawdown', 0)).toFixed(2)}%
                      </div>
                    </div>

                    <div className="metric">
                      <div className="metric-label">변동성</div>
                      <div className="metric-value">
                        {parseFloat(getPerformanceValue('volatility', 0)).toFixed(2)}%
                      </div>
                    </div>

                    <div className="metric">
                      <div className="metric-label">승률</div>
                      <div className="metric-value">
                        {parseFloat(getPerformanceValue('winRate', 0)).toFixed(2)}%
                      </div>
                    </div>
                  </div>

                  {/* 백테스트 금액 요약 */}
                  <div className="amount-summary">
                    <div className="amount-item">
                      <span>초기 투자금:</span>
                      <strong>
                        {(parseInt(getPerformanceValue('finalAmount', 0)) - parseInt(getPerformanceValue('profit', 0))).toLocaleString()}원
                      </strong>
                    </div>
                    <div className="amount-item">
                      <span>최종 자산:</span>
                      <strong className={getPerformanceValue('profit', 0) >= 0 ? 'positive' : 'negative'}>
                        {parseInt(getPerformanceValue('finalAmount', 0)).toLocaleString()}원
                      </strong>
                    </div>
                    <div className="amount-item">
                      <span>수익금:</span>
                      <strong className={getPerformanceValue('profit', 0) >= 0 ? 'positive' : 'negative'}>
                        {parseInt(getPerformanceValue('profit', 0)).toLocaleString()}원
                      </strong>
                    </div>
                  </div>

                  {/* 포트폴리오 구성 */}
                  <div className="holdings-summary">
                    <h3>포트폴리오 구성</h3>
                    {portfolioDetail.holdings && portfolioDetail.holdings.length > 0 ? (
                      portfolioDetail.holdings.map(h => (
                        <div key={h.ticker} className="holding-row">
                          <span>{h.ticker} - {h.name}</span>
                          <span className="weight-badge">{h.weight}%</span>
                        </div>
                      ))
                    ) : (
                      <p className="empty-message">포트폴리오 구성 정보가 없습니다.</p>
                    )}
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