# 최종 오류 해결 가이드 (CORS 및 배포 문제)

이 문서는 현재 발생하고 있는 CORS(Cross-Origin Resource Sharing) 정책 오류와 이미지 404 오류의 원인을 진단하고, 해결을 위한 최종 점검 단계를 안내합니다.

---

### 1. 현재 상황 분석

먼저 현재 오류 메시지를 통해 알 수 있는 사실은 다음과 같습니다.

1.  **API 연결 주소 문제 해결 (성공)**
    -   `net::ERR_CONNECTION_REFUSED` 오류가 사라지고, API 요청이 올바른 서버 주소(`https://stock-portfolio-backtest.onrender.com/...`)로 향하고 있습니다. 이는 프론트엔드의 API 주소 설정 및 재배포가 성공적으로 이루어졌음을 의미합니다.

2.  **새로운 문제 발생: CORS 정책 오류**
    -   `Access to fetch at ... has been blocked by CORS policy` 라는 새로운 오류가 발생했습니다.
    -   **의미**: 프론트엔드(`https://pswon5894.github.io`)가 백엔드 서버에 API 요청을 보냈지만, 백엔드 서버가 "나는 이 출처(origin)를 알지 못하므로 요청을 허용할 수 없어"라고 응답하며 요청을 차단한 상황입니다.

---

### 2. 문제의 핵심 원인

**Render에 배포된 서버 코드가 최신 버전이 아닙니다.**

이전에 저희가 `server/server.js` 파일에서 `allowedOrigins` 배열에 `https://pswon5894.github.io`를 추가하여 CORS 요청을 허용하도록 코드를 수정했습니다. 하지만 현재 서버가 그 수정사항을 인지하지 못하고 있다는 것은, **해당 변경사항이 아직 Render 서버에 반영(배포)되지 않았음**을 의미합니다.

---

### 3. 해결을 위한 최종 점검 단계

아래 단계를 순서대로 실행하여 서버에 최신 코드를 배포하고 문제를 해결할 수 있습니다.

#### **단계 1: 서버 코드 변경사항 Git에 푸시**

로컬 컴퓨터에서 수정한 `server.js` 파일의 내용을 GitHub 저장소로 전송해야 Render가 변경사항을 감지할 수 있습니다.

-   프로젝트의 최상위 디렉터리(`stock-portfolio-backtest`)에서 아래의 Git 명령어들을 실행하여 코드를 푸시하세요.

    ```bash
    git add .
    git commit -m "Final fix for server CORS policy"
    git push
    ```

#### **단계 2: Render 서버 재배포 확인**

-   Git 푸시가 완료되면, Render 대시보드로 이동하여 백엔드 서비스 페이지를 확인합니다.
-   "Events" 또는 "Deploys" 탭에서 방금 푸시한 커밋 메시지("Final fix for server CORS policy")로 **새로운 배포가 자동으로 시작되었는지 확인**합니다.
-   배포가 진행되는 과정을 지켜보고, 최종적으로 상태가 **"Live"** 또는 **"Success"** 로 표시될 때까지 기다립니다. (몇 분 정도 소요될 수 있습니다.)

#### **단계 3: 최종 확인**

-   서버 배포가 성공적으로 완료된 것을 확인한 후, 다시 프론트엔드 페이지(`https://pswon5894.github.io/stock-portfolio-backtest/`)로 돌아옵니다.
-   **브라우저 캐시를 강력하게 새로고침(Ctrl+Shift+R 또는 Cmd+Shift+R)** 한 뒤, 백테스트 실행 등 API를 호출하는 기능을 다시 시도해봅니다.

---

### 4. 이미지(logo192.png) 404 오류에 대하여

이 문제 역시 프론트엔드의 빌드 또는 배포 과정이 최신 상태로 업데이트되지 않아 발생했을 가능성이 높습니다. 위의 CORS 문제가 해결된 후에도 이 문제가 지속된다면, 아래의 프론트엔드 재배포 명령을 다시 한번 실행해 보시는 것을 권장합니다.

```bash
# client 디렉터리에서 실행
npm run build
npm run deploy
```

가장 중요한 것은 **API 통신을 막고 있는 CORS 오류를 해결하는 것**이므로, 우선 서버 재배포에 집중해주시기 바랍니다.
