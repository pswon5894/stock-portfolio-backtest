// useBacktest.js
import {useCallback, useState} from 'react';

export function useBacktest(API_BASE_URL){
    const [backtestResult, setBacktestResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // ==================== 백테스트 실행 ====================
  const runBacktest = useCallback( async ({
    portfolioName,
    holdings,
    initialCapital,
    startDate,
    endDate,
    onStepChange,   // 필요하면 외부에서 step 변경 콜백을 받음, (파라미터)
  }) => {
    setLoading(true);
    setError(null);

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
        onStepChange?.(5);
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
      onStepChange?.(5);
      alert('⚠️ 서버에서 실제 데이터를 가져올 수 없어 모의 데이터를 표시합니다.\n에러: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  return{
    backtestResult,
    loading,
    error,
    runBacktest,
  };
}
