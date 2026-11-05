import { FALLBACK_KNOWLEDGE } from '../route';

export async function POST(req: Request) {
  const { userName = '고객', userContent = '' } = await req.json();

  if (!userContent.trim()) {
    return new Response(JSON.stringify({ error: '문의 내용을 입력해주세요.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiUrl = process.env.DIFY_API_URL || 'http://localhost/v1';
  const apiKey = process.env.DIFY_API_KEY || 'app-FguiOitGwnEptTRAWIqs6O0g';

  const encoder = new TextEncoder();

  // 스마트 폴백 답변 생성기 (Dify LLM 키 미등록 시 부드러운 스트리밍)
  const getFallbackAnswer = () => {
    const lower = userContent.toLowerCase();
    for (const [key, val] of Object.entries(FALLBACK_KNOWLEDGE)) {
      if (lower.includes(key.toLowerCase())) return val;
    }
    return `문의하신 내용 [${userContent}]을 프론트 데스크 직원이 확인 중입니다. 긴급 문의는 내선 0번 또는 카운터로 연락 부탁드립니다.`;
  };

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const difyRes = await fetch(`${apiUrl}/workflows/run`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: {
              user_content: userContent,
              user_name: userName || '고객',
            },
            response_mode: 'streaming',
            user: `motel-stream-${encodeURIComponent(userName || 'guest')}`,
          }),
        });

        if (!difyRes.ok || !difyRes.body) {
          throw new Error(`Dify HTTP ${difyRes.status}`);
        }

        const reader = difyRes.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let hasStreamedContent = false;
        let workflowFailed = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.replace('data: ', '').trim();
              if (!dataStr) continue;

              try {
                const parsed = JSON.parse(dataStr);

                // 1. 노드 시작 이벤트 (진행 상태)
                if (parsed.event === 'node_started') {
                  const nodeTitle = parsed.data?.title || parsed.data?.node_type || '작업';
                  controller.enqueue(
                    encoder.encode(`event: node_progress\ndata: ${JSON.stringify({ status: 'running', title: nodeTitle })}\n\n`)
                  );
                }

                // 2. 텍스트 청크 스트리밍
                if (parsed.event === 'text_chunk') {
                  const chunkText = parsed.data?.text || '';
                  if (chunkText) {
                    hasStreamedContent = true;
                    controller.enqueue(
                      encoder.encode(`event: chunk\ndata: ${JSON.stringify({ text: chunkText })}\n\n`)
                    );
                  }
                }

                // 3. 워크플로우 완료 또는 오류 이벤트
                if (parsed.event === 'workflow_finished') {
                  if (parsed.data?.status === 'failed') {
                    workflowFailed = true;
                  } else {
                    const outputs = parsed.data?.outputs || {};
                    const finalOut =
                      outputs.text ||
                      outputs.result ||
                      outputs.output ||
                      outputs.answer ||
                      outputs.response;

                    if (!hasStreamedContent && finalOut) {
                      hasStreamedContent = true;
                      controller.enqueue(
                        encoder.encode(`event: chunk\ndata: ${JSON.stringify({ text: finalOut })}\n\n`)
                      );
                    }
                  }
                }
              } catch {}
            }
          }
        }

        // 만약 Dify에서 워크플로우가 실패했거나(LLM API 키 문제 등) 스트림이 비어있는 경우, 모텔 표준 RAG 폴백을 스트리밍
        if (workflowFailed || !hasStreamedContent) {
          controller.enqueue(
            encoder.encode(`event: node_progress\ndata: ${JSON.stringify({ status: 'fallback', title: '모텔 표준 지식베이스 조회' })}\n\n`)
          );

          const fallbackText = getFallbackAnswer();
          const words = fallbackText.split(' ');

          for (let i = 0; i < words.length; i++) {
            const word = words[i] + (i < words.length - 1 ? ' ' : '');
            controller.enqueue(
              encoder.encode(`event: chunk\ndata: ${JSON.stringify({ text: word, source: 'fallback' })}\n\n`)
            );
            await new Promise((r) => setTimeout(r, 45)); // 타이핑 딜레이
          }
        }

        controller.enqueue(encoder.encode(`event: done\ndata: {}\n\n`));
        controller.close();
      } catch (err: any) {
        // 네트워크 또는 Dify 미접속 시 폴백 스트리밍
        const fallbackText = getFallbackAnswer();
        const words = fallbackText.split(' ');

        for (let i = 0; i < words.length; i++) {
          const word = words[i] + (i < words.length - 1 ? ' ' : '');
          controller.enqueue(
            encoder.encode(`event: chunk\ndata: ${JSON.stringify({ text: word, source: 'fallback' })}\n\n`)
          );
          await new Promise((r) => setTimeout(r, 40));
        }

        controller.enqueue(encoder.encode(`event: done\ndata: {}\n\n`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
