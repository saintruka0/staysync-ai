'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  source?: 'dify' | 'fallback';
}

export default function DifyChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: '안녕하세요! 모텔 프론트 AI 어시스턴트(Dify 연동)입니다. 객실 규정, 환불 지침, 고객 응대 스크립트 등 무엇이든 질문해 주세요.',
      timestamp: '방금',
      source: 'dify',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    '퇴실 시간 및 레이트 체크아웃 규정',
    '주차장 만차 시 인근 주차 안내 스크립트',
    '미성년자 입실 관련 응대 매뉴얼',
    '객실 와이파이 및 넷플릭스 연결 안내',
    '침구/수건 추가 요금 및 제공 기준',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const question = (textToSend || input).trim();
    if (!question || loading) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: question,
      timestamp: timeStr,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const aiMessageId = `ai-${Date.now()}`;
    const initialAiMsg: ChatMessage = {
      id: aiMessageId,
      sender: 'ai',
      text: '',
      timestamp: timeStr,
      source: 'dify',
    };

    setMessages((prev) => [...prev, initialAiMsg]);

    try {
      const res = await fetch('/api/dify/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: '프론트 데스크',
          userContent: question,
        }),
      });

      if (!res.body) throw new Error('응답 스트림이 없습니다.');

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
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === aiMessageId ? { ...m, text: m.text + parsed.text, source: parsed.source || m.source } : m
                  )
                );
              }
            } catch {}
          }
        }
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMessageId
            ? { ...m, text: 'Dify 서버와 통신 중 문제가 발생했습니다. 로컬 Dify 컨테이너 상태를 확인해주세요.' }
            : m
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 플로팅 토글 버튼 */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-full shadow-2xl shadow-blue-900/50 hover:scale-105 motion-safe:transition-transform motion-reduce:transition-none duration-200 group border border-blue-400/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          title="Dify 모텔 AI 어시스턴트 열기"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-indigo-200 motion-safe:animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-900"></span>
          </div>
          <span className="text-xs font-bold tracking-tight">모텔 AI 어시스턴트</span>
        </button>
      )}

      {/* 챗봇 창 */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-40 bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl motion-safe:transition-opacity motion-reduce:transition-none duration-300 ${
            isExpanded ? 'w-[90vw] md:w-[600px] h-[80vh]' : 'w-[92vw] sm:w-[420px] h-[580px]'
          }`}
        >
          {/* 헤더 */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/40 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-indigo-300" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-white">StaySync Dify AI</h4>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                </div>
                <p className="text-[10px] text-slate-400">모텔 RAG 지식 & 매뉴얼 응대</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                title={isExpanded ? '축소' : '확대'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() =>
                  setMessages([
                    {
                      id: 'reset',
                      sender: 'ai',
                      text: '대화가 초기화되었습니다. 필요한 매뉴얼이나 응대 스크립트를 문의해 주세요.',
                      timestamp: '방금',
                    },
                  ])
                }
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                title="대화 초기화"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                title="닫기"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 메시지 리스트 */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs bg-slate-950/40">
            {messages.map((m) => {
              const isAi = m.sender === 'ai';
              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-2 ${isAi ? 'justify-start' : 'justify-end'}`}
                >
                  {isAi && (
                    <div className="w-6 h-6 rounded-lg bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div className={`max-w-[82%] space-y-1 ${isAi ? 'items-start' : 'items-end'}`}>
                    <div
                      className={`p-3 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                        isAi
                          ? 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-tl-sm'
                          : 'bg-indigo-600 text-white font-medium rounded-tr-sm shadow-md shadow-indigo-600/20'
                      }`}
                    >
                      {m.text}
                    </div>
                    <div
                      className={`flex items-center gap-1.5 text-[10px] text-slate-400 px-1 ${
                        isAi ? 'justify-start' : 'justify-end'
                      }`}
                    >
                      <span>{m.timestamp}</span>
                      {isAi && m.source && (
                        <span className="text-[10px] px-1 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                          {m.source === 'dify' ? 'Dify RAG' : '표준매뉴얼'}
                        </span>
                      )}
                    </div>
                  </div>

                  {!isAi && (
                    <div className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-indigo-300">
                <div className="w-6 h-6 rounded-lg bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 motion-safe:animate-ping"></span>
                  <span className="text-[11px] text-slate-300">Dify 워크플로우 응답 생성 중…</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 퀵 칩 리스트 */}
          <div className="px-3 py-2 bg-slate-900 border-t border-slate-800 overflow-x-auto whitespace-nowrap flex gap-1.5">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                disabled={loading}
                className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 text-slate-300 hover:text-white border border-slate-700/70 transition-colors shrink-0"
              >
                {q}
              </button>
            ))}
          </div>

          {/* 입력창 */}
          <div className="p-3 bg-slate-900 border-t border-slate-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="모텔 규정 및 응대 스크립트를 입력하세요..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition disabled:opacity-40 shadow-md shadow-indigo-600/20"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
