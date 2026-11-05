#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
StaySync AI - OTA 예약 크롤러 & 웹앱 실시간 동기화 스크립트

주요 플랫폼 지원:
1. 야놀자 파트너센터 (Yanolja Partner Center)
2. 여기어때 마케팅센터 (GoodChoice Partner Center)
3. 아고다 YCS (Agoda Yield Control System)
4. 네이버 예약 파트너센터 (Naver Booking Partner)

동작 방식:
- 각 플랫폼의 어드민에 로그인하여 신규 예약 목록을 스크래핑한 후,
- 로컬 웹앱 API (http://localhost:3000/api/sync/reservations)로 JSON POST 요청을 보내 실시간 동기화합니다.
"""

import os
import sys
import json
import time
import argparse
import urllib.request
import urllib.error
from datetime import datetime, date

# Windows 콘솔 cp949 인코딩 문제 방지
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except AttributeError:
        pass

DEFAULT_API_URL = os.environ.get("STAYSYNC_API_URL", "http://localhost:3000/api/sync/reservations")


def push_to_webapp(platform: str, reservations: list, api_url: str = DEFAULT_API_URL) -> bool:
    """웹앱의 /api/sync/reservations 엔드포인트로 크롤링된 예약 데이터를 전송합니다."""
    if not reservations:
        print(f"[{platform}] 동기화할 신규 예약이 없습니다.")
        return True

    payload = {
        "platform": platform,
        "reservations": reservations
    }
    data = json.dumps(payload, ensure_ascii=False).encode("utf-8")

    req = urllib.request.Request(
        api_url,
        data=data,
        headers={"Content-Type": "application/json; charset=utf-8"}
    )

    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            result = json.loads(response.read().decode("utf-8"))
            print(f"[OK] [{platform}] 동기화 성공: {result.get('message')}")
            return True
    except urllib.error.URLError as e:
        print(f"[FAIL] [{platform}] 웹앱 전송 실패: {e}. (웹앱이 http://localhost:3000에서 실행 중인지 확인하세요)")
        return False
    except Exception as e:
        print(f"[ERROR] [{platform}] 예기치 못한 오류: {e}")
        return False


class BaseCrawler:
    """모든 플랫폼 크롤러의 기본 인터페이스"""
    def __init__(self, platform_name: str, config: dict = None):
        self.platform_name = platform_name
        self.config = config or {}

    def login(self) -> bool:
        """업체 관리자 페이지 로그인 (세션 쿠키 확보)"""
        raise NotImplementedError

    def fetch_reservations(self) -> list:
        """신규 예약 목록 크롤링 후 표준 딕셔너리 리스트 반환"""
        raise NotImplementedError


class YanoljaCrawler(BaseCrawler):
    """야놀자 파트너센터 크롤러"""
    def __init__(self, config=None):
        super().__init__("야놀자", config)

    def login(self) -> bool:
        # TODO: 실제 야놀자 파트너센터 로그인 URL 및 세션 쿠키 처리 (requests/playwright 활용)
        # partner_id = self.config.get("id")
        # partner_pw = self.config.get("pw")
        return True

    def fetch_reservations(self) -> list:
        # TODO: 실제 예약 현황 페이지 파싱 로직
        # 현재는 연동 테스트용 실시간 샘플 데이터 생성 예시
        now_str = datetime.now().strftime("%H:%M")
        today_str = date.today().isoformat()
        
        return [
            {
                "reservationNo": f"YN-{datetime.now().strftime('%m%d')}-{int(time.time()) % 10000}",
                "guestName": "정*우",
                "phone": "010-8271-9921",
                "roomType": "디럭스 트윈",
                "checkInDate": today_str,
                "checkInTime": "19:30",
                "checkOutDate": today_str,
                "price": 75000,
                "status": "대기"
            }
        ]


class GoodChoiceCrawler(BaseCrawler):
    """여기어때 마케팅센터 크롤러"""
    def __init__(self, config=None):
        super().__init__("여기어때", config)

    def login(self) -> bool:
        # TODO: 여기어때 마케팅센터 로그인 로직
        return True

    def fetch_reservations(self) -> list:
        today_str = date.today().isoformat()
        return [
            {
                "reservationNo": f"YG-{datetime.now().strftime('%m%d')}-{int(time.time()) % 10000}",
                "guestName": "오*석",
                "phone": "010-3312-4451",
                "roomType": "게이밍 PC 2인실",
                "checkInDate": today_str,
                "checkInTime": "20:00",
                "checkOutDate": today_str,
                "price": 85000,
                "status": "대기"
            }
        ]


class AgodaCrawler(BaseCrawler):
    """아고다 YCS 크롤러"""
    def __init__(self, config=None):
        super().__init__("아고다", config)

    def login(self) -> bool:
        # TODO: Agoda YCS API 또는 웹 파싱
        return True

    def fetch_reservations(self) -> list:
        today_str = date.today().isoformat()
        return [
            {
                "reservationNo": f"AG-{datetime.now().strftime('%m%d')}-{int(time.time()) % 10000}",
                "guestName": "David K",
                "phone": "010-5555-1234",
                "roomType": "프리미엄 스위트",
                "checkInDate": today_str,
                "checkInTime": "21:00",
                "checkOutDate": today_str,
                "price": 140000,
                "status": "대기"
            }
        ]


class NaverBookingCrawler(BaseCrawler):
    """네이버 예약 파트너센터 크롤러"""
    def __init__(self, config=None):
        super().__init__("네이버", config)

    def login(self) -> bool:
        return True

    def fetch_reservations(self) -> list:
        today_str = date.today().isoformat()
        return [
            {
                "reservationNo": f"NV-{datetime.now().strftime('%m%d')}-{int(time.time()) % 10000}",
                "guestName": "한*진",
                "phone": "010-9012-3344",
                "roomType": "스탠다드 더블",
                "checkInDate": today_str,
                "checkInTime": "18:00",
                "checkOutDate": today_str,
                "price": 60000,
                "status": "대기"
            }
        ]


def run_crawlers(platforms, api_url=DEFAULT_API_URL):
    crawlers = {
        "yanolja": YanoljaCrawler(),
        "yeogi": GoodChoiceCrawler(),
        "agoda": AgodaCrawler(),
        "naver": NaverBookingCrawler(),
    }

    targets = list(crawlers.keys()) if "all" in platforms else platforms

    for key in targets:
        if key in crawlers:
            crawler = crawlers[key]
            print(f"[{datetime.now().strftime('%H:%M:%S')}] {crawler.platform_name} 크롤링 시작...")
            crawler.login()
            reservations = crawler.fetch_reservations()
            push_to_webapp(crawler.platform_name, reservations, api_url)


def main():
    parser = argparse.ArgumentParser(description="StaySync AI - 모텔 예약 실시간 크롤러")
    parser.add_argument(
        "--platform",
        default="all",
        choices=["all", "yanolja", "yeogi", "agoda", "naver"],
        help="크롤링할 특정 플랫폼 선택 (기본값: all)"
    )
    parser.add_argument(
        "--interval",
        type=int,
        default=0,
        help="주기적 자동 반복 실행 간격(초). 0이면 1회만 실행."
    )
    parser.add_argument(
        "--api-url",
        default=DEFAULT_API_URL,
        help=f"웹앱 전송 API 엔드포인트 URL (기본값: {DEFAULT_API_URL})"
    )

    args = parser.parse_args()

    platforms = [args.platform] if args.platform != "all" else ["all"]

    if args.interval > 0:
        print(f"🚀 크롤러 데몬 시작: {args.interval}초 간격으로 자동 동기화합니다 (종료: Ctrl+C)")
        try:
            while True:
                run_crawlers(platforms, args.api_url)
                time.sleep(args.interval)
        except KeyboardInterrupt:
            print("\n크롤러가 안전하게 중단되었습니다.")
    else:
        run_crawlers(platforms, args.api_url)


if __name__ == "__main__":
    main()
