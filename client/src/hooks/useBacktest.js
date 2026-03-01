// src/hooks/useBacktest.js
import {useState} from 'react';

export const useBacktest = (API_BASE_URL) =>{
  const [loading, setLoading] = useState()
  const [backtestResult, setBacktestResult] = useState()


  // ==================== 백테스트 실행 ====================

  const runBacktest = async ({
    setStep,
    portfolioName,
    holdings,
    initialCapital,
    startDate,
    endDate,
  }) => {
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
        setStep?.(5);
      } else {
        const error = await response.json();
        throw new Error(error.error || '서버 응답 오류');
      }
    } catch (error) {
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

      // console.log(setBacktestResult)

      setStep?.(5);
      alert('⚠️ 서버에서 실제 데이터를 가져올 수 없어 모의 데이터를 표시합니다.\n에러: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return{
    runBacktest, loading, backtestResult, setBacktestResult
  }
}
