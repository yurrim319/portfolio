# 프로젝트 구조 및 콘텐츠 편집 가이드

## 폴더 구조

```
portfolio/
├── docs/                          ← 프로젝트 문서 (이 폴더)
├── plan/                          ← 아키텍처 계획서
│
├── src/
│   ├── content.config.ts          ← 컬렉션 스키마 정의 (projects, pages)
│   ├── content/
│   │   ├── projects/
│   │   │   └── *.mdx              ← 프로젝트 글 (여기서 편집)
│   │   └── pages/
│   │       └── about.md           ← About 페이지 본문
│   │
│   ├── components/
│   │   ├── Header.astro           ← 공통 nav
│   │   ├── Footer.astro           ← 공통 footer (print 링크 포함)
│   │   ├── ProjectCard.astro      ← 홈 목록의 프로젝트 카드
│   │   └── LutCubeViewer.astro    ← 인터랙티브 3D 뷰어
│   │
│   ├── layouts/
│   │   ├── Base.astro             ← HTML 기본 껍데기 (head, fonts)
│   │   ├── SiteLayout.astro       ← Base + Header/Footer + .site 래퍼 (홈/about/contact/글 공통)
│   │   ├── ProjectLayout.astro    ← 글 상세 페이지 레이아웃(article-header, mdx-content)
│   │   └── PrintLayout.astro      ← nav/footer 없는 인쇄 전용 셸
│   │
│   ├── pages/
│   │   ├── index.astro            ← 홈 (hero + 프로젝트 목록)
│   │   ├── about.astro
│   │   ├── contact.astro
│   │   ├── print.astro            ← 전체 프로젝트 인쇄용 페이지
│   │   └── projects/
│   │       └── [slug].astro       ← 글 상세 라우팅
│   │
│   ├── styles/
│   │   ├── theme.css              ← 색상/폰트 CSS 변수
│   │   ├── global.css             ← 전역 스타일 (theme.css import)
│   │   ├── mdx-content.css        ← MDX 본문(h2/p/table/code 등) 공통 스타일
│   │   └── print.css              ← /print 전용 스타일
│   │
│   ├── lib/
│   │   ├── projects.ts            ← getVisibleProjects(), getSortedProjects()
│   │   └── site.ts                ← SITE 상수 (email 등)
│   │
│   └── types/
│       └── project.ts             ← Project, Chip 타입
│
└── public/                        ← 정적 파일 (이미지, 폰트 등)
```

---

## 글 추가하는 법

### 1. MDX 파일 생성

`src/content/projects/` 안에 파일 이름이 곧 URL이 됩니다.

```
src/content/projects/my-new-post.mdx
→ /projects/my-new-post
```

파일을 추가하기만 하면 홈 목록과 상세 페이지가 자동으로 생성됩니다. `ProjectCard`나 라우팅 코드를 건드릴 필요는 없습니다.

### 2. Frontmatter 작성

```yaml
---
title: "글 제목"
subtitle: "글 부제목 또는 한 줄 설명"       # 홈 카드 설명 + 상세 페이지 부제로 그대로 사용됨
type: "카테고리 · 분류"       # 예: renderer · material study
date: "2026.06"
thumbnail: "lut-strip"        # 선택. 등록된 프리셋(ProjectCard.astro 참고), 없으면 기본 썸네일
draft: true                   # 선택. true면 홈 목록/라우팅에서 완전히 제외됨(작성 중인 글)
chips:
  - { label: "UE5",    highlight: true }   # highlight: true → 강조 chip
  - { label: "HLSL" }                      # highlight 없으면 일반 chip
---
```

### 3. 본문 작성

기존과 동일 (일반 마크다운, 코드블록, 표, 리스트, `<LutCubeViewer />` 삽입 등).

---

## About 페이지 수정

`src/content/pages/about.md`를 직접 수정하면 됩니다. `title`/`description` frontmatter + 마크다운 본문.

## Contact 정보 수정

`src/lib/site.ts`의 `SITE.email` 값을 바꾸면 Contact 페이지와 Footer 등에 자동 반영됩니다.

---

## 스타일 수정

| 수정 대상 | 파일 |
|---|---|
| 색상/폰트 토큰 | `src/styles/theme.css` |
| nav, hero, 카드, chip, note-box 등 공통 | `src/styles/global.css` |
| 글 본문 (h2, p, code, table 등) — 웹/인쇄 공통 | `src/styles/mdx-content.css` |
| `/print` 페이지 전용 스타일 | `src/styles/print.css` |
| 3D 뷰어 레이아웃·색상·로직 | `src/components/LutCubeViewer.astro` |

---

## 인쇄 / PDF

`/print` 라우트가 draft가 아닌 모든 프로젝트를 페이지 나눔과 함께 이어붙여 렌더링합니다. 인터랙티브 3D 뷰어처럼 인쇄에 의미 없는 요소는 `print.css`에서 숨겨집니다. 브라우저 인쇄(Ctrl/Cmd+P) → "PDF로 저장"으로 내보내면 됩니다.

---

## 개발 서버

```bash
npm run dev
```

`http://localhost:4321/portfolio` 에서 확인.
