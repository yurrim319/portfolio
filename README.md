# yurim · portfolio

Astro 기반 TA(Technical Artist) 포트폴리오. Markdown 하나로 작성한 프로젝트가 웹사이트와 인쇄용(PDF) 페이지로 동시에 생성되는 것을 목표로 한다. 설계 원칙과 로드맵은 [plan/refactor-plan-0804.md](plan/refactor-plan-0804.md) 참고.

## 프로젝트 구조

```text
src/
├── components/     Header, Footer, ProjectCard, LutCubeViewer 등 재사용 UI
├── content/
│   ├── projects/   프로젝트 글(.mdx) — 여기에 파일 하나 추가하면 홈/상세 페이지 자동 생성
│   └── pages/       About 같은 단일 콘텐츠 페이지(.md)
├── layouts/        SiteLayout(공통 nav/footer), ProjectLayout, PrintLayout
├── pages/           라우팅 (/, /about, /contact, /print, /projects/[slug])
├── styles/          global.css, theme.css(색상/폰트 변수), print.css, mdx-content.css
├── lib/             getSortedProjects() 등 콘텐츠 유틸
└── types/           Project 등 공유 타입
```

새 프로젝트 글 추가 방법과 스타일 수정 위치는 [docs/project-structure.md](docs/project-structure.md)에 정리되어 있다.

## 개발 명령어

| Command           | Action                              |
| :----------------- | :----------------------------------- |
| `npm install`       | 의존성 설치                          |
| `npm run dev`       | `localhost:4321` 로컬 개발 서버 실행 |
| `npm run build`     | `./dist/` 로 정적 빌드                |
| `npm run preview`   | 빌드 결과 로컬 미리보기               |

## PDF / 인쇄

`/print` 라우트가 모든 프로젝트를 인쇄용 레이아웃으로 이어붙여 렌더링한다. 브라우저 인쇄(Ctrl/Cmd+P) → PDF로 저장하면 된다.

## 콘텐츠 저작 도구 (Portfolio Author)

`src/content/projects`, `src/content/pages`의 글을 GUI로 열람·생성·편집·삭제할 수 있는 로컬 도구. 사이트 배포와는 무관하며 로컬에서만 사용한다. 설계는 [plan/tools-plan.md](plan/tools-plan.md) 참고 (현재는 Phase 1: 파일 탐색기 + 마크다운 에디터 + 저장까지만 구현됨).

```bash
cd tools/portfolio-author
npm install
npm run dev
```
(루트에서 `npm run author`로도 실행 가능)
