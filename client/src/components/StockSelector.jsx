import React from "react";

const StockSelector = ({
  searchQuery,
  setSearchQuery,
  filteredStocks,
  addStock,
  holdings,
  removeStock,
  setStep,
  goToNextStep,
}) => {
  return (
    <div className="card">
      <h2>2️⃣ 주식 종목 선택</h2>

      <div className="form-group">
        <label>종목 검색</label>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="종목명 또는 티커 검색...(예시 qqq, 나스닥, 애플, 넷플릭스, 구글, 엔비디아)"
          className="input"
        />
      </div>

      {searchQuery && (
        <div className="search-results">
          {filteredStocks.map((stock) => (
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
          holdings.map((h) => (
            <div key={h.ticker} className="holding-item">
              <span>
                <strong>{h.ticker}</strong> - {h.name}
              </span>
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
  );
};

export default StockSelector;