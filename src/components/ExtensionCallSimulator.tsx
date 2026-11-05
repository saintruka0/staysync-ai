'use client';

import React, { useState } from 'react';
import { useMotel } from '@/context/MotelContext';
import { PhoneCall, PhoneForwarded, X, Sparkles, Clock, CheckCircle2 } from 'lucide-react';

interface ExtensionCallSimulatorProps {
  onClose: () => void;
}

export default function ExtensionCallSimulator({ onClose }: ExtensionCallSimulatorProps) {
  const { callLogs, rooms, simulateIncomingCall } = useMotel();
  const [selectedRoom, setSelectedRoom] = useState('305');
  const [callerQuestion, setCallerQuestion] = useState('수건 2장이랑 생수 좀 더 올려주실 수 있나요?');
  const [isCalling, setIsCalling] = useState(false);

  const sampleQuestions = [
    '수건 2장이랑 생수 좀 더 올려주실 수 있나요?',
    '객실 와이파이 비밀번호랑 넷플릭스 보는 법 알려주세요.',
    '내일 12시 퇴실인데 1시로 연장 가능한가요? 비용은요?',
    '주차장에 차가 만차인 것 같은데 어디에 대면 되나요?',
    '1층에 배달 음식 도착했는데 방으로 올려주시나요?',
  ];

  const handleSimulateCall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!callerQuestion.trim() || isCalling) return;

    setIsCalling(true);
    await simulateIncomingCall(selectedRoom, callerQuestion);
    setIsCalling(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">객실 내선 전화 자동응대 & 콜로그</h3>
              <p className="text-xs text-slate-400">Dify 기반 실시간 AI 음성/텍스트 응대 스크립트</p>
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
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          {/* 1. 내선 전화 수신 시뮬레이션 패널 */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 space-y-3">
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
              <PhoneForwarded className="w-4 h-4 text-indigo-400" />
              내선 전화 수신 시뮬레이터
            </span>

            <form onSubmit={handleSimulateCall} className="space-y-3">
              <div className="flex gap-2">
                <select
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                  className="bg-slate-900 text-slate-200 text-xs border border-slate-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 shrink-0"
                >
                  {rooms.map((r) => (
                    <option key={r.id} value={r.number}>
                      {r.number}호 내선
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  value={callerQuestion}
                  onChange={(e) => setCallerQuestion(e.target.value)}
                  placeholder="고객의 음성 문의 내용을 입력하거나 아래 예시를 클릭하세요."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />

                <button
                  type="submit"
                  disabled={isCalling}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 disabled:opacity-50 shadow-md shadow-indigo-600/20"
                >
                  <PhoneCall className={`w-3.5 h-3.5 ${isCalling ? 'animate-pulse text-indigo-300' : ''}`} />
                  <span>{isCalling ? '응대 분석중...' : '수신 시뮬레이션'}</span>
                </button>
              </div>

              {/* 빠른 질문 칩들 */}
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[11px] text-slate-400 mr-1 py-0.5">자주 오는 문의 예시:</span>
                {sampleQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCallerQuestion(q)}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-slate-900 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition"
                  >
                    {q.slice(0, 18)}...
                  </button>
                ))}
              </div>
            </form>
          </div>

          {/* 2. 최근 내선 통화 로그 & AI 추천 스크립트 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" />
                최근 내선 통화 내역 ({callLogs.length}건)
              </span>
            </div>

            <div className="space-y-3">
              {callLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-xl border border-slate-800 bg-slate-800/40 hover:bg-slate-800/70 transition space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {log.roomNumber}호
                      </span>
                      <span className="text-xs font-bold text-white">{log.category}</span>
                      <span className="text-[11px] text-slate-400 font-mono">({log.duration})</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">{log.timestamp}</span>
                  </div>

                  {/* 음성 텍스트화(STT) 대화 기록 */}
                  <p className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                    {log.transcript}
                  </p>

                  {/* AI 자동 추천 스크립트 */}
                  <div className="bg-indigo-950/30 border border-indigo-800/40 p-2.5 rounded-lg text-xs text-indigo-200 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block text-indigo-300 mb-0.5">AI 권장 조치 & 스크립트:</span>
                      <p className="text-slate-300 leading-relaxed">{log.aiSuggestedAction}</p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {log.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="px-6 py-3.5 bg-slate-900 border-t border-slate-800 flex justify-end">
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
