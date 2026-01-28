import React, { useState, useEffect } from 'react';
import './App.css';
// import PortfolioDetailModal from './components/PortfolioDetailModal';
import RankingBoard from './components/RankingBoard';
import BacktestResults from './components/BacktestResults';

function App() {

  const API_URL = process.env.REACT_APP_API_URL;

  fetch(`${API_URL}/users`)
    .then(res => res.json())
    .then(data => console.log(data));


  // ==================== 상태 관리 ====================
  const [step, setStep] = useState(0); // 0: 홈, 1-5: 백테스트 단계
  const [serverStatus, setServerStatus] = useState('확인 중...');
  
  // 포트폴리오 데이터
  const [portfolioName, setPortfolioName] = useState('');
  const [initialCapital, setInitialCapital] = useState(10000000);
  const [holdings, setHoldings] = useState([]);
  
  // 주식 검색
  const [searchQuery, setSearchQuery] = useState('');
  const [availableStocks] = useState([
    { ticker: 'QQQ', name: '나스닥 100' },
    { ticker: 'SPY', name: 'S&P 500' },
    { ticker: 'QLD', name: '나스닥 2배' },
    { ticker: 'SSO', name: 'S&P 2배' },
    { ticker: 'TQQQ', name: '나스닥 3배' },
    { ticker: 'UPRO', name: 'S&P 3배' },
    { ticker: 'AAPL', name: '애플' },
    { ticker: 'MSFT', name: '마이크로소프트' },
    { ticker: 'GOOGL', name: '구글' },
    { ticker: 'AMZN', name: '아마존' },
    { ticker: 'TSLA', name: '테슬라' },
    { ticker: 'NVDA', name: '엔비디아' },
    { ticker: 'META', name: '메타' },
    { ticker: 'NFLX', name: '넷플릭스' },
  ]);
  
  // 백테스트 설정
  const [startDate, setStartDate] = useState('2022-01-01');
  const [endDate, setEndDate] = useState('2025-12-31');
  
  // 결과 및 로딩
  const [backtestResult, setBacktestResult] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // 랭킹 및 모달
  const [rankings, setRankings] = useState([]);
  const [rankingsLoading, setRankingsLoading] = useState(true);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState(null);
  const [portfolioDetail, setPortfolioDetail] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // const serverUrl = 'https://stock-portfolio-backtest.onrender.com'
  // const serverUrl = 'http://localhost:5000'

  // ==================== 서버 연결 테스트 ====================
  useEffect(() => {
    fetch(`${API_URL}`)
      .then(res => res.json())
      .then(data => {
        setServerStatus('✅ 연결됨');
      })
      .catch(err => {
        setServerStatus('❌ 연결 실패');
      });
  }, []);

  // ==================== 랭킹 조회 ====================
  useEffect(() => {
    if (step === 0) {
      fetchRankings();
    }
  }, [step]);

  const fetchRankings = async () => {
    setRankingsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/backtest/rankings?limit=3`);
      if (response.ok) {
        const data = await response.json();
        setRankings(data);
      }
    } catch (error) {
      console.error('랭킹 조회 실패:', error);
      setRankings([]);
    } finally {
      setRankingsLoading(false);
    }
  };

  // ==================== 포트폴리오 상세 조회 ====================
  useEffect(() => {
    if (selectedPortfolioId) {
      fetchPortfolioDetail(selectedPortfolioId);
    }
  }, [selectedPortfolioId]);

  const fetchPortfolioDetail = async (portfolioId) => {
    setModalLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/backtest/results/${portfolioId}`);
      if (response.ok) {
        const data = await response.json();
        // 데이터 정규화: settings가 없으면 빈 객체로 설정
        const normalizedData = {
          ...data,
          settings: data.settings || data.backtest?.settings || {}
        };
        setPortfolioDetail(normalizedData);
      }
    } catch (error) {
      console.error('포트폴리오 조회 실패:', error);
      setPortfolioDetail(null);
    } finally {
      setModalLoading(false);
    }
  };

  // ==================== 종목 관리 함수 ====================
  const addStock = (stock) => {
    if (holdings.find(h => h.ticker === stock.ticker)) {
      alert('이미 추가된 종목입니다.');
      return;
    }
    setHoldings([...holdings, { ...stock, weight: 0 }]);
    setSearchQuery('');
  };

  const removeStock = (ticker) => {
    setHoldings(holdings.filter(h => h.ticker !== ticker));
  };

  const updateWeight = (ticker, weight) => {
    const newHoldings = holdings.map(h => 
      h.ticker === ticker ? { ...h, weight: parseFloat(weight) || 0 } : h
    );
    setHoldings(newHoldings);
  };

  // ==================== 계산 ====================
  const totalWeight = holdings.reduce((sum, h) => sum + h.weight, 0);

  const filteredStocks = availableStocks.filter(stock =>
    stock.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stock.name.includes(searchQuery)
  );

  // ==================== 단계 이동 ====================
  const goToNextStep = () => {
    if (step === 1 && !portfolioName) {
      alert('포트폴리오 이름을 입력하세요');
      return;
    }
    if (step === 2 && holdings.length === 0) {
      alert('최소 1개 종목을 추가하세요');
      return;
    }
    if (step === 3 && Math.abs(totalWeight - 100) > 0.01) {
      alert('총 비중이 100%가 되어야 합니다');
      return;
    }
    setStep(step + 1);
  };

  // ==================== 백테스트 실행 ====================
  const runBacktest = async () => {
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/api/backtest/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          portfolio: {
            name: portfolioName,
            holdings,
            initialCapital
          },
          startDate,
          endDate
        })
      });

      if (response.ok) {
        const result = await response.json();
        setBacktestResult({
          ...result,
          portfolioName,
          holdings,
          settings: { startDate, endDate, initialCapital }
        });
        setStep(5);
      } else {
        const error = await response.json();
        throw new Error(error.error || '서버 응답 오류');
      }
    } catch (error) {
      console.log('서버 연결 실패, 모의 데이터 사용:', error);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResult = {
        performance: {
          totalReturn: (Math.random() * 100 - 20).toFixed(2),
          annualizedReturn: (Math.random() * 30 - 5).toFixed(2),
          sharpeRatio: (Math.random() * 2).toFixed(2),
          maxDrawdown: (Math.random() * 30).toFixed(2),
          volatility: (Math.random() * 40 + 10).toFixed(2),
          winRate: (Math.random() * 60 + 30).toFixed(2),
        },
        portfolioName,
        holdings,
        settings: { startDate, endDate, initialCapital }
      };
      
      setBacktestResult(mockResult);
      setStep(5);
      alert('⚠️ 서버에서 실제 데이터를 가져올 수 없어 모의 데이터를 표시합니다.\n에러: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ==================== 리셋 ====================
  const resetBacktest = () => {
    setStep(1);
    setPortfolioName('');
    setHoldings([]);
    setBacktestResult(null);
  };

  const startNewBacktest = () => {
    setStep(1);
    setPortfolioName('');
    setHoldings([]);
    setBacktestResult(null);
  };
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

  // ==================== 렌더링 ====================
  return (
    <div className="App">
      {/* ========== 헤더 ========== */}
      <header className="App-header">
        <h1>📈 주식 포트폴리오 백테스터</h1>
        <p className="status">서버: {serverStatus}</p>
        
        {/* 진행 바 */}
        {step > 0 && (
          <div className="progress-bar">
            {[1, 2, 3, 4, 5].map(s => (
              <div key={s} className={`step ${step >= s ? 'active' : ''}`}>
                {s}
              </div>
            ))}
          </div>
        )}
        
        {/* 홈 버튼 */}
        {step > 0 && (
          <button onClick={() => setStep(0)} className="home-button">
            🏠 홈으로
          </button>
        )}
      </header>

      <main className="container">
        {/* ========== 홈 화면 (Step 0) ========== */}
        {step === 0 && (
          <div className="home-screen">
            {/* 환영 섹션 */}
            <div className="welcome-section">
              <h2>주식 포트폴리오 백테스팅에 오신 것을 환영합니다! 🎉</h2>
              <p>과거 데이터로 포트폴리오 성과를 시뮬레이션하고 최적의 투자 전략을 찾아보세요.</p>
              <button onClick={startNewBacktest} className="button large">
                새로운 백테스트 시작하기 🚀
              </button>
            </div>

            {/* RankingBoard 컴포넌트 사용 */}
            <RankingBoard 
              rankings={rankings}
              rankingsLoading={rankingsLoading}
              onSelectPortfolio={setSelectedPortfolioId}
            />
          </div>
        )}

        {/* ========== Step 1: 포트폴리오 기본 정보 ========== */}
        {step === 1 && (
          <div className="card">
            <h2>1️⃣ 포트폴리오 기본 정보</h2>
            
            <div className="form-group">
              <label>포트폴리오 이름</label>
              <input
                type="text"
                value={portfolioName}
                onChange={(e) => setPortfolioName(e.target.value)}
                placeholder="예: 테크 성장주 포트폴리오"
                className="input"
              />
            </div>

            <div className="form-group">
              <label>초기 투자금액</label>
              <input
                type="number"
                value={initialCapital}
                onChange={(e) => setInitialCapital(parseInt(e.target.value))}
                className="input"
              />
              <small>{initialCapital.toLocaleString()}원</small>
            </div>

            <button onClick={goToNextStep} className="button">
              다음 단계 →
            </button>
          </div>
        )}

        {/* ========== Step 2: 종목 선택 ========== */}
        {step === 2 && (
          <div className="card">
            <h2>2️⃣ 주식 종목 선택</h2>
            
            <div className="form-group">
              <label>종목 검색</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="종목명 또는 티커 검색..."
                className="input"
              />
            </div>

            {searchQuery && (
              <div className="search-results">
                {filteredStocks.map(stock => (
                  <div 
                    key={stock.ticker}
                    onClick={() => addStock(stock)}
                    className="stock-item"
                  >
                    <strong>{stock.ticker}</strong> - {stock.name}
                  </div>
                ))}
              </div>
            )}

            <div className="selected-stocks">
              <h3>선택된 종목 ({holdings.length}개)</h3>
              {holdings.length === 0 ? (
                <p className="empty">종목을 추가해주세요</p>
              ) : (
                holdings.map(h => (
                  <div key={h.ticker} className="holding-item">
                    <span><strong>{h.ticker}</strong> - {h.name}</span>
                    <button 
                      onClick={() => removeStock(h.ticker)}
                      className="remove-btn"
                    >
                      삭제
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="button-group">
              <button onClick={() => setStep(1)} className="button secondary">
                ← 이전
              </button>
              <button onClick={goToNextStep} className="button">
                다음 단계 →
              </button>
            </div>
          </div>
        )}

        {/* ========== Step 3: 비중 설정 ========== */}
        {step === 3 && (
          <div className="card">
            <h2>3️⃣ 종목별 비중 설정</h2>
            
            <div className="holdings-list">
              {holdings.map(h => (
                <div key={h.ticker} className="weight-item">
                  <div className="stock-info">
                    <strong>{h.ticker}</strong>
                    <span>{h.name}</span>
                  </div>
                  <div className="weight-input">
                    <input
                      type="number"
                      value={h.weight}
                      onChange={(e) => updateWeight(h.ticker, e.target.value)}
                      min="0"
                      max="100"
                      step="0.1"
                    />
                    <span>%</span>
                  </div>
                </div>
              ))}
            </div>

            <div className={`total-weight ${Math.abs(totalWeight - 100) < 0.01 ? 'valid' : 'invalid'}`}>
              총 비중: {totalWeight.toFixed(2)}% / 100%
            </div>

            <div className="button-group">
              <button onClick={() => setStep(2)} className="button secondary">
                ← 이전
              </button>
              <button onClick={goToNextStep} className="button">
                다음 단계 →
              </button>
            </div>
          </div>
        )}

        {/* ========== Step 4: 백테스트 기간 설정 ========== */}
        {step === 4 && (
          <div className="card">
            <h2>4️⃣ 백테스트 기간 설정</h2>
            
            <div className="form-group">
              <label>시작일</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input"
              />
            </div>

            <div className="form-group">
              <label>종료일</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input"
              />
            </div>

            <div className="info-box">
              <h4>💡 투자 방식: Buy & Hold</h4>
              <p>초기에 설정한 비중대로 매수 후 만기까지 보유합니다.</p>
              <p>리밸런싱 없이 장기 투자 성과를 확인할 수 있습니다.</p>
            </div>

            <div className="summary">
              <h3>📋 설정 요약</h3>
              <p><strong>포트폴리오:</strong> {portfolioName}</p>
              <p><strong>초기 투자금:</strong> {initialCapital.toLocaleString()}원</p>
              <p><strong>종목 수:</strong> {holdings.length}개</p>
              <p><strong>기간:</strong> {startDate} ~ {endDate}</p>
            </div>

            <div className="button-group">
              <button onClick={() => setStep(3)} className="button secondary">
                ← 이전
              </button>
              <button onClick={runBacktest} className="button">
                백테스트 실행 🚀
              </button>
            </div>
          </div>
        )}

                {/* ========== Step 5: 결과 ========== */}
                {step === 5 && (
                  <BacktestResults 
                    backtestResult={backtestResult}
                    resetBacktest={resetBacktest}
                  />
                )}

        {/* ========== 로딩 스피너 ========== */}
        {loading && (
          <div className="loading-overlay">
            <div className="loading-content">
              <div className="spinner"></div>
              <p>백테스트 실행 중...</p>
            </div>
          </div>
        )}

        {/* ========== 포트폴리오 상세 모달 ========== */}
        {selectedPortfolioId && (
          <div className="modal-overlay" onClick={() => setSelectedPortfolioId(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setSelectedPortfolioId(null)}>✕</button>
              
              {modalLoading ? (
                <div className="modal-loading">
                  <div className="spinner"></div>
                  <p>로딩 중...</p>
                </div>
              ) : portfolioDetail ? (
                <div className="portfolio-detail">
                  <h2>{portfolioDetail.portfolioName || '포트폴리오'}</h2>
                  <p className="detail-date">
                    {portfolioDetail.createdAt 
                      ? new Date(portfolioDetail.createdAt).toLocaleDateString('ko-KR')
                      : '생성일 미상'
                    }
                  </p>

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
                          {getSettingValue('initialCapital') 
                            ? parseInt(getSettingValue('initialCapital')).toLocaleString() + '원'
                            : '미설정'
                          }
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
        )}
      </main>
    </div>
  );
}

export default App;