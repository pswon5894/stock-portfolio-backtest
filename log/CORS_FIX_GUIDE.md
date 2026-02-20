# CORS (Cross-Origin Resource Sharing)

###  문제점: 왜 수정한 필요한가?

CORS는 웹 브라우저의 보안 정책으로, 한 출처(Origin)에서 실행 중인 웹 애플리케이션이 다른 출처의 리소스에 접근하는 것을 제한. 여기서 출처는 프로토콜, 호스트(도메인), 포트 번호를 합친 것을 의미

*   **로컬 개발 환경 출처**: `http://localhost:3000` (프론트엔드)
*   **배포된 프론트엔드 출처(예시)**: `stock-portfolio-backtest.vercel.app`
*   **배포된 백엔드 출처(예시)**: `https://your-project-name.onrender.com`

현재 `server/server.js` 파일의 CORS 설정은 오직 `http://localhost:3000`에서 요청만 허용 (하드코딩)

```js
// server/server.js의 현재 코드
const corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions));
```

배포된 프론트엔드(`stock-portfolio-backtest.vercel.app`)가 백엔드 API를 호출하면, 백엔드 서버가 요청을 거부, 웹이 동작 안함

---

### 해결책: 허용된 출처 목록(Whitelist) 관리

백엔드 서버의 CORS 설정에 **요청을 허용할 출처 목록(Whitelist)을 명시**. 이 목록에는 로컬 개발 환경 주소와 배포된 프론트엔드 주소가 모두 포함

---


#### 현재 코드

```javascript
// Middleware
const corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions));
```

#### 변경 코드

```javascript
// Middleware
// 허용할 출처 목록
const allowedOrigins = [
  'http://localhost:3000',
  'stock-portfolio-backtest.vercel.app'
];

const corsOptions = {
  origin: function (origin, callback) {
    // 요청 출처(origin)가 허용 목록에 있거나, origin이 없는 경우(예: Postman)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true); // 허용
    } else {
      callback(new Error('Not allowed by CORS')); // 거부
    }
  },
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

#### **변경점 설명**

*   `allowedOrigins`라는 배열을 만들어, 요청을 허용할 주소들을 모두 담습니다.
*   `origin` 옵션에 함수를 제공하여, 들어오는 요청의 `origin`이 이 `allowedOrigins` 배열에 포함되어 있는지 동적으로 확인
*   이를 통해 로컬 환경과 배포 환경 모두에서 API 요청이 원활하게 이루어지도록 할 수 있습니다.
