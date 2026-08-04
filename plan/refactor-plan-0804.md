# TA Portfolio Platform

> Version : v1.0
> Framework : Astro
> Goal : Single Source Portfolio

---

# 1. 프로젝트 목적

이 프로젝트는 단순한 포트폴리오 웹사이트를 만드는 것이 아니다.

하나의 콘텐츠를 작성하면

- Website
- PDF Portfolio

를 동시에 생성할 수 있는 Portfolio Platform을 구축하는 것이 목적이다.

콘텐츠를 여러 곳에서 중복 관리하지 않고 하나의 Source만 유지하는 것을 목표로 한다.

---

# 2. 목표

## Primary Goal

- TA 포트폴리오 제작
- 프로젝트 문서 관리
- PDF 자동 생성 기반 마련
- 유지보수 가능한 구조 설계

## Secondary Goal

- Astro 학습
- Component 기반 개발 경험
- Static Site Generator 이해
- Build Pipeline 이해

---

# 3. 설계 원칙

## Single Source of Truth

모든 프로젝트 정보는 하나의 Markdown에서 관리한다.

```text
Project.md

↓

Website

↓

PDF
```

동일한 데이터를 여러 곳에서 수정하지 않는다.

---

## Content First

디자인보다 콘텐츠를 우선한다.

컴포넌트는 콘텐츠를 표현하기 위한 역할만 수행한다.

---

## Component Driven

페이지를 만드는 것이 아니라

재사용 가능한 Component를 만든다.

예시

- Header
- Footer
- Section
- ProjectCard
- Gallery
- Badge
- Timeline

---

## Static First

동적인 기능보다

정적 페이지를 우선한다.

Database는 사용하지 않는다.

---

## Maintainability

새로운 프로젝트는

Markdown 파일 하나만 추가하면

자동으로 페이지가 생성되어야 한다.

---

# 4. 디렉토리 구조

```text
src/

├── components/
│
├── content/
│   ├── projects/
│   ├── blog/
│   └── pages/
│
├── layouts/
│
├── pages/
│
├── styles/
│
├── lib/
│
└── types/

public/

scripts/
```

---

# 5. 폴더 역할

## components/

재사용 가능한 UI

예시

- Header
- Footer
- Navigation
- ProjectCard
- MarkdownRenderer
- ImageGallery

---

## content/

실제 데이터

웹사이트의 핵심

Markdown만 관리한다.

```text
projects/

shader-study.md

glsl-water.md

unreal-lighting.md
```

---

## layouts/

공통 레이아웃

- BaseLayout
- ProjectLayout
- PrintLayout

---

## pages/

라우팅

예시

```text
/

about

projects

blog

contact

print
```

---

## styles/

CSS 관리

```text
global.css

theme.css

print.css
```

print.css는 PDF 생성을 위한 스타일이다.

---

## lib/

유틸 함수

예시

- formatDate()
- sortProjects()
- getProjectTags()

---

## scripts/

빌드 관련

향후

- PDF Export
- Sitemap
- Search Index

등을 추가한다.

---

# 6. 콘텐츠 구조

모든 프로젝트는 동일한 구조를 가진다.

```text
Overview

↓

Problem

↓

Research

↓

Implementation

↓

Result

↓

Reflection
```

모든 프로젝트가 동일한 구조를 유지하도록 한다.

---

# 7. 개발 순서

Phase 1

프로젝트 구조 정리

↓

Base Layout 작성

↓

Navigation 작성

---

Phase 2

Content Collection 구축

↓

Markdown Parsing

↓

Project List 자동 생성

---

Phase 3

Project Detail

↓

Tag

↓

Gallery

↓

Markdown Component

---

Phase 4

About

↓

Home

↓

Contact

---

Phase 5

Print CSS

↓

Print Layout

↓

PDF Export

---

# 8. 향후 확장

현재 범위에는 포함하지 않는다.

후보 기능

- Blog
- Search
- Dark Mode
- RSS
- i18n
- GitHub 연동
- 자동 PDF Export
- GitHub Actions

필요할 때만 추가한다.

---

# 9. 제외 대상

현재 구현하지 않는다.

- 로그인
- CMS
- Database
- 관리자 페이지
- 댓글
- 방문자 통계
- SEO 최적화
- 복잡한 애니메이션

---

# 10. 최종 목표

Markdown 하나만 작성하면

```text
Markdown

↓

Astro

↓

Website

↓

Print Layout

↓

PDF
```

가 자동으로 생성되는 Portfolio Platform을 구축한다.

웹사이트는 결과물이며,

핵심은 콘텐츠 관리와 재사용 가능한 구조를 만드는 것이다.