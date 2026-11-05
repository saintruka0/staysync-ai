'use client';

import React from 'react';
import { useMotel } from '@/context/MotelContext';
import { Sparkles, CheckCircle2, AlertTriangle, ArrowRight, Camera } from 'lucide-react';
import Link from 'next/link';

export default function CleaningOverview() {
  const { rooms } = useMotel();

  const cleaningRooms = rooms.filter((r) => r.status === 'cleaning');
  const inspectedRooms = rooms.filter((r) => r.status === 'inspected');

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col h-full">
      {/* 헤더 */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            하우스키핑 & AI 청소 점검 현황
          </h2>
          <p className="text-xs text-slate-400">청소 후 사진 업로드 자동 AI 판독 시스템</p>
        </div>
        <Link
          href="/housekeeping"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold transition-colors"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>청소 모바일 모드</span>
        </Link>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
        <div className="bg-amber-950/20 border border-amber-800/40 p-3 rounded-xl">
          <span className="text-amber-400 font-semibold block mb-1">현재 청소중</span>
          <span className="text-2xl font-black text-amber-200">{cleaningRooms.length}개 객실</span>
        </div>
        <div className="bg-violet-950/20 border border-violet-800/40 p-3 rounded-xl">
          <span className="text-violet-300 font-semibold block mb-1">AI 점검 통과 (입실준비)</span>
          <span className="text-2xl font-black text-white">{inspectedRooms.length}개 객실</span>
        </div>
      </div>

      {/* 최근 점검 완료 및 진행중 목록 */}
      <div className="space-y-2.5 overflow-y-auto flex-1 max-h-[300px] pr-1">
        {inspectedRooms.map((room) => (
          <div
            key={room.id}
            className="p-3 rounded-xl border border-purple-900/40 bg-purple-950/10 flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-xs font-black text-white px-2 py-0.5 rounded bg-purple-900/60 border border-purple-700">
                {room.number}호
              </span>
              <div className="min-w-0">
                <div className="text-xs font-bold text-purple-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                  AI 점검 {room.inspection?.score || 95}점 합격
                </div>
                <p className="text-[11px] text-slate-400 truncate">
                  {room.inspection?.aiFeedback || '침구 및 비품 완비'}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0 text-[10px] text-slate-400">
              <div>{room.cleanerName || '룸메이드'}</div>
              <div>{room.inspection?.timestamp || '최근'}</div>
            </div>
          </div>
        ))}

        {cleaningRooms.map((room) => (
          <div
            key={room.id}
            className="p-3 rounded-xl border border-amber-900/40 bg-amber-950/10 flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-black text-white px-2 py-0.5 rounded bg-amber-900/60 border border-amber-700 motion-safe:animate-pulse">
                {room.number}호
              </span>
              <div>
                <div className="text-xs font-bold text-amber-200">청소 작업 진행중</div>
                <p className="text-[11px] text-slate-400">담당: {room.cleanerName || '미지정'}</p>
              </div>
            </div>
            <span className="text-[10px] text-amber-400 border border-amber-800 px-2 py-0.5 rounded-full">
              사진 검사 대기
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
