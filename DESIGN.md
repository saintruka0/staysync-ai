---
name: StaySync AI
description: Modern boutique hospitality operations and guest care design system
colors:
  bg-base: "#090d16"
  bg-surface: "#0f172a"
  bg-elevated: "#1e293b"
  border-subtle: "#334155"
  text-primary: "#f8fafc"
  text-muted: "#94a3b8"
  accent-primary: "#2563eb"
  accent-gold: "#d97706"
  status-available: "#10b981"
  status-occupied: "#3b82f6"
  status-cleaning: "#f59e0b"
  status-inspected: "#8b5cf6"
  status-urgent: "#f43f5e"
typography:
  display:
    fontFamily: "Pretendard, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "1.5rem"
    fontWeight: 800
    lineHeight: 1.2
  body:
    fontFamily: "Pretendard, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  caption:
    fontFamily: "Pretendard, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 500
    lineHeight: 1.4
  nano:
    fontFamily: "Pretendard, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "0.625rem"
    fontWeight: 600
    lineHeight: 1.2
rounded:
  sm: "6px"
  md: "12px"
  lg: "16px"
  full: "9999px"
---

# Design System

<!-- impeccable:design-schema 1 -->

## Overview

StaySync AI의 시각 언어는 **정밀한 부티크 호스피탈리티(Precision Hospitality)**를 지향합니다.
인공지능 도구에서 흔히 남용되는 보라색-남색 네온 그라디언트와 어두운 배경 위의 사이언 남발(AI Slop)을 배제하고, 차분한 옵시디언 나이트 배경 위에 묵직한 코발트와 웜 브라스(골드/앰버)를 액센트로 배치하여 호텔 프론트 카운터에 어울리는 절제된 품격을 전달합니다.

## Colors

- **배경 (Canvas & Surface)**:
  - Base: `#090d16` (깊이감 있는 딥 옵시디언)
  - Surface: `#0f172a` (패널 및 카드 배경)
  - Elevated: `#1e293b` (팝업 모달, 입력창, 호버 상태)
- **객실 상태별 시맨틱 컬러 (Room Semantics)**:
  - `available` (입실가능): 소프트 에메랄드 (`#10b981`)
  - `occupied` (재실중): 스틸 블루 (`#3b82f6`)
  - `cleaning` (청소중): 웜 앰버 (`#f59e0b`)
  - `inspected` (점검완료): 아이리스 세이지 (`#8b5cf6`)
  - `urgent` (긴급요청/소음민원): 크림슨 코럴 (`#f43f5e`)

## Typography

- 기본 서체: `Pretendard`, 시스템 폰트 (`-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`)
- 가독성 원칙: 호실 번호(Room Numbers)와 핵심 지표(점유율, 가격)는 `font-black`(Weight 900)과 타이트한 트래킹을 주어 한눈에 판독되도록 합니다.

## Layout

- 프론트 대시보드는 12컬럼 그리드 기반(좌측 7~8열: 객실 매트릭스 & 청소 점검, 우측 4~5열: 실시간 문의 피드 & 예약 싱크).
- 게스트 모바일 화면은 420px max-width 뷰포트로 스마트폰 원핸드 터치에 최적화.

## Elevation & Depth

- 불필요한 번쩍이는 네온 글로우(Glow)를 지양하고, 미세한 경계선(`border-slate-800`)과 절제된 섀도우(`shadow-xl shadow-black/40`)로 카드 간 계층을 분리합니다.

## Shapes

- 모바일 카드 및 팝업: `rounded-2xl` (16px)로 부드러운 라운딩 적용.
- 상태 뱃지 및 액션 칩: `rounded-full` (필 형태)로 시선 분산 방지.

## Components

- **Room Card**: 호실 번호, 상태 뱃지, 투숙객 이름/플랫폼, 특이사항 뱃지가 일관되게 정렬된 컴팩트 카드.
- **Inquiry Ticket**: 고객 원문, Dify 추천 답변, 원클릭 전송 액션이 결합된 카드.
- **Dify Assistant Widget**: 코발트와 골드 포인트로 마감된 단정한 플로팅 위젯.

## Do's and Don'ts

- **Do**:
  - 버튼과 뱃지 텍스트는 명도 대비 4.5:1 이상의 선명한 화이트 또는 블랙을 사용합니다.
  - 모션은 부드러운 감속(`ease-out`, `transition-all duration-200`)을 사용합니다.
- **Don't**:
  - 촌스러운 보라색-남색 그라디언트 덩어리를 남발하지 않습니다 (`from-indigo-600 to-purple-600` 지양).
  - 유치한 바운스 애니메이션(`animate-bounce`)을 배제합니다.
  - 컬러 배경 위에 흐릿한 회색 텍스트(`text-slate-400 on colored bg`)를 올리지 않습니다.
