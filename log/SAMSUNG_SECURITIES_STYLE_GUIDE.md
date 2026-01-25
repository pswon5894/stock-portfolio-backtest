# 삼성증권 스타일 CSS 가이드

이 문서는 기존 애플리케이션의 CSS를 삼성증권의 브랜드 아이덴티티에 맞게 변경하는 가이드를 제공합니다. 제공해주신 색상 팔레트를 기반으로 주요 CSS 파일(`index.css`, `App.css`)의 변경 사항을 안내합니다.

## 1. 색상 팔레트 (Color Palette)

먼저, 삼성증권 스타일에 사용할 색상 변수를 CSS 최상단에 정의합니다. 이 변수들은 전체 애플리케이션의 일관된 색상 사용을 보장합니다.

```css
:root {
  --primary-blue: #0047AB;      /* 삼성 블루 */
  --secondary-blue: #0066CC;    /* 라이트 블루 */
  --dark-blue: #002E6E;         /* 다크 블루 */
  --light-blue: #E6F2FF;        /* 배경 블루 */
  --accent-blue: #00A3FF;       /* 강조 블루 */
  
  --text-primary: #1A1A1A;      /* 주요 텍스트 */
  --text-secondary: #666666;    /* 보조 텍스트 */
  --text-white: #FFFFFF;        /* 흰색 텍스트 */
  
  --success: #00A651;           /* 상승 (녹색) */
  --danger: #E8453C;            /* 하락 (빨강) */
  --warning: #FF9900;           /* 경고 (주황) */
  
  --border-color: #D6D6D6;      /* 테두리 */
  --bg-gray: #F5F7FA;           /* 배경 회색 */
  --bg-white: #FFFFFF;          /* 배경 흰색 */
}
```

---

## 2. `index.css` 변경

기본적인 글꼴과 전역 스타일을 설정합니다. 가독성을 높이기 위해 'Noto Sans KR'와 같은 현대적인 웹 폰트를 사용하는 것을 권장합니다.

**변경 전 (`client/src/index.css`)**
```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}
```

**변경 후 (`client/src/index.css`)**
```css
/* Google Fonts에서 Noto Sans KR 임포트 */
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap');

:root {
  --primary-blue: #0047AB;
  --secondary-blue: #0066CC;
  --dark-blue: #002E6E;
  --light-blue: #E6F2FF;
  --accent-blue: #00A3FF;
  --text-primary: #1A1A1A;
  --text-secondary: #666666;
  --text-white: #FFFFFF;
  --success: #00A651;
  --danger: #E8453C;
  --warning: #FF9900;
  --border-color: #D6D6D6;
  --bg-gray: #F5F7FA;
  --bg-white: #FFFFFF;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: var(--bg-gray);
  color: var(--text-primary);
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace;
}
```

---

## 3. `App.css` 변경

애플리케이션의 주요 컴포넌트 스타일을 삼성증권 테마에 맞게 대대적으로 수정합니다.

**변경 전 (`client/src/App.css`)**
> 기존 `App.css`의 내용은 길어서 생략합니다. 주요 변경 포인트를 아래에서 설명합니다.

**변경 후 (`client/src/App.css`)**

기존 `App.css` 파일의 내용을 아래 코드로 교체하거나, 각 클래스에 해당하는 스타일을 업데이트하세요.

```css
/* 기본 레이아웃 및 배경 */
.App {
  min-height: 100vh;
  background-color: var(--bg-gray);
}

/* Header */
.App-header {
  background-color: var(--primary-blue);
  padding: 20px;
  text-align: center;
  color: var(--text-white);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.App-header h1 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
}

/* 컨테이너 및 카드 */
.container {
  max-width: 960px;
  margin: 30px auto;
  padding: 0 20px;
}

.card {
  background: var(--bg-white);
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--border-color);
}

.card h2 {
  color: var(--dark-blue);
  margin-bottom: 25px;
  font-size: 1.5rem;
  border-bottom: 2px solid var(--primary-blue);
  padding-bottom: 10px;
}

/* 폼 요소 */
.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--text-primary);
}

.input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 1rem;
  font-family: 'Noto Sans KR', sans-serif;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input:focus {
  outline: none;
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 3px rgba(0, 71, 171, 0.15);
}

/* 버튼 */
.button {
  padding: 12px 25px;
  background-color: var(--primary-blue);
  color: var(--text-white);
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.2s;
  width: auto; /* Full-width 해제 */
}

.button:hover {
  background-color: var(--dark-blue);
  transform: translateY(-1px);
}

.button:disabled {
  background-color: #a0b3c4;
  cursor: not-allowed;
  transform: none;
}

.button.secondary {
  background-color: var(--text-secondary);
  color: var(--text-white);
}

.button.secondary:hover {
  background-color: #555;
}

.button-group {
  display: flex;
  gap: 15px;
  margin-top: 30px;
  justify-content: flex-end; /* 오른쪽 정렬 */
}

/* 주식 검색 및 선택 */
.search-results {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  margin-top: 5px;
}

.stock-item {
  padding: 10px 15px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.stock-item:hover {
  background-color: var(--light-blue);
}

.stock-item strong {
  color: var(--primary-blue);
  margin-right: 8px;
}

/* 보유 종목 */
.selected-stocks h3 {
  color: var(--dark-blue);
  margin-bottom: 15px;
  font-size: 1.2rem;
}

.weight-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: var(--bg-gray);
  border-radius: 4px;
  margin-bottom: 10px;
}

.remove-btn {
  padding: 5px 10px;
  background: var(--danger);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.remove-btn:hover {
  background: #c82333;
}


/* 결과 및 메트릭 */
.metric-value.positive {
  color: var(--success);
}

.metric-value.negative {
  color: var(--danger);
}

.total-weight.valid {
  background-color: #e6f6ec;
  color: var(--success);
  border: 1px solid var(--success);
}

.total-weight.invalid {
  background-color: #fbe9e8;
  color: var(--danger);
  border: 1px solid var(--danger);
}

/* 기타 기존 스타일은 유지하거나 위 스타일에 맞게 조정합니다. */
/* 예: .loading-overlay, .spinner 등 */

/* 아래는 기존 App.css의 스타일 중 일부를 새 테마에 맞게 조정한 것입니다. */
/* 필요에 따라 기존 CSS와 병합하거나 수정하여 사용하세요. */

.spinner {
  border-top-color: var(--primary-blue);
}

.holdings-summary h3, .result-header h3, .summary h3 {
  color: var(--primary-blue);
}

.weight-badge {
  background: var(--secondary-blue);
}

```

---
## 4. `PortfolioBuilder.jsx` 인라인 스타일 제거

`PortfolioBuilder.jsx` 파일 내부에 여러 인라인 스타일이 존재합니다. 유지보수성과 일관성을 위해 이들을 `App.css`의 클래스로 옮기는 것을 권장합니다.

**예시:**
`PortfolioBuilder.jsx`의 `updateWeight` 함수 내 `input` 태그의 인라인 스타일:
```jsx
<input
  type="number"
  value={holding.weight}
  onChange={(e) => updateWeight(index, e.target.value)}
  style={{ width: '80px', padding: '8px', border: '2px solid #e0e0e0', borderRadius: '5px', textAlign: 'right', fontSize: '1rem' }}
  placeholder="비중"
  step="0.1"
/>
```

이 인라인 스타일을 `App.css`에 새로운 클래스로 추가합니다.

**`App.css`에 추가할 클래스**
```css
.weight-input input {
  width: 80px;
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  text-align: right;
  font-size: 1rem;
}
```

**`PortfolioBuilder.jsx` 수정**
이제 `style` 속성을 `className`으로 교체합니다.

```jsx
<input
  type="number"
  value={holding.weight}
  onChange={(e) => updateWeight(index, e.target.value)}
  className="input weight-input-field" /* 예시 클래스명 */
  placeholder="비중"
  step="0.1"
/>
```
*Note: 위 예시에서 `weight-input-field`는 `App.css`에 정의한 새로운 클래스를 의미합니다. 기존의 `input` 클래스와 함께 사용하여 기본 스타일을 상속받고, 추가적인 스타일을 적용할 수 있습니다.*

---

## 5. 적용 방법

1.  **`client/src/index.css`** 파일의 내용을 위의 "변경 후" 코드로 교체합니다.
2.  **`client/src/App.css`** 파일의 내용을 위의 "변경 후" 코드로 교체하거나, 기존 코드와 비교하여 선택적으로 업데이트합니다. 전체를 교체하는 것이 테마 일관성을 위해 더 좋습니다.
3.  애플리케이션을 다시 시작하여 변경된 스타일을 확인합니다.

이 가이드를 통해 애플리케이션에 보다 전문적이고 일관된 삼성증권의 느낌을 적용할 수 있습니다.