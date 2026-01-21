1️⃣ Cloudflare Workers ⭐ 가장 추천 (콜드 슬립 없음)

결론:

👉 콜드 스타트가 사실상 없고, 무료 플랜도 실사용 가능

특징

❌ 콜드 슬립 없음 (Edge에서 항상 준비 상태)

✅ 글로벌 엣지 실행 (응답 매우 빠름)

✅ 무료 플랜 제공

❌ 일반적인 서버(Node 서버)와 구조가 다름

무료 플랜

요청: 하루 100,000건

CPU 시간: 충분 (일반 API 서버 OK)

HTTPS, 도메인 무료

기술 스택

JavaScript / TypeScript

Express 느낌 ❌ → Fetch 기반

DB:

Cloudflare D1 (SQLite)

KV / Durable Objects

외부 DB (Supabase, PlanetScale 등)

언제 좋나?

REST API

인증 서버

간단한 백엔드

사이드 프로젝트 / MVP

👉 “콜드 슬립 없는 무료 백엔드”의 최강자

2️⃣ Deno Deploy (거의 콜드 슬립 없음)
특징

❌ 체감 콜드 스타트 거의 없음

✅ 무료 플랜 있음

❌ DB는 외부 연동 필수

무료 플랜

요청 제한 있음 (개인/사이드 프로젝트 충분)

서버 항상 활성 상태에 가까움

기술 스택

TypeScript 친화적

Express와 유사한 Oak, Fresh 사용 가능

단점

생태계가 Node보다 작음

장기적으로 제한 걸릴 수 있음

3️⃣ Oracle Cloud Always Free VPS (진짜 서버)

결론:

👉 콜드 슬립 “완전 없음” + 리눅스 서버

무료 사양

VM 1~2대

ARM CPU (꽤 성능 좋음)

24GB RAM까지 가능

영구 무료

장점

Docker, Node, Spring, Go 뭐든 가능

진짜 서버 → 콜드 스타트 개념 자체 없음

단점 ⚠️

가입 난이도 높음 (카드 필요)

가끔 계정 정지 이슈

서버 직접 관리 필요

👉 백엔드 공부/운영용으로는 최고

4️⃣ Google Cloud e2-micro (무료 티어)
특징

VM 1대

항상 켜둘 수 있음

트래픽 적으면 무료 유지 가능

단점

성능 매우 낮음

설정 복잡

❌ 비추천 (콜드 슬립 있음)
플랫폼	이유
Render Free	15분 미접속 시 슬립
Railway	무료 플랜 사실상 종료
Fly.io Free	자동 머신 중단
Firebase Functions	콜드 스타트 있음
AWS Lambda	콜드 스타트 있음
🎯 상황별 추천 정리
✅ 최대한 무료 + 콜드 슬립 절대 싫음

👉 Cloudflare Workers

✅ Node/Express 그대로 쓰고 싶음

👉 Oracle Cloud Always Free

✅ TypeScript + 간단한 API

👉 Deno Deploy

원하면 다음도 바로 정리해줄 수 있어요 👇

Node.js 기준 Cloudflare Workers 구조 예제

Express → Workers 변환 방법

무료 DB 조합 추천

“프론트 + 백엔드” 완전 무료 스택

지금 쓰는 언어(Node/Spring 등) 알려주면 거기에 맞춰 딱 맞게 추천해줄게요 👍