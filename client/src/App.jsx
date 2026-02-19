import React, { useState, useEffect } from 'react';
import './App.css';
import { useThemeStore } from "./theme/themeStore";
import ThemeToggle from "./theme/ThemeToggle";

import availableStocks from './data/stocks'
import PortfolioDetailModal from './components/PortfolioDetailModal';
import RankingBoard from './components/RankingBoard';
import BacktestResults from './components/BacktestResults';
import StockSelector from "./components/StockSelector";
import BacktestPeriod from './components/BacktestPeriod';

// import {useBacktest} from './hooks/useBacktest';

function App() {

  const darkMode = useThemeStore((state) => state.darkMode);

  // ==================== 상태 관리 ====================
  const [step, setStep] = useState(0); // 0: 홈, 1-5: 백테스트 단계
  const [serverStatus, setServerStatus] = useState('확인 중...');
  
  // 포트폴리오 데이터
  const [portfolioName, setPortfolioName] = useState('');
  const [initialCapital, setInitialCapital] = useState(10000000);
  const [holdings, setHoldings] = useState([]);
  
  // 주식 검색
  const [searchQuery, setSearchQuery] = useState('');

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

  // 개발 환경에서는 http://localhost:5000/api, 프로덕션 환경에서는 배포된 서버 주소 사용
  const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? 'https://stock-portfolio-backtest.onrender.com'
    : 'http://localhost:5000';

  // ==================== 서버 연결 테스트 ====================
  useEffect(() => {
    fetch(`${API_BASE_URL}`)
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
      const response = await fetch(`${API_BASE_URL}/api/backtest/rankings?limit=3`);
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
      const response = await fetch(`${API_BASE_URL}/api/backtest/results/${portfolioId}`);
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
      const response = await fetch(`${API_BASE_URL}/api/backtest/run`, {
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
      console.log('서버 연결 실패, 재시작 바람니다:', error);
      
      setStep(5);
      alert('⚠️ 서버가 깨어나는 중일수도 있습니다. 웹페이지를 다시 시작해주세요\n에러: ' + error.message);
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

  // ==================== 모달 닫기 함수 (추가 또는 수정) ====================
  const closeModal = () => {
    setSelectedPortfolioId(null);
    setPortfolioDetail(null);
  };
  
  // ==================== 렌더링 ====================
  return (
    // <div className="App">
    <div className={darkMode ? "app dark" : "App"}>
       <ThemeToggle />
      {/* ========== 헤더 ========== */}
      <header className="App-header">
        <h1> 주식 포트폴리오 백테스터</h1>
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
            홈으로
          </button>
        )}
      </header>

      <main className="container">
        {/* ========== 홈 화면 (Step 0) ========== */}
        {step === 0 && (
          <div className="home-screen">
            {/* 환영 섹션 */}
            <div className="welcome-section">
              <h2>주식 포트폴리오 백테스팅에 오신 것을 환영합니다!</h2>
              <p>과거 데이터로 포트폴리오 성과를 시뮬레이션하고 최적의 투자 전략을 찾아보세요.</p>
              <button onClick={startNewBacktest} className={`button large ${darkMode ? 'dark' : ''}`}>
                새로운 백테스트 시작하기
              </button>
            </div>

            {/* 3위까지 랭킹 표시 */}
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
        <StockSelector
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filteredStocks={filteredStocks}
          addStock={addStock}
          holdings={holdings}
          removeStock={removeStock}
          setStep={setStep}
          goToNextStep={goToNextStep}
        />
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
          <BacktestPeriod
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            portfolioName={portfolioName}
            initialCapital={initialCapital}
            holdings={holdings}
            setStep={setStep}
            runBacktest={runBacktest}
          />
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
        <PortfolioDetailModal 
          show={!!selectedPortfolioId}
          portfolioDetail={portfolioDetail}
          modalLoading={modalLoading}
          onClose={closeModal}
        />
      </main>
    </div>
  );
}

export default App;