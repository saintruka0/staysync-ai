export interface DifyWorkflowResponse {
  task_id?: string;
  workflow_run_id?: string;
  data?: {
    id?: string;
    workflow_id?: string;
    status: 'succeeded' | 'failed' | 'stopped';
    outputs?: Record<string, any>;
    error?: string;
    elapsed_time?: number;
    total_tokens?: number;
  };
  error?: string;
}

export async function runDifyWorkflow(userName: string, userContent: string): Promise<{ text: string; error?: string; raw?: any }> {
  const apiUrl = process.env.DIFY_API_URL || 'http://localhost/v1';
  const apiKey = process.env.DIFY_API_KEY || 'app-FguiOitGwnEptTRAWIqs6O0g';

  try {
    const res = await fetch(`${apiUrl}/workflows/run`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {
          user_content: userContent,
          user_name: userName || '고객',
        },
        response_mode: 'blocking',
        user: `motel-user-${encodeURIComponent(userName || 'guest')}`,
      }),
    });

    const data: DifyWorkflowResponse = await res.json();

    if (!res.ok) {
      return {
        text: '',
        error: data.error || `Dify API 요청 실패 (HTTP ${res.status})`,
        raw: data,
      };
    }

    if (data.data?.status === 'failed') {
      return {
        text: '',
        error: data.data.error || '워크플로우 실행 중 오류가 발생했습니다.',
        raw: data,
      };
    }

    // 워크플로우의 outputs 중 텍스트 추출 (text, result, output, answer 등)
    const outputs = data.data?.outputs || {};
    const textOutput =
      outputs.text ||
      outputs.result ||
      outputs.output ||
      outputs.answer ||
      outputs.response ||
      (typeof outputs === 'string' ? outputs : JSON.stringify(outputs, null, 2));

    return {
      text: typeof textOutput === 'string' ? textOutput : JSON.stringify(textOutput),
      raw: data,
    };
  } catch (err: any) {
    return {
      text: '',
      error: err.message || 'Dify 서버에 연결할 수 없습니다.',
    };
  }
}
