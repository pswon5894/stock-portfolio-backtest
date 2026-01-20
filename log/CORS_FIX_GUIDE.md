# CORS (Cross-Origin Resource Sharing) 설정 수정 가이드

이 문서는 현재 프로젝트의 백엔드 서버(`server`)가 배포된 프론트엔드(`client`)로부터의 API 요청을 정상적으로 처리하기 위해 필요한 CORS 설정 변경 방법을 안내합니다.

---

### 1. 문제점: 왜 수정한 필요한가?

CORS는 웹 브라우저의 보안 정책으로, 한 출처(Origin)에서 실행 중인 웹 애플리케이션이 다른 출처의 리소스에 접근하는 것을 제한합니다. 여기서 출처는 프로토콜, 호스트(도메인), 포트 번호를 합친 것을 의미합니다.

*   **로컬 개발 환경 출처**: `http://localhost:3000` (프론트엔드)
*   **배포된 프론트엔드 출처(예시)**: `https://<YOUR_USERNAME>.github.io`
*   **배포된 백엔드 출처(예시)**: `https://your-project-name.onrender.com`

현재 `server/server.js` 파일의 CORS 설정은 오직 `http://localhost:3000`からのの 요청만 허용하도록 하드코딩되어 있습니다.

```javascript
// server/server.js의 현재 코드
const corsOptions = {
  origin: 'http://localhost:3000', // 👈 이 부분!
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions));
```

이 상태에서는 나중에 GitHub Pages로 배포된 프론트엔드(`https://...github.io`)가 백엔드 API를 호출하면, 백엔드 서버가 이 요청을 거부하게 되어 애플리케이션이 정상적으로 동작하지 않습니다.

---

### 2. 해결책: 허용된 출처 목록(Whitelist) 관리

해결책은 백엔드 서버의 CORS 설정에 **요청을 허용할 출처 목록(Whitelist)을 명시**하는 것입니다. 이 목록에는 로컬 개발 환경 주소와 배포된 프론트엔드 주소가 모두 포함되어야 합니다.

---

### 3. 코드 수정 제안

`server/server.js` 파일의 CORS 관련 코드를 아래와 같이 수정할 것을 제안합니다.

#### **AS-IS (현재 코드)**

```javascript
// Middleware
const corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions));
```

#### **TO-BE (변경 제안 코드)**

```javascript
// Middleware
// 허용할 출처 목록
const allowedOrigins = [
  'http://localhost:3000',
  'https://<YOUR_GITHUB_USERNAME>.github.io' // 👈 프론트엔드 배포 후 이 주소를 실제 주소로 꼭 변경해주세요.
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
*   `origin` 옵션에 함수를 제공하여, 들어오는 요청의 `origin`이 이 `allowedOrigins` 배열에 포함되어 있는지 동적으로 확인합니다.
*   이를 통해 로컬 환경과 배포 환경 모두에서 API 요청이 원활하게 이루어지도록 할 수 있습니다.

---

### 4. 다음 단계

나중에 프론트엔드를 배포하고 CORS 오류가 발생하면, 이 가이드를 참고하여 저에게 코드 수정을 요청해주세요.

그때 **본인의 GitHub Pages 주소(`https://<YOUR_GITHUB_USERNAME>.github.io`)**를 알려주시면, 위 제안대로 코드를 정확하게 수정해 드리겠습니다.
