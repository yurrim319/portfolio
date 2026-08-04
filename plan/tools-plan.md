# Portfolio Author

> Version : v1.0
> Status : Planning
> Target : Astro Portfolio Platform

---

# 1. 프로젝트 소개

Portfolio Author는 Astro 기반 Portfolio Platform을 위한 콘텐츠 저작(Authoring) 도구이다.

Markdown을 직접 편집하는 대신 GUI를 이용하여 프로젝트 문서를 작성하고, 이미지를 관리하며, 콘텐츠를 일관된 형식으로 생성하는 것을 목표로 한다.

Portfolio Author는 CMS가 아니다.

콘텐츠를 저장하거나 서비스하는 시스템이 아니라 Markdown 파일을 생성하고 관리하는 생산성 도구이다.

---

# 2. 프로젝트 목표

## Primary Goal

- Markdown 작성 생산성 향상
- 프로젝트 구조 표준화
- 이미지 관리 자동화
- 콘텐츠 작성 시간 단축
- Live Preview 제공

## Secondary Goal

- Astro 콘텐츠 파이프라인 지원
- PDF Export를 고려한 콘텐츠 작성
- Markdown 문법 학습 부담 감소

---

# 3. 설계 철학

## Markdown First

Markdown이 항상 원본(Source)이다.

Portfolio Author는 Markdown을 생성하고 수정하는 도구일 뿐이다.

```text
Portfolio Author

↓

Markdown

↓

Astro

↓

Website

↓

PDF
```

---

## Authoring Tool

Portfolio Author는 콘텐츠를 작성하는 도구이다.

콘텐츠 저장소나 CMS 역할은 수행하지 않는다.

모든 파일은 프로젝트 내부에서 관리된다.

---

## Component Based Writing

문서를 작성하는 것이 아니라

Component를 조립하는 방식으로 콘텐츠를 생성한다.

예시

- Image
- Gallery
- Code Block
- Timeline
- Note
- Callout
- Video

---

## Automation First

반복 작업은 가능한 한 자동화한다.

예시

- Frontmatter 생성
- 이미지 복사
- 이미지 이름 변경
- Markdown 생성
- Template 생성

---

## Non Destructive

사용자가 작성한 Markdown을 임의로 수정하지 않는다.

자동 생성 기능 외에는 항상 사용자가 직접 편집할 수 있어야 한다.

---

# 4. 전체 구조

```text
Portfolio Author

├── File Explorer
├── Markdown Editor
├── Live Preview
├── Frontmatter Editor
├── Component Library
├── Asset Manager
└── Template Manager
```

---

# 5. 시스템 구조

```text
Portfolio Author

        │

        ▼

Template Generator

        │

        ▼

Frontmatter Generator

        │

        ▼

Markdown Editor

        │

        ▼

Asset Manager

        │

        ▼

Live Preview

        │

        ▼

Save

        │

        ▼

Astro Website
```

---

# 6. 주요 기능

## File Explorer

Markdown 파일 관리

기능

- 프로젝트 목록
- 파일 생성
- 파일 삭제
- 파일 열기

---

## Markdown Editor

기본 텍스트 편집기

기능

- Syntax Highlight
- Auto Save
- Undo / Redo
- Line Number

---

## Live Preview

Markdown을 실시간으로 렌더링한다.

목표는 Astro에서 출력되는 화면과 최대한 동일한 Preview를 제공하는 것이다.

---

## Frontmatter Editor

GUI 기반 Metadata 작성

입력 항목

- Title
- Summary
- Thumbnail
- Tags
- Date
- Order

자동 생성

```yaml
---
title:
summary:
thumbnail:
tags:
date:
order:
---
```

---

## Component Library

Markdown Component를 버튼으로 삽입한다.

예시

- Image
- Gallery
- Code Block
- Video
- Table
- Timeline
- Warning
- Note
- Quote
- Before / After

Markdown 문법을 외울 필요 없이 Component를 선택하여 작성한다.

---

## Asset Manager

이미지 관리 기능

기능

- Drag & Drop
- Import
- Rename
- Preview
- Delete

이미지 Import 과정

```text
Select Image

↓

Copy

↓

public/images/project-name/

↓

Rename

↓

Markdown Insert
```

자동 생성

```md
![Image](/images/project/image01.png)
```

---

## Template Manager

프로젝트 유형에 맞는 기본 문서를 생성한다.

예시

Project Template

```text
Overview

Problem

Research

Implementation

Result

Reflection
```

Blog Template

```text
Summary

Content

Conclusion
```

---

# 7. 디렉토리 구조

```text
tools/

portfolio-author/

├── components/
├── pages/
├── lib/
├── templates/
├── preview/
├── assets/
└── types/
```

---

# 8. 개발 단계

## Phase 1

기본 Editor

- File Explorer
- Markdown Editor
- Save

---

## Phase 2

Live Preview

- Markdown Render
- Auto Refresh

---

## Phase 3

Frontmatter Editor

- Metadata GUI
- Frontmatter 자동 생성

---

## Phase 4

Asset Manager

- Drag & Drop
- Import
- Rename
- Markdown 자동 삽입

---

## Phase 5

Template Manager

- Project Template
- Blog Template
- Research Note Template

---

## Phase 6

Component Library

- Image
- Gallery
- Timeline
- Code Block
- Note
- Comparison

---

# 9. 향후 확장

후보 기능

- PDF Preview
- Mermaid Editor
- Diagram Builder
- Tag Manager
- Image Compression
- Thumbnail Generator
- Keyboard Shortcut
- Git Commit Helper

필요한 경우에만 추가한다.

---

# 10. 구현하지 않는 기능

현재 범위에서 제외

- CMS
- Database
- 로그인
- 사용자 관리
- Cloud Sync
- 협업 기능
- 댓글
- 온라인 Editor
- 버전 관리 시스템

---

# 11. 최종 목표

Portfolio Author는 콘텐츠를 한 번만 작성하면 다양한 출력 형태로 재사용할 수 있는 Authoring Tool을 목표로 한다.

```text
Portfolio Author

↓

Markdown

↓

Astro

├── Website
└── PDF
```

콘텐츠는 한 곳에서 관리하고,

웹사이트와 PDF는 동일한 콘텐츠를 기반으로 생성된다.

Portfolio Author의 목적은 웹사이트를 만드는 것이 아니라, 지속적으로 관리 가능한 포트폴리오 콘텐츠를 빠르고 일관성 있게 작성하는 환경을 제공하는 것이다.