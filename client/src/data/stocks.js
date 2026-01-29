// src/data/stocks.js
const availableStocks = [
  { ticker: 'QQQ', name: '나스닥 100 etf' },
  { ticker: 'SPY', name: 'S&P 500 etf' },
  { ticker: 'QLD', name: '나스닥 2배 etf' },
  { ticker: 'SSO', name: 'S&P 2배 etf' },
  { ticker: 'TQQQ', name: '나스닥 3배 etf' },
  { ticker: 'UPRO', name: 'S&P 3배 etf' },
  { ticker: 'AAPL', name: '애플' },
  { ticker: 'MSFT', name: '마이크로소프트' },
  { ticker: 'GOOGL', name: '구글' },
  { ticker: 'AMZN', name: '아마존' },
  { ticker: 'TSLA', name: '테슬라' },
  { ticker: 'NVDA', name: '엔비디아' },
  { ticker: 'META', name: '메타' },
  { ticker: 'NFLX', name: '넷플릭스' },
];

export default availableStocks;

//지금은 추가나 관리할 의도가 적으므로 넘어가지만
//db파일에 항목을 추가해두는것이 나음 수정이나 관리차원에서