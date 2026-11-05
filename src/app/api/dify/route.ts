import { NextResponse } from 'next/server';
import { runDifyWorkflow } from '@/lib/dify';

// 호텔/모텔 기본 응대 지식베이스 (Dify 연결 오류 시 폴백 또는 보조 지식)
export const FALLBACK_KNOWLEDGE: Record<string, string> = {
  '와이파이': '객실 내 Wi-Fi 이름은 [StaySync_객실번호] 이며, 비밀번호는 [stay1234!] 입니다. TV 셋톱박스 상단 스티커에서도 확인 가능합니다.',
  'wifi': '객실 내 Wi-Fi 이름은 [StaySync_객실번호] 이며, 비밀번호는 [stay1234!] 입니다.',
  '수건': '수건 추가 요청이 접수되었습니다. 객실 문 앞 또는 프론트에서 즉시 2장을 추가 제공해 드리겠습니다.',
  '생수': '생수는 객실 냉장고에 기본 2병 비치되어 있으며, 추가 필요 시 프론트로 방문하시거나 요청 주시면 무료로 제공해 드립니다.',
  '주차': '본 건물 1층 지상 주차장 및 지하 1층 자주식 주차장을 이용하실 수 있습니다. 투숙객은 무료 주차이며, 입출차 시 프론트에 차량번호를 말씀해 주세요.',
  '체크아웃': '기본 퇴실(체크아웃) 시간은 익일 12:00(정오)입니다. 레이트 체크아웃은 1시간당 10,000원의 추가 요금이 발생하며 프론트 사전 승인이 필요합니다.',
  '퇴실': '기본 퇴실(체크아웃) 시간은 익일 12:00(정오)입니다. 카드키는 프론트 반납함 또는 엘리베이터 내 카드 수거함에 넣어주시면 됩니다.',
  '배달': '배달 음식 주문 시 객실 호수(예: 305호)를 기입해 주시고, 라이더분들의 보안을 위해 1층 로비 픽업 테이블에서 수령해 주시기 바랍니다.',
  '어메니티': '일회용 칫솔/치약, 면도기, 빗, 클렌징폼, 샴푸/린스/바디워시는 욕실 및 화장대에 완비되어 있습니다.',
  '충전기': '침대 옆 협탁에 C타입, 8핀(아이폰), 5핀 일체형 고속 멀티 충전기가 비치되어 있습니다.',
  '가운': '옷장에 살균 세탁된 위생 가운 2벌이 비치되어 있습니다.',
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userName = '고객', userContent = '' } = body;

    if (!userContent.trim()) {
      return NextResponse.json({ error: '문의 내용을 입력해주세요.' }, { status: 400 });
    }

    // 1. 로컬 Dify 워크플로우 호출 시도
    const result = await runDifyWorkflow(userName, userContent);

    // Dify가 정상 응답을 준 경우
    if (result.text && !result.error) {
      return NextResponse.json({
        source: 'dify',
        answer: result.text,
        success: true,
      });
    }

    // 2. Dify에서 오류가 발생한 경우 (예: Gemini API 키 미등록/만료 등)
    // 폴백 지식 매칭 시도
    const lowerContent = userContent.toLowerCase();
    let fallbackAnswer = '';

    for (const [key, answer] of Object.entries(FALLBACK_KNOWLEDGE)) {
      if (lowerContent.includes(key.toLowerCase())) {
        fallbackAnswer = answer;
        break;
      }
    }

    if (!fallbackAnswer) {
      fallbackAnswer = `문의하신 내용 [${userContent}]을 프론트 데스크 직원이 확인 중입니다. 긴급 문의는 내선 0번 또는 카운터로 연락 부탁드립니다.`;
    }

    return NextResponse.json({
      source: 'fallback',
      answer: fallbackAnswer,
      difyError: result.error,
      difyNotice: '로컬 Dify 워크플로우 응답 대기/설정 안내: Dify 내부의 LLM(Gemini) API Key 설정을 확인해주세요. 현재는 모텔 표준 매뉴얼로 응답되었습니다.',
      success: true,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || '서버 내부 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
