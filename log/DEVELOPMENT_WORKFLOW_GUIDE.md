# 프로젝트 개발 워크플로우 가이드: API 명세서부터 테스트까지

이 문서는 "API 명세서 작성 → MSW 기반 프론트 개발 → 실제 API 연결 → 테스트 보완" 워크플로우를 현재 `stock-portfolio-backtest` 프로젝트에 적용하는 구체적인 방법을 안내합니다. 이 워크플로우는 프론트엔드와 백엔드 팀 간의 의존성을 줄이고, 병렬 개발을 가능하게 하여 생산성과 코드 품질을 높이는 것을 목표로 합니다.

---

### **1단계: API 명세서 작성**

가장 먼저 프론트엔드와 백엔드 사이의 통신 규칙, 즉 **API 명세(API Specification)**를 정의합니다. 이것은 두 팀 간의 "계약서" 역할을 합니다.

#### **왜 필요한가?**

-   백엔드는 이 명세에 따라 API를 개발하고, 프론트엔드는 이 명세에 따라 API를 호출하고 UI를 개발합니다.
-   서로의 작업 완료를 기다릴 필요 없이 동시에 개발을 시작할 수 있습니다.

#### **어떻게 작성하는가?**

[OpenAPI (Swagger)](https://swagger.io/specification/) 명세를 사용하는 것을 추천합니다. 프로젝트 루트에 `openapi.yaml` 파일을 만들고 API를 정의합니다.

**예시: `openapi.yaml` - 주식 검색 API 정의**

```yaml
openapi: 3.0.0
info:
  title: Stock Portfolio Backtest API
  version: 1.0.0
paths:
  /api/stocks/search:
    get:
      summary: 주식 정보 검색
      parameters:
        - name: query
          in: query
          required: true
          description: 검색할 주식의 티커 또는 이름
          schema:
            type: string
      responses:
        '200':
          description: 검색 성공
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    ticker:
                      type: string
                      example: "AAPL"
                    name:
                      type: string
                      example: "Apple Inc."
        '400':
          description: 잘못된 요청 (쿼리 없음)

  # 여기에 다른 API(포트폴리오, 백테스트 등) 명세도 추가합니다.
  # /api/portfolios, /api/backtest/run 등
```

**✅ 해야 할 일**: 프로젝트의 모든 API 엔드포인트(`portfolios`, `backtest` 등)에 대한 명세서를 위와 같은 형식으로 `openapi.yaml` 파일에 작성합니다.

---

### **2단계: MSW 기반 프론트엔드 개발**

API 명세서가 나왔으므로, 프론트엔드는 **실제 백엔드 API가 완성되기를 기다릴 필요 없이** 가짜 API 서버인 **MSW(Mock Service Worker)**를 사용하여 개발을 시작합니다.

#### **왜 필요한가?**

-   백엔드 개발이 완료될 때까지 프론트엔드 개발이 멈추는 "블로킹(blocking)" 상태를 방지합니다.
-   API 명세서에 정의된 응답 데이터를 미리 만들어 UI 개발 및 로직 검증을 할 수 있습니다.

#### **어떻게 설정하고 사용하는가?**

1.  **MSW 설치** (`client` 디렉터리에서 실행)
    ```bash
    npm install msw --save-dev
    ```

2.  **서비스 워커 스크립트 생성** (`client` 디렉터리에서 실행)
    ```bash
    npx msw init client/public --save
    ```
    이 명령은 `client/public`에 `mockServiceWorker.js` 파일을 생성합니다.

3.  **Mock 핸들러 작성**
    `client/src/mocks/handlers.js` 파일을 만들고, 1단계에서 작성한 API 명세에 따라 가짜 응답을 반환하는 핸들러를 작성합니다.

    **예시: `client/src/mocks/handlers.js`**
    ```javascript
    import { rest } from 'msw';

    export const handlers = [
      // 주식 검색 요청을 가로챕니다.
      rest.get('/api/stocks/search', (req, res, ctx) => {
        const query = req.url.searchParams.get('query');
        
        // 실제 API인 것처럼 딜레이를 줍니다.
        return res(
          ctx.delay(500),
          ctx.status(200),
          ctx.json([
            { ticker: `MOCK-${query.toUpperCase()}`, name: `Mock ${query} Company` },
            { ticker: 'MSFT', name: 'Microsoft Corporation' },
          ])
        );
      }),

      // 여기에 다른 API 핸들러(포트폴리오, 백테스트 등)도 추가합니다.
      rest.post('/api/backtest/run', (req, res, ctx) => {
         return res(
            ctx.delay(1500),
            ctx.status(200),
            ctx.json({
               "message": "Mock backtest successful",
               "results": { /* 가짜 결과 데이터 */ }
            })
         )
      })
    ];
    ```

4.  **브라우저에서 MSW 활성화**
    `client/src/mocks/browser.js` 파일을 만들고, `client/src/index.js`에서 개발 환경일 때만 MSW를 실행하도록 설정합니다.

    **`client/src/mocks/browser.js`**
    ```javascript
    import { setupWorker } from 'msw';
    import { handlers } from './handlers';

    export const worker = setupWorker(...handlers);
    ```

    **`client/src/index.js`**
    ```javascript
    // ... 다른 import들
    
    // 개발 환경에서만 MSW를 활성화합니다.
    if (process.env.NODE_ENV === 'development') {
      const { worker } = require('./mocks/browser');
      worker.start();
    }

    const root = ReactDOM.createRoot(document.getElementById('root'));
    // ...
    ```

**✅ 해야 할 일**: 위 설정 후 `npm start`를 실행하면, `api.js`의 API 호출들이 실제 서버가 아닌 MSW가 반환하는 가짜 데이터를 받게 됩니다. 이 데이터를 이용하여 UI 컴포넌트 개발을 완료합니다.

---

### **3단계: 실제 API 연결**

백엔드 개발이 완료되면, 프론트엔드를 MSW가 아닌 실제 백엔드 API에 연결하여 통합 테스트를 진행합니다.

#### **어떻게 하는가?**

-   **백엔드 서버 실행**: 터미널에서 `cd server && npm start` 명령으로 실제 백엔드 서버를 실행합니다.
-   **프론트엔드 연결**: `client/package.json`의 `"proxy"` 설정 덕분에, `client`에서 `npm start`로 실행된 프론트엔드는 별도 코드 수정 없이 자동으로 `localhost:5000`의 실제 백엔드 API를 호출하게 됩니다.
-   `client/src/index.js`에서 `worker.start()` 부분을 주석 처리하면 MSW의 작동을 일시적으로 중단하고 실제 API를 테스트할 수 있습니다.

---

### **4단계: 테스트 보완**

API 연결이 확인된 후, 코드 변경에 따른 부작용(side effect)을 방지하고 안정성을 높이기 위해 자동화된 테스트를 보강합니다.

#### **백엔드 테스트**

-   **Jest**와 **Supertest** 라이브러리를 사용하여 API 엔드포인트 테스트를 작성합니다.
-   **예시: `server/routes/stocks.test.js`**
    ```javascript
    const request = require('supertest');
    const app = require('../server'); // Express 앱을 가져옵니다. (server.js 수정 필요)

    describe('GET /api/stocks/search', () => {
      it('should return stock search results', async () => {
        const res = await request(app)
          .get('/api/stocks/search?query=AAPL')
          .expect('Content-Type', /json/)
          .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0]).toHaveProperty('ticker');
      });
    });
    ```

#### **프론트엔드 테스트**

-   **React Testing Library**와 **MSW**를 함께 사용하여 컴포넌트를 테스트합니다. MSW를 테스트 환경에서 사용하면, 테스트 실행 시 실제 네트워크 요청을 보내는 대신 핸들러에 정의된 가짜 데이터를 사용하게 되어 빠르고 안정적인 테스트가 가능합니다.
-   **예시: 주식 검색 컴포넌트 테스트**
    ```javascript
    // src/components/StockSearch.test.js
    import { render, screen, fireEvent, waitFor } from '@testing-library/react';
    import { rest } from 'msw';
    import { setupServer } from 'msw/node';
    import StockSearch from './StockSearch';

    // 테스트용 서버 설정
    const server = setupServer(
      rest.get('/api/stocks/search', (req, res, ctx) => {
        return res(ctx.json([{ ticker: 'TEST', name: 'Test Stock' }]));
      })
    );

    beforeAll(() => server.listen());
    afterEach(() => server.resetHandlers());
    afterAll(() => server.close());

    test('searches for a stock and displays the result', async () => {
      render(<StockSearch />);
      
      const input = screen.getByPlaceholderText(/검색/i);
      fireEvent.change(input, { target: { value: 'TEST' } });

      const button = screen.getByRole('button', { name: /검색/i });
      fireEvent.click(button);

      // 'Test Stock' 텍스트가 화면에 나타날 때까지 기다립니다.
      await waitFor(() => {
        expect(screen.getByText('Test Stock')).toBeInTheDocument();
      });
    });
    ```

**✅ 해야 할 일**: 백엔드의 주요 API 로직과 프론트엔드의 핵심 컴포넌트들에 대한 테스트 코드를 작성하여 코드 커버리지를 높입니다.

---

### **결론**

이 워크플로우를 따르면, 명확한 역할 분담과 병렬적인 개발 진행이 가능해지며, 테스트를 통해 코드의 안정성을 확보할 수 있습니다. 프로젝트의 규모가 커질수록 이 구조적인 접근 방식의 이점은 더욱 커질 것입니다.
