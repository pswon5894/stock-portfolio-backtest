https://stock-portfolio-backtest.vercel.app/
vercel 배포 주소 + render(초기 구동 콜드 스립 깨울 때만 느림)

https://pswon5894.github.io/stock-portfolio-backtest/
배포 깃페이지 + render(초기 구동 콜드 스립 깨울 때만 느림)

https://stock-portfolio-backtest.onrender.com
15분간 미사용시 콜드 슬립, 깨어나는데 30초정도 걸림

# 프로젝트 작동 방식 설명

이 문서는 주식 포트폴리오 백테스트 애플리케이션의 전체 아키텍처, 구성 요소 및 데이터 흐름에 대해 설명합니다.

## 1. 전체 아키텍처

기술 스택
프로젝트 버전
"react": "^19.2.3"
node v24.12.0

이 프로젝트는 현대적인 웹 애플리케이션의 표준 구조인 **클라이언트-서버 아키텍처**를 따릅니다.

-   **클라이언트 (Frontend)**: `client` 디렉토리에 있으며, [React]를 사용하여 구축되었습니다. 사용자가 포트폴리오를 구성하고 백테스트를 실행하며 그 결과를 확인할 수 있는 웹 인터페이스(UI)를 제공
-   **서버 (Backend)**: `server` 디렉토리에 있으며, [Node.js]와 [Express] 프레임워크를 기반으로 합니다. 클라이언트로부터의 요청을 처리하는 RESTful API를 제공하고, 비즈니스 로직을 수행하며, 데이터베이스와 통신합니다.
-   **데이터베이스**: [MongoDB]를 사용하여 데이터를 저장. 주로 사용자가 생성한 포트폴리오와 외부 API에서 가져온 주식 데이터를 캐싱
-   **외부 서비스**: [Yahoo Finance API](https://finance.yahoo.com/)를 통해 실제 주식 시장의 과거 데이터를 가져옵니다. `yahoo-finance2` 라이브러리를 사용하여 통신


## 2. 백엔드 (Server) 상세 설명

서버는 API 제공, 비즈니스 로직 처리, 데이터 관리를 담당

-   **`server.js`**: 서버의 메인 진입점. Express 앱을 설정하고, MongoDB 데이터베이스에 연결하며, API 라우터들을 등록

-   **`routes/`**: API 엔드포인트를 정의
    -   `portfolios.js`: 포트폴리오에 대한 CRUD(생성, 조회, 수정, 삭제) API를 제공
    -   `stocks.js`: 주식 종목을 검색하고 특정 종목의 과거 데이터를 조회하는 API를 제공
    -   `backtest.js`: 백테스트 실행을 요청하는 `POST /api/backtest/run` 엔드포인트를 정의합니다.

-   **`services/`**: 핵심 비즈니스 로직을 포함합니다.
    -   `stockService.js`: Yahoo Finance API와의 통신을 담당합니다. **데이터 캐싱 전략**이 구현되어 있어, 먼저 내부 MongoDB에 데이터가 있는지 확인하고, 없거나 오래된 경우에만 외부 API를 호출하여 데이터를 가져온 후 MongoDB에 저장(캐시)합니다. 이는 성능을 향상시키고 API 호출 횟수를 줄이는 중요한 역할을 합니다.
    -   `backtestService.js`: 실제 백테스트 시뮬레이션을 수행합니다. `stockService`를 통해 필요한 모든 주식 데이터를 가져온 후, "Buy and Hold" 투자 전략을 시뮬레이션

-   **`models/`**: MongoDB 데이터베이스의 스키마를 정의
    -   `Portfolio.js`: 사용자가 생성한 포트폴리오의 구조(이름, 보유 종목 및 비중 등)를 정의
    -   `Stock.js`: `stockService`가 캐싱할 주식 데이터의 구조를 정의
    -   `BacktestResult.js`: 백테스트 실행 결과를 저장하기 위한 스키마

## 3. 프론트엔드 (Client) 상세 설명

클라이언트는 사용자 경험(UX)을 만들고 서버와 상호작용합니다.

-   **`App.js`**: 애플리케이션의 메인 React 컴포넌트입니다. 전체 UI의 흐름을 단계별 마법사(Wizard) 형태로 관리
    1.  포트폴리오 이름/초기 자본 설정
    2.  포트폴리오에 포함할 주식 종목 선택
    3.  종목별 투자 비중 설정
    4.  백테스트 기간 설정 및 실행
    5.  결과 확인
-   **`components/`**: 재사용 가능한 UI 조각들입니다.
    -   `PortfolioBuilder.jsx`: 포트폴리오를 생성하고 편집하는 UI 컴포넌트
    -   `PortfolioList.jsx`: 저장된 포트폴리오 목록을 보여주는 컴포넌트
    -   `BacktestResults.jsx`: 백테스트 결과를 시각적으로 표현하는 컴포넌트
-   **`services/api.js`**: 서버 API와의 모든 통신을 중앙에서 관리하는 모듈 `axios` 라이브러리를 사용하여 백엔드에 HTTP 요청을 보내고 응답을 처리. 이를 통해 컴포넌트 코드와 API 호출 로직을 분리

## 4. 핵심 데이터 흐름: 백테스트 실행 과정

사용자가 "백테스트 실행" 버튼을 클릭했을 때의 데이터 흐름은 다음과 같습니다.

1.  **[Client]** React 앱이 사용자가 입력한 포트폴리오 정보(종목, 비중)와 기간 설정을 모아 JSON 객체를 만듭니다.
2.  **[Client → Server]** `services/api.js`를 통해 이 JSON 객체를 담아 서버의 `POST /api/backtest/run` 엔드포인트로 HTTP 요청을 보냅니다.
3.  **[Server]** `backtest.js` 라우터가 요청을 받아 `backtestService`의 `runBacktest` 함수를 호출합니다.
4.  **[Server]** `backtestService`는 포트폴리오에 포함된 모든 종목에 대해 `stockService`에게 과거 데이터를 요청합니다.
5.  **[Server/DB/API]** `stockService`는 각 종목에 대해 먼저 MongoDB 캐시를 확인합니다. 데이터가 있으면 즉시 반환하고, 없으면 Yahoo Finance API에 데이터를 요청하여 가져온 후 DB에 캐싱하고 반환합니다.
6.  **[Server]** `backtestService`는 모든 종목의 데이터를 받은 후, 설정된 기간 동안 "Buy and Hold" 전략을 시뮬레이션하여 일별 포트폴리오 가치를 계산합니다.
7.  **[Server]** 시뮬레이션 결과를 바탕으로 최종 수익률, MDD 등 다양한 성과 지표를 계산합니다.
8.  **[Server → Client]** 계산된 모든 결과 데이터를 JSON 형태로 클라이언트에 응답으로 보냅니다.
9.  **[Client]** React 앱이 이 응답 데이터를 받아 상태(state)를 업데이트하고, `BacktestResults` 컴포넌트를 통해 사용자에게 보기 쉽게 결과를 렌더링합니다.


## 5 배포
배포

프론트엔드 git page 호스팅 배포
프론트엔드 vercel 배포
(깃허브 커밋하면 자동으로 업데이트 후 자동 빌드 및 배포)

백엔드 render (초기 구동 느림,  장기 미사용시 서버를 깨워야해서, 무료 티어, 5분 콜드 슬립 있음)
깃 허브 코드를 바탕으로 커밋을 하게되면 자동으로 업데이트 배포

데이터 베이스 mongodb

백엔드 후보 aws s3

## 6 후기, 추가 사항
성능 최적화, light house
인덱스 펀드와 비교
포트폴리오 랭킹 대결(서버에 포트폴리오를 저장해서 포트폴리오를 등수로 표시)

mongodb는 비관계형 db로 데이터 저장 방식을 유연하게 중간에 변경할 수 있고, 
node.js express 웹 서버 구축