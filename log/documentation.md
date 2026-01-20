# 서버 스크립트 설명

이 문서에서는 `server` 디렉토리에 있는 주요 스크립트 파일들의 역할과 기능에 대해 설명합니다.

## `server.js`

`server.js`는 Node.js Express 프레임워크를 사용하여 구축된 백엔드 API 서버의 메인 진입점입니다. 이 스크립트의 주요 기능은 다음과 같습니다.

-   **서버 초기화**: Express 애플리케이션을 생성하고 기본 미들웨어(CORS, JSON 파서 등)를 설정합니다.
-   **CORS 설정**: 클라이언트 애플리케이션(`http://localhost:3000`)과의 원활한 통신을 위해 CORS (Cross-Origin Resource Sharing) 정책을 설정합니다.
-   **데이터베이스 연결**: `mongoose`를 사용하여 MongoDB Atlas 데이터베이스에 연결합니다. 연결 정보는 `dev.js` 파일에 저장된 환경 변수를 사용합니다.
-   **API 라우팅**: `/api/stocks`, `/api/portfolios`, `/api/backtest` 경로로 들어오는 요청을 각각의 라우터 파일로 전달하여 처리합니다.
-   **에러 핸들링**: 서버 내부에서 발생하는 오류를 처리하는 중앙 에러 핸들링 미들웨어를 포함합니다.
-   **서버 실행**: `PORT` 환경 변수 또는 기본값 `5000` 포트에서 서버를 실행하고, 실행 시 콘솔에 사용 가능한 API 엔드포인트 정보를 출력합니다.

## `test-api.js`

`test-api.js`는 `stockService`를 통해 외부 API(Yahoo Finance)와의 연동을 테스트하기 위한 독립적인 스크립트입니다. 이 스크립트는 서버를 실행하지 않고 특정 기능의 동작을 확인하는 데 사용됩니다.

-   **API 연결 테스트**: `stockService.testAPIConnection` 함수를 호출하여 API 서버와의 기본적인 연결 상태를 확인합니다.
-   **개별 종목 데이터 테스트**: 'AAPL', 'MSFT', 'GOOGL'과 같은 특정 주식 종목 코드를 사용하여 일정 기간의 실제 주가 데이터를 가져오는 `stockService.getStockData` 함수의 동작을 테스트하고 결과를 콘솔에 출력합니다.
-   **포트폴리오 데이터 테스트**: 여러 종목으로 구성된 포트폴리오의 주가 데이터를 한 번에 가져오는 `stockService.getMultipleStocksData` 함수의 동작을 시뮬레이션합니다.
-   **독립 실행**: 이 스크립트는 `node server/test-api.js` 명령으로 직접 실행할 수 있으며, 테스트 완료 후 자동으로 프로세스를 종료합니다.
