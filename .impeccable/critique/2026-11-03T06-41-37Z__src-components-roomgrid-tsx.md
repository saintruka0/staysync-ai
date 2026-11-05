---
target: the room grid
total_score: 17
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 1
target_identity: "file:C:\\Projects\\Anti\\bnb\\src\\components\\RoomGrid.tsx"
target_fingerprint: "sha256:68891652b3b67717524941fe2fb57420dd884d9ffdf83dbda5de4be0d466530b"
target_path: "C:\\Projects\\Anti\\bnb\\src\\components\\RoomGrid.tsx"
timestamp: 2026-11-03T06-41-37Z
slug: src-components-roomgrid-tsx
---
# Design Critique: Room Grid & Modal (`src/components/RoomGrid.tsx`)

Method: dual-agent (A: 930e83df-9a2c-4eca-b129-74bf45169090 · B: 8260a1cd-386c-4bee-86aa-8140849464f3)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|:-----:|-----------|
| 1 | Visibility of System Status | 2/4 | 상태 뱃지는 있으나 필터별 객실 수 미표시, 모달 내 상태 변경 시 화면 내 피드백 부재 |
| 2 | Match System / Real World | 2/4 | 건물의 수직적 층 구조(2~5층)를 무시하고 5열 그리드로 일괄 래핑하여 공간 인지 왜곡 |
| 3 | User Control and Freedom | 1/4 | '입실가능(빈방)' 클릭 시 투숙객 정보 즉시 영구 삭제 (실행취소/Undo 없음) |
| 4 | Consistency and Standards | 2/4 | 층별 필터는 버튼, 상태 필터는 select 드롭다운으로 이원화; 브랜드 토큰 불일치 잔재 |
| 5 | Error Prevention | 1/4 | 재실/예약 객실의 퇴실 처리에 확인 팝업 없음; 소음 민원 객실 옆 배정 방지책 부재 |
| 6 | Recognition Rather Than Recall | 2/4 | 객실 타입(게이밍PC/스파) 말줄임(`truncate`), 특이사항이 단순 숫자 아이콘으로 은닉 |
| 7 | Flexibility and Efficiency | 1/4 | 원클릭 빠른 배정이나 키보드 단축키 부재; 모든 조작이 무거운 모달 진입을 강제함 |
| 8 | Aesthetic and Minimalist Design | 2/4 | 전 객실에 무의미한 '상세보기 →' 반복, 청소중 뱃지의 지속적인 깜빡임으로 시각 피로 |
| 9 | Error Recovery | 2/4 | 메모 삭제 시 확인 절차 없음; 삭제된 데이터 복구 불가 |
| 10 | Help and Documentation | 2/4 | AI 점검 합격 기준 점수(85점/90점)나 상태별 의미에 대한 툴팁/안내 부재 |
| **Total** | | **17/40** | **Critical Operational Debt (현장 운영 개선 필요)** |

## Design Specificity Verdict

- **LLM Assessment**: 현 인터페이스는 전형적인 **"SaaS 템플릿 증후군"**을 보입니다. 모텔 프론트는 3초 이내에 직관적으로 건물의 물리적 상태를 파악해야 하는 특수 현장인데, 이커머스 카드 목록처럼 방들을 나열하고 호버 리프트(-translate-y-1)와 '상세보기' 링크를 붙였습니다. 층별 수직 랙(Floor Rack) 구조와 즉각적인 운영용 컨트롤이 결핍되어 있습니다.
- **Deterministic Scan**: 정적 검사에서 `RoomGrid.tsx`의 9px 임의 폰트(`text-[9px]`) 1건 검출. 런타임 브라우저 검사에서 11px 미만의 `undersized-ui-text` 40건(10px 상태 뱃지, 플랫폼 태그 등), `nested-cards` 15건(이중 테두리 박스 중첩), 경계선 대비 미달(`low-contrast` 4.4:1) 2건이 확인되었습니다.

## Overall Impression
기본적인 상태 모델링(AI 점검완료, 청소중 등)과 객실 번호 타이포그래피는 훌륭하나, **"실제 모텔 카운터 직원이 밤 11시 반에 전화받으면서 쓸 수 있는가?"**라는 질문에는 '아니오'입니다. 물리적 공간 배치 부재와 파괴적 조작(고객 정보 즉시 삭제)에 대한 방어책이 시급합니다.

## What's Working
1. **객실 번호 시각적 앵커링**: `text-xl font-black text-white`로 번호가 크고 명확하여 호실 탐색 시 시선이 즉시 안착됩니다.
2. **현장 밀착형 도메인 상태**: 단순 입실/퇴실을 넘어 'AI 청소 점검완료'를 독립 상태로 둔 것은 실제 하우스키핑-프론트 간 승인 병목을 해소하는 훌륭한 기능 설계입니다.
3. **투숙객 모바일 즉시 검증 링크**: 모달 내에서 `/guest?room=305`로 바로 이동할 수 있어 직원이 고객 화면을 즉시 동기화해 볼 수 있습니다.

## Priority Issues
- **[P0] 조용한 체크아웃 및 데이터 영구 유실 위험 (Silent Checkout)**
  - 모달에서 '입실가능(빈방)'을 누르면 투숙객 이름, 전화번호, 플랫폼 정보가 확인 창 없이 즉시 초기화됩니다. 마우스 삑사리 한 번에 체크인 중인 고객 정보가 날아갑니다.
  - *Fix*: 재실 객실의 빈방 전환 시 "현재 OOO 고객님이 투숙 중입니다. 퇴실(체크아웃) 처리하시겠습니까?" 2차 확인 모달 및 토스트 내 '실행 취소(Undo)' 제공.
- **[P1] 물리적 공간 멘탈 모델 왜곡 (Continuous Grid Wrap)**
  - 2층부터 5층까지의 방이 5열 그리드로 한 화면에 마구 섞여, 205호 옆에 301호가 붙는 비현실적 배치가 발생합니다.
  - *Fix*: 층별(5층 스위트 -> 2층 스탠다드) 수직 랙 그룹핑 및 층별 공실 현황 요약 헤더 도입.
- **[P2] 가독성 미달 미세 텍스트 (9~10px) & 저대비**
  - 핵심인 상태 뱃지와 플랫폼 태그가 9~10px로 작아 카운터 조명이나 모니터 거리에서 시인성이 떨어집니다.
  - *Fix*: 10px 미만 폰트를 전면 금지하고 `text-[11px]` 및 `text-xs`(12px)로 상향하며 뱃지 배경 대비를 4.5:1 이상으로 보강.
- **[P3] 긴급 주의사항(소음/블랙리스트) 은닉 및 룸타입 말줄임**
  - 소음 민원 이력이 작은 방패 아이콘(1) 속에 숨겨져 있고, 게이밍PC/스파 룸타입이 잘려 보입니다.
  - *Fix*: 카드 표면에 ⚠️ 소음주의 칩을 노출하고, 🎮 PC / 🛁 스파 어메니티 아이콘을 직관적으로 표기.

## Persona Red Flags
- **야간 당직 직원 (새벽 01:30, 침침한 카운터 조명에서 전화 응대 중)**: 어두운 화면에서 방패 아이콘 속 숫자가 보이지 않아 소음 민원 고객 옆방에 다른 손님을 배정해 새벽 클레임 발생.
- **주말 신규 아르바이트생 (첫 근무일)**: 모달에서 실수로 '입실가능'을 클릭해 현재 방에 있는 손님의 예약 정보를 지워버리고 복구하지 못해 멘붕.

## Minor Observations
- 층 필터(버튼)와 상태 필터(select 드롭다운)의 컨트롤 스타일 불일치.
- 전 객실 카드마다 반복되는 '상세보기 →' 텍스트 제거 필요.
- 모달 내 ESC 키 닫기 및 포커스 트랩 미구현.
