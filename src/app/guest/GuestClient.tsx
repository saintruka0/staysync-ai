'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMotel } from '@/context/MotelContext';
import { MOTEL_FOOD_PLACES } from '@/lib/mockData';
import {
  Wifi,
  Copy,
  Check,
  Send,
  MessageSquare,
  Sparkles,
  Utensils,
  Package,
  Phone,
  Clock,
  MapPin,
  Bot,
  User,
  Building2,
  Bath,
  Droplets,
  Zap,
  Shirt,
  BedDouble,
  Info,
} from 'lucide-react';

export default function GuestClient() {
  const searchParams = useSearchParams();
  const roomNumber = searchParams.get('room') || '305';

  const { addInquiry, addAmenityRequest } = useMotel();

  const [copiedWifi, setCopiedWifi] = useState(false);
  const [activeTab, setActiveTab] = useState<'amenity' | 'chat' | 'food'>('amenity');

  // 챗봇 상태
  const [chatMessages, setChatMessages] = useState<
    { id: string; sender: 'guest' | 'ai'; text: string; time: string }[]
  >([
    {
      id: 'welcome',
      sender: 'ai',
      text: `안녕하세요! StaySync ${roomNumber}호 고객님. 객실 이용 중 궁금하신 점이나 비품이 필요하시면 언제든 말씀해 주세요.`,
      time: '방금',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // 비품 요청 성공 상태 토스트
  const [requestedItem, setRequestedItem] = useState<string | null>(null);

  const wifiSSID = `StaySync_${roomNumber}`;
  const wifiPass = 'stay1234!';

  const handleCopyWifi = () => {
    navigator.clipboard?.writeText(wifiPass);
    setCopiedWifi(true);
    setTimeout(() => setCopiedWifi(false), 2500);
  };

  const handleAmenityClick = (item: string, qty = 1) => {
    addAmenityRequest(roomNumber, item, qty);
    setRequestedItem(`${item} ${qty > 1 ? `(${qty}개)` : ''}`);
    setTimeout(() => setRequestedItem(null), 3000);
  };

  const handleSendChat = async (textToSend?: string) => {
    const text = (textToSend || chatInput).trim();
    if (!text || isChatLoading) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newMsg = {
      id: `g-${Date.now()}`,
      sender: 'guest' as const,
      text,
      time: timeStr,
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const aiReply = await addInquiry(roomNumber, `${roomNumber}호 투숙객`, text);
      setChatMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: aiReply,
          time: timeStr,
        },
      ]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: '프론트 데스크로 문의가 전달되었습니다. 잠시만 기다려 주시면 안내해 드리겠습니다.',
          time: timeStr,
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex justify-center">
      <div className="w-full max-w-md bg-slate-900 border-x border-slate-800 flex flex-col min-h-screen shadow-2xl relative">
        {/* 상단 헤더 배너 */}
        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-900 p-5 border-b border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm tracking-tight text-white">StaySync Hotel</span>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
              {roomNumber}호 객실
            </span>
          </div>

          <h1 className="text-xl font-black text-white tracking-tight">편안하고 즐거운 휴식 되세요</h1>
          <p className="text-xs text-slate-400 mt-1">24시간 프론트 데스크 케어 & 맛집 안내</p>

          {/* Wi-Fi 원클릭 연결 카드 */}
          <div className="mt-4 bg-slate-900/90 border border-slate-700/80 rounded-2xl p-3.5 flex items-center justify-between gap-2 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                <Wifi className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-slate-400">객실 와이파이</div>
                <div className="text-xs font-bold text-white">{wifiSSID}</div>
                <div className="text-[10px] text-slate-400 font-mono">비번: {wifiPass}</div>
              </div>
            </div>
            <button
              onClick={handleCopyWifi}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-md shadow-indigo-600/20"
            >
              {copiedWifi ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>복사완료</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>비번 복사</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 비품 요청 성공 토스트 알림 */}
        {requestedItem && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white text-xs px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 motion-safe:transition-opacity motion-reduce:transition-none duration-300 ring-2 ring-emerald-400/40">
            <Check className="w-4 h-4" />
            <span>프론트에 [{requestedItem}] 요청이 전달되었습니다!</span>
          </div>
        )}

        {/* 탭 네비게이션 */}
        <div className="grid grid-cols-3 bg-slate-900/90 border-b border-slate-800 text-xs font-semibold p-1.5">
          <button
            onClick={() => setActiveTab('amenity')}
            className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
              activeTab === 'amenity'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>비품 요청</span>
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
              activeTab === 'chat'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>AI 문의</span>
          </button>
          <button
            onClick={() => setActiveTab('food')}
            className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
              activeTab === 'food'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>주변 맛집</span>
          </button>
        </div>

        {/* 탭 내용 영역 */}
        <div className="flex-1 p-4 overflow-y-auto pb-20">
          {/* TAB 1: 원클릭 비품 요청 */}
          {activeTab === 'amenity' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white mb-1">원클릭 간편 비품 신청</h3>
                <p className="text-xs text-slate-400">
                  버튼을 누르면 프론트 데스크로 즉시 알림이 전달됩니다.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { title: '타올/수건 추가', detail: '깨끗한 수건 2장', Icon: Bath, iconColor: 'text-cyan-400', item: '수건 2장' },
                  { title: '생수 추가', detail: '시원한 생수 2병', Icon: Droplets, iconColor: 'text-blue-400', item: '생수 2병' },
                  { title: '어메니티 키트', detail: '칫솔/치약/면도기', Icon: Sparkles, iconColor: 'text-amber-400', item: '일회용 어메니티 키트' },
                  { title: '충전 케이블', detail: 'C타입 / 8핀 멀티', Icon: Zap, iconColor: 'text-yellow-400', item: '고속 충전 케이블' },
                  { title: '위생 가운', detail: '살균 세탁 가운 2벌', Icon: Shirt, iconColor: 'text-purple-400', item: '위생 가운 2벌' },
                  { title: '베개 추가', detail: '폭신한 경추 베개', Icon: BedDouble, iconColor: 'text-emerald-400', item: '베개 1개' },
                ].map((amenity, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAmenityClick(amenity.item)}
                    className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:border-indigo-500/80 text-left transition-colors flex flex-col justify-between group active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 shadow-md"
                  >
                    <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-2">
                      <amenity.Icon className={`w-4 h-4 ${amenity.iconColor}`} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {amenity.title}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{amenity.detail}</div>
                    </div>
                    <div className="mt-3 text-[10px] font-bold text-indigo-400 group-hover:underline">
                      신청하기
                    </div>
                  </button>
                ))}
              </div>

              {/* 안내 문구 */}
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-slate-300">
                  <Info className="w-3.5 h-3.5 text-indigo-400" />
                  <span>객실 이용 안내</span>
                </div>
                <div>• 기본 퇴실 시간: 익일 12:00(정오)</div>
                <div>• 레이트 체크아웃(퇴실 연장)은 프론트 승인이 필요합니다.</div>
                <div>• 전 객실 금연 구역입니다.</div>
              </div>
            </div>
          )}

          {/* TAB 2: AI 문의 챗봇 (Dify 연동) */}
          {activeTab === 'chat' && (
            <div className="flex flex-col h-full min-h-[440px]">
              <div className="mb-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  24시간 객실 AI 챗봇
                </h3>
                <p className="text-xs text-slate-400">
                  Dify 지식베이스 기반으로 모텔 이용 규정을 즉시 답변해 드립니다.
                </p>
              </div>

              {/* 채팅 메시지 목록 */}
              <div className="flex-1 space-y-3 py-2 overflow-y-auto">
                {chatMessages.map((m) => {
                  const isAi = m.sender === 'ai';
                  return (
                    <div
                      key={m.id}
                      className={`flex items-start gap-2 ${isAi ? 'justify-start' : 'justify-end'}`}
                    >
                      {isAi && (
                        <div className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5">
                          <Bot className="w-3.5 h-3.5" />
                        </div>
                      )}
                      <div className={`max-w-[80%] space-y-1 ${isAi ? 'items-start' : 'items-end'}`}>
                        <div
                          className={`p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                            isAi
                              ? 'bg-slate-800 text-slate-200 border border-slate-700/60 rounded-tl-sm'
                              : 'bg-indigo-600 text-white font-medium rounded-tr-sm shadow-md shadow-indigo-600/20'
                          }`}
                        >
                          {m.text}
                        </div>
                        <span className="text-[10px] text-slate-400 px-1 block">{m.time}</span>
                      </div>
                    </div>
                  );
                })}

                {isChatLoading && (
                  <div className="flex items-center gap-2 text-xs text-indigo-300">
                    <div className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 flex items-center justify-center shrink-0">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <div className="p-3 bg-slate-800 rounded-2xl border border-slate-700/60 text-xs text-slate-400 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-400 motion-safe:animate-ping"></span>
                      답변을 확인하고 있습니다…
                    </div>
                  </div>
                )}
              </div>

              {/* 빠른 질문 버튼 */}
              <div className="flex flex-wrap gap-1.5 py-2">
                {[
                  '퇴실 시간 연장 얼마인가요?',
                  '배달 음식은 어디서 받나요?',
                  '넷플릭스 어떻게 보나요?',
                  '주차장 출차 안내',
                ].map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendChat(q)}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 text-slate-300 hover:text-white border border-slate-700/70 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* 채팅 입력 */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendChat();
                }}
                className="flex items-center gap-2 pt-2 border-t border-slate-800"
              >
                <input
                  type="text"
                  placeholder="궁금한 내용을 입력하세요..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={isChatLoading}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={isChatLoading || !chatInput.trim()}
                  className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: 주변 맛집 & 편의점 큐레이션 */}
          {activeTab === 'food' && (
            <div className="space-y-3.5">
              <div>
                <h3 className="text-sm font-bold text-white mb-1">모텔 주변 검증 맛집 & 편의</h3>
                <p className="text-xs text-slate-400">직접 먹어보고 선별한 도보 5분 거리 추천 리스트</p>
              </div>

              <div className="space-y-3">
                {MOTEL_FOOD_PLACES.map((place) => (
                  <div
                    key={place.id}
                    className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/70 hover:border-slate-600 transition space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{place.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400">
                            {place.category}
                          </span>
                        </div>
                        <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5 font-medium">
                          <MapPin className="w-3 h-3" />
                          {place.distance}
                        </div>
                      </div>

                      {place.phone !== '-' && (
                        <a
                          href={`tel:${place.phone}`}
                          className="px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0 transition"
                        >
                          <Phone className="w-3 h-3" />
                          전화
                        </a>
                      )}
                    </div>

                    <div className="text-xs text-slate-300">
                      <span className="text-slate-400">대표메뉴:</span>{' '}
                      <span className="font-medium text-slate-200">{place.popularMenu}</span>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      영업시간: {place.hours}
                    </div>

                    {/* 추천 꿀팁 */}
                    <div className="bg-indigo-950/30 p-2 rounded-lg border border-indigo-800/30 text-[11px] text-indigo-200 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <div>
                        <span className="font-medium text-indigo-300">프론트 팁:</span> {place.tip}
                      </div>
                    </div>

                    {/* 태그 */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {place.tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
