import { NextResponse } from 'next/server';

export async function GET() {
  const apiUrl = process.env.DIFY_API_URL || 'http://localhost/v1';
  const apiKey = process.env.DIFY_API_KEY || 'app-FguiOitGwnEptTRAWIqs6O0g';

  const startTime = Date.now();

  try {
    // 1. Dify 파라미터 엔드포인트 조회
    const paramRes = await fetch(`${apiUrl}/parameters`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: 'no-store',
    });

    const latency = Date.now() - startTime;

    if (!paramRes.ok) {
      return NextResponse.json({
        status: 'error',
        connected: false,
        httpStatus: paramRes.status,
        message: `Dify 연결 실패 (HTTP ${paramRes.status})`,
        latencyMs: latency,
        apiUrl,
      });
    }

    const params = await paramRes.json();

    // 2. 워크플로우 테스트 호출로 LLM 키 검사
    let llmStatus = 'ready';
    let llmMessage = '정상 작동';

    try {
      const testRun = await fetch(`${apiUrl}/workflows/run`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: { user_name: '시스템진단', user_content: '핑' },
          response_mode: 'blocking',
          user: 'system-diagnostic-probe',
        }),
      });

      const testData = await testRun.json();
      if (testData.data?.status === 'failed') {
        const err = testData.data.error || '';
        if (err.includes('API key not valid') || err.includes('API_KEY_INVALID')) {
          llmStatus = 'gemini_key_invalid';
          llmMessage = 'Dify 내부 Google Gemini API 키가 유효하지 않습니다. (Dify 설정 > Model Provider 확인 필요)';
        } else if (err.includes('quota') || err.includes('Quota exceeded') || err.includes('rate-limits')) {
          llmStatus = 'gemini_quota_exceeded';
          llmMessage = 'Google Gemini 무료 API 할당량(분당 5회 요청 제한)이 초과되었습니다. 잠시 후 재시도하거나 유료 키 등록이 필요합니다.';
        } else {
          llmStatus = 'workflow_error';
          llmMessage = err.slice(0, 100);
        }
      }
    } catch {
      llmStatus = 'unknown';
    }

    return NextResponse.json({
      status: 'ok',
      connected: true,
      apiUrl,
      latencyMs: latency,
      appType: 'workflow',
      variables: params.user_input_form?.map((f: any) => Object.keys(f)[0]) || ['user_name', 'user_content'],
      ragEnabled: params.retriever_resource?.enabled ?? true,
      llmStatus,
      llmMessage,
      fallbackReady: true,
    });
  } catch (err: any) {
    return NextResponse.json({
      status: 'offline',
      connected: false,
      message: err.message || '로컬 Dify 서버(http://localhost/v1)에 접속할 수 없습니다.',
      latencyMs: Date.now() - startTime,
      apiUrl,
    });
  }
}
