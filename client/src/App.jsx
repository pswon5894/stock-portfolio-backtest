import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // 상태 관리
  const [step, setStep] = useState(1);
  const [serverStatus, setServerStatus] = useState('확인 중...');
  
  // 포트폴리오 데이터
  const [portfolioName, setPortfolioName] = useState('');
  const [initialCapital, setInitialCapital] = useState(10000000);
  const [holdings, setHoldings] = useState([]);
  
  // 주식 검색
  const [searchQuery, setSearchQuery] = useState('');
  const [availableStocks] = useState([
    { ticker: 'QQQ', name: '나스닥100' },
    { ticker: 'QLD', name: '나스닥2배' },
    { ticker: 'TQQQ', name: '나스닥3배' },
    { ticker: 'SPY', name: 'snp500' },
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
  const [startDate, setStartDate] = useState('2020-01-01');
  const [endDate, setEndDate] = useState('2023-12-31');
  
  // 결과
  const [backtestResult, setBacktestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // 서버 연결 테스트
  useEffect(() => {
    fetch('https://pswon5894.github.io/stock-portfolio-backtest/')
      .then(res => res.json())
      .then(data => {
        setServerStatus('✅ 연결됨');
      })
      .catch(err => {
        setServerStatus('❌ 연결 실패');
      });
  }, []);

  // 종목 추가
  const addStock = (stock) => {
    if (holdings.find(h => h.ticker === stock.ticker)) {
      alert('이미 추가된 종목입니다.');
      return;
    }
    setHoldings([...holdings, { ...stock, weight: 0 }]);
    setSearchQuery('');
  };

  // 종목 삭제
  const removeStock = (ticker) => {
    setHoldings(holdings.filter(h => h.ticker !== ticker));
  };

  // 비중 업데이트
  const updateWeight = (ticker, weight) => {
    const newHoldings = holdings.map(h => 
      h.ticker === ticker ? { ...h, weight: parseFloat(weight) || 0 } : h
    );
    setHoldings(newHoldings);
  };

  // 총 비중 계산
  const totalWeight = holdings.reduce((sum, h) => sum + h.weight, 0);

  // 다음 단계로
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

  // 백테스트 실행
  const runBacktest = async () => {
    setLoading(true);
    
    try {
      // 서버 API 호출 시도
      const response = await fetch('http://localhost:5000/api/backtest/run', {
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
        // 서버에서 실제 백테스트 결과 받음
        const result = await response.json();
        setBacktestResult({
          ...result,
          portfolioName,
          holdings,
          settings: { startDate, endDate, initialCapital }
        });
        setStep(5);
      } else {
        throw new Error('서버 응답 오류');
      }
    } catch (error) {
      console.error('백테스트 실행 중 오류 발생:', error);
      alert('백테스트 실행에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 검색 필터링
  const filteredStocks = availableStocks.filter(stock =>
    stock.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stock.name.includes(searchQuery)
  );

  // 화면 렌더링
  return (
    <div className="App">
      <header className="App-header">
        <h1>📈 주식 포트폴리오 백테스터</h1>
        <p className="status">서버: {serverStatus}</p>
        <div className="progress-bar">
          {[1, 2, 3, 4, 5].map(s => (
            <div key={s} className={`step ${step >= s ? 'active' : ''}`}>
              {s}
            </div>
          ))}
        </div>
      </header>

      <main className="container">
        {/* Step 1: 포트폴리오 기본 정보 */}
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

        {/* Step 2: 종목 선택 */}
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

        {/* Step 3: 비중 설정 */}
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

        {/* Step 4: 백테스트 기간 설정 */}
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

        {/* Step 5: 결과 */}
        {step === 5 && backtestResult && (
          <div className="card result">
            <h2>5️⃣ 백테스트 결과</h2>
            
            <div className="result-header">
              <h3>{backtestResult.portfolioName}</h3>
              <p>{backtestResult.settings.startDate} ~ {backtestResult.settings.endDate}</p>
            </div>

            <div className="metrics">
              <div className="metric">
                <div className="metric-label">총 수익률</div>
                <div className={`metric-value ${backtestResult.performance.totalReturn >= 0 ? 'positive' : 'negative'}`}>
                  {backtestResult.performance.totalReturn}%
                </div>
              </div>

              <div className="metric">
                <div className="metric-label">연환산 수익률</div>
                <div className={`metric-value ${backtestResult.performance.annualizedReturn >= 0 ? 'positive' : 'negative'}`}>
                  {backtestResult.performance.annualizedReturn}%
                </div>
              </div>

              <div className="metric">
                <div className="metric-label">샤프 비율</div>
                <div className="metric-value">{backtestResult.performance.sharpeRatio}</div>
              </div>

              <div className="metric">
                <div className="metric-label">최대 낙폭</div>
                <div className="metric-value negative">
                  -{backtestResult.performance.maxDrawdown}%
                </div>
              </div>

              <div className="metric">
                <div className="metric-label">변동성</div>
                <div className="metric-value">{backtestResult.performance.volatility}%</div>
              </div>

              <div className="metric">
                <div className="metric-label">승률</div>
                <div className="metric-value">{backtestResult.performance.winRate}%</div>
              </div>
            </div>

            {backtestResult.performance.finalAmount && (
              <div className="amount-summary">
                <div className="amount-item">
                  <span>초기 투자금:</span>
                  <strong>{initialCapital.toLocaleString()}원</strong>
                </div>
                <div className="amount-item">
                  <span>최종 자산:</span>
                  <strong className={backtestResult.performance.profit >= 0 ? 'positive' : 'negative'}>
                    {parseInt(backtestResult.performance.finalAmount).toLocaleString()}원
                  </strong>
                </div>
                <div className="amount-item">
                  <span>수익금:</span>
                  <strong className={backtestResult.performance.profit >= 0 ? 'positive' : 'negative'}>
                    {parseInt(backtestResult.performance.profit).toLocaleString()}원
                  </strong>
                </div>
              </div>
            )}

            <div className="holdings-summary">
              <h3>포트폴리오 구성</h3>
              {backtestResult.holdings.map(h => (
                <div key={h.ticker} className="holding-row">
                  <span>{h.ticker} - {h.name}</span>
                  <span className="weight-badge">{h.weight}%</span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => {
                setStep(1);
                setPortfolioName('');
                setHoldings([]);
                setBacktestResult(null);
              }}
              className="button"
            >
              새로운 백테스트 시작
            </button>
          </div>
        )}

        {/* 로딩 */}
        {loading && (
          <div className="loading-overlay">
            <div className="loading-content">
              <div className="spinner"></div>
              <p>백테스트 실행 중...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;