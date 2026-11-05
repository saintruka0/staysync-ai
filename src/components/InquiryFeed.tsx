'use client';

import React, { useState } from 'react';
import { useMotel } from '@/context/MotelContext';
import {
  MessageSquare,
  Package,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Send,
  Clock,
  History,
  X,
  FileText,
} from 'lucide-react';

export default function InquiryFeed() {
  const { inquiries, amenities, callLogs, resolveInquiry, deliverAmenity } = useMotel();
  const [activeTab, setActiveTab] = useState<'all' | 'inquiry' | 'amenity'>('all');
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [historyRoom, setHistoryRoom] = useState<string | null>(null);

  const pendingInquiries = inquiries.filter((i) => i.status !== 'resolved');
  const pendingAmenities = amenities.filter((a) => a.status === 'pending');

  const quickTemplates = [
    '요청하신 비품 문 앞에 놓아드렸습니다.',
    '생수는 1층 프론트 데스크에서 무료 추가 수령 가능합니다.',
    '1시간 레이트 체크아웃(10,000원) 승인되었습니다.',
    '배달 음식은 보안상 1층 로비 픽업 테이블에서 수령해 주세요.',
    '객실 와이파이는 [StaySync_호수 / 비번 stay1234!] 입니다.',
  ];

  const handleSendReply = (inquiryId: string, defaultText: string) => {
    const textToSend = replyDrafts[inquiryId] || defaultText || '확인하였습니다.';
    resolveInquiry(inquiryId, textToSend);
    setReplyDrafts((prev) => {
      const next = { ...prev };
      delete next[inquiryId];
      return next;
    });
  };

  // 특정 호실의 전체 히스토리 필터
  const roomInquiries = historyRoom ? inquiries.filter((i) => i.roomNumber === historyRoom) : [];
  const roomAmenities = historyRoom ? amenities.filter((a) => a.roomNumber === historyRoom) : [];
  const roomCalls = historyRoom ? callLogs.filter((c) => c.roomNumber === historyRoom) : [];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col h-full">
      {/* 탭 헤더 */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            방별 실시간 문의 & 비품 요청
          </h2>
          <p className="text-xs text-slate-400">투숙객 모바일 QR 및 챗봇 연동</p>
        </div>

        {/* 탭 버튼 */}
        <div className="flex bg-slate-800 p-1 rounded-xl text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-2.5 py-1 rounded-lg font-bold transition ${
              activeTab === 'all' ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            전체 ({pendingInquiries.length + pendingAmenities.length})
          </button>
          <button
            onClick={() => setActiveTab('inquiry')}
            className={`px-2.5 py-1 rounded-lg font-bold transition ${
              activeTab === 'inquiry' ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            문의 ({pendingInquiries.length})
          </button>
          <button
            onClick={() => setActiveTab('amenity')}
            className={`px-2.5 py-1 rounded-lg font-bold transition ${
              activeTab === 'amenity' ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            비품 ({pendingAmenities.length})
          </button>
        </div>
      </div>

      {/* 리스트 영역 */}
      <div className="space-y-3 overflow-y-auto flex-1 max-h-[420px] pr-1">
        {/* 1. 비품 요청 카드 (amenities) */}
        {(activeTab === 'all' || activeTab === 'amenity') &&
          amenities.map((item) => {
            const isPending = item.status === 'pending';
            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border transition ${
                  isPending
                    ? 'bg-amber-950/20 border-amber-700/60'
                    : 'bg-slate-900/50 border-slate-800/60 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setHistoryRoom(item.roomNumber)}
                      className="text-xs px-2 py-0.5 rounded-full font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:scale-105 transition"
                      title="이 객실의 전체 문의 히스토리 보기"
                    >
                      {item.roomNumber}호 &para;
                    </button>
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-amber-400" />
                      원클릭 비품 요청
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">{item.createdAt}</span>
                </div>

                <div className="flex items-center justify-between gap-2 mt-2">
                  <div className="text-xs text-slate-200 font-medium">
                    {item.item} <span className="text-amber-400 font-bold">x {item.quantity}</span>
                  </div>
                  {isPending ? (
                    <button
                      onClick={() => deliverAmenity(item.id)}
                      className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-md shadow-amber-900/30"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      전달 완료
                    </button>
                  ) : (
                    <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      전달 완료됨
                    </span>
                  )}
                </div>
              </div>
            );
          })}

        {/* 2. 객실 문의 카드 (inquiries) */}
        {(activeTab === 'all' || activeTab === 'inquiry') &&
          inquiries.map((inq) => {
            const isResolved = inq.status === 'resolved';
            const draftText = replyDrafts[inq.id] ?? inq.aiSuggestedAnswer ?? '';

            return (
              <div
                key={inq.id}
                className={`p-3.5 rounded-2xl border transition ${
                  !isResolved
                    ? inq.isUrgent
                      ? 'bg-rose-950/20 border-rose-700/60'
                      : 'bg-slate-800/70 border-slate-700/80'
                    : 'bg-slate-900/50 border-slate-800/60 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setHistoryRoom(inq.roomNumber)}
                      className="text-xs px-2 py-0.5 rounded-full font-black bg-blue-500/20 text-blue-300 border border-blue-500/40 hover:scale-105 transition"
                      title="이 객실의 전체 문의 히스토리 보기"
                    >
                      {inq.roomNumber}호 &para;
                    </button>
                    <span className="text-xs font-bold text-white">{inq.guestName}</span>
                    <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {inq.category}
                    </span>
                    {inq.isUrgent && !isResolved && (
                      <span className="text-[11px] px-1.5 py-0.5 rounded-full font-bold bg-rose-900/80 text-rose-200 border border-rose-700 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        긴급
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {inq.createdAt}
                  </span>
                </div>

                {/* 질문 본문 */}
                <p className="text-xs text-slate-100 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 mb-2.5 leading-relaxed">
                  &ldquo;{inq.message}&rdquo;
                </p>

                {/* AI 추천 답변 & 전송 폼 */}
                {!isResolved ? (
                  <div className="space-y-2 bg-slate-900/80 border border-slate-700/80 p-3 rounded-2xl">
                    <div className="flex items-center justify-between text-[11px] text-blue-300 font-bold">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                        Dify RAG 추천 답변
                      </span>
                      <span className="text-slate-400 text-[10px]">수정 또는 템플릿 선택</span>
                    </div>

                    {/* 빠른 응답 템플릿 칩 */}
                    <div className="flex flex-wrap gap-1">
                      {quickTemplates.map((tpl, tIdx) => (
                        <button
                          key={tIdx}
                          type="button"
                          onClick={() => setReplyDrafts({ ...replyDrafts, [inq.id]: tpl })}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 text-slate-300 border border-slate-700/80 transition-colors"
                        >
                          {tpl.slice(0, 16)}…
                        </button>
                      ))}
                    </div>

                    <textarea
                      rows={2}
                      value={draftText}
                      onChange={(e) =>
                        setReplyDrafts({ ...replyDrafts, [inq.id]: e.target.value })
                      }
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none leading-relaxed"
                    />

                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleSendReply(inq.id, draftText)}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-blue-900/30"
                      >
                        <Send className="w-3.5 h-3.5" />
                        답변 전송 & 처리완료
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-emerald-400 flex items-center justify-between pt-1 border-t border-slate-800">
                    <span className="flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      최종 조치: {inq.finalAnswer || '답변 완료'}
                    </span>
                    <span className="text-slate-400">완료됨</span>
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* 호실별 통합 히스토리 모달 */}
      {historyRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg p-5 space-y-4 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-sm">
                  {historyRoom}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{historyRoom}호 전체 문의 & 요청 히스토리</h3>
                  <p className="text-[11px] text-slate-400">투숙 중 발생한 모든 인터랙션 타임라인</p>
                </div>
              </div>
              <button
                onClick={() => setHistoryRoom(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs text-slate-300">
              {/* 비품 요청 히스토리 */}
              {roomAmenities.length > 0 && (
                <div className="space-y-1.5">
                  <span className="font-bold text-amber-300 flex items-center gap-1">
                    <Package className="w-3.5 h-3.5" /> 비품 신청 내역 ({roomAmenities.length}건)
                  </span>
                  {roomAmenities.map((a) => (
                    <div key={a.id} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex justify-between items-center">
                      <div>{a.item} <span className="text-amber-400 font-bold">x {a.quantity}</span></div>
                      <div className="text-[10px] text-slate-500 font-mono">{a.createdAt} ({a.status === 'delivered' ? '전달완료' : '대기중'})</div>
                    </div>
                  ))}
                </div>
              )}

              {/* 문의 내역 히스토리 */}
              {roomInquiries.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <span className="font-bold text-blue-300 flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" /> 채팅 문의 내역 ({roomInquiries.length}건)
                  </span>
                  {roomInquiries.map((inq) => (
                    <div key={inq.id} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1">
                      <div className="flex justify-between text-slate-400 text-[10px]">
                        <span>[{inq.category}] {inq.createdAt}</span>
                        <span className="text-emerald-400 font-bold">{inq.status === 'resolved' ? '처리완료' : '접수중'}</span>
                      </div>
                      <div className="text-white font-medium">&ldquo;{inq.message}&rdquo;</div>
                      {inq.finalAnswer && <div className="text-[11px] text-slate-400 bg-slate-900 p-1.5 rounded">↳ 답변: {inq.finalAnswer}</div>}
                    </div>
                  ))}
                </div>
              )}

              {/* 내선 전화 통화 히스토리 */}
              {roomCalls.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <span className="font-bold text-indigo-300 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> 내선 통화 내역 ({roomCalls.length}건)
                  </span>
                  {roomCalls.map((c) => (
                    <div key={c.id} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1">
                      <div className="flex justify-between text-slate-400 text-[10px]">
                        <span>{c.timestamp} ({c.duration})</span>
                        <span className="text-emerald-400">{c.status}</span>
                      </div>
                      <div className="text-slate-200">{c.transcript}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setHistoryRoom(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
