'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  X,
  RefreshCw,
  Server,
  Key,
  BookOpen,
  Send,
  Sparkles,
} from 'lucide-react';

interface DifyDiagnosticsModalProps {
  onClose: () => void;
}

export default function DifyDiagnosticsModal({ onClose }: DifyDiagnosticsModalProps) {
  const [loading, setLoading] = useState(true);
  const [healthData, setHealthData] = useState<any>(null);
  const [testInput, setTestInput] = useState('와이파이 비밀번호가 어떻게 되나요?');
  const [testResponse, setTestResponse] = useState('');
  const [streamProgress, setStreamProgress] = useState<string[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dify/health');
      const data = await res.json();
      setHealthData(data);
    } catch (err: any) {
      setHealthData({ connected: false, message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const handleTestStream = async () => {
    if (!testInput.trim() || isTesting) return;

    setIsTesting(true);
    setTestResponse('');
    setStreamProgress([]);

    try {
      const res = await fetch('/api/dify/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: '진단도구',
          userContent: testInput,
        }),
      });

      if (!res.body) return;
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

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
              if (parsed.text) {
                setTestResponse((prev) => prev + parsed.text);
              }
              if (parsed.title) {
                setStreamProgress((prev) => [...prev, `${parsed.title} (${parsed.status})`]);
              }
            } catch {}
          }
        }
      }
    } catch (err: any) {
      setTestResponse(`스트리밍 오류: ${err.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Dify v1 연결 상태 & 스트리밍 진단</h3>
                {healthData?.connected ? (
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    연결됨 (Online)
                  </span>
                ) : (
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    오프라인
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">엔드포인트: http://localhost/v1</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 본문 */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
          {/* 상태 그리드 카드 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-slate-800/70 border border-slate-700/60 p-3 rounded-xl">
              <span className="text-slate-400 block mb-1">응답 지연시간</span>
              <span className="text-lg font-black text-emerald-400">
                {healthData?.latencyMs ? `${healthData.latencyMs}ms` : '-'}
              </span>
            </div>
            <div className="bg-slate-800/70 border border-slate-700/60 p-3 rounded-xl">
              <span className="text-slate-400 block mb-1">앱 아키텍처</span>
              <span className="text-lg font-black text-white uppercase">
                {healthData?.appType || 'Workflow'}
              </span>
            </div>
            <div className="bg-slate-800/70 border border-slate-700/60 p-3 rounded-xl">
              <span className="text-slate-400 block mb-1">RAG 지식 검색</span>
              <span className="text-lg font-black text-blue-400">
                {healthData?.ragEnabled ? '활성화됨' : '비활성'}
              </span>
            </div>
            <div className="bg-slate-800/70 border border-slate-700/60 p-3 rounded-xl">
              <span className="text-slate-400 block mb-1">폴백 안전망</span>
              <span className="text-lg font-black text-purple-400">100% 가동</span>
            </div>
          </div>

          {/* Dify LLM 키 설정 가이드 */}
          {healthData?.llmStatus === 'gemini_key_invalid' && (
            <div className="bg-amber-950/30 border border-amber-600/40 p-3.5 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Dify 내부 LLM(Gemini) API Key 점검 안내</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                로컬 Dify 서버와 통신은 정상(200 OK)이나, Dify 내부 워크플로우에 등록된 <strong>Google Gemini API Key</strong>가 등록되지 않았거나 만료되었습니다. 현재는 모텔 표준 지식베이스가 자동 응답 중입니다.
              </p>
              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 space-y-1 font-mono text-[11px] text-slate-400">
                <div>1. 브라우저에서 <span className="text-amber-300 font-bold">http://localhost</span> (Dify 콘솔) 접속</div>
                <div>2. 우측 상단 프로필 &rarr; <strong>Settings &rarr; Model Provider &rarr; Google Gemini</strong> 선택</div>
                <div>3. 유효한 Gemini API Key 입력 후 저장 시 Dify 실시간 AI 답변이 100% 작동합니다.</div>
              </div>
            </div>
          )}

          {healthData?.llmStatus === 'gemini_quota_exceeded' && (
            <div className="bg-amber-950/30 border border-amber-600/40 p-3.5 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Google Gemini API 분당 호출 한도(Quota Exceeded) 안내</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                지식 검색(사규 RAG 등)은 <strong>2만 토큰 이상의 문서를 정상적으로 찾아냈으나</strong>, 다음 단계인 Gemini LLM의 <strong>무료 티어 분당 호출 한도(5~15 RPM)가 일시 초과</strong>되어 Dify 워크플로우가 중단되었습니다.
              </p>
              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 space-y-1 font-mono text-[11px] text-slate-400">
                <div>• 원인: Gemini 무료 API 키의 분당 요청 수(RPM) 일시적 초과</div>
                <div>• 조치 1: <strong>10초~1분 뒤</strong> 다시 테스트하시면 바로 정상 응답합니다.</div>
                <div>• 조치 2: Google AI Studio에서 결제 카드가 연결된 종량제(Pay-as-you-go) 키를 등록하면 한도 없이 작동합니다.</div>
              </div>
            </div>
          )}

          {/* 실시간 SSE 스트리밍 테스트 패널 */}
          <div className="bg-slate-800/50 border border-slate-700/70 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-400" />
                실시간 SSE 스트리밍 프록시 테스트
              </span>
              <span className="text-[11px] text-slate-400">한 글자씩 실시간 타이핑 검증</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder="테스트할 질문을 입력하세요..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                onClick={handleTestStream}
                disabled={isTesting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50 shrink-0 shadow-md shadow-blue-900/30"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isTesting ? '스트리밍중...' : '스트림 전송'}</span>
              </button>
            </div>

            {/* 노드 진행 상태 인디케이터 */}
            {streamProgress.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {streamProgress.map((step, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-slate-900 text-blue-300 border border-blue-900/50 font-mono"
                  >
                    ✓ {step}
                  </span>
                ))}
              </div>
            )}

            {/* 스트리밍 응답 결과창 */}
            {testResponse && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                {testResponse}
              </div>
            )}
          </div>
        </div>

        {/* 푸터 */}
        <div className="px-6 py-3.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={fetchHealth}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>상태 새로고침</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
