// useBacktest.js
import {useState} from 'react';

export function useBacktest(){
    const [loading, setLoading] = useState(true);
    const [backtestResult, setBacktestResult]= useState;
    const [step ,setStep] =useState;

    // ==================== 백테스트 실행 ====================
  const runBacktest = async () => {
    setLoading(true);
    
    try {
      const response = await fetch(`${serverUrl}/api/backtest/run`, {
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

  return{
    loading,
    backtestResult,
    runBacktest,
  };
}
