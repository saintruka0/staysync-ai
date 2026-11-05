# StaySync AI - OTA 예약 크롤러 연동 가이드

이 디렉토리(`crawler/`)는 야놀자, 여기어때, 아고다, 네이버 등 **각 숙박 플랫폼의 파트너/어드민 센터를 크롤링하여 StaySync 웹앱으로 예약 현황을 실시간 전송**하는 파이썬 모듈입니다.

---

## 1. 아키텍처 개요

```
[업체별 파트너센터] ──(파이썬 크롤러: Selenium / Playwright / Requests)──> 
  [HTTP POST: http://localhost:3000/api/sync/reservations] ──> 
    [StaySync 프론트 데스크 실시간 현황판에 신규 예약 팝업 & 객실 즉시 배정]
```

---

## 2. 빠른 실행 방법

### 단발성 1회 실행 (모든 플랫폼)
```bash
python crawler/sync_reservations.py
```

### 특정 플랫폼만 크롤링
```bash
python crawler/sync_reservations.py --platform yanolja
python crawler/sync_reservations.py --platform yeogi
python crawler/sync_reservations.py --platform agoda
python crawler/sync_reservations.py --platform naver
```

### 주기적 자동 크롤링 (데몬 모드: 예: 60초 주기)
```bash
python crawler/sync_reservations.py --interval 60
```

---

## 3. 웹앱 수신 JSON 규격 (API Specification)

크롤러가 웹앱(`http://localhost:3000/api/sync/reservations`)으로 전송하는 JSON 페이로드 규격:

```json
{
  "platform": "야놀자",
  "reservations": [
    {
      "reservationNo": "YN-20261103-9012",
      "guestName": "김철수",
      "phone": "010-1234-5678",
      "roomType": "스탠다드 더블",
      "checkInDate": "2026-11-03",
      "checkInTime": "19:00",
      "checkOutDate": "2026-11-04",
      "price": 65000,
      "status": "대기"
    }
  ]
}
```

---

## 4. 크롤링 로직 커스터마이징 위치 (`sync_reservations.py`)

* `YanoljaCrawler.fetch_reservations()`: 야놀자 파트너센터 셀렉터 및 파싱
* `GoodChoiceCrawler.fetch_reservations()`: 여기어때 마케팅센터 셀렉터 및 파싱
* `AgodaCrawler.fetch_reservations()`: 아고다 YCS API 또는 웹 파싱
* `NaverBookingCrawler.fetch_reservations()`: 네이버 스마트플레이스 예약 파싱
