# 프로젝트 구조 및 콘텐츠 편집 가이드

## 폴더 구조

```
portfolio/
├── docs/                          ← 프로젝트 문서 (이 폴더)
│
├── src/
│   ├── content.config.ts          ← 컬렉션 스키마 정의
│   ├── content/
│   │   └── works/
│   │       └── *.mdx              ← 글 파일 (여기서 편집)
│   │
│   ├── components/
│   │   └── LutCubeViewer.astro    ← 인터랙티브 3D 뷰어
│   │
│   ├── layouts/
│   │   └── Base.astro             ← HTML 기본 껍데기 (head, fonts)
│   │
│   ├── pages/
│   │   ├── index.astro            ← 메인 works 목록
│   │   └── works/
│   │       └── [slug].astro       ← 글 레이아웃 (스타일, nav, header)
│   │
│   └── styles/
│       └── global.css             ← 전역 스타일
│
└── public/                        ← 정적 파일 (이미지, 폰트 등)
```

---

## 글 추가하는 법

### 1. MDX 파일 생성

`src/content/works/` 안에 파일 이름이 곧 URL이 됩니다.

```
src/content/works/my-new-post.mdx
→ /works/my-new-post
```

### 2. Frontmatter 작성

파일 맨 위에 `---`로 감싼 메타데이터를 작성하세요.

```yaml
---
title: "글 제목"
subtitle: "글 부제목 또는 한 줄 설명"
type: "카테고리 · 분류"       # 예: renderer · material study
date: "2026.06"
chips:
  - { label: "UE5",    highlight: true }   # highlight: true → 강조 chip
  - { label: "HLSL" }                      # highlight 없으면 일반 chip
---
```

### 3. 본문 작성

Frontmatter 아래부터 일반 마크다운으로 작성하세요.

```md
## 섹션 제목

일반 텍스트. **굵게**, `인라인 코드`.

---    ← 수평선 (섹션 구분)

## 다음 섹션

코드 블록:

\```hlsl
float3 color = SceneColor.rgb;
\```

표:

| 항목 | 설명 |
|---|---|
| 값1 | 설명1 |

- 리스트 항목
- 리스트 항목
```

---

## 인터랙티브 컴포넌트 삽입

### LutCubeViewer

MDX 파일 상단(Frontmatter 바로 아래)에 import를 추가하고, 본문 원하는 위치에 태그를 넣으세요.

```mdx
---
title: "..."
---

import LutCubeViewer from '../../components/LutCubeViewer.astro';

## 섹션 제목

설명 텍스트...

<LutCubeViewer show="all" />    ← 3섹션 전체

또는 섹션별로:

<LutCubeViewer show="cube" />    ← 01. RGB Cube만
<LutCubeViewer show="slice" />   ← 02. B축 슬라이싱만
<LutCubeViewer show="compare" /> ← 03. 보간 비교만
```

---

## 스타일 수정

| 수정 대상 | 파일 |
|---|---|
| 글 본문 (h2, p, code, table 등) | `src/pages/works/[slug].astro` — `<style>` 블록 |
| nav, header, chip, note-box 등 공통 | `src/styles/global.css` |
| 3D 뷰어 레이아웃·색상 | `src/components/LutCubeViewer.astro` — `<style>` 블록 |
| 3D 뷰어 렌더링 로직 | `src/components/LutCubeViewer.astro` — `<script>` 블록 |

---

## 개발 서버

```bash
npm run dev
```

`http://localhost:4321/portfolio` 에서 확인.
