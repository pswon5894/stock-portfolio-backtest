import React, { useState, useEffect } from 'react';
import { stockAPI } from '../services/api';

function PortfolioBuilder({ portfolio, onSave, onRunBacktest, onCancel }) {
  const [portfolioName, setPortfolioName] = useState('');
  const [holdings, setHoldings] = useState([]);
  const [initialCapital, setInitialCapital] = useState(10000000);
  const [startDate, setStartDate] = useState('2020-01-01');
  const [endDate, setEndDate] = useState('2023-12-31');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (portfolio) {
      setPortfolioName(portfolio.name);
      setHoldings(portfolio.holdings || []);
      setInitialCapital(portfolio.initialCapital || 10000000);
      setStartDate(portfolio.startDate ? portfolio.startDate.substring(0, 10) : '2020-01-01');
      setEndDate(portfolio.endDate ? portfolio.endDate.substring(0, 10) : '2023-12-31');
    } else {
      // Reset for new portfolio
      setPortfolioName('');
      setHoldings([]);
      setInitialCapital(10000000);
    }
  }, [portfolio]);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length > 1) {
      try {
        const response = await stockAPI.searchStocks(query);
        setSearchResults(response.data);
      } catch (error) {
        console.error("Stock search failed:", error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  const addHolding = (stock) => {
    if (holdings.find(h => h.ticker === stock.ticker)) {
      alert('이미 추가된 종목입니다.');
      return;
    }
    setHoldings([...holdings, {
      ticker: stock.ticker,
      name: stock.name,
      weight: 0
    }]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const updateWeight = (index, weight) => {
    const newHoldings = [...holdings];
    newHoldings[index].weight = parseFloat(weight) || 0;
    setHoldings(newHoldings);
  };

  const removeHolding = (index) => {
    setHoldings(holdings.filter((_, i) => i !== index));
  };

  const totalWeight = holdings.reduce((sum, h) => sum + (h.weight || 0), 0);

  const handleSave = () => {
    if (Math.abs(totalWeight - 100) > 0.01) {
      alert('총 비중이 100%가 되어야 합니다.');
      return;
    }
    onSave({
      name: portfolioName,
      initialCapital,
      holdings,
      startDate,
      endDate,
    });
  };

  const handleRunBacktest = () => {
    if (Math.abs(totalWeight - 100) > 0.01) {
      alert('총 비중이 100%가 되어야 합니다.');
      return;
    }
    onRunBacktest({
      name: portfolioName,
      initialCapital,
      holdings,
      startDate,
      endDate,
    });
  };

  return (
    <div className="card">
      <h2>
        {portfolio ? '포트폴리오 수정' : '새 포트폴리오 만들기'}
      </h2>
      
      {/* Portfolio Info */}
      <div className="form-group">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <div>
            <label className="form-group label">포트폴리오 이름</label>
            <input
              type="text"
              value={portfolioName}
              onChange={(e) => setPortfolioName(e.target.value)}
              className="input"
              placeholder="예: 성장주 포트폴리오"
            />
          </div>
          <div>
            <label className="form-group label">초기 투자금액</label>
            <input
              type="number"
              value={initialCapital}
              onChange={(e) => setInitialCapital(parseInt(e.target.value))}
              className="input"
            />
          </div>
        </div>
      </div>

      {/* Stock Search */}
      <div className="form-group">
        <label className="form-group label">주식 검색</label>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="input"
          placeholder="종목명 또는 티커 입력"
        />
        {searchResults.length > 0 && (
          <div className="search-results">
            {searchResults.map((stock) => (
              <div key={stock.ticker} onClick={() => addHolding(stock)} className="stock-item">
                <strong>{stock.ticker}</strong>
                <span>{stock.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Holdings */}
      <div className="selected-stocks">
        <h3>보유 종목</h3>
        {holdings.length === 0 ? (
          <p className="empty">종목을 추가해주세요</p>
        ) : (
          <div className="holdings-list">
            {holdings.map((holding, index) => (
              <div key={index} className="weight-item">
                <div className="stock-info">
                  <strong>{holding.ticker}</strong>
                  <span>{holding.name}</span>
                </div>
                <div className="weight-input">
                  <input
                    type="number"
                    value={holding.weight}
                    onChange={(e) => updateWeight(index, e.target.value)}
                    style={{ width: '80px', padding: '8px', border: '2px solid #e0e0e0', borderRadius: '5px', textAlign: 'right', fontSize: '1rem' }}
                    placeholder="비중"
                    step="0.1"
                  />
                  <span>%</span>
                  <button onClick={() => removeHolding(index)} className="remove-btn">
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {holdings.length > 0 && (
          <div className={`total-weight ${Math.abs(totalWeight - 100) < 0.01 ? 'valid' : 'invalid'}`}>
            총 비중: {totalWeight.toFixed(2)}%
          </div>
        )}
      </div>

      {/* Backtest Period */}
      <div className="form-group">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <div>
            <label className="form-group label">백테스트 시작일</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input" />
          </div>
          <div>
            <label className="form-group label">백테스트 종료일</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input" />
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="button-group">
        <button onClick={onCancel} className="button secondary">
          목록으로
        </button>
        <button
          onClick={handleSave}
          disabled={!portfolioName || holdings.length === 0 || Math.abs(totalWeight - 100) > 0.01}
          className="button"
        >
          {portfolio ? '포트폴리오 수정' : '포트폴리오 저장'}
        </button>
        <button
          onClick={handleRunBacktest}
          disabled={!portfolioName || holdings.length === 0 || Math.abs(totalWeight - 100) > 0.01}
          className="button"
        >
          백테스트 실행 🚀
        </button>
      </div>
    </div>
  );
}

export default PortfolioBuilder;