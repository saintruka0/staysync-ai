'use client';

import React from 'react';
import Link from 'next/link';
import { useMotel } from '@/context/MotelContext';
import { Building2, QrCode, Sparkles, User, ShieldCheck, PhoneCall, RefreshCw } from 'lucide-react';
import { UserRole } from '@/types/motel';

interface HeaderProps {
  onOpenCallSimulator?: () => void;
  onOpenUserManagement?: () => void;
  onOpenDifyDiagnostics?: () => void;
}

export default function Header({ onOpenCallSimulator, onOpenUserManagement, onOpenDifyDiagnostics }: HeaderProps) {
  const { rooms, inquiries, amenities, currentUser, setCurrentRole, syncReservations } = useMotel();

  const occupiedCount = rooms.filter((r) => r.status === 'occupied').length;
  const cleaningCount = rooms.filter((r) => r.status === 'cleaning').length;
  const availableCount = rooms.filter((r) => r.status === 'available').length;
  const pendingInquiriesCount = inquiries.filter((i) => i.status === 'new').length;
  const pendingAmenitiesCount = amenities.filter((a) => a.status === 'pending').length;

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* 로고 & 메인 타이틀 */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-blue-600 border border-blue-400/40 flex items-center justify-center text-white shadow-lg shadow-blue-900/30 group-hover:scale-105 motion-safe:transition-transform motion-reduce:transition-none">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight text-white">StaySync AI</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onOpenDifyDiagnostics?.();
                  }}
                  className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 hover:bg-blue-500/30 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transition-colors cursor-pointer"
                  title="Dify v1 연결 상태 및 실시간 스트리밍 진단"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 motion-safe:animate-pulse"></span>
                  <span>Dify v1 연동</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400">모텔 프론트 데스크 & 투숙객 AI 케어 포털</p>
            </div>
          </Link>
        </div>

        {/* 룸 상태 요약 바 */}
        <div className="hidden md:flex items-center gap-2 text-xs bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-400">빈방:</span>
            <span className="font-semibold text-emerald-400">{availableCount}</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span className="text-slate-400">재실:</span>
            <span className="font-semibold text-blue-400">{occupiedCount}</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-slate-400">청소중:</span>
            <span className="font-semibold text-amber-400">{cleaningCount}</span>
          </div>
          {(pendingInquiriesCount > 0 || pendingAmenitiesCount > 0) && (
            <>
              <span className="text-slate-600">|</span>
              <div className="flex items-center gap-1.5 motion-safe:animate-pulse">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span className="text-rose-400 font-semibold">
                  미처리 요청: {pendingInquiriesCount + pendingAmenitiesCount}건
                </span>
              </div>
            </>
          )}
        </div>

        {/* 네비게이션 & 액션 버튼 */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* 예약 싱크 버튼 */}
          <button
            onClick={() => syncReservations()}
            className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 active:scale-95 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
            title="야놀자/여기어때 예약 크롤링 동기화"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">예약 싱크</span>
          </button>

          {/* 내선 전화 시뮬레이터 */}
          {onOpenCallSimulator && (
            <button
              onClick={onOpenCallSimulator}
              className="flex items-center gap-1.5 text-xs bg-indigo-950/60 hover:bg-indigo-900 active:scale-95 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 text-indigo-200 px-3 py-1.5 rounded-lg border border-indigo-700/50 transition-colors"
              title="내선 전화 자동응대 테스트"
            >
              <PhoneCall className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">내선응대</span>
            </button>
          )}

          {/* 투숙객 모바일 QR 링크 */}
          <Link
            href="/guest?room=305"
            target="_blank"
            className="flex items-center gap-1.5 text-xs bg-emerald-950/50 hover:bg-emerald-900/60 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-700/50 transition-colors"
            title="305호 투숙객 QR 페이지 새 창 열기"
          >
            <QrCode className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">투숙객 QR (305호)</span>
          </Link>

          {/* 청소 직원 모바일 링크 */}
          <Link
            href="/housekeeping"
            className="flex items-center gap-1.5 text-xs bg-amber-950/50 hover:bg-amber-900/60 text-amber-300 px-3 py-1.5 rounded-lg border border-amber-700/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            title="하우스키핑 전용 모바일 화면"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">청소 모바일</span>
          </Link>

          {/* 사용자 역할 스위처 */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="flex flex-col items-end text-right">
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-1">
                <User className="w-3 h-3 text-slate-400" />
                {currentUser.name}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {currentUser.role}
              </span>
            </div>
            <select
              value={currentUser.role}
              onChange={(e) => setCurrentRole(e.target.value as UserRole)}
              className="bg-slate-800 text-slate-200 text-xs border border-slate-700 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="admin">점주(Admin)</option>
              <option value="front">프론트(Front)</option>
              <option value="housekeeping">청소(Clean)</option>
            </select>

            {currentUser.role === 'admin' && onOpenUserManagement && (
              <button
                onClick={onOpenUserManagement}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                title="직원 및 권한 관리"
              >
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
