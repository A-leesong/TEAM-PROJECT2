# EgAg (이그에그)

> AI와 사용자가 1획씩 번갈아 그림을 완성하는 협업 드로잉 서비스

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프론트엔드 | React 19 + Vite + TypeScript |
| 캔버스 | Konva.js + react-konva |
| 차트 | Recharts |
| 아이콘 | Lucide React |
| 백엔드 | Spring Boot 3.4.3 + Java |
| 빌드 | Gradle (Groovy DSL) |
| DB | MySQL 8 + JPA/Hibernate |
| AI | LangChain4j + GPT-4o Vision |
| 인증 | Spring Security + JWT + Kakao OAuth2 |
| 결제 | 포트원 (PortOne) |
| 상태관리 | Zustand |
| HTTP 클라이언트 | Axios |

---

## 빠른 시작

```bash
# 1. 클론
git clone <레포지토리 URL>
cd egag

# 2. 백엔드 실행
./gradlew bootRun

# 3. 프론트엔드 실행
cd frontend
npm install
npm run dev
```

- 백엔드: `http://localhost:8080`
- 프론트엔드: `http://localhost:5173`

> 자세한 셋업은 `docs/개발환경_셋업.md` 참고

---

## 팀원

| 담당 | 이름 | 역할 |
|------|------|------|
| **A** | 규원 | 캔버스 · AI Agent |
| **B** | 송아 | 인증 · 결제 |
| **C** | 상준 | 소셜 · 탐색 |
| **D** | 진희 | 공통 · 관리자 |

---

## 문서

- `docs/개발환경_셋업.md` — 로컬 환경 구성 가이드
- `docs/프로젝트_설계서.md` — 전체 설계 (API, DB, 페이지 구조)
- `docs/구현_현황.md` — 구현 완료 현황
- `docs/협업_규칙.md` — Git 브랜치 · 커밋 · 협업 규칙
