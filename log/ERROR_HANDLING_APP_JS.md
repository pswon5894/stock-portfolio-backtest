# `App.js` 백테스트 실패 시 UI 처리 (코드 수정 없이)

이 문서는 `client/src/App.js` 파일에서 백엔드 서버 연결 실패 등으로 백테스트 실행이 정상적으로 이루어지지 않았을 때, 현재 코드가 어떻게 사용자에게 알리고 로딩 화면을 제거하는지에 대해 설명합니다. 별도의 코드 수정 없이 현재 구현된 방식을 분석합니다.

## `runBacktest` 함수의 오류 처리 로직

`App.js` 파일 내의 `runBacktest` 비동기 함수는 백테스트 실행 요청을 백엔드 서버로 보내고, 그 결과를 처리합니다. 이 함수에는 `try...catch...finally` 블록이 구현되어 있어 오류 발생 시 특정 동작을 수행합니다.

```javascript
  // 백테스트 실행
  const runBacktest = async () => {
    setLoading(true); // (1) 로딩 화면 표시

    try {
      // (2) 서버 API 호출 시도
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
        // (3) 성공적으로 응답을 받고 HTTP 상태 코드가 2xx인 경우
        // 결과 처리 및 Step 5로 이동
        const result = await response.json();
        setBacktestResult({
          ...result,
          portfolioName,
          holdings,
          settings: { startDate, endDate, initialCapital }
        });
        setStep(5);
      } else {
        // (4) 서버로부터 응답은 받았으나 HTTP 상태 코드가 2xx가 아닌 경우 (예: 400, 500 에러)
        throw new Error('서버 응답 오류');
      }
    } catch (error) {
      // (5) 네트워크 오류 (서버 연결 불가), fetch 실패, 또는 (4)에서 던져진 에러가 발생한 경우
      console.error('백테스트 실행 중 오류 발생:', error); // 콘솔에 에러 로깅
      alert('백테스트 실행에 실패했습니다.'); // 사용자에게 alert 창 표시
      // 이곳에서는 setStep(5)를 호출하지 않으므로, 현재 단계(Step 4)에 머무릅니다.
    } finally {
      setLoading(false); // (6) 로딩 화면 숨기기 (성공/실패 여부와 관계없이 항상 실행)
    }
  };
```

### 동작 분석

백테스트 실행 중 서버 연결 문제나 기타 오류가 발생했을 때의 UI 흐름은 다음과 같습니다.

1.  **로딩 화면 표시**: `runBacktest` 함수가 시작되면 `setLoading(true)`를 통해 로딩 상태가 활성화되고, 화면에 로딩 오버레이가 나타납니다.
2.  **서버 통신 시도**: `fetch` 함수를 사용하여 백엔드 서버의 `/api/backtest/run` 엔드포인트로 요청을 보냅니다.
3.  **오류 감지**:
    *   `fetch` 호출 자체가 실패하는 경우 (예: 네트워크 연결 없음, 백엔드 서버가 실행 중이지 않음)에는 즉시 `catch` 블록으로 이동합니다.
    *   서버로부터 응답은 받았으나, 응답의 HTTP 상태 코드가 2xx 범위가 아닌 경우 (`response.ok`가 `false`), 코드 내에서 `new Error('서버 응답 오류')`를 `throw`하여 `catch` 블록으로 강제로 이동시킵니다.
4.  **오류 처리 및 알림**: `catch` 블록에서는 다음 두 가지 주요 작업을 수행합니다.
    *   `console.error(...)`: 발생한 오류를 개발자 콘솔에 기록합니다.
    *   `alert('백테스트 실행에 실패했습니다.');`: 사용자에게 백테스트 실패를 알리는 브라우저 기본 `alert` 팝업을 띄웁니다.
5.  **로딩 화면 제거**: `finally` 블록에 `setLoading(false)`가 위치해 있습니다. `finally` 블록은 `try` 블록이 성공적으로 완료되든, `catch` 블록이 실행되든 관계없이 항상 실행됩니다. 따라서, 오류 발생 여부와 관계없이 백테스트 시도 과정이 끝나면 로딩 화면은 항상 사라지게 됩니다.

### 결론

현재 `App.js` 코드는 백테스트가 서버 연결 문제로 실패했을 경우, 사용자에게 `alert` 메시지를 표시하고, `finally` 블록을 통해 로딩 화면을 자동으로 숨기도록 이미 구현되어 있습니다. 오류 발생 시 애플리케이션은 백테스트 설정 단계(Step 4)에 머무르게 되며, 결과 단계(Step 5)로 자동으로 이동하지 않습니다. 이는 사용자에게 오류 상황을 명확히 알리고 추가적인 조치를 취할 수 있도록 하는 적절한 처리 방식입니다.
